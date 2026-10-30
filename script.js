/* =========================================================
   CÂU CHUYỆN TÌNH YÊU - JAVASCRIPT
   File này điều khiển trái tim hoa, chữ chạy và đồng hồ.
   Bạn có thể chỉnh các thông tin ở PHẦN 1 bên dưới.
   ========================================================= */

/* =========================================================
   PHẦN 1. CẤU HÌNH - HÃY CHỈNH SỬA TẠI ĐÂY
   ========================================================= */
const CAU_HINH = {
    // Đổi tên hai người trong đoạn mã hiển thị bên trái.
    tenNguoiThuNhat: "LÒ VĂN VIỆT",
    tenNguoiThuHai: "TRẦN KHÁNH LINH",

    // Ngày bắt đầu yêu: năm, tháng (0-11), ngày, giờ, phút, giây.
    // Ví dụ: 15/06/2024 lúc 20:00 => new Date(2024, 5, 15, 20, 0, 0)
    ngayBatDauYeu: new Date(2026, 5, 3, 0, 0, 0),

    // Tốc độ gõ chữ: số càng nhỏ thì chữ chạy càng nhanh (đơn vị mili giây).
    tocDoGoChu: 34,

    // Thời gian chờ trước khi bắt đầu vẽ trái tim (mili giây).
    thoiGianChoVeTim: 1200,

    // Màu cánh hoa. Có thể thêm hoặc thay các mã màu CSS.
    mauCanhHoa: ["#ff6fae", "#ff9bc5", "#ffc1dc", "#ff4f91", "#ffd1e5"]
};

/* =========================================================
   PHẦN 2. LẤY CÁC THÀNH PHẦN HTML
   ========================================================= */
const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");
const khuVucTraiTim = document.querySelector(".khung-trai-tim");
const khuVucMa = document.getElementById("code");
const dongHo = document.getElementById("elapseClock");
const thongDiep = document.getElementById("messages");
const loiYeu = document.getElementById("loveu");

/* Thay tên mẫu trong đoạn mã bằng tên bạn đã khai báo ở phần cấu hình. */
function capNhatTenTrongDoanMa() {
    const cacDong = khuVucMa.querySelectorAll(".dong-ma");
    cacDong.forEach((dong) => {
        dong.innerHTML = dong.innerHTML
            .replace("LÒ VĂN VIỆT", CAU_HINH.tenNguoiThuNhat)
            .replace("TRẦN KHÁNH LINH", CAU_HINH.tenNguoiThuHai);
    });
}

/* =========================================================
   PHẦN 3. HIỆU ỨNG GÕ CHỮ TỪNG KÝ TỰ
   Dùng bản sao của từng dòng để giữ nguyên màu cú pháp HTML.
   ========================================================= */
function chayHieuUngGoChu() {
    khuVucMa.classList.add("con-tro");
    const cacDong = [...khuVucMa.querySelectorAll(".dong-ma")];

    // Lấy trực tiếp các nút văn bản đang có trong HTML.
    // Chỉ xóa nội dung bên trong nút, không gán lại innerHTML,
    // để trình duyệt không loại bỏ những nút văn bản rỗng.
    const duLieuDong = cacDong.map((dong) => {
        const cacNutVanBan = [];
        const boDuyet = document.createTreeWalker(dong, NodeFilter.SHOW_TEXT);

        while (boDuyet.nextNode()) {
            const nut = boDuyet.currentNode;
            cacNutVanBan.push({ nut, noiDung: nut.nodeValue });
            nut.nodeValue = "";
        }

        return cacNutVanBan;
    });

    let dongHienTai = 0;
    let doanHienTai = 0;
    let kyTuHienTai = 0;

    function goTiep() {
        if (dongHienTai >= duLieuDong.length) {
            khuVucMa.classList.remove("con-tro");
            const ab=document.getElementById("albumBtn"); if(ab) ab.style.display="inline-block";
            return;
        }

        const cacDoan = duLieuDong[dongHienTai];
        if (doanHienTai >= cacDoan.length) {
            dongHienTai++;
            doanHienTai = 0;
            kyTuHienTai = 0;
            goTiep();
            return;
        }

        const doan = cacDoan[doanHienTai];
        if (kyTuHienTai < doan.noiDung.length) {
            doan.nut.nodeValue += doan.noiDung.charAt(kyTuHienTai);
            kyTuHienTai++;
            setTimeout(goTiep, CAU_HINH.tocDoGoChu);
        } else {
            doanHienTai++;
            kyTuHienTai = 0;
            goTiep();
        }
    }

    goTiep();
}

