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

## หลังบ้าน Content Manager (เพิ่มเติม)
หลังบ้านกลางอยู่ที่ http://localhost:771/ ผ่าน QuizWebContentManagerService (แยกจาก QuizWeb port 770) ไม่ใช่ docs/lock.html
โมดูลนี้ต้องมีส่วนจัดการเกมในหลังบ้านกลาง (รายชื่อเกม, เปิด/ปิด, ลำดับการแสดง, ปรับค่าตั้งเกม, ดูสถิติเฉพาะกรณีที่ผู้ใช้สั่ง) โดยคงแบบทดสอบเดิม
ก่อนเชื่อมต้องตรวจ source จริง C:\ProgramData\QuizWeb\ContentManager\QuizWebContentManagerService.cs และสำรอง ห้ามเดา route/compile/service
การพัฒนาในแชตนี้จำกัดการจัดการฝั่งโมดูล games เท่านั้น; เมนูรวม/สิทธิ์/การเปิด route ที่ port 771 ให้แชต GameLock หลักรับผิดชอบ

### API หลังบ้านโมดูล (หลังติดตั้ง patchadmin.ps1)
- GET `http://127.0.0.1:771/api/modules/games` => `{ok:true,module:"games",data:{version:1,items:[...]}}`
- POST same-origin ต้องมี header `X-QuizWeb-Admin: 1`; rows มี `id,title,slug,description,order,enabled`
- เก็บใน `C:\ProgramData\QuizWeb\ContentManager\modules\games.json`
- เว็บเกม port 770 / GitHub Pages ยังไม่ได้อ่านข้อมูลจาก 771 อัตโนมัติ; ต้องพัฒนา pipeline เผยแพร่ config เกมที่ไม่เป็นข้อมูลส่วนตัวต่อในแชตเกม ห้ามให้ client ต่างเครื่องเรียก localhost:771
