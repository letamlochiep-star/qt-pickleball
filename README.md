# Pickleball QT 2026 — Hướng dẫn triển khai Vercel + đồng bộ

## 1. Cấu trúc thư mục repo GitHub

```
/
├── index.html                ← file v3.3 (đổi tên WEB_PICKLEBALL_PA1_V3_FULL.html → index.html)
├── api/
│   └── state.js              ← serverless function đồng bộ
├── package.json              ← khai báo @vercel/kv
├── vercel.json               ← cấu hình header + timeout
└── README.md                 ← file này
```

**Lưu ý**: file HTML phải tên là `index.html` ở thư mục gốc để Vercel serve ở URL chính.

## 2. Thiết lập Vercel KV (lần duy nhất, ~5 phút)

1. Vào https://vercel.com/dashboard → project của bạn
2. Tab **Storage** → bấm **Create Database** → chọn **KV**
3. Đặt tên: `pkl-qt-2026-kv` → chọn vùng **Singapore (sin1)** → Create
4. Sau khi tạo, bấm **Connect Project** → chọn project đang chạy pickleball → Connect
5. Vercel tự thêm 3 biến môi trường: `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`

## 3. Thêm biến môi trường `ADMIN_PASSWORD`

1. Vercel dashboard → Project → **Settings** → **Environment Variables**
2. Thêm biến mới:
   - Key: `ADMIN_PASSWORD`
   - Value: `Antam2025@`  *(hoặc mật khẩu admin bạn đã đổi trong app)*
   - Environment: **Production**, **Preview**, **Development** (tick cả 3)
3. Bấm **Save**

**Quan trọng**: nếu bạn đổi mật khẩu admin trong app (qua tab Quản trị), bạn cũng phải vào đây cập nhật lại `ADMIN_PASSWORD` cho khớp. Nếu không, admin vẫn nhập điểm trong app được nhưng dữ liệu KHÔNG đồng bộ lên server.

## 4. Deploy

Sau khi commit 4 file trên vào GitHub và push:

```bash
git add index.html api/state.js package.json vercel.json README.md
git commit -m "v3.3: thêm sync layer qua Vercel KV"
git push
```

Vercel tự rebuild trong ~30 giây. Mở URL `your-app.vercel.app`.

## 5. Luồng hoạt động

- **Máy BTC** (laptop): Mở `your-app.vercel.app/#admin` → đăng nhập `letam` / `Antam2025@`
  - Góc trên phải sẽ thấy chip `☁ Live v{số}` nếu kết nối backend thành công
  - Mỗi lần ghi điểm/sửa/xoá → tự động push lên Vercel KV
- **Thiết bị khán giả** (điện thoại phụ huynh, laptop khác): Mở `your-app.vercel.app`
  - Chip `☁ Live v{số}` hiện bên trái
  - Mỗi 5 giây, tự động kéo dữ liệu mới từ server
  - Khi admin ghi điểm, phụ huynh thấy trong ~5 giây

## 6. Giới hạn miễn phí Vercel

- **KV free tier**: 30 000 lệnh/tháng
- Giả định giải 10 giờ, 4 máy xem polling 5s/lần = ~29k lệnh → vừa sát mức miễn phí
- Nếu lo vượt: tăng chu kỳ polling từ 5s lên 10s trong file HTML (dòng `setInterval(..., 5000)` → `10000`)

## 7. Kiểm tra sync hoạt động

Trên máy BTC đã đăng nhập admin:
- Mở DevTools (F12) → Console
- Ghi điểm 1 trận
- Thấy log: `[SYNC] Push OK v1`

Trên điện thoại:
- Vào `your-app.vercel.app`
- Console (Chrome Android: `chrome://inspect`) sẽ thấy `[SYNC] Pull v1` sau vài giây
- Tab "Bảng đấu" → bảng A → ô 15 điểm xuất hiện

## 8. Reset toàn bộ dữ liệu trên server

Nếu cần xoá sạch dữ liệu KV (vd đầu giải mới):

1. Vercel Dashboard → Storage → KV → tab "Data Browser"
2. Xoá 2 key: `pkl-qt-2026-state` và `pkl-qt-2026-version`

Hoặc chạy lệnh qua Vercel CLI:
```bash
vercel env pull
# rồi dùng npx với token từ env
```

## 9. Chế độ offline

Nếu Vercel KV không khả dụng (quá quota, sự cố mạng), app tự chuyển về chế độ offline:
- Chip hiện `◌ Offline`
- Dữ liệu vẫn lưu trong `localStorage` máy BTC
- Khi KV khả dụng trở lại, admin reload trang → push lần đầu lên server
- **Luôn xuất JSON backup định kỳ** (nút ở toolbar) để phòng trường hợp xấu
