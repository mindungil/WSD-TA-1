import Comment from "../models/comment.model.js";
import Review from "../models/review.model.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";

// 댓글 등록
export async function createComment(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content) throw new CustomError("댓글 내용을 입력하세요.", 400);

    const review = await Review.findById(reviewId);
    if (!review) throw new CustomError("리뷰가 존재하지 않습니다.", 404);

    const comment = await Comment.create({ userId: req.user._id, reviewId: reviewId, content });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

// 리뷰별 댓글 조회(페이지)
export async function getCommentsByReview(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { page, limit, skip } = getPagination(req);

    const [items, total] = await Promise.all([
      Comment.find({ reviewId: reviewId }).populate("userId", "nickname").skip(skip).limit(limit),
      Comment.countDocuments({ reviewId: reviewId }),
    ]);
    res.json({ success: true, page, limit, total, data: items });
  } catch (err) {
    next(err);
  }
}

// 댓글 수정
export async function updateComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) throw new CustomError("댓글을 찾을 수 없습니다.", 404);
    if (!comment.userId.equals(req.user._id)) throw new CustomError("권한이 없습니다.", 403);

    if (req.body.content !== undefined) comment.content = req.body.content;
    await comment.save();
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

// 댓글 삭제
export async function deleteComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) throw new CustomError("댓글을 찾을 수 없습니다.", 404);
    if (!comment.user.equals(req.user._id)) throw new CustomError("권한이 없습니다.", 403);

    await comment.remove();
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}