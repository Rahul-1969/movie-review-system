import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.model.js';
import Genre from '../models/Genre.model.js';
import User from '../models/User.model.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const TMDB_BASE  = 'https://api.themoviedb.org/3';
const TMDB_IMG   = 'https://image.tmdb.org/t/p/w500';
const TMDB_TOKEN = process.env.TMDB_API_KEY;
const BATCH_SIZE = 20;
const DELAY_MS   = 220;

if (!TMDB_TOKEN) {
  console.error('❌  TMDB_API_KEY is not set in .env');
  process.exit(1);
}

// ─── TMDB genre id → our slug (TV genres use different IDs) ──────────────────
// TV genre IDs: https://developers.themoviedb.org/3/genres/get-tv-list
const TMDB_GENRE_SLUG = {
  // Shared genres (same ID in TV & movie)
  28:  'action',
  18:  'drama',
  35:  'comedy',
  53:  'thriller',
  878: 'sci-fi',
  // TV-specific genre IDs that map to our slugs
  10759: 'action',   // Action & Adventure (TV)
  10765: 'sci-fi',   // Sci-Fi & Fantasy (TV)
  9648:  'thriller', // Mystery (TV, closest to thriller)
};

// ─── Language code → display name ─────────────────────────────────────────────
const LANG_MAP = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
};

