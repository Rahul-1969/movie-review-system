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
const DELAY_MS   = 220;   // slightly more conservative than importMovies

if (!TMDB_TOKEN) {
  console.error('❌  TMDB_API_KEY is not set in .env');
  process.exit(1);
}

// ─── Regional catalogs to import (3 pages each ≈ 60 movies per region) ───────
const REGIONAL_CATALOGS = [
  { lang: 'hi', displayName: 'Hindi',    label: 'Bollywood'         },
  { lang: 'te', displayName: 'Telugu',   label: 'Tollywood (Telugu)' },
  { lang: 'ta', displayName: 'Tamil',    label: 'Kollywood (Tamil)'  },
  { lang: 'ko', displayName: 'Korean',   label: 'Korean Cinema'      },
  { lang: 'ja', displayName: 'Japanese', label: 'Japanese Cinema'    },
  { lang: 'es', displayName: 'Spanish',  label: 'Spanish Cinema'     },
];

// ─── TMDB genre id → our slug mapping (same as importMovies.js) ───────────────
const TMDB_GENRE_SLUG = {
  28:  'action',
  18:  'drama',
  35:  'comedy',
  53:  'thriller',
  878: 'sci-fi',
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

// ─── Collect TMDB ids from discover endpoint for one language ─────────────────
const collectRegionalIds = async (langCode, pages = 3) => {
  const ids = new Set();
  for (let page = 1; page <= pages; page++) {
    try {
      const path = `/discover/movie?with_original_language=${langCode}&sort_by=popularity.desc&page=${page}`;
      const data = await tmdbFetch(path);
      (data.results || []).forEach((m) => ids.add(m.id));
      process.stdout.write(`    page ${page}/${pages} — ${ids.size} ids\r`);
    } catch (err) {
      console.warn(`\n    ⚠️  ${err.message} (skipping page ${page})`);
    }
    await sleep(150);
  }
  console.log();
  return ids;
};

// ─── Fetch full movie details (same logic as importMovies.js) ─────────────────
const fetchMovieDetails = async (tmdbId) => {
  const [details, credits, videos] = await Promise.all([
    tmdbFetch(`/movie/${tmdbId}?language=en-US`),
    tmdbFetch(`/movie/${tmdbId}/credits?language=en-US`),
    tmdbFetch(`/movie/${tmdbId}/videos?language=en-US`),
  ]);

  const director = (credits.crew || []).find((c) => c.job === 'Director')?.name || '';

  const cast = (credits.cast || [])
    .slice(0, 5)
    .map((c) => ({ name: c.name, role: c.character || '' }));

  const trailerKey = (videos.results || []).find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  )?.key;
  const trailer = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : '';

  return { details, director, cast, trailer };
};

// ─── Process a set of TMDB ids and insert into MongoDB ────────────────────────
const processBatch = async (ids, displayName, slugToId, adminId, counters) => {
  const idArr = [...ids];

  for (let batchStart = 0; batchStart < idArr.length; batchStart += BATCH_SIZE) {
    const batchIds  = idArr.slice(batchStart, batchStart + BATCH_SIZE);
    const batchDocs = [];

    for (let i = 0; i < batchIds.length; i++) {
      const globalIdx = batchStart + i + 1;
      const tmdbId    = batchIds[i];

      try {
        const { details, director, cast, trailer } = await fetchMovieDetails(tmdbId);

        const title       = details.title || details.original_title || 'Untitled';
        const releaseYear = parseInt(details.release_date?.split('-')[0]) || null;

        process.stdout.write(
          `    [${globalIdx}/${idArr.length}] ${title.substring(0, 45).padEnd(45)}\r`
        );

        // Deduplicate against existing DB records
        const exists = await Movie.exists({ title, releaseYear });
        if (exists) {
          counters.skipped++;
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
          language:    displayName,
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
          addedBy:       adminId,
        });
      } catch (err) {
        counters.errors++;
        console.warn(`\n    ⚠️  TMDB id ${tmdbId}: ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    if (batchDocs.length > 0) {
      try {
        const result = await Movie.insertMany(batchDocs, { ordered: false });
        counters.inserted += result.length;
        const rangeEnd = Math.min(batchStart + BATCH_SIZE, idArr.length);
        console.log(`\n    ✅  Batch [${batchStart + 1}–${rangeEnd}]: inserted ${result.length}`);
      } catch (err) {
        const inserted = err.insertedDocs?.length ?? 0;
        counters.inserted += inserted;
        console.log(`\n    ⚠️  Batch partial: inserted ${inserted}`);
      }
    }
  }
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log('🌍  Regional Cinema Import Script');
  console.log('════════════════════════════════════════\n');

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

  const totals = { inserted: 0, skipped: 0, errors: 0 };
  const regionSummary = [];

  // Process each regional catalog sequentially to respect rate limits
  for (const catalog of REGIONAL_CATALOGS) {
    console.log(`\n─── ${catalog.label} (lang: ${catalog.lang}) ──────────────────────`);

    const ids = await collectRegionalIds(catalog.lang, 3);
    console.log(`  📊  ${ids.size} unique TMDB IDs collected`);

    const counters = { inserted: 0, skipped: 0, errors: 0 };
    await processBatch(ids, catalog.displayName, slugToId, admin._id, counters);

    totals.inserted += counters.inserted;
    totals.skipped  += counters.skipped;
    totals.errors   += counters.errors;

    regionSummary.push({
      label:    catalog.label,
      fetched:  ids.size,
      inserted: counters.inserted,
      skipped:  counters.skipped,
    });

    console.log(
      `\n  📌  ${catalog.label}: inserted ${counters.inserted} | skipped ${counters.skipped} | errors ${counters.errors}`
    );
  }

  // Final summary table
  console.log('\n\n════════════════════════════════════════');
  console.log('🌍  Regional Import Complete!\n');
  console.log('  ' + 'Region'.padEnd(30) + 'Fetched'.padEnd(12) + 'Inserted'.padEnd(12) + 'Skipped');
  console.log('  ' + '─'.repeat(66));
  regionSummary.forEach((r) => {
    console.log(
      '  ' +
      r.label.padEnd(30) +
      String(r.fetched).padEnd(12) +
      String(r.inserted).padEnd(12) +
      r.skipped
    );
  });
  console.log('  ' + '─'.repeat(66));
  console.log(`\n    ✅  Total inserted : ${totals.inserted}`);
  console.log(`    ⏭️   Total skipped  : ${totals.skipped}`);
  console.log(`    ❌  Total errors   : ${totals.errors}`);
  console.log('════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error('❌  Fatal error:', err.message);
  process.exit(1);
});
