# FPT Telecom SOP — Affiliate Marketing Performance Dashboard

> **Hệ Thống Dashboard Báo Cáo Hiệu Suất Bán Hàng Affiliate Marketing (AM)**  
> Tích hợp trên Cổng Điều Hành Bán Hàng SOP (Sales Operations Portal) — FPT Telecom.  
> Sản phẩm phục vụ: **Ban Giám Đốc (BOD)**, **Cấp Quản Lý (Giám đốc Vùng / Chi nhánh / Trưởng phòng)** và **Đội ngũ Vận hành (Admin / MarTech Ops)**.

---

## 📌 1. Tổng Quan Bài Toán & Giá Trị Mang Lại

Hệ thống Dashboard AM giải quyết triệt để các bài toán phân tích đa chiều kênh bán hàng tiếp thị liên kết:
- **Xác định lượt truy cập sạch (Clean Traffic)**: Tự động loại bỏ bot, crawler và dedup lượt click ảo (1 user / 1 link / 1 ngày).
- **Quy tắc Lead không thu hồi**: Ghi nhận độc lập từng khách hàng tiềm năng theo đúng link tiếp thị của Sales, không thu hồi và không trừ lead khi lên đơn.
- **Phễu chuyển đổi toàn trình 4 nấc (End-to-End Funnel)**: Đo lường xuyên suốt từ `Clicks Thật` $\rightarrow$ `Leads KHTN` $\rightarrow$ `Đơn Khởi Tạo DKOL` $\rightarrow$ `Thi Công Kích Hoạt Hoàn Tất`.
- **Doanh thu tiền tươi ước tính (Est. GMV)**: Thể hiện giá trị hợp đồng thực thu đóng trước kỳ đầu và dự phóng vận tốc về đích KPI tháng (Run-rate).
- **Quản trị hành động nhân sự**: Giám sát tỷ lệ Sales phủ AM, cung cấp công cụ đôn đốc 1-chạm và vinh danh Top Sales / Top Link tiếp thị.

---

## 🚀 2. Cấu Trúc Các Phân Hệ Trên Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. THANH BỘ LỌC ĐA CHIỀU (FILTER BAR - CHUẨN ANCS)                                          │
│    • Lọc khoảng ngày (Từ - Đến) với Datepicker kiểm soát lỗi inline                         │
│    • Chuyển nhanh chế độ gom nhóm: Ngày | Tuần (T4 -> T3) | Tháng | Năm                     │
│    • Cascade tổ chức: Chọn Vùng -> Tự động drill-down Chi nhánh con · Nút Reset mặc định    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. KHỐI 5 THẺ KPI TỔNG QUAN REALTIME                                                        │
│    [1. Clicks Thật] [2. Leads KHTN] [3. Tổng Đơn DKOL] [4. Tỷ Lệ CR %] [5. Sales Phủ AM]   │
│    • Tích hợp so sánh cùng kỳ Like-for-like lũy kế [upto]                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. GÓC NHÌN ĐIỀU HÀNH · BAN GIÁM ĐỐC (EXECUTIVE FUNNEL & FINANCIAL OVERVIEW)                │
│    • Phễu chuyển đổi 4 nấc trực quan & đo lường điểm rơi từng chặng                         │
│    • Doanh thu tiền tươi ước tính (Est. GMV): ~650k VNĐ / đơn thi công                      │
│    • Thanh đo tiến độ tháng (Goal Progress) & Dự phóng vận tốc cuối kỳ (Run-rate Forecast)  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. HỆ THỐNG BIỂU ĐỒ XU HƯỚNG & CƠ CẤU ĐA CHIỀU                                              │
│    • Biểu đồ đường song hành: Clicks Thật vs Unique Users (có tooltip thông minh)           │
│    • Biểu đồ phân bổ: Cơ cấu Campaign, Thiết bị (Mobile vs Desktop), Trình duyệt phổ biến,  │
│      Hiệu suất địa bàn (Vùng / Chi nhánh)                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. BÁO CÁO GOOGLE ANALYTICS 4 (GA4 — amtracking)                                            │
│    • Thẻ chỉ số: Views, Sessions, Active Users, Engagement Rate                             │
│    • Bảng Top 10 Landing Page có lượng truy cập cao nhất kèm nút mở trang thực tế           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. BẢNG QUẢN LÝ & THEO DÕI SALES AM (10 CỘT THÔNG TIN)                                      │
│    • STT, Mã Sales, Tên, Chi nhánh, Trạng thái AM, Clicks, Leads, Đơn Online, Doanh Thu,    │
│      Hành Động (Nút "Xem Link" mở modal popup chi tiết & Nút "Đôn đốc" nhân viên)           │
│    • Hỗ trợ click đảo chiều sắp xếp theo Clicks, Leads, Đơn, Doanh thu                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 7. BẢNG XẾP HẠNG TOP 10 SALES XUẤT SẮC & TOP 8 LINK TIẾP THỊ                                │
│    • Xếp hạng Top 1 ưu tiên Đơn Online hoàn tất giảm dần (Tiêu chí phụ: Clicks -> Leads)    │
│    • Vinh danh Top 1-2-3 huy hiệu Vàng, Bạc, Đồng; hiển thị Doanh thu và Link affiliate     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 3. Cấu Trúc Mã Nguồn & Thư Mục

