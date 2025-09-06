import Wishlist from "../models/wishlist.model.js";
import Book from "../models/book.model.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";

// 위시리스트 추가
export async function addWishlist(req, res, next) {
  try {
    const { bookId, note } = req.body;
    if (!bookId) throw new CustomError("bookId 필요", 400);

    let book = await Book.findOne({ isbn });
    if(!book) {
      throw new CustomError("책 정보 없음", 402);
    }

    const entry = await Wishlist.create({ userId: req.user._id, bookId: book._id, note: note});
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

// 위시리스트 조회 - 페이지
export async function getWishlist(req, res, next) {
  try {
    const { userId } = req.user._id;
    const { page, limit, skip } = getPagination(req);

    const [items, total] = await Promise.all([
      Wishlist.find({ userId: userId })
        .populate("bookId")
        .skip(skip)
        .limit(limit),
      Wishlist.countDocuments({ userId: userId }),
    ]);
    res.json({ success: true, page, limit, total, data: items });
  } catch (err) {
    next(err);
  }
}

// 위시리스트 삭제
export async function deleteWishlist(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await Wishlist.findById(id);
    if (!entry) throw new CustomError("항목 없음", 404);
    if (!entry.userId.equals(req.user._id)) throw new CustomError("권한 없음", 403);

    await entry.deleteOne();
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}