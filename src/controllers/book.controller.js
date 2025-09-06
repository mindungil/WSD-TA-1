import Book from "../models/book.model.js";
import Library from "../models/library.model.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

// 책 검색 및 저장
export async function searchBook(req, res, next) {
  try {
    const title = req.query.title;
    const page = req.query.page || 1;
    const size = req.query.size || 10;

    if(!title) throw new CustomError("책 제목이 전달되지 않았습니다.", 404);

    const response = await axios.get("https://dapi.kakao.com/v3/search/book", {
      params: {
        target: "title",
        query: title,
        page,
        size
      },
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
      },
    });

    // 책 정보 서버 DB에 삽입
    const bulkOps = response.data.documents.map((doc) => ({
      updateOne: {
        filter: { isbn: doc.isbn },
        update: {
          $setOnInsert: {
            title: doc.title,
            authors: doc.authors,
            publisher: doc.publisher,
            price: doc.price,
            sale_price: doc.sale_price,
            contents: doc.contents,
            thumbnail: doc.thumbnail,
            isbn: doc.isbn,
            publishedAt: doc.datetime,
            status: doc.status
          },
        },
        upsert: true,
      },
    }));

    const result = await Book.bulkWrite(bulkOps)

    return res.status(200).json({
      success: true,
      data: response.data.documents,
      meta: response.data.meta
    });
  } catch(err) {
    next(err);
  }
}

// 서버에 등록된 책 단일 조회
export async function getBook(req, res, next) {
  try {
    const bookId = req.params.bookId;
    if(!bookId) throw new CustomError("bookId가 필요합니다.", 404);

    const book = await Book.findById({_id: bookId});
    return res.status(200).json({
      success: true,
      data: book
    });
  } catch(err) {
    next(err);
  }
}

// 서버에 등록된 책 목록(이름 검색 + 페이지네이션)
export async function getBookList(req, res, next) {
  try {
    const title = req.query.title;
    if (!title) throw new CustomError("title이 필요합니다.", 404);

    const { page, limit, skip } = getPagination(req);

    // title 부분일치 검색 + 페이지네이션
    const [books, total] = await Promise.all([
      Book.find({ title: new RegExp(title, "i") }) // 대소문자 구분 X
        .skip(skip)
        .limit(limit),
      Book.countDocuments({ title: new RegExp(title, "i") }),
    ]);

    return res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total,               
        page,                
        limit,               
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ISBN으로 단일 책 조회(서버)
export async function getBookToIsbn(req, res, next) {
  try {
    const isbn = req.params.isbn;
    const book = await Book.findOne({isbn: isbn});

    if(!book) throw new CustomError("해당 도서가 존재하지 않습니다.", 404);
    
    res.json({success: true, data: book });
  } catch(err) {
    next(err);
  }
}