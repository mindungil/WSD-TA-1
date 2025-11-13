import { Review, Book, User } from "../models/index.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";
import { getRedis } from "../config/redis.config.js";
import { Op } from "sequelize";

// 리뷰 조회(redis 캐싱, 페이지)
export async function getReviews(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req);
    const { bookId } = req.params;

    // 페이지 단위 캐시 키 생성
    // 버전 키를 사용해 대량 무효화 비용을 줄임
    const version = (await getRedis().get("reviews:top:version")) || "0";
    const cacheKey = `reviews:top:v:${version}:book:${bookId || "all"}:page:${page}:limit:${limit}`;
    const cached = await getRedis().get(cacheKey);

    if (cached) {
      return res.json({ success: true, source: "cache", data: JSON.parse(cached) });
    }

    // DB 조회
    const where = { status: "active" };
    if (bookId) {
      where.book_id = parseInt(bookId);
    }

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "isbn"],
        },
      ],
      order: [["rating", "DESC"], ["created_at", "DESC"]],
      offset: skip,
      limit: limit,
    });

    // 캐시 저장 (예: 60초)
    await getRedis().set(cacheKey, JSON.stringify(reviews), { EX: 60 });

    res.json({ success: true, source: "db", data: reviews, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
}

// 리뷰 생성
export async function createReview(req, res, next) {
  try {
    const bookId = req.params.bookId;
    const { content, rating } = req.body;
    if (!bookId || !content || !rating) throw new CustomError("book 식별자, 내용, 평점이 필요합니다.", 400);

    // 책이 DB에 있는지 확인
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new CustomError("책 정보가 없습니다.", 404);
    }

    // 이미 리뷰를 작성했는지 확인
    const existingReview = await Review.findOne({
      where: { user_id: req.user.id, book_id: bookId },
    });

    if (existingReview) {
      throw new CustomError("이미 리뷰를 작성하셨습니다.", 409);
    }

    const review = await Review.create({
      user_id: req.user.id,
      book_id: bookId,
      content,
      rating,
    });

    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// 리뷰 수정
export async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) throw new CustomError("리뷰를 찾을 수 없습니다.", 404);
    if (review.user_id !== req.user.id) throw new CustomError("권한이 없습니다.", 403);

    const allowed = ["content", "rating"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) review[k] = req.body[k];
    });

    await review.save();

    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// 리뷰 삭제
export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) throw new CustomError("리뷰를 찾을 수 없습니다.", 404);
    if (review.user_id !== req.user.id) throw new CustomError("권한이 없습니다.", 403);

    review.status = "deleted";
    review.deleted_at = new Date();
    await review.save();

    // 캐시 무효화 - 모든 페이지 캐시 삭제
    try {
      await getRedis().incr("reviews:top:version");
    } catch (cacheError) {
      console.error("캐시 무효화 실패:", cacheError);
      // 캐시 오류는 무시하고 계속 진행
    }
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}

// 사용자의 리뷰 전체 조회(페이지)
export async function getUserReviews(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { user_id: userId, status: "active" },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "isbn"],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: skip,
      limit: limit,
    });

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}
