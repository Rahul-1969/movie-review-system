import Comment from '../models/Comment.model.js';
import Review from '../models/Review.model.js';

export const createComment = async (req, res, next) => {
  try {
    const { reviewId, parentCommentId, text } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) return res.status(404).json({ success: false, message: 'Parent comment not found' });
      if (parent.review.toString() !== reviewId) {
        return res.status(400).json({ success: false, message: 'Parent comment does not belong to this review' });
      }
    }

    const comment = await Comment.create({
      review: reviewId,
      user: req.user._id,
      parentComment: parentCommentId || null,
      text,
    });

    await Review.findByIdAndUpdate(reviewId, { $inc: { commentCount: 1 } });
    
    await comment.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: comment });
  } catch (err) { 
    next(err); 
  }
};

export const getCommentsByReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const comments = await Comment.find({ review: reviewId })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    const processedComments = comments.map(c => ({
      ...c,
      text: c.isDeleted ? '[deleted]' : c.text,
      user: c.isDeleted ? null : c.user,
      replies: []
    }));

    const commentMap = new Map();
    processedComments.forEach(c => commentMap.set(c._id.toString(), c));

    const rootComments = [];
    processedComments.forEach(c => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        if (commentMap.has(parentId)) {
          const parent = commentMap.get(parentId);
          
          if (parent.parentComment) {
            // Find root ancestor
            let ancestor = parent;
            while (ancestor.parentComment) {
              const nextAncestor = commentMap.get(ancestor.parentComment.toString());
              if (!nextAncestor) break;
              ancestor = nextAncestor;
            }
            ancestor.replies.push(c);
          } else {
            parent.replies.push(c);
          }
        }
      } else {
        rootComments.push(c);
      }
    });

    res.json({ success: true, data: rootComments });
  } catch (err) { 
    next(err); 
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.isDeleted) return res.status(400).json({ success: false, message: 'Cannot edit deleted comment' });
    if (comment.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (!req.body.text?.trim()) return res.status(400).json({ success: false, message: 'Text is required' });

    comment.text = req.body.text.trim();
    await comment.save();
    
    await comment.populate('user', 'name avatar');
    res.json({ success: true, data: comment });
  } catch (err) { 
    next(err); 
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    comment.isDeleted = true;
    await comment.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { 
    next(err); 
  }
};

export const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.isDeleted) return res.status(400).json({ success: false, message: 'Cannot like deleted comment' });

    const userId = req.user._id;
    const hasLiked = comment.likes.some((id) => id.equals(userId));

    if (hasLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ success: true, data: comment });
  } catch (err) { 
    next(err); 
  }
};
