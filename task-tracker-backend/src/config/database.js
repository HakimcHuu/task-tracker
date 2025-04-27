// src/config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables from .env

// Validate essential environment variables
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_PASS", "DB_HOST", "DB_PORT"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(
      `Error: Missing required environment variable ${varName} in .env file.`
    );
    process.exit(1); // Exit if required variable is missing
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Ensure port is an integer
    dialect: "mysql", // Specify MySQL dialect
    logging: false, // Disable logging SQL queries (or console.log for debugging)
    dialectOptions: {
      // Recommended for MySQL connection robustness
      connectTimeout: 10000,
    },
  }
);

module.exports = sequelize; // Export the configured Sequelize instance
