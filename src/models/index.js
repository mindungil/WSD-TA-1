import User from "./user.model.js";
import Publisher from "./publisher.model.js";
import Book from "./book.model.js";
import Author from "./author.model.js";
import BookAuthor from "./bookAuthor.model.js";
import Category from "./category.model.js";
import BookCategory from "./bookCategory.model.js";
import Order from "./order.model.js";
import OrderItem from "./orderItem.model.js";
import Review from "./review.model.js";
import Wishlist from "./wishlist.model.js";
import Cart from "./cart.model.js";

// Publishers - Books 관계
Publisher.hasMany(Book, { foreignKey: "publisher_id", as: "books" });
Book.belongsTo(Publisher, { foreignKey: "publisher_id", as: "publisher" });

// Books - Authors 관계 (N:M)
Book.belongsToMany(Author, {
  through: BookAuthor,
  foreignKey: "book_id",
  otherKey: "author_id",
  as: "authors",
});
Author.belongsToMany(Book, {
  through: BookAuthor,
  foreignKey: "author_id",
  otherKey: "book_id",
  as: "books",
});

// Categories - Books 관계 (N:M)
Book.belongsToMany(Category, {
  through: BookCategory,
  foreignKey: "book_id",
  otherKey: "category_id",
  as: "categories",
});
Category.belongsToMany(Book, {
  through: BookCategory,
  foreignKey: "category_id",
  otherKey: "book_id",
  as: "books",
});

// Categories 자기 참조 (parent-child)
Category.hasMany(Category, { foreignKey: "parent_id", as: "children" });
Category.belongsTo(Category, { foreignKey: "parent_id", as: "parent" });

// Users - Orders 관계
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Orders - OrderItems 관계
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Books - OrderItems 관계
Book.hasMany(OrderItem, { foreignKey: "book_id", as: "orderItems" });
OrderItem.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// Users - Reviews 관계
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Books - Reviews 관계
Book.hasMany(Review, { foreignKey: "book_id", as: "reviews" });
Review.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// Users - Wishlists 관계
User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlists" });
Wishlist.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Books - Wishlists 관계
Book.hasMany(Wishlist, { foreignKey: "book_id", as: "wishlists" });
Wishlist.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// Users - Carts 관계
User.hasMany(Cart, { foreignKey: "user_id", as: "carts" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Books - Carts 관계
Book.hasMany(Cart, { foreignKey: "book_id", as: "carts" });
Cart.belongsTo(Book, { foreignKey: "book_id", as: "book" });

export {
  User,
  Publisher,
  Book,
  Author,
  BookAuthor,
  Category,
  BookCategory,
  Order,
  OrderItem,
  Review,
  Wishlist,
  Cart,
};
