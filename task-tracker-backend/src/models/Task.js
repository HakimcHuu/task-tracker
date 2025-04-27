// src/models/Task.js (Relevant Part)
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    // ... id, text, startTime, endTime ...
    text: { type: DataTypes.STRING, allowNull: false /* ... validation */ },
    startTime: { type: DataTypes.TIME, allowNull: true /* ... validation */ },
    endTime: { type: DataTypes.TIME, allowNull: true /* ... validation */ },

    // --- Ensure this matches the actual DB column name and type ---
    listId: {
      type: DataTypes.STRING(100), // e.g., VARCHAR(100)
      allowNull: false,
      defaultValue: "main",
    },
    // ---------------------------------------------------------------

    dateAdded: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    dateUpdated: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    dateFor: { type: DataTypes.DATEONLY, allowNull: false },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "tasks",
  }
);

module.exports = Task;
