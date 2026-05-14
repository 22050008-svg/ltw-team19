import api from '../../api/axiosConfig';

/**
 * Lấy thông tin cấu hình email hiện tại.
 * Endpoint: GET /api/v1/admin/mail
 */
const getMailConfig = () => {
  return api.get('/admin/mail');
};

/**
 * Cập nhật cấu hình email.
 * Endpoint: PUT /api/v1/admin/mail
 * @param {object} configData - Dữ liệu cấu hình mới.
 */
const updateMailConfig = (configData) => {
  return api.put('/admin/mail', configData);
};

/**
 * Gửi email kiểm tra.
 * Endpoint: POST /api/v1/admin/mail/test
 * @param {object} testData - Dữ liệu email test, ví dụ: { toEmail: '...' }
 */
const sendTestMail = (testData) => {
  return api.post('/admin/mail/test', testData);
};

const mailService = {
  getMailConfig,
  updateMailConfig,
  sendTestMail,
};

export default mailService;