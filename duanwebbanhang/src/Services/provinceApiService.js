import axios from 'axios';

// Sử dụng API public miễn phí để lấy dữ liệu đơn vị hành chính Việt Nam
<<<<<<< HEAD
// Sau sáp nhập 2025: Việt Nam còn 34 tỉnh/thành, bỏ cấp quận/huyện
// Cấu trúc mới: Tỉnh/Thành → Phường/Xã (2 cấp)
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/v2';
=======
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/v1';
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9

const provinceApi = axios.create({
  baseURL: PROVINCE_API_URL,
});

<<<<<<< HEAD
/** Lấy danh sách 34 Tỉnh/Thành phố */
=======
/** Lấy danh sách Tỉnh/Thành phố */
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
const getProvinces = () => {
  return provinceApi.get('/p/');
};

<<<<<<< HEAD
/**
 * Lấy danh sách Phường/Xã theo mã tỉnh/thành phố
 * (Sau sáp nhập, không còn cấp quận/huyện - wards trực tiếp dưới province)
 */
const getWardsByProvince = (provinceCode) => {
  return provinceApi.get(`/p/${provinceCode}?depth=2`);
};

const provinceApiService = {
  getProvinces,
  getWardsByProvince,
=======
/** Lấy danh sách Quận/Huyện theo mã tỉnh/thành phố */
const getDistricts = (provinceCode) => {
  return provinceApi.get(`/p/${provinceCode}?depth=2`);
};

/** Lấy danh sách Phường/Xã theo mã quận/huyện */
const getWards = (districtCode) => {
  return provinceApi.get(`/d/${districtCode}?depth=2`);
};

const provinceApiService = {
  getProvinces,
  getDistricts,
  getWards,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
};

export default provinceApiService;