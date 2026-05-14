/**
 * Migration: Add edit_count column to product_reviews table
 * Run this script to add the column to your database
 * 
 * Usage:
 *   node src/migrations/add-edit-count-to-product-reviews.js
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

const addColumn = async () => {
    try {
        // Check if column already exists
        const result = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'product_reviews' 
            AND COLUMN_NAME = 'edit_count'
        `);

        if (result[0][0].count > 0) {
            console.log('✓ edit_count column already exists');
            process.exit(0);
        }

        // Add the column
        await sequelize.query(`
            ALTER TABLE product_reviews 
            ADD COLUMN edit_count INT DEFAULT 0 
            COMMENT 'Số lần chỉnh sửa đánh giá (tối đa 1 lần)'
        `);

        console.log('✓ edit_count column added successfully to product_reviews table');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error adding edit_count column:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

addColumn();
