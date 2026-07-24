import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.model.js';

// ─── Known poster fixes ───────────────────────────────────────────────────────
const KNOWN_FIXES = [
  {
    title: 'The Godfather',
    releaseYear: 1972,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLegHzgGJ9P.jpg',
  },
  {
    title: 'The Shawshank Redemption',
    releaseYear: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  },
];

const main = async () => {
  console.log('🖼️   Fix Posters Script');
  console.log('────────────────────────────────────────');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected\n');

  // ── STEP 1: Apply known fixes ─────────────────────────────────────────────
  console.log('📌  Applying known poster fixes...');
  for (const fix of KNOWN_FIXES) {
    const query = { title: fix.title };
    if (fix.releaseYear) query.releaseYear = fix.releaseYear;

    const result = await Movie.findOneAndUpdate(
      query,
      { $set: { 'poster.url': fix.posterUrl } },
      { new: true }
    );

    if (result) {
      console.log(`  ✅  Fixed: "${fix.title}" (${fix.releaseYear})`);
      console.log(`         → ${fix.posterUrl}`);
    } else {
      console.log(`  ⚠️   Not found in DB: "${fix.title}" (${fix.releaseYear})`);
    }
  }

  // ── STEP 2: Scan ALL movies for missing / empty poster URLs ───────────────
  console.log('\n🔍  Scanning all movies for missing posters...');

  const missingPosters = await Movie.find({
    $or: [
      { 'poster.url': '' },
      { 'poster.url': null },
      { 'poster.url': { $exists: false } },
    ],
  })
    .select('title releaseYear language')
    .lean();

  if (missingPosters.length === 0) {
    console.log('  ✅  No movies with missing poster URLs found!');
  } else {
    console.log(`\n  ⚠️   Found ${missingPosters.length} movie(s) with empty/missing poster URLs:\n`);
    console.log(
      '  ' +
        ['Title', 'Year', 'Language']
          .map((h) => h.padEnd(40))
          .join('')
    );
    console.log('  ' + '─'.repeat(90));

    missingPosters.forEach((m) => {
      const title = (m.title || '(no title)').substring(0, 38).padEnd(40);
      const year  = String(m.releaseYear || '—').padEnd(40);
      const lang  = (m.language || '—').padEnd(20);
      console.log(`  ${title}${year}${lang}`);
    });

    console.log(
      `\n  ℹ️   To fix these, find the correct TMDB poster path and run:\n` +
      `       await Movie.findOneAndUpdate({ title }, { $set: { 'poster.url': 'https://image.tmdb.org/t/p/w500/<path>.jpg' } })`
    );
  }

  // ── STEP 3: Summary ───────────────────────────────────────────────────────
  const totalMovies = await Movie.countDocuments();
  const withPoster  = await Movie.countDocuments({ 'poster.url': { $ne: '' } });
  const pct = ((withPoster / totalMovies) * 100).toFixed(1);

  console.log('\n════════════════════════════════════════');
  console.log('🖼️   Poster Audit Complete');
  console.log(`    Total movies   : ${totalMovies}`);
  console.log(`    With poster    : ${withPoster} (${pct}%)`);
  console.log(`    Missing poster : ${missingPosters.length}`);
  console.log('════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error('❌  Fatal error:', err.message);
  process.exit(1);
});
