import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    releaseYear: {
      type: Number,
      min: 1888,
      max: new Date().getFullYear() + 5,
    },
    language: {
      type: String,
      trim: true,
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    cast: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
      },
    ],
    director: {
      type: String,
      trim: true,
    },
    poster: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    trailer: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
        'Please provide a valid YouTube URL',
      ],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contentType: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
    },
  },
  { timestamps: true }
);

// ─── Text index for title search ──────────────────────────────────────────────
movieSchema.index({ averageRating: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ contentType: 1 });
movieSchema.index(
  { title: 'text', description: 'text', director: 'text' },
  { language_override: 'lang_override' }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
