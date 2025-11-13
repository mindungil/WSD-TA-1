import { Book, Publisher, Author, Category, BookAuthor, BookCategory } from "../models/index.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";
import { Op } from "sequelize";
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
        let upserted = 0;
        let modified = 0;

        for (const r of records) {
          // Publisher 처리
          let publisher = null;
          if (r.publisher) {
            [publisher] = await Publisher.findOrCreate({
              where: { name: r.publisher },
              defaults: { name: r.publisher },
            });
          }

          // Book 처리
          const [book, created] = await Book.findOrCreate({
            where: { isbn: r.isbn },
            defaults: {
              title: r.title,
              publisher_id: publisher ? publisher.id : null,
              price: r.price ? parseFloat(r.price) : 0,
              published_date: r.publishedAt || null,
              description: r.contents || null,
              status: r.status || "active",
            },
          });

          if (!created) {
            await book.update({
              title: r.title,
              publisher_id: publisher ? publisher.id : null,
              price: r.price ? parseFloat(r.price) : 0,
              published_date: r.publishedAt || null,
              description: r.contents || null,
              status: r.status || "active",
            });
            modified++;
          } else {
            upserted++;
          }

          // Authors 처리
          if (r.authors) {
            const authorNames = String(r.authors).split("|").map((s) => s.trim()).filter(Boolean);
            await BookAuthor.destroy({ where: { book_id: book.id } });
            for (let i = 0; i < authorNames.length; i++) {
              const [author] = await Author.findOrCreate({
                where: { name: authorNames[i] },
                defaults: { name: authorNames[i] },
              });
              await BookAuthor.create({
                book_id: book.id,
                author_id: author.id,
                author_order: i + 1,
              });
            }
          }

          // Categories 처리
          if (r.categories) {
            const categoryNames = String(r.categories).split("|").map((s) => s.trim()).filter(Boolean);
            await BookCategory.destroy({ where: { book_id: book.id } });
            for (const categoryName of categoryNames) {
              const [category] = await Category.findOrCreate({
                where: { name: categoryName },
                defaults: { name: categoryName },
              });
              await BookCategory.create({
                book_id: book.id,
                category_id: category.id,
              });
            }
          }
        }

        return res.status(200).json({ success: true, data: { upserted, modified } });
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
    if (!bookId) throw new CustomError("bookId가 필요합니다.", 404);

    const book = await Book.findByPk(bookId, {
      include: [
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
        { model: Category, as: "categories" },
      ],
    });

    if (!book) throw new CustomError("해당 도서가 존재하지 않습니다.", 404);

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
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
    const { count, rows: books } = await Book.findAndCountAll({
      where: {
        title: {
          [Op.iLike]: `%${title}%`,
        },
      },
      include: [
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
        { model: Category, as: "categories" },
      ],
      offset: skip,
      limit: limit,
    });

    return res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
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
    const book = await Book.findOne({
      where: { isbn },
      include: [
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
        { model: Category, as: "categories" },
      ],
    });

    if (!book) throw new CustomError("해당 도서가 존재하지 않습니다.", 404);

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
}
