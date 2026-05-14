

const { readdir } = require('fs/promises');
const { createWriteStream } = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');

// Load environment variables. Adjust the path to find the .env file at the project root.
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Import Sequelize models. The path is relative to this script's location.
const { Product, sequelize } = require('../../../models');

const API_URL = 'https://www.stemtown.com/api/product/getProductInfo';
const PRODUCTS_DIR = __dirname; // The script is expected to run from this directory.

/**
 * Fetches product information from the external API using a SKU.
 * @param {string} sku - The product SKU (stock keeping unit).
 * @returns {Promise<object|null>} The product data from the API or null if an error occurs.
 */
async function getProductInfo(sku) {
    try {
        console.log(`[API] Fetching info for SKU: ${sku}`);
        const response = await axios.post(
            API_URL,
            new URLSearchParams({ code: sku }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json, text/plain, */*',
                },
                // Add a timeout to prevent hanging requests
                timeout: 10000, // 10 seconds
            }
        );

        if (response.data && response.data.status === 1 && response.data.data) {
            return response.data.data;
        } else {
            console.warn(`[API] No valid data returned for SKU: ${sku}. Status: ${response.data?.status || 'N/A'}`);
            return null;
        }
    } catch (error) {
        console.error(`[API] Error fetching data for SKU ${sku}: ${error.message}`);
        return null;
    }
}

/**
 * Downloads a file from a URL and saves it to a local path.
 * @param {string} url - The URL of the file to download.
 * @param {string} savePath - The full local path where the file will be saved.
 */
async function downloadFile(url, savePath) {
    try {
        console.log(`[DOWNLOAD] Starting download from: ${url}`);
        const response = await axios.get(url, { responseType: 'stream' });
        const fileStream = createWriteStream(savePath);
        await pipeline(response.data, fileStream);
        console.log(`[DOWNLOAD] Successfully saved to: ${savePath}`);
    } catch (error) {
        console.error(`[DOWNLOAD] Failed to download or save file ${url}: ${error.message}`);
        throw error; // Re-throw to be caught by the main processing loop.
    }
}

/**
 * Updates the product's image URL in the database.
 * @param {string} sku - The product's SKU.
 * @param {string} imageUrl - The new, web-accessible path to the image.
 */
async function updateProductImageInDB(sku, imageUrl) {
    try {
        const [affectedRows] = await Product.update(
            { imageUrl: imageUrl },
            { where: { sku: sku } }
        );

        if (affectedRows > 0) {
            console.log(`[DB] Successfully updated imageUrl for SKU: ${sku}`);
        } else {
            console.warn(`[DB] SKU not found in database, could not update: ${sku}`);
        }
    } catch (error) {
        console.error(`[DB] Error updating database for SKU ${sku}: ${error.message}`);
        throw error; // Re-throw to be caught by the main processing loop.
    }
}

/**
 * The main function that orchestrates the entire process.
 */
async function runSync() {
    console.log('--- Starting Product Image Sync Script ---');
    try {
        // 1. Connect to the database
        await sequelize.authenticate();
        console.log('[DB] Database connection established successfully.');

        // 2. Get all subdirectories
        const entries = await readdir(PRODUCTS_DIR, { withFileTypes: true });
        const directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        console.log(`Found ${directories.length} product directories to process.`);
        let successCount = 0;
        let failCount = 0;

        // 3. Process each directory
        for (const dirName of directories) {
            // The SKU is the directory name with all whitespace removed.
            const sku = dirName.replace(/\s/g, '');
            if (!sku) continue;

            console.log(`\n--- Processing directory: "${dirName}" (SKU: ${sku}) ---`);

            try {
                // a. Fetch product info from API
                const productData = await getProductInfo(sku);
                if (!productData?.coverList?.length) {
                    console.warn(`[SKIP] No images found in API response for SKU: ${sku}`);
                    continue;
                }

                // b. Identify the primary image (one with "first: 1" or the first in the list)
                const primaryImage = productData.coverList.find(img => img.first === 1) || productData.coverList[0];
                const imageUrl = primaryImage?.cover;

                if (!imageUrl) {
                    console.warn(`[SKIP] No image URL could be determined for SKU: ${sku}`);
                    continue;
                }

                // c. Download the image
                // Lấy phần mở rộng của file từ URL gốc (ví dụ: .jpg, .png)
                const extension = path.extname(new URL(imageUrl).pathname);
                const newImageName = `cover${extension}`; // Đặt tên file mới là 'cover' + phần mở rộng
                const localImagePath = path.join(PRODUCTS_DIR, dirName, newImageName);

                await downloadFile(imageUrl, localImagePath);

                // d. Update the database with the correct web-accessible path
                const dbImageUrl = `/uploads/images/products/${dirName}/${newImageName}`;
                await updateProductImageInDB(sku, dbImageUrl);
                
                successCount++;
            } catch (error) {
                failCount++;
                console.error(`[FAIL] An error occurred while processing SKU ${sku}. Skipping. Error: ${error.message}`);
                // The loop continues to the next directory
            }
        }
        
        console.log('\n--- Sync Report ---');
        console.log(`- Total directories processed: ${directories.length}`);
        console.log(`- Successful updates: ${successCount}`);
        console.log(`- Failed updates: ${failCount}`);

    } catch (error) {
        console.error('\nA critical error occurred, stopping the script:', error);
        process.exit(1); // Exit with an error code
    } finally {
        // 4. Close the database connection
        await sequelize.close();
        console.log('[DB] Database connection closed.');
        console.log('--- Script finished ---');
    }
}

// Execute the main function
runSync();