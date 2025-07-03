// script.js

document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const totalSavingsElement = document.getElementById('totalSavings');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    // ดึงข้อมูลการออมจาก Local Storage, ถ้าไม่มีให้เป็น Object ว่างเปล่า
    // savingsData = { "YYYY-MM-DD": amount, ... }
    let savingsData = JSON.parse(localStorage.getItem('savingsData')) || {};

    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    /**
     * สร้างและแสดงปฏิทินสำหรับเดือนและปีที่กำหนด
     * @param {number} month - เดือน (0-11)
     * @param {number} year - ปี
     */
    function renderCalendar(month, year) {
        calendarGrid.innerHTML = ''; // ล้างปฏิทินเก่าออก

        // เพิ่มชื่อวันในสัปดาห์
        dayNames.forEach(day => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.classList.add('day-name');
            dayNameDiv.textContent = day;
            calendarGrid.appendChild(dayNameDiv);
        });

        // คำนวณวันแรกของเดือนและจำนวนวันในเดือน
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = อาทิตย์, 1 = จันทร์...
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // ได้วันที่ของวันสุดท้ายของเดือน (คือจำนวนวันในเดือน)

        // อัปเดตข้อความเดือนและปีปัจจุบัน
        currentMonthYearElement.textContent = `${monthNames[month]} ${year + 543}`; // +543 สำหรับปีพ.ศ.

        // เพิ่มช่องว่างสำหรับวันก่อนหน้าวันแรกของเดือน
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        // เพิ่มวันในแต่ละวันของเดือน
        for (let day = 1; day <= daysInMonth; day++) {
            const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');

            // ตรวจสอบว่าเป็นวันปัจจุบันหรือไม่
            const today = new Date();
            const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            if (isToday) {
                dayDiv.classList.add('today');
            }

            dayDiv.innerHTML = `
                <div class="date-number">${day}</div>
                <input type="number" 
                       class="saving-input" 
                       data-date="${dateISO}" 
                       value="${savingsData[dateISO] || ''}" 
                       placeholder="เงินออม"
                       min="0">
            `;
            calendarGrid.appendChild(dayDiv);
        }

        // คำนวณและแสดงยอดเงินออมรวมหลังจากปฏิทินถูกสร้าง
        calculateAndDisplayTotalSavings();
    }

    /**
     * อัปเดตข้อมูลการออมใน Local Storage และคำนวณยอดรวมใหม่
     * @param {string} date - วันที่ในรูปแบบ YYYY-MM-DD
     * @param {number} amount - จำนวนเงินที่ออม
     */
    function updateSavings(date, amount) {
        if (amount <= 0) { // ถ้ากรอก 0 หรือค่าน้อยกว่า 0 ให้ลบข้อมูลนั้นออก
            delete savingsData[date];
        } else {
            savingsData[date] = amount;
        }
        localStorage.setItem('savingsData', JSON.stringify(savingsData));
        calculateAndDisplayTotalSavings();
    }

    /**
     * คำนวณยอดเงินออมรวมทั้งหมดและแสดงผล
     */
    function calculateAndDisplayTotalSavings() {
        let total = 0;
        for (const date in savingsData) {
            total += parseFloat(savingsData[date]) || 0; // รวมเงินออมแต่ละวัน
        }
        totalSavingsElement.textContent = total.toFixed(2); // แสดงผลเป็นทศนิยม 2 ตำแหน่ง
    }

    // Event listener สำหรับการเปลี่ยนแปลงค่าในช่องกรอกเงิน
    calendarGrid.addEventListener('input', (event) => {
        if (event.target.classList.contains('saving-input')) {
            const date = event.target.dataset.date; // ดึงวันที่จาก data-date attribute
            const amount = parseFloat(event.target.value); // แปลงค่าเป็นตัวเลข
            updateSavings(date, amount);
        }
    });

    // Event listeners สำหรับปุ่มเปลี่ยนเดือน
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // เรียกใช้งานฟังก์ชัน renderCalendar ครั้งแรกเมื่อหน้าเว็บโหลดเสร็จ
    renderCalendar(currentMonth, currentYear);
});