/* =========================================================
   PHẦN 4. CÁC ĐỐI TƯỢNG TẠO CÁNH HOA
   Đây là phần thay thế thư viện garden.js của bản gốc.
   Mỗi bông hoa gồm nhiều cánh được vẽ bằng đường cong Bezier.
   ========================================================= */
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    xoay(goc) {
        const xCu = this.x;
        const yCu = this.y;
        this.x = Math.cos(goc) * xCu - Math.sin(goc) * yCu;
        this.y = Math.sin(goc) * xCu + Math.cos(goc) * yCu;
        return this;
    }

    nhan(heSo) {
        this.x *= heSo;
        this.y *= heSo;
        return this;
    }

    banSao() {
        return new Vector(this.x, this.y);
    }
}

class CanhHoa {
    constructor(gocBatDau, gocCanh, doKeo, mau, banKinh, tocDoLon) {
        this.gocBatDau = gocBatDau;
        this.gocCanh = gocCanh;
        this.doKeo = doKeo;
        this.mau = mau;
        this.banKinh = banKinh;
        this.tocDoLon = tocDoLon;
        this.kichThuoc = 0.5;
        this.hoanTat = false;
    }

    ve(ctx) {
        const diemDau = new Vector(0, this.kichThuoc).xoay(this.gocBatDau);
        const diemCuoi = diemDau.banSao().xoay(this.gocCanh);
        const dieuKhien1 = diemDau.banSao().nhan(this.doKeo);
        const dieuKhien2 = diemCuoi.banSao().nhan(this.doKeo);

        ctx.beginPath();
        ctx.strokeStyle = this.mau;
        ctx.lineWidth = 0.65;
        ctx.moveTo(diemDau.x, diemDau.y);
        ctx.bezierCurveTo(
            dieuKhien1.x, dieuKhien1.y,
            dieuKhien2.x, dieuKhien2.y,
            diemCuoi.x, diemCuoi.y
        );
        ctx.stroke();
    }

    capNhat(ctx) {
        if (this.kichThuoc < this.banKinh) {
            this.kichThuoc += this.tocDoLon;
            this.ve(ctx);
        } else {
            this.hoanTat = true;
        }
    }
}

class BongHoa {
    constructor(x, y, banKinh, mau, soCanh) {
        this.x = x;
        this.y = y;
        this.banKinh = banKinh;
        this.cacCanh = [];

        const gocMoiCanh = (Math.PI * 2) / soCanh;
        const gocBatDau = Math.random() * Math.PI / 2;

        for (let i = 0; i < soCanh; i++) {
            this.cacCanh.push(new CanhHoa(
                gocBatDau + i * gocMoiCanh,
                gocMoiCanh,
                1.1 + Math.random() * 1.4,
                mau,
                banKinh,
                0.12 + Math.random() * 0.24
            ));
        }
    }

    capNhat(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        this.cacCanh.forEach((canh) => canh.capNhat(ctx));
        ctx.restore();
        return this.cacCanh.every((canh) => canh.hoanTat);
    }
}

/* =========================================================
   PHẦN 5. QUẢN LÝ VƯỜN HOA VÀ VẼ ĐƯỜNG VIỀN TRÁI TIM
   ========================================================= */
