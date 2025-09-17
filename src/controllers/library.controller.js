import Book from "../models/book.model.js";
import Library from "../models/library.model.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";

// 라이브러리에 도서 등록
export async function addBookToLibrary(req, res, next) {
  try {
    const { bookId } = req.body;
    if (!bookId) throw new CustomError("bookId가 필요합니다. ", 404);

    let book = await Book.findById({ _id: bookId });
    if (!book) {
      // 서버에 책이 없으면 추가하는 방식
      // book = await Book.create({ isbn, title, authors, publisher, thumbnail, category });
      
      // 서버에 책이 없으면 오류를 반환하는 방식
      throw new CustomError("책 정보가 존재하지 않습니다.", 403);
    }

    const lib = await Library.create({ userId: req.user._id, bookId: book._id, isbn: book.isbn });
    return res.status(201).json({ success: true, data: lib });
  } catch (err) {
    next(err);
  }
}

// 회원의 라이브러리 목록 조회(페이지)
export async function getLibraryList(req, res, next) {
  try {
    const userId = req.user._id;
    const { page, limit, skip } = getPagination(req);

    const [items, total] = await Promise.all([
      Library.find({ userId: userId }).skip(skip).limit(limit).lean(),
      Library.countDocuments({ userId: userId }),
    ]);

    return res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

// 라이브러리 도서 조회(단일)
export async function getLibraryOne(req, res, next) {
  try {
    const { bookId, isbn } = req.query;
    const userId = req.user._id;

    if (!bookId && !isbn) throw new CustomError("bookId 또는 isbn이 필요합니다.", 400);

    let filter;
    if (bookId) {
      filter = { userId, bookId };
    } else {
      filter = { userId, isbn };
    }

    const item = await Library.findOne(filter);
    return res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// 라이브러리 도서 삭제
export async function deleteLibraryItem(req, res, next) {
  try {
    const id = req.params.id;
    const library = await Library.findById(id);
    if (!library) throw new CustomError("해당 등록을 찾을 수 없습니다.", 404);
    if (!library.userId.equals(req.user._id)) throw new CustomError("권한이 없습니다.", 403);

    await library.deleteOne();
    res.json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    next(err);
  }
}