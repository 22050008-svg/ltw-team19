/**
 * Migration: Create review_images table
 * Run this script to create the table in your database
 * 
 * Usage:
 *   node src/migrations/create-review-images-table.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: process.env.DB_DIALECT || 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        logging: console.log,
    }
);

const createTable = async () => {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS review_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
                INDEX idx_review_id (review_id),
                INDEX idx_display_order (display_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('✓ review_images table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating review_images table:', error.message);
        process.exit(1);
    }
};

createTable();
