const mailService = require('../../services/mail.service');
const { response } = require('../../helpers/response');
const { AppError } = require('../../helpers/error');

const getMailConfig = async (req, res, next) => {
    try {
        const config = await mailService.getMailConfig();
        res.status(200).json(response(config));
    } catch (error) {
        next(error);
    }
};

const updateMailConfig = async (req, res, next) => {
    try {
        const configData = req.body;
        const updatedConfig = await mailService.updateMailConfig(configData);
        res.status(200).json(response(updatedConfig));
    } catch (error) {
        next(error);
    }
};

const sendTestEmail = async (req, res, next) => {
    try {
        const { toEmail } = req.body;
        if (!toEmail) {
            throw new AppError(400, "Vui lòng cung cấp địa chỉ email nhận thư test.");
        }
        await mailService.sendTestEmail(toEmail);
        res.status(200).json(response({ message: `Đã gửi email test thành công đến ${toEmail}` }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMailConfig,
    updateMailConfig,
    sendTestEmail,
};