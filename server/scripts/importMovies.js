import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.model.js';
import Genre from '../models/Genre.model.js';
import User from '../models/User.model.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';
const TMDB_TOKEN = process.env.TMDB_API_KEY;
const BATCH_SIZE = 20;
const DELAY_MS   = 200;

if (!TMDB_TOKEN) {
  console.error('❌  TMDB_API_KEY is not set in .env');
  process.exit(1);
}

// ─── TMDB genre id → our slug mapping ────────────────────────────────────────
const TMDB_GENRE_SLUG = {
  28:  'action',
  18:  'drama',
  35:  'comedy',
  53:  'thriller',
  878: 'sci-fi',
};

// ─── Language code → display name ─────────────────────────────────────────────
const LANG_MAP = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  hi: 'Hindi',
};

// ─── Auto-detect TMDB auth format ────────────────────────────────────────────
// Read Access Token  → long JWT starting with "eyJ", use Authorization: Bearer
// API Key v3         → short 32-char hex string,  use ?api_key= query param
const IS_BEARER = TMDB_TOKEN.startsWith('eyJ');

if (!IS_BEARER) {
  console.log('ℹ️   Detected TMDB API Key v3 format — using ?api_key= query param');
} else {
  console.log('ℹ️   Detected TMDB Read Access Token — using Authorization: Bearer');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmdbFetch = async (path) => {
  // Append api_key to path if using v3 key
  const sep = path.includes('?') ? '&' : '?';
  const url = IS_BEARER
    ? `${TMDB_BASE}${path}`
    : `${TMDB_BASE}${path}${sep}api_key=${TMDB_TOKEN}`;

  const headers = IS_BEARER
    ? { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${path}`);
  }
  return res.json();
};

// ─── Collect movie ids from list endpoints ────────────────────────────────────
const collectIds = async (endpoint, pages) => {
  const ids = new Set();
  for (let page = 1; page <= pages; page++) {
    try {
      const data = await tmdbFetch(`${endpoint}?language=en-US&page=${page}`);
      (data.results || []).forEach((m) => ids.add(m.id));
      process.stdout.write(`  ${endpoint} page ${page}/${pages} — ${ids.size} unique ids so far\r`);
    } catch (err) {
      console.warn(`\n  ⚠️  ${err.message} (skipping page ${page})`);
    }
    await sleep(150);
  }
  console.log(); // newline after \r
  return ids;
};

// ─── Fetch full movie details (details + credits + videos) ────────────────────
const fetchMovieDetails = async (tmdbId) => {
  const [details, credits, videos] = await Promise.all([
    tmdbFetch(`/movie/${tmdbId}?language=en-US`),
    tmdbFetch(`/movie/${tmdbId}/credits?language=en-US`),
    tmdbFetch(`/movie/${tmdbId}/videos?language=en-US`),
  ]);

  // Director
  const director = (credits.crew || []).find((c) => c.job === 'Director')?.name || '';

  // Top 5 cast
  const cast = (credits.cast || [])
    .slice(0, 5)
    .map((c) => ({ name: c.name, role: c.character || '' }));

  // YouTube trailer
  const trailerKey = (videos.results || []).find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  )?.key;
  const trailer = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : '';

  return { details, director, cast, trailer };
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log('🎬  TMDB Movie Import Script');
  console.log('────────────────────────────────────────');

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected\n');

  // 2. Load genre map (DB slug → ObjectId)
  const dbGenres = await Genre.find({});
  if (!dbGenres.length) {
    console.error('❌  No genres found in DB. Run `npm run seed` first.');
    process.exit(1);
  }
  const slugToId = Object.fromEntries(dbGenres.map((g) => [g.slug, g._id]));
  console.log(`✅  Loaded ${dbGenres.length} genres: ${dbGenres.map((g) => g.slug).join(', ')}\n`);

  // 3. Find admin user
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌  No admin user found. Run `npm run seed` first.');
    process.exit(1);
  }
  console.log(`✅  Admin user: ${admin.email}\n`);

  // 4. Collect TMDB ids from 3 endpoints
  console.log('📡  Fetching movie IDs from TMDB...');
  const allIds = new Set();

  const [popularIds, topRatedIds, nowPlayingIds] = await Promise.all([
    collectIds('/movie/popular',     10),
    collectIds('/movie/top_rated',    5),
    collectIds('/movie/now_playing',  5),
  ]);

  popularIds.forEach((id) => allIds.add(id));
  topRatedIds.forEach((id) => allIds.add(id));
  nowPlayingIds.forEach((id) => allIds.add(id));

  const uniqueIds = [...allIds];
  console.log(`\n📊  Total unique TMDB IDs collected: ${uniqueIds.length}`);
  console.log('────────────────────────────────────────\n');

  // 5. Process in batches
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
        const { details, director, cast, trailer } = await fetchMovieDetails(tmdbId);

        const title       = details.title || details.original_title || 'Untitled';
        const releaseYear = parseInt(details.release_date?.split('-')[0]) || null;
        const langCode    = details.original_language || 'en';
        const language    = LANG_MAP[langCode] || langCode;

        process.stdout.write(
          `  [${globalIdx}/${uniqueIds.length}] Fetched: ${title.substring(0, 50).padEnd(50)}  \r`
        );

        // Map TMDB genre_ids → our Genre ObjectIds
        const genreIds = (details.genres || [])
          .map((g) => {
            const ourSlug = TMDB_GENRE_SLUG[g.id];
            return ourSlug ? slugToId[ourSlug] : null;
          })
          .filter(Boolean);

        // Check for duplicate (same title + releaseYear)
        const exists = await Movie.exists({ title, releaseYear });
        if (exists) {
          skippedTotal++;
          await sleep(DELAY_MS);
          continue;
        }

        const doc = {
          title,
          description: details.overview || '',
          releaseYear,
          language,
          genres: genreIds,
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
          addedBy:       admin._id,
        };

        batchDocs.push(doc);
      } catch (err) {
        errorTotal++;
        console.warn(`\n  ⚠️  TMDB id ${tmdbId}: ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    // Insert the batch
    if (batchDocs.length > 0) {
      try {
        const result = await Movie.insertMany(batchDocs, { ordered: false });
        insertedTotal += result.length;
        console.log(
          `\n  ✅  Batch [${batchStart + 1}–${Math.min(batchStart + BATCH_SIZE, uniqueIds.length)}]: ` +
          `inserted ${result.length} | skipped ${batchDocs.length - result.length} duplicates`
        );
      } catch (err) {
        // insertMany with ordered:false reports partial successes via err.insertedDocs
        const inserted = err.insertedDocs?.length ?? 0;
        insertedTotal += inserted;
        console.log(
          `\n  ⚠️   Batch [${batchStart + 1}–${Math.min(batchStart + BATCH_SIZE, uniqueIds.length)}]: ` +
          `inserted ${inserted} (some duplicates skipped by MongoDB)`
        );
      }
    }
  }

  // 6. Final summary
  console.log('\n════════════════════════════════════════');
  console.log('🎬  Import Complete!');
  console.log(`    ✅  Inserted : ${insertedTotal}`);
  console.log(`    ⏭️   Skipped  : ${skippedTotal} (already in DB)`);
  console.log(`    ❌  Errors   : ${errorTotal}`);
  console.log('════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
