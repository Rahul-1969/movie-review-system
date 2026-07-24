import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// ─── Auto-generate slug from name ─────────────────────────────────────────────
genreSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

const Genre = mongoose.model('Genre', genreSchema);
export default Genre;
