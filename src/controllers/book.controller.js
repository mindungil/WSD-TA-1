import Book from "../models/book.model.js";
import Library from "../models/library.model.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";
import fs from "fs";
import { parse } from "csv-parse";
import multer from "multer";

// CSV 업로드용 multer 설정 (메모리 저장)
const upload = multer({ storage: multer.memoryStorage() });

// 책 검색 및 저장
// CSV 파일을 업로드하여 도서 등록
export const uploadCsvMiddleware = upload.single("file");

export async function importBooksFromCsv(req, res, next) {
  try {
    if (!req.file) throw new CustomError("CSV 파일이 필요합니다.", 400);

    const csvBuffer = req.file.buffer;
    const parser = parse({ columns: true, trim: true });

    const records = [];
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    parser.on("error", (err) => next(err));

    parser.on("end", async () => {
      try {
        // CSV 컬럼 가정: isbn,title,authors,publisher,price,sale_price,contents,thumbnail,publishedAt,status,categories
        const bulkOps = records.map((r) => {
          const authors = r.authors ? String(r.authors).split("|").map((s) => s.trim()).filter(Boolean) : [];
          const categories = r.categories ? String(r.categories).split("|").map((s) => s.trim()).filter(Boolean) : [];
          return {
            updateOne: {
              filter: { isbn: r.isbn },
              update: {
                $set: {
                  title: r.title,
                  authors,
                  publisher: r.publisher || undefined,
                  price: r.price ? Number(r.price) : undefined,
                  sale_price: r.sale_price ? Number(r.sale_price) : undefined,
                  contents: r.contents || undefined,
                  thumbnail: r.thumbnail || undefined,
                  publishedAt: r.publishedAt || undefined,
                  status: r.status || undefined,
                  categories,
                },
                $setOnInsert: { isbn: r.isbn },
              },
              upsert: true,
            },
          };
        });

        if (bulkOps.length === 0) {
          return res.status(400).json({ success: false, message: "CSV 데이터가 비어 있습니다." });
        }

        const result = await Book.bulkWrite(bulkOps, { ordered: false });
        return res.status(200).json({ success: true, data: { upserted: result.upsertedCount, modified: result.modifiedCount } });
      } catch (e) {
        next(e);
      }
    });

    parser.write(csvBuffer);
    parser.end();
  } catch (err) {
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