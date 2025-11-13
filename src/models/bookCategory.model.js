import { DataTypes } from "sequelize";
import sequelize from "../config/postgresql.config.js";

const BookCategory = sequelize.define(
  "BookCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "books",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "book_categories",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["book_id", "category_id"],
      },
    ],
  }
);

export default BookCategory;

