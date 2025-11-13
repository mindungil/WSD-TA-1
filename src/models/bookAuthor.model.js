import { DataTypes } from "sequelize";
import sequelize from "../config/postgresql.config.js";

const BookAuthor = sequelize.define(
  "BookAuthor",
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
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "authors",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    author_order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "book_authors",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["book_id", "author_id"],
      },
    ],
  }
);

export default BookAuthor;

