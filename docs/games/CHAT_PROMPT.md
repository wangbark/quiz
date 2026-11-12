# เริ่มแชตใหม่ — เว็บเกม QuizWeb

# QuizWeb — กติกาแยกแชตพัฒนาโมดูล
โครงการเดียวกัน: C:\QuizWeb | GitHub: wangbark/quiz (branch main) | GitHub Pages docs/
URL ของ GameLock: /gamelock-client.html
โมดูล 3 เว็บอยู่ใน repo และเครื่องเดียวกันตั้งแต่ต้น ห้ามย้ายโฟลเดอร์เมื่อรวมงาน
- คำศัพท์: docs/vocab/ และ patchvocab.ps1, /vocab/index.html
- บันทึกประจำวัน: docs/diary/ และ patchdiary.ps1, /diary/index.html
- เกม: docs/games/ และ patchgame.ps1, /games/index.html

ขอบเขตสำคัญ: แก้เฉพาะ docs/<โมดูลนี้>/ และ patch<โมดูลนี้>.ps1 เท่านั้น; ห้ามแก้ docs/gamelock-client.html, docs/index.html, GameLock/QuizWeb Service, API, coupon, PIN, คะแนน, ปลดเวลา, Android, หรือโมดูลอื่น
ไฟล์ docs/<โมดูล>/ เป็น source of truth; patch เฉพาะโมดูลคัดลอกไป C:\QuizWeb\wwwroot\<โมดูล> และ C:\QuizWeb\publish\wwwroot\<โมดูล> เท่านั้น ไม่แตะส่วนอื่นและไม่ restart service
ส่งแพตช์เป็นไฟล์ชื่อเฉพาะโมดูลฉบับเต็ม ใช้รันทับได้ทันที ไม่ส่งคำสั่งให้แก้แพตช์เก่าด้วยมือ; สำรองไฟล์ก่อนแก้ ตรวจหลังคัดลอก และรายงานข้อผิดพลาดจริง
หน้าเว็บต้อง responsive, ภาษาไทยเป็นหลัก, รองรับ desktop/มือถือ, มีปุ่มกลับไป ../gamelock-client.html, เก็บ data ของโมดูลแยก ไม่ใช้ storage keys ข้ามโมดูล
หากต้องเชื่อมคะแนน/เวลา/คูปอง ต้องกลับไปอนุมัติและทำในแชต GameLock หลักก่อน


## งานในแชตนี้
พัฒนาเว็บ **เกม** ภายใน docs/games/ เท่านั้น; แยกไฟล์เกมแต่ละเกมในโฟลเดอร์ย่อยได้
ออกแบบหน้าเลือกเกมและต่อยอดมินิเกมตามคำสั่งผู้ใช้ทีละเกม; ให้รองรับเมาส์ คีย์บอร์ด และจอสัมผัสถ้าเหมาะสม
อย่าแตะระบบ GameLock/แบบทดสอบ และอย่าเพิ่มเวลา/คูปองอัตโนมัติ
ผลลัพธ์แต่ละรอบ: ไฟล์ patchgame.ps1 ฉบับเต็ม พร้อมไฟล์ที่เปลี่ยน และวิธีรัน powershell -ExecutionPolicy Bypass -File C:\QuizWeb\patchgame.ps1