const vuonHoa = [];
let cacDiemTraiTim = [];
let maKhungHinh = null;
let demKhungHinh = 0;
let chiSoDiem = 0;
let daHienLoiNhan = false;
let kichThuocCanvas = { rong: 0, cao: 0 };

function taoDuongTraiTim() {
    cacDiemTraiTim = [];
    const rong = kichThuocCanvas.rong;
    const cao = kichThuocCanvas.cao;

    // Hệ số này giúp trái tim vừa trong khung trên cả điện thoại.
    const tiLe = Math.min(rong / 39, cao / 34);
    const tamX = rong / 2;
    const tamY = cao / 2 + tiLe * 1.2;
    // Lấy các điểm thô theo công thức trái tim tham số.
    const diemTho = [];
    const soBuoc = 1200;
    for (let i = 0; i <= soBuoc; i++) {
        const t = (i / soBuoc) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        diemTho.push({ x: tamX + x * tiLe, y: tamY + y * tiLe });
    }

    // Tính độ dài cung tích lũy để phân bố hoa đều theo đường viền.
    const doDaiCung = [0];
    for (let i = 1; i < diemTho.length; i++) {
        const dx = diemTho[i].x - diemTho[i - 1].x;
        const dy = diemTho[i].y - diemTho[i - 1].y;
        doDaiCung.push(doDaiCung[i - 1] + Math.hypot(dx, dy));
    }
    const chuVi = doDaiCung[doDaiCung.length - 1];

    // Khoảng cách giữa các bông hoa, điều chỉnh để không chồng lấn.
    const khoangCach = Math.max(6, tiLe * 1.6);
    const soHoa = Math.max(24, Math.floor(chuVi / khoangCach));

    for (let i = 0; i < soHoa; i++) {
        const mucTieu = (i / soHoa) * chuVi;
        // Tìm đoạn chứa mucTieu.
        let j = 1;
        while (j < doDaiCung.length && doDaiCung[j] < mucTieu) j++;
        if (j >= doDaiCung.length) j = doDaiCung.length - 1;
        const doanTruoc = doDaiCung[j - 1];
        const doanSau = doDaiCung[j];
        const tiLeNoi = (mucTieu - doanTruoc) / (doanSau - doanTruoc || 1);
        const x = diemTho[j - 1].x + (diemTho[j].x - diemTho[j - 1].x) * tiLeNoi;
        const y = diemTho[j - 1].y + (diemTho[j].y - diemTho[j - 1].y) * tiLeNoi;
        cacDiemTraiTim.push({ x, y });
    }
}

function themMotBongHoa(diem) {
    const mau = CAU_HINH.mauCanhHoa[
        Math.floor(Math.random() * CAU_HINH.mauCanhHoa.length)
    ];
    const banKinh = 3 + Math.random() * 2.5;
    const soCanh = 7 + Math.floor(Math.random() * 5);
    vuonHoa.push(new BongHoa(diem.x, diem.y, banKinh, mau, soCanh));
}

function capNhatVuonHoa() {
    // Duyệt ngược để xóa bông hoa đã nở mà không bỏ sót phần tử.
    for (let i = vuonHoa.length - 1; i >= 0; i--) {
        const daXong = vuonHoa[i].capNhat(ctx);
        if (daXong) vuonHoa.splice(i, 1);
    }
}

function veTraiTim() {
    demKhungHinh++;
    if (chiSoDiem < cacDiemTraiTim.length) {
        // Mỗi nhịp thêm một bông hoa để trái tim dần hiện ra.
        if (demKhungHinh % 2 === 0) {
            themMotBongHoa(cacDiemTraiTim[chiSoDiem]);
            chiSoDiem++;
        }
    } else if (!daHienLoiNhan) {
        daHienLoiNhan = true;
        hienThiLoiNhan();
    }

    capNhatVuonHoa();
    maKhungHinh = requestAnimationFrame(veTraiTim);
}

