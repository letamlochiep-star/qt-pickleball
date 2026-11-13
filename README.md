# Pickleball THCS Quang Trung 2026 · Phương án 1 (PA1)

Hệ thống Web App đơn trang (Single-Page Application - SPA) phục vụ điều hành và quản lý giải đấu Pickleball chào mừng Ngày Nhà giáo Việt Nam 20/11 (thi đấu ngày 15/11/2026 tại Đà Lạt Sport).

## 🏓 Tính năng chính
- **Cấu trúc giải đấu**: Điều hành 50 cặp VĐV khối 6, 7, 8, 9; 15 bảng đấu; tổng cộng 90 trận đấu.
- **Hai trình độc lập**:
  - **Trình 6–7**: 22 cặp, 7 bảng (A–G), 39 trận (chọn 2 suất hạng ba tốt nhất vào vòng 1/8).
  - **Trình 8–9**: 28 cặp, 8 bảng (A–H), 51 trận.
- **Luật trường**: Chạm 11 là thắng (11–10 vẫn thắng). Đổi sân khi có đội đạt mốc 6 điểm đầu tiên.
- **Bảng ma trận Berger (v3.1)**: Lịch thi đấu vòng tròn, bảng điểm đối đầu chéo, hiệu số, thứ hạng tự động.
- **Cây nhánh trực tiếp**: Tự động đưa đội thắng từ vòng 1/8 → Tứ kết → Bán kết → Chung kết.
- **Phân quyền & Bảo mật**:
  - Chế độ xem công khai cho khán giả.
  - Đăng nhập trọng tài để chốt điểm số từng trận.
  - Quản trị viên (`#admin`) có quyền sửa điểm, nạp danh sách, thêm trọng tài, đổi mật khẩu.
- **Xử lý tệp & Dữ liệu**:
  - Đọc/ghi và xuất dữ liệu Excel (.xlsx, .csv) hoàn toàn offline với thư viện JSZip tích hợp sẵn.
  - Xuất/nhập bản sao lưu định dạng JSON, tự động lưu trữ trên `localStorage`.

## 🚀 Hướng dẫn sử dụng
1. Mở trực tiếp tệp `index.html` bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Edge, Firefox, Safari).
2. Không cần cài đặt máy chủ web (Server/Node.js/Python), ứng dụng chạy 100% Client-side.
3. Để vào chế độ quản trị: Thêm `#admin` vào cuối đường dẫn trên thanh địa chỉ URL (ví dụ: `file:///.../index.html#admin`).
