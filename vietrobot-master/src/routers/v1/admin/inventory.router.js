// /routers/v1/admin/inventory.router.js
const express = require("express");
const inventoryController = require("../../../controllers/admin/inventory.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/inventory
const inventoryRouter = express.Router();

inventoryRouter.get("/movements", checkPermission("inventory.read"), inventoryController.getStockMovements);
inventoryRouter.post("/adjustments", checkPermission("inventory.manage"), inventoryController.createManualAdjustment);

module.exports = inventoryRouter;