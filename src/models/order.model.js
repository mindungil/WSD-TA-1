import { DataTypes } from "sequelize";
import sequelize from "../config/postgresql.config.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("paid", "canceled"),
      allowNull: false,
      defaultValue: "paid",
    },
    payment_method: {
      type: DataTypes.ENUM("card", "mobile", "etc"),
      allowNull: false,
      defaultValue: "card",
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeUpdate: (order) => {
        order.updated_at = new Date();
      },
    },
  }
);

export default Order;

