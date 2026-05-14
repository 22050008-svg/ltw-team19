// services/productAttribute.service.js
const { ProductAttribute, ProductAttributeValue, sequelize } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Tạo một thuộc tính sản phẩm mới (Admin)
 * Cho phép cùng một tên thuộc tính ở các danh mục khác nhau
 * VD: "Thương Hiệu" có thể là categoryId=null (chung) và categoryId=4 (Máy Lạnh)
 * @param {object} attributeData - { name, categoryId, displayOrder }
 * @returns {Promise<ProductAttribute>}
 */
const createAttribute = async (attributeData) => {
    try {
        const { name, categoryId, displayOrder = 0 } = attributeData;

        if (!name || !name.trim()) {
            throw new AppError(400, "Tên thuộc tính không được để trống");
        }

        // Kiểm tra xem (name + categoryId) đã tồn tại chưa
        // Cho phép cùng tên nhưng categoryId khác nhau
        const existing = await ProductAttribute.findOne({ 
            where: { 
                name: name.trim(),
                categoryId: categoryId || null  // null khi để trống
            } 
        });
        
        if (existing) {
            const categoryText = categoryId ? `cho danh mục này` : `chung cho tất cả sản phẩm`;
            throw new AppError(400, `Thuộc tính "${name}" đã tồn tại ${categoryText}`);
        }

        // Validate categoryId if provided
        if (categoryId) {
            const Category = require("../models").Category;
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new AppError(400, `Danh mục với ID ${categoryId} không tồn tại`);
            }
        }

        const attribute = await ProductAttribute.create({
            name: name.trim(),
            categoryId: categoryId || null,
            displayOrder: parseInt(displayOrder) || 0
        });

        return attribute;
    } catch (error) {
        if (error instanceof AppError) throw error;
        
        // Log chi tiết lỗi
        console.error("❌ createAttribute service error:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error stack:", error.stack);
        
        // Xử lý lỗi database cụ thể
        if (error.code === 'ER_DUP_ENTRY' || error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError(400, `Thuộc tính đã tồn tại. Vui lòng kiểm tra tên và danh mục.`);
        }
        
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new AppError(400, `Dữ liệu không hợp lệ: ${messages}`);
        }

        throw new AppError(500, `Không thể tạo thuộc tính sản phẩm: ${error.message}`);
    }
};

/**
 * Lấy tất cả thuộc tính (tùy chọn lọc theo category)
 * @param {object} queryParams - { categoryId }
 * @returns {Promise<Array>}
 */
const getAttributes = async (queryParams = {}) => {
    try {
        const { categoryId } = queryParams;
        const whereClause = categoryId ? { categoryId } : {};

        const attributes = await ProductAttribute.findAll({
            where: whereClause,
            include: [
                {
                    model: ProductAttributeValue,
                    as: 'values',
                    attributes: ['id', 'value', 'attributeId']
                }
            ],
            order: [['displayOrder', 'ASC']],
            attributes: ['id', 'name', 'categoryId', 'displayOrder']
        });

        return attributes;
    } catch (error) {
        console.error("getAttributes service error:", error);
        throw new AppError(500, "Không thể lấy danh sách thuộc tính");
    }
};

/**
 * Lấy một thuộc tính cụ thể + các giá trị
 * @param {number} attributeId
 * @returns {Promise<ProductAttribute>}
 */
const getAttributeById = async (attributeId) => {
    try {
        const attribute = await ProductAttribute.findByPk(attributeId, {
            include: [
                {
                    model: ProductAttributeValue,
                    as: 'values',
                    attributes: ['id', 'value', 'attributeId', 'createdAt']
                }
            ]
        });

        if (!attribute) {
            throw new AppError(404, "Thuộc tính không tồn tại");
        }

        return attribute;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getAttributeById service error:", error);
        throw new AppError(500, "Không thể lấy chi tiết thuộc tính");
    }
};

/**
 * Cập nhật thuộc tính (Admin)
 * @param {number} attributeId
 * @param {object} updateData - { name, categoryId, displayOrder }
 * @returns {Promise<ProductAttribute>}
 */
const updateAttribute = async (attributeId, updateData) => {
    try {
        const attribute = await ProductAttribute.findByPk(attributeId);
        if (!attribute) {
            throw new AppError(404, "Thuộc tính không tồn tại");
        }

        // Kiểm tra tên mới nếu được cập nhật
        if (updateData.name && updateData.name !== attribute.name) {
            // Kiểm tra (name + categoryId) combination
            const existing = await ProductAttribute.findOne({
                where: { 
                    name: updateData.name,
                    categoryId: updateData.categoryId !== undefined ? updateData.categoryId : attribute.categoryId
                }
            });
            if (existing) {
                const categoryText = (updateData.categoryId || attribute.categoryId) 
                    ? `cho danh mục này` 
                    : `chung cho tất cả sản phẩm`;
                throw new AppError(400, `Thuộc tính "${updateData.name}" đã tồn tại ${categoryText}`);
            }
        }

        await attribute.update(updateData);
        return attribute;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("updateAttribute service error:", error);
        throw new AppError(500, "Không thể cập nhật thuộc tính");
    }
};

