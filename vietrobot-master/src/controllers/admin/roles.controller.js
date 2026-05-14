// controllers/admin/roles.controller.js
const adminRoleService = require("../../services/roles.service");
const { response } = require("../../helpers/response");

const getRoles = async (req, res, next) => {
    try {
        const roles = await adminRoleService.getRoles();
        res.status(200).json(response(roles));
    } catch (error) {
        next(error);
    }
};

const createRole = async (req, res, next) => {
    try {
        const roleData = req.body; // { name, description, permissionIds }
        const newRole = await adminRoleService.createRole(roleData);
        res.status(201).json(response(newRole));
    } catch (error) {
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const roleData = req.body; // { name, description, permissionIds }
        const updatedRole = await adminRoleService.updateRole(id, roleData);
        res.status(200).json(response(updatedRole));
    } catch (error) {
        next(error);
    }
};

const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminRoleService.deleteRole(id);
        res.status(200).json(response({ message: "Role deleted successfully." }));
    } catch (error) {
        next(error);
    }
};

const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await adminRoleService.getAllPermissions();
        res.status(200).json(response(permissions));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    getAllPermissions,
    deleteRole,
};