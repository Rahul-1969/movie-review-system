import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500, default: '' },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    isPublic: { type: Boolean, default: true },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

listSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('List', listSchema);
