import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000, // 60s — AI calls cần nhiều thời gian
});

// Request interceptor — có thể thêm auth token sau
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor — xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.error('Yêu cầu hết thời gian. Vui lòng thử lại.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Không thể kết nối đến server. Kiểm tra lại kết nối.');
    } else if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          // Client error — thường có message chi tiết
          break;
        case 401:
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          break;
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này.');
          break;
        case 404:
          toast.error('Dữ liệu không tồn tại hoặc đã bị xóa.');
          break;
        case 429:
          toast.error('Quá nhiều yêu cầu. Vui lòng đợi một chút.');
          break;
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        case 502:
          toast.error('Server đang bảo trì. Thử lại sau.');
          break;
        case 503:
          toast.error('Dịch vụ tạm ngưng. Vui lòng thử lại sau.');
          break;
        default:
          // Dùng message từ server nếu có
          if (data?.error && status < 500) {
            // Không toast — để component tự xử lý
          } else {
            toast.error(`Lỗi không xác định (${status})`);
          }
      }
    }
    return Promise.reject(error);
  }
);
