// script.js

document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const totalSavingsElement = document.getElementById('totalSavings');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
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

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthYearElement.textContent = `${monthNames[month]} ${year + 543}`;

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

            // กำหนด animation-delay สำหรับแต่ละวัน
            // ทำให้แต่ละวันปรากฏขึ้นมาไม่พร้อมกัน ดูมีมิติมากขึ้น
            dayDiv.style.animationDelay = `${(firstDayOfMonth + day) * 0.03}s`; // เพิ่มดีเลย์เล็กน้อย

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

        calculateAndDisplayTotalSavings();
    }

    /**
     * อัปเดตข้อมูลการออมใน Local Storage และคำนวณยอดรวมใหม่
     * @param {string} date - วันที่ในรูปแบบYYYY-MM-DD
     * @param {number} amount - จำนวนเงินที่ออม
     */
    function updateSavings(date, amount) {
        if (amount <= 0 || isNaN(amount)) { // ถ้ากรอก 0, ค่าน้อยกว่า 0 หรือไม่ใช่ตัวเลข ให้ลบข้อมูลนั้นออก
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
            total += parseFloat(savingsData[date]) || 0;
        }
        
        // ตรวจสอบว่าค่าเปลี่ยนไปหรือไม่ก่อนที่จะเรียกอนิเมชั่น
        const currentTotalText = totalSavingsElement.textContent;
        const newTotalText = total.toFixed(2);

        if (currentTotalText !== newTotalText) {
            // เพิ่ม class เพื่อกระตุ้นอนิเมชั่น pulseEffect
            totalSavingsElement.closest('.summary').classList.remove('pulseEffect'); // ลบ class เก่าออกก่อน
            void totalSavingsElement.closest('.summary').offsetWidth; // ทริกการ reflow เพื่อให้อนิเมชั่นเล่นซ้ำ
            totalSavingsElement.closest('.summary').classList.add('pulseEffect'); // เพิ่ม class ใหม่
        }
        
        totalSavingsElement.textContent = newTotalText;
    }

    // Event listener สำหรับการเปลี่ยนแปลงค่าในช่องกรอกเงิน
    calendarGrid.addEventListener('input', (event) => {
        if (event.target.classList.contains('saving-input')) {
            const date = event.target.dataset.date;
            const amount = parseFloat(event.target.value);
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