```text
dashboard-am/
├── demo-improve/                       # Bản demo hoàn chỉnh & tối ưu giao diện
│   ├── index.html                      # Màn hình chính Dashboard AM (Standalone & Full-featured)
│   ├── css/
│   │   └── sop-dashboard.css           # Corporate Design System, tokens & styles
│   └── js/
│       └── sop-app.js                  # Toàn bộ nghiệp vụ, data binding, charts & filters
├── demo/                               # Bản demo nguyên bản ban đầu
├── diagrams/                           # Thư mục lưu trữ hình ảnh sơ đồ Use Case
├── [AM] - Dashboard Hieu Suat Ban Hang AM - UseCase.xlsx  # Bảng đặc tả Use Case chuẩn FPT ISC (5 Sheets, BR-AM-01 đến 24)
├── [AM] - Dashboard SOP - Diagrams UseCase.html          # Trang xem sơ đồ luồng Use Case trực quan
├── meeting-notes-dashboardAM.txt       # Biên bản thống nhất yêu cầu nghiệp vụ
└── README.md                           # Tài liệu tổng quan dự án
```

---

## 💻 4. Hướng Dẫn Trải Nghiệm Demo Trực Tiếp

1. Clone repository về máy tính:
   ```bash
   git clone https://github.com/duythien2610/dashboard-am.git
   cd dashboard-am
   ```
2. Mở trực tiếp file `demo-improve/index.html` bằng trình duyệt (Google Chrome, Microsoft Edge, Safari...):
   - Không yêu cầu cài đặt server phức tạp hay dependencies ngoài.
   - Hỗ trợ đầy đủ dữ liệu giả lập cho Tháng 7, Tháng 8 và Cả năm 2026.
   - Thử nghiệm các tính năng:
     - Lọc theo Vùng 1 $\rightarrow$ Vùng 7 để xem bảng và biểu đồ tự động chuyển đổi.
     - Click vào các tiêu đề cột `Clicks`, `Leads`, `Đơn Online`, `Doanh Thu Ước Tính` để sắp xếp dữ liệu.
     - Click nút **"Xem Link"** để mở popup xem chi tiết từng chiến dịch của Sales.
     - Click liên kết tại cột Chiến dịch / Link AM để mở kiểm tra Landing page thực tế.

---

## 📋 5. Tiêu Chuẩn Đặc Tả & Truy Vết (RTM)

- **Quy ước mã quy tắc nghiệp vụ**: `BR-AM-01` đến `BR-AM-24` định nghĩa chính xác từ cách tính Clicks thật, quy tắc Lead không thu hồi, chuẩn đơn thi công DKOL, đến công thức Doanh thu tiền tươi và Run-rate dự phóng.
- **Tiêu chuẩn tài liệu**: File Excel đặc tả đầy đủ 5 Sheet (Tổng quan, Bộ lọc & KPI, Biểu đồ & GA4, Quản lý Sales AM, Top Sales & Link) không lỗi wrap-text, căn chỉnh chuẩn form mẫu FPT Telecom.

---
*Phát triển và chuẩn hóa bởi Đội ngũ Phân Tích Nghiệp Vụ (Senior Business Analyst) — FPT Telecom.*
