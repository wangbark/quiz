# เริ่มแชตใหม่ — เว็บบันทึกประจำวัน QuizWeb

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
พัฒนาเว็บ **บันทึกประจำวัน** ภายใน docs/diary/ เท่านั้น
เริ่มด้วยหน้าบันทึกตามวัน รายการย้อนหลัง การแก้ไข/ลบ และการสำรองข้อมูลเมื่อผู้ใช้ตกลงรายละเอียด
เนื่องจากบันทึกอาจเป็นข้อมูลส่วนตัว ห้ามส่งข้อมูลขึ้นเซิร์ฟเวอร์หรือ GitHub อัตโนมัติ; ขอข้อกำหนดพื้นที่จัดเก็บ/สิทธิ์ผู้ใช้ก่อนเพิ่มระบบบันทึกจริง
อย่าเชื่อมคะแนน/เวลา/คูปองหรือแก้ GameLock
ผลลัพธ์แต่ละรอบ: ไฟล์ patchdiary.ps1 ฉบับเต็ม พร้อมไฟล์ที่เปลี่ยน และวิธีรัน powershell -ExecutionPolicy Bypass -File C:\QuizWeb\patchdiary.ps1

## หลังบ้าน Content Manager (เพิ่มเติม)
หลังบ้านกลางอยู่ที่ http://localhost:771/ ผ่าน QuizWebContentManagerService (แยกจาก QuizWeb port 770) ไม่ใช่ docs/lock.html
โมดูลนี้ต้องมีส่วนจัดการบันทึกประจำวันในหลังบ้านกลาง (กำหนดการแสดงผล, หมวดหมู่, สิทธิ์/การเก็บรักษา และดูแลข้อมูลตามที่ผู้ใช้อนุมัติ) โดยคงแบบทดสอบเดิม
บันทึกเป็นข้อมูลส่วนบุคคล: ค่าเริ่มต้นห้ามเผยแพร่, ห้ามเก็บข้อความบันทึกลง repo สาธารณะ/ไฟล์ static, ห้ามสร้าง API เข้าถึงบันทึกโดยไม่มีการยืนยันตัวตนและควบคุมสิทธิ์จาก server
ก่อนเชื่อมต้องตรวจ source จริง C:\ProgramData\QuizWeb\ContentManager\QuizWebContentManagerService.cs และสำรอง ห้ามเดา route/compile/service
การพัฒนาในแชตนี้จำกัดการจัดการฝั่งโมดูล diary เท่านั้น; เมนูรวม/สิทธิ์/การเปิด route ที่ port 771 ให้แชต GameLock หลักรับผิดชอบ
