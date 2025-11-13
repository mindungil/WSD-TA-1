import { Category, Book, Publisher, Author } from "../models/index.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";

// 카테고리 목록 조회 (계층 구조)
export async function getCategories(req, res, next) {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    // 계층 구조로 변환
    const categoryMap = new Map();
    const rootCategories = [];

    // 모든 카테고리를 맵에 저장
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_id,
        children: [],
      });
    });

    // 계층 구조 구성
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        } else {
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    res.json({ success: true, data: rootCategories });
  } catch (err) {
    next(err);
  }
}

// 카테고리별 도서 조회
export async function getBooksByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const { page, limit, skip } = getPagination(req);

    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new CustomError("카테고리를 찾을 수 없습니다.", 404);
    }

    // 카테고리와 연결된 도서 조회
    const { count, rows: books } = await Book.findAndCountAll({
      include: [
        {
          model: Category,
          as: "categories",
          where: { id: categoryId },
          attributes: [],
        },
        { model: Publisher, as: "publisher" },
        { model: Author, as: "authors", through: { attributes: ["author_order"] } },
      ],
      offset: skip,
      limit: limit,
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    res.json({
      success: true,
      data: books,
      category: { id: category.id, name: category.name },
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// 카테고리 생성 (관리자용 - 추후 권한 체크 추가 가능)
export async function createCategory(req, res, next) {
  try {
    const { name, parentId } = req.body;
    if (!name) throw new CustomError("카테고리 이름이 필요합니다.", 400);

    // 부모 카테고리 확인
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        throw new CustomError("부모 카테고리를 찾을 수 없습니다.", 404);
      }
    }

    const category = await Category.create({
      name,
      parent_id: parentId || null,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