/**
 * Xóa thuộc tính (Admin)
 * @param {number} attributeId
 * @returns {Promise<boolean>}
 */
const deleteAttribute = async (attributeId) => {
    const t = await sequelize.transaction();
    try {
        const attribute = await ProductAttribute.findByPk(attributeId);
        if (!attribute) {
            throw new AppError(404, "Thuộc tính không tồn tại");
        }

        // Xóa tất cả giá trị liên quan
        await ProductAttributeValue.destroy({
            where: { attributeId },
            transaction: t
        });

        // Xóa thuộc tính
        await attribute.destroy({ transaction: t });

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("deleteAttribute service error:", error);
        throw new AppError(500, "Không thể xóa thuộc tính");
    }
};

/**
 * Tạo giá trị cho một thuộc tính (Admin)
 * @param {number} attributeId
 * @param {string} value - Giá trị (vd: "Xanh", "M", etc.)
 * @returns {Promise<ProductAttributeValue>}
 */
const createAttributeValue = async (attributeId, value) => {
    try {
        if (!value || !value.trim()) {
            throw new AppError(400, "Giá trị không được để trống");
        }

        // Kiểm tra thuộc tính tồn tại
        const attribute = await ProductAttribute.findByPk(attributeId);
        if (!attribute) {
            throw new AppError(404, `Thuộc tính với ID ${attributeId} không tồn tại`);
        }

        // Kiểm tra giá trị đã tồn tại chưa
        const existing = await ProductAttributeValue.findOne({
            where: { attributeId, value: value.trim() }
        });
        if (existing) {
            throw new AppError(400, `Giá trị "${value}" đã tồn tại cho thuộc tính này`);
        }

        const attributeValue = await ProductAttributeValue.create({
            attributeId,
            value: value.trim()
        });

        console.log(`✅ Created attribute value: ID=${attributeValue.id}, attributeId=${attributeId}, value="${attributeValue.value}"`);
        return attributeValue;
    } catch (error) {
        if (error instanceof AppError) throw error;
        
        console.error("❌ createAttributeValue service error:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error stack:", error.stack);
        
        // Xử lý lỗi database cụ thể
        if (error.code === 'ER_DUP_ENTRY' || error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError(400, `Giá trị đã tồn tại cho thuộc tính này`);
        }
        
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new AppError(400, `Dữ liệu không hợp lệ: ${messages}`);
        }

        throw new AppError(500, `Không thể tạo giá trị thuộc tính: ${error.message}`);
    }
};

/**
 * Lấy tất cả giá trị của một thuộc tính
 * @param {number} attributeId
 * @returns {Promise<Array>}
 */
const getAttributeValues = async (attributeId) => {
    try {
        const attribute = await ProductAttribute.findByPk(attributeId);
        if (!attribute) {
            throw new AppError(404, "Thuộc tính không tồn tại");
        }

        const values = await ProductAttributeValue.findAll({
            where: { attributeId },
            attributes: ['id', 'value', 'attributeId', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        return values;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getAttributeValues service error:", error);
        throw new AppError(500, "Không thể lấy giá trị thuộc tính");
    }
};

/**
 * Cập nhật một giá trị thuộc tính (Admin)
 * @param {number} attributeValueId
 * @param {string} newValue
 * @returns {Promise<ProductAttributeValue>}
 */
const updateAttributeValue = async (attributeValueId, newValue) => {
    try {
        const trimmedValue = newValue.trim();

        if (!trimmedValue) {
            throw new AppError(400, "Giá trị không được để trống");
        }

        const value = await ProductAttributeValue.findByPk(attributeValueId);
        if (!value) {
            throw new AppError(404, "Giá trị thuộc tính không tồn tại");
        }

        // Update value
        await value.update({ value: trimmedValue });

        return value;
    } catch (error) {
        if (error instanceof AppError) throw error;
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError(400, "Giá trị này đã tồn tại cho thuộc tính này");
        }
        console.error("updateAttributeValue service error:", error);
        throw new AppError(500, "Không thể cập nhật giá trị thuộc tính");
    }
};

/**
 * Xóa một giá trị thuộc tính (Admin)
 * @param {number} attributeValueId
 * @returns {Promise<boolean>}
 */
const deleteAttributeValue = async (attributeValueId) => {
    try {
        const value = await ProductAttributeValue.findByPk(attributeValueId);
        if (!value) {
            throw new AppError(404, "Giá trị thuộc tính không tồn tại");
        }

        await value.destroy();
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("deleteAttributeValue service error:", error);
        throw new AppError(500, "Không thể xóa giá trị thuộc tính");
    }
};

module.exports = {
    createAttribute,
    getAttributes,
    getAttributeById,
    updateAttribute,
    deleteAttribute,
    createAttributeValue,
    getAttributeValues,
    updateAttributeValue,
    deleteAttributeValue,
};
