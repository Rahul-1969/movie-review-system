import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model.js';
import Movie from './models/Movie.model.js';
import Genre from './models/Genre.model.js';
import Review from './models/Review.model.js';
import { recalculateRating } from './services/rating.service.js';

const GENRES = [
  { name: 'Action', slug: 'action' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Sci-Fi', slug: 'sci-fi' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Genre.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed genres
    const genres = await Genre.insertMany(GENRES);
    const genreMap = Object.fromEntries(genres.map((g) => [g.slug, g._id]));
    console.log('✅ Genres seeded');

    // Seed admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@moviereview.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@moviereview.com / Admin@123');

    // Seed movies
    const movies = [
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        releaseYear: 2010,
        language: 'English',
        genres: [genreMap['action'], genreMap['sci-fi'], genreMap['thriller']],
        director: 'Christopher Nolan',
        cast: [{ name: 'Leonardo DiCaprio', role: 'Dom Cobb' }, { name: 'Joseph Gordon-Levitt', role: 'Arthur' }],
        trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        poster: { url: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseYear: 1994,
        language: 'English',
        genres: [genreMap['drama']],
        director: 'Frank Darabont',
        cast: [{ name: 'Tim Robbins', role: 'Andy Dufresne' }, { name: 'Morgan Freeman', role: 'Ellis Boyd Redding' }],
        trailer: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
        poster: { url: 'https://image.tmdb.org/t/p/w500/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        releaseYear: 2008,
        language: 'English',
        genres: [genreMap['action'], genreMap['thriller']],
        director: 'Christopher Nolan',
        cast: [{ name: 'Christian Bale', role: 'Bruce Wayne' }, { name: 'Heath Ledger', role: 'The Joker' }],
        trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        poster: { url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        releaseYear: 2014,
        language: 'English',
        genres: [genreMap['sci-fi'], genreMap['drama']],
        director: 'Christopher Nolan',
        cast: [{ name: 'Matthew McConaughey', role: 'Cooper' }, { name: 'Anne Hathaway', role: 'Brand' }],
        trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        poster: { url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        releaseYear: 1994,
        language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'Quentin Tarantino',
        cast: [{ name: 'John Travolta', role: 'Vincent Vega' }, { name: 'Samuel L. Jackson', role: 'Jules Winnfield' }],
        trailer: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
        poster: { url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Matrix',
        description: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.',
        releaseYear: 1999,
        language: 'English',
        genres: [genreMap['action'], genreMap['sci-fi']],
        director: 'The Wachowskis',
        cast: [{ name: 'Keanu Reeves', role: 'Neo' }, { name: 'Laurence Fishburne', role: 'Morpheus' }],
        trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
        poster: { url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Goodfellas',
        description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
        releaseYear: 1990,
        language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'Martin Scorsese',
        cast: [{ name: 'Ray Liotta', role: 'Henry Hill' }, { name: 'Robert De Niro', role: 'James Conway' }],
        trailer: 'https://www.youtube.com/watch?v=qo5jJpHtI1Y',
        poster: { url: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Fight Club',
        description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
        releaseYear: 1999,
        language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'David Fincher',
        cast: [{ name: 'Brad Pitt', role: 'Tyler Durden' }, { name: 'Edward Norton', role: 'The Narrator' }],
        trailer: 'https://www.youtube.com/watch?v=qtRKdVHc-cE',
        poster: { url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Silence of the Lambs',
        description: 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
        releaseYear: 1991,
        language: 'English',
        genres: [genreMap['thriller']],
        director: 'Jonathan Demme',
        cast: [{ name: 'Jodie Foster', role: 'Clarice Starling' }, { name: 'Anthony Hopkins', role: 'Hannibal Lecter' }],
        trailer: 'https://www.youtube.com/watch?v=W6Mm8Sbe__o',
        poster: { url: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        releaseYear: 2019,
        language: 'Korean',
        genres: [genreMap['thriller'], genreMap['drama'], genreMap['comedy']],
        director: 'Bong Joon-ho',
        cast: [{ name: 'Song Kang-ho', role: 'Ki-taek' }, { name: 'Lee Sun-kyun', role: 'Park Dong-ik' }],
        trailer: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
        poster: { url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        releaseYear: 1972, language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'Francis Ford Coppola',
        cast: [{ name: 'Marlon Brando', role: 'Vito Corleone' }, { name: 'Al Pacino', role: 'Michael Corleone' }],
        trailer: 'https://www.youtube.com/watch?v=sY1S34973zA',
        poster: { url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLegHzgGJ9P.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Schindler\'s List',
        description: 'In German-occupied Poland, industrialist Oskar Schindler becomes concerned for his Jewish workforce after seeing their persecution by the Nazis.',
        releaseYear: 1993, language: 'English',
        genres: [genreMap['drama']],
        director: 'Steven Spielberg',
        cast: [{ name: 'Liam Neeson', role: 'Oskar Schindler' }, { name: 'Ralph Fiennes', role: 'Amon Göth' }],
        trailer: 'https://www.youtube.com/watch?v=gG22XNhtnoY',
        poster: { url: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Forrest Gump',
        description: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other history unfold through the perspective of an Alabama man.',
        releaseYear: 1994, language: 'English',
        genres: [genreMap['drama'], genreMap['comedy']],
        director: 'Robert Zemeckis',
        cast: [{ name: 'Tom Hanks', role: 'Forrest Gump' }, { name: 'Robin Wright', role: 'Jenny Curran' }],
        trailer: 'https://www.youtube.com/watch?v=bLvqoHBptjg',
        poster: { url: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Whiplash',
        description: 'A promising young drummer enrolls at a cut-throat music conservatory where his teacher will stop at nothing to realize a student\'s potential.',
        releaseYear: 2014, language: 'English',
        genres: [genreMap['drama']],
        director: 'Damien Chazelle',
        cast: [{ name: 'Miles Teller', role: 'Andrew Neiman' }, { name: 'J.K. Simmons', role: 'Terence Fletcher' }],
        trailer: 'https://www.youtube.com/watch?v=7d_jQycdQGo',
        poster: { url: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Prestige',
        description: 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have.',
        releaseYear: 2006, language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'Christopher Nolan',
        cast: [{ name: 'Hugh Jackman', role: 'Robert Angier' }, { name: 'Christian Bale', role: 'Alfred Borden' }],
        trailer: 'https://www.youtube.com/watch?v=o4gHCmTQDVI',
        poster: { url: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Joker',
        description: 'A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain.',
        releaseYear: 2019, language: 'English',
        genres: [genreMap['thriller'], genreMap['drama']],
        director: 'Todd Phillips',
        cast: [{ name: 'Joaquin Phoenix', role: 'Arthur Fleck' }, { name: 'Robert De Niro', role: 'Murray Franklin' }],
        trailer: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
        poster: { url: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Gladiator',
        description: 'A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        releaseYear: 2000, language: 'English',
        genres: [genreMap['action'], genreMap['drama']],
        director: 'Ridley Scott',
        cast: [{ name: 'Russell Crowe', role: 'Maximus' }, { name: 'Joaquin Phoenix', role: 'Commodus' }],
        trailer: 'https://www.youtube.com/watch?v=owK1qxDselE',
        poster: { url: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'The Social Network',
        description: 'As Harvard student Mark Zuckerberg creates the social networking site that would become Facebook, he is sued by the twins who claimed he stole their idea.',
        releaseYear: 2010, language: 'English',
        genres: [genreMap['drama']],
        director: 'David Fincher',
        cast: [{ name: 'Jesse Eisenberg', role: 'Mark Zuckerberg' }, { name: 'Andrew Garfield', role: 'Eduardo Saverin' }],
        trailer: 'https://www.youtube.com/watch?v=lB95KLmpLR4',
        poster: { url: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Saving Private Ryan',
        description: 'Following the Normandy Landings, a group of US soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        releaseYear: 1998, language: 'English',
        genres: [genreMap['action'], genreMap['drama']],
        director: 'Steven Spielberg',
        cast: [{ name: 'Tom Hanks', role: 'Captain Miller' }, { name: 'Matt Damon', role: 'Private Ryan' }],
        trailer: 'https://www.youtube.com/watch?v=9CiW_DgxCnQ',
        poster: { url: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg', public_id: '' },
        addedBy: admin._id,
      },
      {
        title: 'Spirited Away',
        description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
        releaseYear: 2001, language: 'Japanese',
        genres: [genreMap['drama']],
        director: 'Hayao Miyazaki',
        cast: [{ name: 'Daveigh Chase', role: 'Chihiro (voice)' }, { name: 'Suzanne Pleshette', role: 'Yubaba (voice)' }],
        trailer: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
        poster: { url: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', public_id: '' },
        addedBy: admin._id,
      },
    ];

    const testUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'User@1234',
      role: 'user',
    });

    await Movie.insertMany(movies);
    console.log('✅ 20 movies seeded');

    const insertedMovies = await Movie.find({});

    const reviewData = [
      {
        title: 'Inception',
        rating: 9,
        comment:
          'Mind-bending masterpiece. Nolan at his absolute best. The layered dream sequences are unlike anything in cinema.',
      },
      {
        title: 'The Dark Knight',
        rating: 10,
        comment:
          "Heath Ledger's Joker is the greatest villain performance in superhero history. A flawless film.",
      },
      {
        title: 'Parasite',
        rating: 9,
        comment:
          'Bong Joon-ho crafts a perfect thriller. The class commentary is sharp and the third act is unforgettable.',
      },
      {
        title: 'The Matrix',
        rating: 9,
        comment:
          'Revolutionary filmmaking. Still holds up perfectly. The action choreography redefined cinema.',
      },
      {
        title: 'Pulp Fiction',
        rating: 8,
        comment:
          "Tarantino's nonlinear storytelling keeps you hooked from start to finish. Iconic dialogue throughout.",
      },
      {
        title: 'Goodfellas',
        rating: 9,
        comment:
          "Scorsese's best work. Ray Liotta is phenomenal and the narration pulls you right into mob life.",
      },
      {
        title: 'Fight Club',
        rating: 8,
        comment:
          "The twist still hits hard even on rewatch. Fincher's direction is razor sharp throughout.",
      },
      {
        title: 'Interstellar',
        rating: 8,
        comment:
          'Emotionally devastating and visually stunning. The docking scene is the most tense 10 minutes in film.',
      },
    ];

    for (const r of reviewData) {
      const movie = insertedMovies.find((m) => m.title === r.title);

      if (!movie) continue;

      await Review.create({
        movie: movie._id,
        user: testUser._id,
        rating: r.rating,
        comment: r.comment,
      });

      await recalculateRating(movie._id);
    }

    console.log('✅ Reviews seeded');

    console.log('\n🎬 Seed complete!');
    console.log('Admin credentials: admin@moviereview.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
