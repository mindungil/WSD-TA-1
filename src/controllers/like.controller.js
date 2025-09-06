import ReviewLike from "../models/reviewLike.model.js";
import CommentLike from "../models/commentLike.model.js";
import Review from "../models/review.model.js";
import Comment from "../models/comment.model.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";

// 리뷰
// 좋아요 누르기
export async function likeReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) throw new CustomError("리뷰가 존재하지 않습니다.", 404);

      // 중복 체크는 unique index가지만 race condition 완화 위해 시도
      try {
        await ReviewLike.create({ userId: req.user._id, reviewId: reviewId });
        review.likes = (review.likes || 0) + 1;
        await review.save();
      } catch (e) {
        if (e.code === 11000) {
          throw new CustomError("이미 좋아요를 눌렀습니다.", 409);
        }
        throw e;
      }

    res.json({ success: true, message: "좋아요 등록" });
  } catch (err) {
    next(err);
  }
}
// 좋아요 취소
export async function unlikeReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const like = await ReviewLike.findOne({ userId: req.user._id, reviewId: reviewId });
    if (!like) throw new CustomError("좋아요를 누르지 않았습니다.", 400);

    await like.deleteOne();
    await Review.findByIdAndUpdate(reviewId, { $inc: { likes: -1 } });

    res.json({ success: true, message: "좋아요 취소" });
  } catch (err) {
    next(err);
  }
}
// 사용자가 좋아요 한 리뷰 조회 (페이지)
export async function getLikeReviews(req, res, next) {
  try {
    const userId = req.user._id;
    const { page, limit, skip, sort } = getPagination(req);

    // 유저가 좋아요한 리뷰 찾기
    const likes = await ReviewLike.find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ReviewLike.countDocuments({ userId });

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: likes.map(like => like.reviewId),
    });
  } catch (err) {
    next(err);
  }
}


// 댓글
// 좋아요 누르기
export async function likeComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) throw new CustomError("댓글이 존재하지 않습니다.", 404);

      // 중복 체크는 unique index가지만 race condition 완화 위해 시도
      try {
        await CommentLike.create({ userId: req.user._id, commentId });
        comment.likes = (comment.likes || 0) + 1;
        await comment.save();
      } catch (e) {
        if (e.code === 11000) {
          throw new CustomError("이미 좋아요를 눌렀습니다.", 409);
        }
        throw e;
      }

    res.json({ success: true, message: "좋아요 등록" });
  } catch (err) {
    next(err);
  }
}
// 좋아요 취소
export async function unlikeComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const like = await CommentLike.findOne({ userId: req.user._id, commentId: commentId });
    if (!like) throw new CustomError("좋아요를 누르지 않았습니다.", 400);

    await like.deleteOne();
    await Comment.findByIdAndUpdate(commentId, { $inc: { likes: -1 } });

    res.json({ success: true, message: "좋아요 취소" });
  } catch (err) {
    next(err);
  }
}
// 좋아요 한 댓글 조회 (페이지)
export async function getLikeComments(req, res, next) {
  try {
    const userId = req.user._id;
    const { page, limit, skip, sort } = getPagination(req);

    // 유저가 좋아요한 댓글 찾기
    const likes = await CommentLike.find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await CommentLike.countDocuments({ userId });

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: likes.map(like => like.commentId),
    });
  } catch (err) {
    next(err);
  }
}
