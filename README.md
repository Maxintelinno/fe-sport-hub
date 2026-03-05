# SPORT HUB — แอปจองสนาม

แอป React Native (Expo) สำหรับการจองสนามกีฬา มีสองบทบาทหลัก:

- **ผู้จองสนาม (Customer)** — ค้นหาสนาม เลือกวันเวลา และจอง
- **เจ้าของสนาม (Owner)** — ลงสนาม จัดการการจอง

## โครงสร้างโปรเจกต์

```
src/
├── context/       # AuthContext (สถานะผู้ใช้ + บทบาท)
├── data/          # ข้อมูล mock + venueStore
├── navigation/    # AuthStack, CustomerTabs, OwnerTabs, AppNavigator
├── screens/
│   ├── auth/      # Welcome, RoleSelect, Login, Register
│   ├── customer/  # VenueList, VenueDetail, BookingForm, MyBookings
│   └── owner/     # MyVenues, AddVenue, VenueBookings
└── types/         # User, Venue, Booking, UserRole
```

## วิธีรัน

```bash
npm install
npm start
```

จากนั้นกด `i` สำหรับ iOS หรือ `a` สำหรับ Android (หรือสแกน QR ด้วย Expo Go)

## Flow การใช้งาน

1. เปิดแอป → หน้า Welcome → เลือกบทบาท (ผู้จอง / เจ้าของสนาม)
2. สมัครสมาชิกหรือเข้าสู่ระบบ (ตอนนี้เป็น mock ไม่ตรวจรหัสผ่าน)
3. **ผู้จอง**: ดูรายการสนาม → กดเลือกสนาม → เลือกวันที่และเวลา → ยืนยันการจอง → ดู "การจองของฉัน"
4. **เจ้าของ**: ดู "สนามของฉัน" (ว่างตอนสมัครใหม่) → "เพิ่มสนาม" → กรอกข้อมูลสนาม → ดูรายการจองของแต่ละสนาม

## ขั้นตอนถัดไป (แนะนำ)

- เชื่อม Backend API (auth, venues, bookings)
- เก็บ token / session จริง
- เพิ่มการกรองสนาม (ประเภทกีฬา, วันที่ว่าง)
- แจ้งเตือน / ปฏิทิน
- ชำระเงิน

## Tech stack

- React Native (Expo)
- TypeScript
- React Navigation (Native Stack + Bottom Tabs)