// ─── Auto-detect TMDB auth format ────────────────────────────────────────────
const IS_BEARER = TMDB_TOKEN.startsWith('eyJ');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmdbFetch = async (path) => {
  const sep = path.includes('?') ? '&' : '?';
  const url = IS_BEARER
    ? `${TMDB_BASE}${path}`
    : `${TMDB_BASE}${path}${sep}api_key=${TMDB_TOKEN}`;

  const headers = IS_BEARER
    ? { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
};

// ─── Collect TV show IDs from list endpoints ───────────────────────────────────
const collectSeriesIds = async (endpoint, pages) => {
  const ids = new Set();
  for (let page = 1; page <= pages; page++) {
    try {
      const data = await tmdbFetch(`${endpoint}?language=en-US&page=${page}`);
      (data.results || []).forEach((s) => ids.add(s.id));
      process.stdout.write(`  ${endpoint} page ${page}/${pages} — ${ids.size} unique ids so far\r`);
    } catch (err) {
      console.warn(`\n  ⚠️  ${err.message} (skipping page ${page})`);
    }
    await sleep(150);
  }
  console.log();
  return ids;
};

// ─── Fetch full TV show details (details + credits + videos) ──────────────────
const fetchSeriesDetails = async (tmdbId) => {
  const [details, credits, videos] = await Promise.all([
    tmdbFetch(`/tv/${tmdbId}?language=en-US`),
    tmdbFetch(`/tv/${tmdbId}/credits?language=en-US`),
    tmdbFetch(`/tv/${tmdbId}/videos?language=en-US`),
  ]);

  // TV credits use "series regular" role — take top 5 cast
  const cast = (credits.cast || [])
    .slice(0, 5)
    .map((c) => ({ name: c.name, role: c.character || '' }));

  // Creator acts as director equivalent for TV shows
  const director = (details.created_by || [])[0]?.name
    || (credits.crew || []).find((c) => c.job === 'Executive Producer')?.name
    || '';

  const trailerKey = (videos.results || []).find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  )?.key;
  const trailer = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : '';

  return { details, director, cast, trailer };
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log('📺  TMDB TV Series Import Script');
  console.log('────────────────────────────────────────');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected\n');

  const dbGenres = await Genre.find({});
  if (!dbGenres.length) {
    console.error('❌  No genres found. Run `npm run seed` first.');
    process.exit(1);
  }
  const slugToId = Object.fromEntries(dbGenres.map((g) => [g.slug, g._id]));
  console.log(`✅  Loaded ${dbGenres.length} genres: ${dbGenres.map((g) => g.slug).join(', ')}\n`);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌  No admin user found. Run `npm run seed` first.');
    process.exit(1);
  }
  console.log(`✅  Admin user: ${admin.email}\n`);

  // Collect IDs from 3 endpoints (5 pages each)
  console.log('📡  Fetching TV series IDs from TMDB...');
  const allIds = new Set();

  const [popularIds, topRatedIds, onAirIds] = await Promise.all([
    collectSeriesIds('/tv/popular',    5),
    collectSeriesIds('/tv/top_rated',  5),
    collectSeriesIds('/tv/on_the_air', 5),
  ]);

  popularIds.forEach((id)   => allIds.add(id));
  topRatedIds.forEach((id)  => allIds.add(id));
  onAirIds.forEach((id)     => allIds.add(id));

  const uniqueIds = [...allIds];
  console.log(`\n📊  Total unique TMDB series IDs collected: ${uniqueIds.length}`);
  console.log('────────────────────────────────────────\n');

  let insertedTotal = 0;
  let skippedTotal  = 0;
  let errorTotal    = 0;

  for (let batchStart = 0; batchStart < uniqueIds.length; batchStart += BATCH_SIZE) {
    const batchIds  = uniqueIds.slice(batchStart, batchStart + BATCH_SIZE);
    const batchDocs = [];

    for (let i = 0; i < batchIds.length; i++) {
      const globalIdx = batchStart + i + 1;
      const tmdbId    = batchIds[i];

      try {
        const { details, director, cast, trailer } = await fetchSeriesDetails(tmdbId);

        // TV shows use .name, fallback to .original_name
        const title       = details.name || details.original_name || 'Untitled';
        // TV shows use first_air_date instead of release_date
        const releaseYear = parseInt(details.first_air_date?.split('-')[0]) || null;
        const langCode    = details.original_language || 'en';
        const language    = LANG_MAP[langCode] || langCode;

        process.stdout.write(
          `  [${globalIdx}/${uniqueIds.length}] Fetched: ${title.substring(0, 50).padEnd(50)}  \r`
        );

        // Deduplicate by title + releaseYear (contentType: 'series' differentiates from movies)
        const exists = await Movie.exists({ title, releaseYear, contentType: 'series' });
        if (exists) {
          skippedTotal++;
          await sleep(DELAY_MS);
          continue;
        }

        const genreIds = (details.genres || [])
          .map((g) => {
            const slug = TMDB_GENRE_SLUG[g.id];
            return slug ? slugToId[slug] : null;
          })
          .filter(Boolean);

        batchDocs.push({
          title,
          description: details.overview || '',
          releaseYear,
          language,
          genres:      genreIds,
          cast,
          director,
          poster: {
            url:       details.poster_path ? `${TMDB_IMG}${details.poster_path}` : '',
            public_id: '',
          },
          trailer,
          averageRating: 0,
          totalReviews:  0,
          isPublished:   true,
          contentType:   'series',          // ← marks this as a TV series
          addedBy:       admin._id,
        });
      } catch (err) {
        errorTotal++;
        console.warn(`\n  ⚠️  TMDB id ${tmdbId}: ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    if (batchDocs.length > 0) {
      try {
        const result = await Movie.insertMany(batchDocs, { ordered: false });
        insertedTotal += result.length;
        const rangeEnd = Math.min(batchStart + BATCH_SIZE, uniqueIds.length);
        console.log(
          `\n  ✅  Batch [${batchStart + 1}–${rangeEnd}]: inserted ${result.length} | skipped ${batchDocs.length - result.length} duplicates`
        );
      } catch (err) {
        const inserted = err.insertedDocs?.length ?? 0;
        insertedTotal += inserted;
        console.log(`\n  ⚠️  Batch partial: inserted ${inserted}`);
      }
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('📺  TV Series Import Complete!');
  console.log(`    ✅  Inserted : ${insertedTotal}`);
  console.log(`    ⏭️   Skipped  : ${skippedTotal} (already in DB)`);
  console.log(`    ❌  Errors   : ${errorTotal}`);
  console.log('════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error('❌  Fatal error:', err.message);
  process.exit(1);
});
