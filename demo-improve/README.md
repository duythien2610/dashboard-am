# FPT Telecom — SOP Affiliate Marketing Dashboard (`demo-improve`)

Phiên bản cải tiến hoàn chỉnh của Dashboard Báo cáo Hiệu suất Bán hàng Affiliate Marketing (AM) trên hệ thống SOP (Sales Operations Portal) của FPT Telecom.

---

## 1. Cách Mở & Chạy Thử Nhanh
* Chỉ cần **nhấp đúp chuột** vào file [`index.html`](file:///c:/BA/ba-tool-kit/project/AM/Dashboard/demo-improve/index.html) để mở trực tiếp trên bất kỳ trình duyệt web nào (Chrome, Edge, Safari, Firefox).
* Toàn bộ mã nguồn, thư viện (`chart.min.js`) và dữ liệu (`fpt-data.js`) đều nằm độc lập cục bộ, không phụ thuộc bundler hay server ngoài.

---

## 2. Các Tính Năng Đã Hiện Thực Hóa (Dựa Trên Phân Tích BA & RTM)

### 1. Phân Đoạn Thời Gian 4 Cấp Độ (`Theo Ngày`, `Theo Tuần`, `Theo Tháng`, `Theo Năm`)
* Bộ nút bấm phân đoạn tại khu vực Bộ lọc cho phép Quản lý linh hoạt chuyển đổi góc nhìn dữ liệu:
  - **Theo Ngày**: Quan sát chi tiết từng ngày trong tháng (31 ngày).
  - **Theo Tuần**: Gom nhóm theo 5 tuần trong tháng.
  - **Theo Tháng**: Quan sát chuỗi xu hướng 12 tháng trong năm 2026.
  - **Theo Năm**: So sánh tăng trưởng qua các năm (2024, 2025, 2026).

### 2. Bộ Lọc Đa Chiều Nâng Cao (UC 1 — BR-AM-01 đến BR-AM-05)
* **Date Range Picker**: Ràng buộc nghiêm ngặt ngày $\le 365$ ngày, Từ ngày $\le$ Đến ngày $\le$ Hôm nay.
* **Cascade Vùng $\rightarrow$ Chi Nhánh**: Khi chọn Vùng (Vùng 1 đến Vùng 7), danh sách Chi nhánh tự động cập nhật tương ứng.
* **Nút Lọc Nhanh**: `Hôm nay (31/08)`, `7 ngày qua`, `30 ngày qua`, `Tháng này (T8)`, `Tháng trước (T7)`, `Cả Năm 2026`.

### 3. 5 Thẻ KPI Realtime Chuẩn Hóa (UC 1 — BR-AM-06 đến BR-AM-10)
1. **Lượt Truy Cập Thật (Real Clicks)**: Đã loại bỏ 205k bot tự động (`facebookexternalhit`, web crawlers). Tỷ lệ Like-for-like `[upto]`.
2. **Khách Hàng Tiềm Năng (Leads)**:
   - **Quy tắc quan trọng**: **Không có cơ chế thu hồi leads** — mỗi lượt đăng ký/đứt gãy qua link của từng Sales đều được tính 1 lead độc lập cho Sales đó.
   - Badge hiển thị rõ ràng: `Không thu hồi · Độc lập theo link`.
3. **Tổng Đơn Hàng Online**: Kèm bảng mini phân bổ 3 trạng thái lớn: *Đã hoàn tất*, *Đang xử lý*, *Hủy*.
4. **Tỷ Lệ Chuyển Đổi (CR %)**: Đơn hàng / Unique Users.
5. **Tỷ Lệ Sales Phủ AM (Active Sales Rate)**: Tỷ lệ nhân viên kinh doanh đã kích hoạt và chia sẻ link AM có clicks thật (56.3% - 18/32 sales). Nhấp vào thẻ sẽ tự động cuộn xuống phân hệ quản lý Sales.

### 4. Hệ Thống Biểu Đồ Trực Quan (UC 2 — BR-AM-11 đến BR-AM-14)
* **Biểu đồ đường kép (Trend Chart)**: Clicks vs Users, hỗ trợ so sánh hai kỳ (nét đứt T7 vs nét liền T8).
* **Biểu đồ Donut Chiến Dịch (Campaigns)**: Tỷ trọng traffic theo Trang chủ FPT, Ngoại Hạng Anh, E-Menu...
* **Cơ Cấu Thiết Bị & Trình Duyệt**: Mobile (65.2%) vs Desktop (34.8%).
* **Biểu đồ Cột Vùng / Chi Nhánh**: So sánh lượt truy cập và đơn hàng thành công theo địa bàn.

### 5. Báo Cáo Google Analytics 4 (`amtracking` — UC 2 — BR-AM-15)
* Đối soát 4 chỉ số lớn: Views (124k), Sessions (62.4k), Events (367k), Active Users (45.3k).
* Bảng Top 10 Trang Đích GA4 có lượt xem cao nhất kèm nút mở URL.

### 6. Quản Lý & Theo Dõi Sales Sử Dụng AM (UC 3 — BR-AM-16 đến BR-AM-19) — *Tính Năng Mới*
* 3 Tab lọc:
  - `Tất Cả Sales` (32 nhân sự)
  - `Đã Sử Dụng AM` (18 nhân sự)
  - `Chưa Dùng AM (Cần Đôn Đốc)` (14 nhân sự, Clicks = 0)
* Ô tìm kiếm tức thì theo Tên, Mã nhân viên (Staff Code), Chi nhánh.
* Bảng 8 cột dữ liệu chuẩn mực.
* Nút **Xuất Excel Danh Sách** tự động tải file `.csv` chuẩn UTF-8 BOM để Trưởng phòng/GĐCN mở trực tiếp trên Excel gửi Zalo/Email đôn đốc nhân viên.

### 7. Bảng Xếp Hạng Top Sales & Top Link Tiếp Thị (UC 4 — BR-AM-20 đến BR-AM-22)
* **Xếp hạng ưu tiên theo Đơn Online hoàn tất** giảm dần (tiêu chí kinh doanh cốt lõi).
* Huy hiệu Top 1, Top 2, Top 3 tối giản, thanh lịch.
* Top 8 Link Tiếp Thị hiệu quả nhất kèm nút sao chép link cá nhân.

---

## 3. Phong Cách Thiết Kế Clean Enterprise
* Không sử dụng sticker / emoji màu mè.
* Sử dụng hệ thống biểu tượng SVG mỏng nhẹ, tối giản, thanh lịch.
* Màu sắc nhận diện chuẩn FPT Telecom: Cam FPT (`#f97316`), Xanh dương FPT (`#1d64d8`), Nền xám nhạt dịu mắt (`#f4f6fa`).
