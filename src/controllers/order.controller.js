import { Order, OrderItem, Cart, Book, User, Publisher, Author } from "../models/index.js";
import { getPagination } from "../utils/paginate.js";
import { CustomError } from "../utils/CustomError.js";
import { Op } from "sequelize";
import sequelize from "../config/postgresql.config.js";

// 주문 생성 (장바구니에서)
export async function createOrder(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { payment_method = "card" } = req.body;
    const userId = req.user.id;

    // 장바구니 조회
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Book, as: "book" }],
      transaction,
    });

    if (cartItems.length === 0) {
      throw new CustomError("장바구니가 비어있습니다.", 400);
    }

    // 재고 확인 및 총 금액 계산
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      if (cartItem.book.stock < cartItem.quantity) {
        throw new CustomError(`"${cartItem.book.title}"의 재고가 부족합니다.`, 400);
      }
      totalAmount += parseFloat(cartItem.book.price) * cartItem.quantity;
    }

    // 주문 생성
    const order = await Order.create(
      {
        user_id: userId,
        total_amount: totalAmount.toFixed(2),
        payment_method,
        status: "paid",
      },
      { transaction }
    );

    // 주문 항목 생성 및 재고 차감
    const orderItems = [];
    for (const cartItem of cartItems) {
      const orderItem = await OrderItem.create(
        {
          order_id: order.id,
          book_id: cartItem.book_id,
          quantity: cartItem.quantity,
          price: cartItem.book.price,
        },
        { transaction }
      );

      // 재고 차감
      await Book.update(
        { stock: cartItem.book.stock - cartItem.quantity },
        { where: { id: cartItem.book_id }, transaction }
      );

      orderItems.push(orderItem);
    }

    // 장바구니 비우기
    await Cart.destroy({ where: { user_id: userId }, transaction });

    await transaction.commit();

    // 주문 정보 조회 (관계 포함)
    const orderWithDetails = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
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
        },
      ],
    });

    res.status(201).json({ success: true, data: orderWithDetails });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
}

// 주문 목록 조회
export async function getOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title", "isbn"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: skip,
      limit: limit,
    });

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// 주문 상세 조회
export async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
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
        },
      ],
    });

    if (!order) throw new CustomError("주문을 찾을 수 없습니다.", 404);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

// 주문 수정
export async function updateOrder(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [{ model: Book, as: "book" }],
        },
      ],
      transaction,
    });

    if (!order) throw new CustomError("주문을 찾을 수 없습니다.", 404);

    const oldStatus = order.status;

    if (status !== undefined) {
      if (status === "canceled" && oldStatus === "paid") {
        // 주문 취소 시 재고 복구
        for (const orderItem of order.orderItems) {
          await Book.increment(
            { stock: orderItem.quantity },
            { where: { id: orderItem.book_id }, transaction }
          );
        }
      } else if (oldStatus === "canceled" && status === "paid") {
        // 취소된 주문을 다시 결제로 변경 시 재고 차감
        for (const orderItem of order.orderItems) {
          if (orderItem.book.stock < orderItem.quantity) {
            throw new CustomError(`"${orderItem.book.title}"의 재고가 부족합니다.`, 400);
          }
          await Book.decrement(
            { stock: orderItem.quantity },
            { where: { id: orderItem.book_id }, transaction }
          );
        }
      }
      order.status = status;
    }

    if (payment_method !== undefined) {
      order.payment_method = payment_method;
    }

    await order.save({ transaction });
    await transaction.commit();

    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
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
        },
      ],
    });

    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
}

// 주문 취소
export async function cancelOrder(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [{ model: Book, as: "book" }],
        },
      ],
      transaction,
    });

    if (!order) throw new CustomError("주문을 찾을 수 없습니다.", 404);
    if (order.status === "canceled") {
      throw new CustomError("이미 취소된 주문입니다.", 400);
    }

    // 주문 취소
    order.status = "canceled";
    await order.save({ transaction });

    // 재고 복구
    for (const orderItem of order.orderItems) {
      await Book.increment(
        { stock: orderItem.quantity },
        { where: { id: orderItem.book_id }, transaction }
      );
    }

    await transaction.commit();

    res.json({ success: true, message: "주문이 취소되었습니다.", data: order });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
}

