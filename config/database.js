// // Creates connection and configures Database

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable query logging
  }
);

// Function to connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connected to MySQL Database: ${sequelize.config.database}`);
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    process.exit(1);
  }
};

// Function to disconnect from the database
const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};
export { sequelize, connectDB, disconnectDB };
