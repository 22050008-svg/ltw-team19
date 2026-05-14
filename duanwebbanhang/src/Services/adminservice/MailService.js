import api from '../../api/axiosConfig';

/**
 * Service để quản lý các API liên quan đến cấu hình email.
 */
const mailService = {
  /**
   * Lấy thông tin cấu hình email hiện tại.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getMailConfig() {
    return api.get('/admin/mail');
  },

  /**
   * Cập nhật cấu hình email.
   * @param {object} configData - Dữ liệu cấu hình mới.
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateMailConfig(configData) {
    return api.put('/admin/mail', configData);
  },

  /**
   * Gửi một email kiểm tra để xác thực cấu hình.
   * @param {{toEmail: string}} data - Đối tượng chứa email người nhận.
   * @returns {Promise<AxiosResponse<any>>}
   */
  sendTestMail(data) {
    return api.post('/admin/mail/test', data);
  }
};

export default mailService;