/* =========================================================
   PHẦN 6. ĐỒNG HỒ ĐẾM THỜI GIAN YÊU NHAU
   Tự tính ngày, giờ, phút, giây từ ngày bạn đặt ở phần 1.
   ========================================================= */
function capNhatDongHo() {
    const bayGio = new Date();
    let chenhLech = bayGio.getTime() - CAU_HINH.ngayBatDauYeu.getTime();

    if (chenhLech < 0) {
        dongHo.textContent = "Ngày đặc biệt ấy vẫn đang chờ phía trước ❤️";
        return;
    }

    const tongGiay = Math.floor(chenhLech / 1000);
    const ngay = Math.floor(tongGiay / 86400);
    const gio = Math.floor((tongGiay % 86400) / 3600);
    const phut = Math.floor((tongGiay % 3600) / 60);
    const giay = tongGiay % 60;

    dongHo.innerHTML =
        `<span>${ngay}</span> ngày ` +
        `<span>${String(gio).padStart(2, "0")}</span> giờ<br>` +
        `<span>${String(phut).padStart(2, "0")}</span> phút ` +
        `<span>${String(giay).padStart(2, "0")}</span> giây`;
}

/* =========================================================
   PHẦN 7. HIỆN LỜI NHẮN SAU KHI TRÁI TIM ĐƯỢC VẼ XONG
   ========================================================= */
function hienThiLoiNhan() {
    thongDiep.classList.add("hien");
    setTimeout(() => loiYeu.classList.add("hien"), 1800);
}

/* =========================================================
   PHẦN 8. ĐIỀU CHỈNH CANVAS KHI ĐỔI KÍCH THƯỚC MÀN HÌNH
   ========================================================= */
function dieuChinhCanvas() {
    const khung = khuVucTraiTim.getBoundingClientRect();
    const matDoDiemAnh = Math.min(window.devicePixelRatio || 1, 2);

    kichThuocCanvas.rong = khung.width;
    kichThuocCanvas.cao = khung.height;
    canvas.width = Math.round(khung.width * matDoDiemAnh);
    canvas.height = Math.round(khung.height * matDoDiemAnh);

    // Vẽ theo đơn vị CSS pixel, tránh trái tim bị mờ trên màn hình nét cao.
    ctx.setTransform(matDoDiemAnh, 0, 0, matDoDiemAnh, 0, 0);

    taoDuongTraiTim();
}

/* =========================================================
   PHẦN 9. KHỞI ĐỘNG TẤT CẢ HIỆU ỨNG
   ========================================================= */
function khoiDongTrang() {
    capNhatTenTrongDoanMa();
    dieuChinhCanvas();
    chayHieuUngGoChu();
    capNhatDongHo();
    setInterval(capNhatDongHo, 1000);

    // Chờ một chút rồi bắt đầu vẽ trái tim hoa.
    setTimeout(() => {
        demKhungHinh = 0;
        veTraiTim();
    }, CAU_HINH.thoiGianChoVeTim);
}

// Khi đổi kích thước cửa sổ, dựng lại trái tim theo kích thước mới.
window.addEventListener("resize", () => {
    dieuChinhCanvas();
});

// Chỉ chạy sau khi toàn bộ cấu trúc HTML đã sẵn sàng.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", khoiDongTrang);
} else {
    khoiDongTrang();
}

