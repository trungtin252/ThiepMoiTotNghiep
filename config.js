// =============================================================================
// CẤU HÌNH THIỆP MỜI LỄ TỐT NGHIỆP - TÂN KỸ SƯ LAI TRUNG TÍN
// =============================================================================

window.GRADUATION_INVITE = {
  // 1. THÔNG TIN CHUNG
  guestName: "Bạn và Gia đình", // Tên hiển thị mặc định khi không có link riêng
  graduateName: "LAI TRUNG TÍN",
  shortName: "Lai Trung Tín",
  degree: "Kỹ sư",
  university: "ĐẠI HỌC CẦN THƠ",
  faculty: "Khoa Chuyên Ngành",
  phone: "0706942875",

  // 2. THỜI GIAN & ĐỊA ĐIỂM
  ceremonyDate: "2026-10-31T14:00:00+07:00",
  displayDate: "Thứ Bảy, 31 tháng 10 năm 2026",
  time: "14:00",
  timeNote: "Lễ chính thức lúc 14:00. Mọi người đến chúc mừng có thể đến trễ hơn (khoảng 15:00 - 16:30) vì phần đầu phải chờ làm lễ trong hội trường.",
  venue: "Hội trường Rùa, Đại học Cần Thơ",
  address: "Khu II, Đường 3/2, Xuân Khánh, Ninh Kiều, TP. Cần Thơ",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Hội+trường+Rùa+Đại+học+Cần+Thơ",

  // 3. THÔNG ĐIỆP & TRI ÂN
  message: "Một chặng đường đã khép lại và một hành trình mới sắp bắt đầu. Sự hiện diện và lời chúc của bạn sẽ là niềm vui to lớn, là một phần kỷ niệm thật đẹp trong ngày tốt nghiệp của tôi.",
  quote: "Không chỉ là ngày nhận bằng, mà là ngày đánh dấu những nỗ lực đã trở thành một kỷ niệm thật đáng tự hào.",
  signOff: "Rất mong được gặp bạn!",
  familyNote: "Trân trọng kính mời",

  // 4. DANH SÁCH KHÁCH MỜI ĐỂ TẠO LINK RIÊNG DẠNG domain.com/ten
  // Cú pháp: "slug-khong-dau": "Tên Hiển Thị Có Dấu Trên Thiệp"
  // Bạn có thể tự thêm hoặc gửi danh sách cho tôi để tôi thêm vào đây!
  guests: {
    "anh-nam": "Anh Nam",
    "bac-ba": "Bác Ba và Gia đình",
    "thay-hung": "Thầy Hùng",
    "gia-dinh": "Gia đình thân yêu",
    "ban-than": "Bạn Thân"
  },

  // 5. NHẠC NỀN
  music: {
    enabled: false,
    src: "assets/music.mp3"
  },

  // 6. LƯU LỜI CHÚC VÀO FILE JSON
  // - Khi chạy local (node server.js): Mặc định tự động ghi thẳng vào file wishes.json trong thư mục!
  // - Khi chạy online: Điền link file JSON online nếu muốn đồng bộ qua mạng
  wishesJsonUrl: ""
};
