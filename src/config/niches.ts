export interface NicheConfig {
  id: string;
  name: string;
  keywords: string[];
  hashtags: string[];
  painPoints: string[];
  contentAngles: string[];
}

export const NICHES: NicheConfig[] = [
  {
    id: "gia-dung",
    name: "Gia dụng thông minh",
    keywords: ["đồ gia dụng", "tiện ích nhà bếp", "dọn nhà", "nhà cửa"],
    hashtags: ["#reviewgiadung", "#tiemnha", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Mua về dùng 2 lần hỏng",
      "Không như quảng cáo",
      "Hàng nhái quá nhiều",
    ],
    contentAngles: ["Test độ bền", "So sánh trước-sau", "Unboxing + review"],
  },
  {
    id: "thoi-trang-nu",
    name: "Thời trang nữ",
    keywords: ["quần áo nữ", "váy", "áo kiểu", "thời trang nữ"],
    hashtags: ["#thoitrangnu", "#ootd", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Size không chuẩn",
      "Chất liệu khác ảnh",
      "Phai màu sau giặt",
    ],
    contentAngles: ["Try-on haul", "Mix đồ", "So sánh giá"],
  },
  {
    id: "thoi-trang-nam",
    name: "Thời trang nam",
    keywords: ["quần áo nam", "áo thun nam", "thời trang nam"],
    hashtags: ["#thoitrangnam", "#ootdmen", "#xuhuong", "#tiktokshop"],
    painPoints: ["Form không vừa", "Chất liệu bí", "Nhanh cũ"],
    contentAngles: ["Outfit check", "Mix đồ cơ bản", "Review sau 1 tháng"],
  },
  {
    id: "cong-nghe",
    name: "Công nghệ & Phụ kiện",
    keywords: ["phụ kiện điện thoại", "tai nghe", "sạc dự phòng", "công nghệ"],
    hashtags: ["#reviewcongnghe", "#phukien", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Hàng fake khó phân biệt",
      "Pin chai nhanh",
      "Không tương thích",
    ],
    contentAngles: ["Test thực tế", "So sánh với hàng đắt tiền", "Unboxing"],
  },
  {
    id: "my-pham",
    name: "Mỹ phẩm & Skincare",
    keywords: ["skincare", "kem chống nắng", "son", "mỹ phẩm"],
    hashtags: ["#reviewmypham", "#skincare", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Không hợp da",
      "Hàng giả tràn lan",
      "Kích ứng da",
    ],
    contentAngles: ["Test 7 ngày", "Before/After", "So sánh thành phần"],
  },
  {
    id: "suc-khoe",
    name: "Sức khỏe & TPCN",
    keywords: [
      "thực phẩm chức năng",
      "vitamin",
      "sức khỏe",
      "giảm cân",
    ],
    hashtags: ["#reviewtpcn", "#suckhoe", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Không rõ nguồn gốc",
      "Hiệu quả chậm",
      "Tác dụng phụ",
    ],
    contentAngles: ["Test 30 ngày", "Review trung thực", "Giải thích thành phần"],
  },
  {
    id: "me-va-be",
    name: "Mẹ & Bé",
    keywords: ["đồ chơi trẻ em", "sữa", "tã", "đồ dùng mẹ bé"],
    hashtags: ["#reviewmevabe", "#mevabe", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Không an toàn cho bé",
      "Chất liệu kém",
      "Giá quá cao",
    ],
    contentAngles: ["Test an toàn", "So sánh giá", "Mẹo hay cho mẹ"],
  },
  {
    id: "nha-cua",
    name: "Nhà cửa & Decor",
    keywords: ["decor", "đồ trang trí", "nhà cửa", "nội thất"],
    hashtags: ["#reviewdecor", "#nhacua", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Khó lắp ráp",
      "Không như hình",
      "Dễ hỏng khi vận chuyển",
    ],
    contentAngles: ["Before/After decor", "Hướng dẫn lắp đặt", "Review thực tế"],
  },
  {
    id: "the-thao",
    name: "Thể thao & Outdoor",
    keywords: ["dụng cụ thể thao", "giày chạy bộ", "tập gym", "outdoor"],
    hashtags: ["#reviewthethao", "#gym", "#xuhuong", "#tiktokshop"],
    painPoints: ["Nhanh hỏng", "Không đúng size", "Chất lượng kém"],
    contentAngles: ["Test sau 1 tháng tập", "So sánh với hàng hiệu", "Mẹo chọn đồ"],
  },
  {
    id: "thu-cung",
    name: "Thú cưng",
    keywords: ["đồ chơi chó mèo", "thức ăn thú cưng", "phụ kiện thú cưng"],
    hashtags: ["#reviewthucung", "#meocung", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Thú cưng không thích",
      "Không an toàn",
      "Giá quá đắt",
    ],
    contentAngles: ["Test với thú cưng", "So sánh giá", "Mẹo chăm sóc"],
  },
  {
    id: "oto-xe-may",
    name: "Ô tô & Xe máy",
    keywords: ["phụ kiện xe", "đồ chơi xe", "chăm sóc xe"],
    hashtags: ["#reviewxe", "#phukienxe", "#xuhuong", "#tiktokshop"],
    painPoints: ["Không tương thích", "Chất liệu kém", "Khó lắp đặt"],
    contentAngles: ["Test thực tế", "Hướng dẫn lắp đặt", "So sánh giá"],
  },
  {
    id: "do-an",
    name: "Đồ ăn & Snack",
    keywords: ["snack", "đồ ăn vặt", "thực phẩm", "ăn kiêng"],
    hashtags: ["#reviewdoan", "#anvat", "#xuhuong", "#tiktokshop"],
    painPoints: [
      "Không ngon như review",
      "Hết hạn",
      "Đóng gói kém",
    ],
    contentAngles: ["Mukbang review", "So sánh hương vị", "Test độ hot"],
  },
];

export function getNicheById(id: string): NicheConfig | undefined {
  return NICHES.find((n) => n.id === id);
}

export function getRandomNiche(): NicheConfig {
  const index = Math.floor(Math.random() * NICHES.length);
  return NICHES[index];
}
