// controllers/productAttribute.controller.js
const productAttributeService = require("../services/productAttribute.service");
const { response } = require("../helpers/response");

/**
 * Tạo thuộc tính sản phẩm mới (Admin)
 */
const createAttribute = async (req, res, next) => {
    try {
        const { name, categoryId, displayOrder } = req.body;
        
        if (!name) {
            return res.status(400).json(response({ error: "Tên thuộc tính là bắt buộc" }));
        }

        const attribute = await productAttributeService.createAttribute({
            name,
            categoryId,
            displayOrder
        });

        res.status(201).json(response(attribute));
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy tất cả thuộc tính (tùy chọn lọc theo category)
 */
const getAttributes = async (req, res, next) => {
    try {
        const queryParams = req.query; // { categoryId }
        const attributes = await productAttributeService.getAttributes(queryParams);
        res.status(200).json(response(attributes));
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy chi tiết một thuộc tính + các giá trị của nó
 */
const getAttributeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attribute = await productAttributeService.getAttributeById(id);
        res.status(200).json(response(attribute));
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật thuộc tính (Admin)
 */
const updateAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const attribute = await productAttributeService.updateAttribute(id, updateData);
        res.status(200).json(response(attribute));
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa thuộc tính (Admin)
 */
const deleteAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        await productAttributeService.deleteAttribute(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Tạo giá trị cho một thuộc tính (Admin)
 */
const createAttributeValue = async (req, res, next) => {
    try {
        const { id: attributeId } = req.params;
        const { value } = req.body;

        console.log(`📝 createAttributeValue request:`, { attributeId, value });

        if (!value) {
            return res.status(400).json(response({ error: "Giá trị là bắt buộc" }));
        }

        const attributeValue = await productAttributeService.createAttributeValue(attributeId, value);
        console.log(`✅ Value created successfully:`, attributeValue.toJSON ? attributeValue.toJSON() : attributeValue);
        res.status(201).json(response(attributeValue));
    } catch (error) {
        console.error(`❌ createAttributeValue controller error:`, error.message);
        next(error);
    }
};

/**
 * Lấy tất cả giá trị của một thuộc tính
 */
const getAttributeValues = async (req, res, next) => {
    try {
        const { id: attributeId } = req.params;
        const values = await productAttributeService.getAttributeValues(attributeId);
        res.status(200).json(response(values));
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật một giá trị thuộc tính (Admin)
 */
const updateAttributeValue = async (req, res, next) => {
    try {
        const { valueId } = req.params;
        const { value } = req.body;

        console.log(`📝 updateAttributeValue request:`, { valueId, value });

        if (!value) {
            return res.status(400).json(response({ error: "Giá trị là bắt buộc" }));
        }

        const attributeValue = await productAttributeService.updateAttributeValue(valueId, value);
        console.log(`✅ Value updated successfully:`, attributeValue.toJSON ? attributeValue.toJSON() : attributeValue);
        res.status(200).json(response(attributeValue));
    } catch (error) {
        console.error(`❌ updateAttributeValue controller error:`, error.message);
        next(error);
    }
};

/**
 * Xóa một giá trị thuộc tính (Admin)
 */
const deleteAttributeValue = async (req, res, next) => {
    try {
        const { valueId } = req.params;
        await productAttributeService.deleteAttributeValue(valueId);
        res.status(204).send();
    } catch (error) {
        next(error);
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
