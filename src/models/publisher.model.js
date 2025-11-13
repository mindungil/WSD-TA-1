import { DataTypes } from "sequelize";
import sequelize from "../config/postgresql.config.js";

const Publisher = sequelize.define(
  "Publisher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "publishers",
    timestamps: false,
    underscored: true,
  }
);

export default Publisher;

