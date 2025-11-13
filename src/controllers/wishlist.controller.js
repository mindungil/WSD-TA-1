import { Wishlist, Book, Publisher, Author } from "../models/index.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";

// 위시리스트 추가
export async function addWishlist(req, res, next) {
  try {
    const { bookId } = req.body;
    if (!bookId) throw new CustomError("bookId 필요", 400);

    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new CustomError("책 정보 없음", 404);
    }

    // 이미 위시리스트에 있는지 확인
    const existing = await Wishlist.findOne({
      where: { user_id: req.user.id, book_id: bookId },
    });

    if (existing) {
      throw new CustomError("이미 위시리스트에 추가된 책입니다.", 409);
    }

    const entry = await Wishlist.create({ user_id: req.user.id, book_id: bookId });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

// 위시리스트 조회 - 페이지
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const { count, rows: items } = await Wishlist.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Book,
          as: "book",
          include: [
            { model: Publisher, as: "publisher" },
            { model: Author, as: "authors", through: { attributes: ["author_order"] } },
          ],
        },
      ],
      offset: skip,
      limit: limit,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// 위시리스트 삭제
export async function deleteWishlist(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await Wishlist.findByPk(id);
    if (!entry) throw new CustomError("항목 없음", 404);
    if (entry.user_id !== req.user.id) throw new CustomError("권한 없음", 403);

    await entry.destroy();
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}