// Auto slideshow on main page
const MAIN_IMGS=["Album/anhlinhyeu/1792341410169.jpeg", "Album/anhlinhyeu/1792341410173.jpeg", "Album/anhlinhyeu/1792341410177.jpeg", "Album/anhlinhyeu/1792341410180.jpeg", "Album/anhlinhyeu/1792341410184.jpeg", "Album/anhlinhyeu/1792341410188.jpeg", "Album/anhlinhyeu/1792341410192.jpeg", "Album/anhlinhyeu/1792341410195.jpeg", "Album/anhlinhyeu/1792341410199.jpeg", "Album/anhlinhyeu/1792341410204.jpeg", "Album/anhlinhyeu/1792341410208.jpeg", "Album/anhlinhyeu/1792341410212.jpeg", "Album/anhlinhyeu/1792341410216.jpeg", "Album/anhlinhyeu/1792341410220.jpeg", "Album/anhlinhyeu/1792341410224.jpeg", "Album/anhlinhyeu/1792341410230.jpeg", "Album/anhlinhyeu/1792341410234.jpeg", "Album/anhlinhyeu/1792341410241.jpeg", "Album/anhlinhyeu/1792341410245.jpeg", "Album/anhlinhyeu/1792341410249.jpeg", "Album/anhlinhyeu/1792341410256.jpeg", "Album/anhlinhyeu/1792341410270.jpeg", "Album/anhlinhyeu/1792341410282.jpeg", "Album/anhlinhyeu/1792341410296.jpeg", "Album/anhlinhyeu/1792341410310.jpeg", "Album/anhlinhyeu/1792341410315.jpeg", "Album/anhlinhyeu/1792341410325.jpeg", "Album/anhlinhyeu/1792341410328.jpeg", "Album/anhlinhyeu/1792341410332.jpeg", "Album/anhlinhyeu/1792341410341.jpeg", "Album/anhlinhyeu/1792341410345.jpeg", "Album/anhlinhyeu/1792341410349.jpeg", "Album/anhlinhyeu/1792341410354.jpeg", "Album/anhlinhyeu/1792341410359.jpeg", "Album/anhlinhyeu/1792341410363.jpeg", "Album/anhlinhyeu/1792341410368.jpeg", "Album/anhlinhyeu/1792341410380.jpeg", "Album/anhlinhyeu/1792341410386.jpeg", "Album/anhlinhyeu/1792341410392.jpeg", "Album/anhlinhyeu/1792341410395.jpeg", "Album/anhlinhyeu/1792341410399.jpeg", "Album/anhlinhyeu/1792341410406.jpeg", "Album/anhlinhyeu/1792341410410.jpeg", "Album/anhlinhyeu/1792341410414.jpeg", "Album/anhlinhyeu/1792341410421.jpeg", "Album/anhlinhyeu/1792341410425.jpeg", "Album/anhlinhyeu/1792341410433.jpeg", "Album/anhlinhyeu/1792341410438.jpeg", "Album/anhlinhyeu/1792341410442.jpeg", "Album/anhlinhyeu/1792341410446.jpeg", "Album/anhlinhyeu/received_1418377900268155.mp4", "Album/anhlinhyeu/received_2101537870751678.mp4", "Album/bomevalinhyeu/1792341476261.jpeg", "Album/bomevalinhyeu/1792341476270.jpeg", "Album/bomevalinhyeu/1792341476276.jpeg", "Album/bomevalinhyeu/1792341476283.jpeg", "Album/bomevalinhyeu/1792341476289.jpeg", "Album/bomevalinhyeu/1792341476296.jpeg", "Album/bomevalinhyeu/1792341476304.jpeg", "Album/bomevalinhyeu/1792341476311.jpeg", "Album/bomevalinhyeu/1792341476318.jpeg", "Album/bomevalinhyeu/1792341476325.jpeg", "Album/bomevalinhyeu/1792341476333.jpeg", "Album/bomevalinhyeu/1792341476339.jpeg", "Album/bomevalinhyeu/1792341476348.jpeg", "Album/bomevalinhyeu/1792341476355.jpeg", "Album/bomevalinhyeu/1792341476361.jpeg", "Album/bomevalinhyeu/1792341476368.jpeg", "Album/bomevalinhyeu/1792341476375.jpeg"];
let mi=0;
const mimg=document.getElementById('mainSlideshow');
if(mimg){setInterval(()=>{mi=(mi+1)%MAIN_IMGS.length;mimg.src=MAIN_IMGS[mi];},3000);}
