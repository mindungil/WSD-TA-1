import { Cart, Book, Publisher, Author } from "../models/index.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";

// 장바구니 추가
export async function addToCart(req, res, next) {
  try {
    const { bookId, quantity } = req.body;
    if (!bookId) throw new CustomError("bookId가 필요합니다.", 400);

    const quantityNum = quantity ? parseInt(quantity) : 1;
    if (quantityNum <= 0) throw new CustomError("수량은 1 이상이어야 합니다.", 400);

    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new CustomError("책 정보가 없습니다.", 404);
    }

    // 재고 확인
    if (book.stock < quantityNum) {
      throw new CustomError("재고가 부족합니다.", 400);
    }

    // 이미 장바구니에 있는지 확인
    const [cartItem, created] = await Cart.findOrCreate({
      where: { user_id: req.user.id, book_id: bookId },
      defaults: {
        user_id: req.user.id,
        book_id: bookId,
        quantity: quantityNum,
      },
    });

    if (!created) {
      // 이미 있으면 수량 증가
      cartItem.quantity += quantityNum;
      if (book.stock < cartItem.quantity) {
        throw new CustomError("재고가 부족합니다.", 400);
      }
      await cartItem.save();
    }

    res.status(201).json({ success: true, data: cartItem });
  } catch (err) {
    next(err);
  }
}

// 장바구니 조회
export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const { count, rows: items } = await Cart.findAndCountAll({
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

    // 총 금액 계산
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += parseFloat(item.book.price) * item.quantity;
    });

    res.json({
      success: true,
      data: items,
      totalAmount: totalAmount.toFixed(2),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// 장바구니 수량 수정
export async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new CustomError("수량은 1 이상이어야 합니다.", 400);
    }

    const cartItem = await Cart.findByPk(id, {
      include: [{ model: Book, as: "book" }],
    });

    if (!cartItem) throw new CustomError("장바구니 항목을 찾을 수 없습니다.", 404);
    if (cartItem.user_id !== req.user.id) throw new CustomError("권한이 없습니다.", 403);

    // 재고 확인
    if (cartItem.book.stock < quantity) {
      throw new CustomError("재고가 부족합니다.", 400);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ success: true, data: cartItem });
  } catch (err) {
    next(err);
  }
}

// 장바구니 항목 삭제
export async function removeFromCart(req, res, next) {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);

    if (!cartItem) throw new CustomError("장바구니 항목을 찾을 수 없습니다.", 404);
    if (cartItem.user_id !== req.user.id) throw new CustomError("권한이 없습니다.", 403);

    await cartItem.destroy();
    res.json({ success: true, message: "장바구니에서 제거되었습니다." });
  } catch (err) {
    next(err);
  }
}

// 장바구니 전체 비우기
export async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;
    await Cart.destroy({ where: { user_id: userId } });
    res.json({ success: true, message: "장바구니가 비워졌습니다." });
  } catch (err) {
    next(err);
  }
}

