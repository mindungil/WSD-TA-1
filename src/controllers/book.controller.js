import { Book, Publisher, Author, Category, BookAuthor, BookCategory } from "../models/index.js";
import { CustomError } from "../utils/CustomError.js";
import { getPagination } from "../utils/paginate.js";
import { Op } from "sequelize";

// 도서 등록
export async function createBook(req, res, next) {
  try {
    const { isbn, title, publisherName, authorNames, categoryNames, publishedDate, price, stock, description } = req.body;

    if (!isbn || !title || !price) {
      throw new CustomError("ISBN, 제목, 가격은 필수입니다.", 400);
    }

    // ISBN 중복 확인
    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      throw new CustomError("이미 등록된 ISBN입니다.", 409);
    }

    // Publisher 처리
    let publisher = null;
    if (publisherName) {
      [publisher] = await Publisher.findOrCreate({
        where: { name: publisherName },
        defaults: { name: publisherName },
      });
    }

    // Book 생성
    const book = await Book.create({
      isbn,
      title,
      publisher_id: publisher ? publisher.id : null,
      published_date: publishedDate || null,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      description: description || null,
      status: "active",
    });

    // Authors 처리
    if (authorNames && Array.isArray(authorNames)) {
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
    if (categoryNames && Array.isArray(categoryNames)) {
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

    // 생성된 도서 조회 (관계 포함)
    const createdBook = await Book.findByPk(book.id, {
      include: [
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
        { model: Category, as: "categories" },
      ],
    });

    res.status(201).json({ success: true, data: createdBook });
  } catch (err) {
    next(err);
  }
}

// 도서 수정
export async function updateBook(req, res, next) {
  try {
    const { bookId } = req.params;
    const { title, publisherName, authorNames, categoryNames, publishedDate, price, stock, description, status } = req.body;

    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new CustomError("해당 도서가 존재하지 않습니다.", 404);
    }

    // Publisher 처리
    if (publisherName !== undefined) {
      if (publisherName) {
        const [publisher] = await Publisher.findOrCreate({
          where: { name: publisherName },
          defaults: { name: publisherName },
        });
        book.publisher_id = publisher.id;
      } else {
        book.publisher_id = null;
      }
    }

    // 기본 필드 업데이트
    if (title !== undefined) book.title = title;
    if (publishedDate !== undefined) book.published_date = publishedDate;
    if (price !== undefined) book.price = parseFloat(price);
    if (stock !== undefined) book.stock = parseInt(stock);
    if (description !== undefined) book.description = description;
    if (status !== undefined) book.status = status;

    await book.save();

    // Authors 처리
    if (authorNames !== undefined && Array.isArray(authorNames)) {
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
    if (categoryNames !== undefined && Array.isArray(categoryNames)) {
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

    // 수정된 도서 조회 (관계 포함)
    const updatedBook = await Book.findByPk(book.id, {
      include: [
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
        { model: Category, as: "categories" },
      ],
    });

    res.json({ success: true, data: updatedBook });
  } catch (err) {
    next(err);
  }
}

// 도서 단일 조회
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

// 도서 목록 조회
export async function getBookList(req, res, next) {
  try {
    const title = req.query.title;
    if (!title) throw new CustomError("title이 필요합니다.", 404);

    const { page, limit, skip } = getPagination(req);

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
