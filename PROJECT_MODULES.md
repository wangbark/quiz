# QuizWeb — 4 การ์ดและแยกพัฒนา 3 โมดูล

Root Windows: `C:\QuizWeb`
Repository: `wangbark/quiz` (branch main)
GitHub Pages root: `docs/`
GameLock หลัก: `docs/gamelock-client.html`

## การ์ด GameLock (CW-4)
1. 📝 แบบทดสอบ — ระบบเดิม ห้ามแก้คะแนน/คูปอง/ปลดเวลา
2. 📚 คำศัพท์ — `docs/vocab/index.html` ภาษาไทยและอังกฤษในหน้าเดียว
3. 📔 บันทึกประจำวัน — `docs/diary/index.html`
4. 🎮 เกม — `docs/games/index.html`

ทุกการ์ดซ่อน/แสดงได้ใน Admin; รายการใหม่มีคีย์ `gamelockCardVisibilityV2` และย้ายค่าจาก V1 เมื่อยังไม่มี V2

## แยกแชตและแพตช์
- Vocab chat: อ่าน `docs/vocab/CHAT_PROMPT.md`; แก้เฉพาะ `docs/vocab/` และ `patchvocab.ps1`
- Diary chat: อ่าน `docs/diary/CHAT_PROMPT.md`; แก้เฉพาะ `docs/diary/` และ `patchdiary.ps1`
- Games chat: อ่าน `docs/games/CHAT_PROMPT.md`; แก้เฉพาะ `docs/games/` และ `patchgame.ps1`

`docs/<module>/` เป็น source of truth. แพตช์แต่ละตัวคัดลอกไฟล์เว็บของตัวเองไปที่ `wwwroot/<module>/` และ `publish/wwwroot/<module>/` เท่านั้น

## การติดตั้งครั้งแรก
แตกแพ็กทั้งหมดไป `C:\QuizWeb` แล้วรัน `powershell -ExecutionPolicy Bypass -File C:\QuizWeb\patch.ps1`
หรือใช้เพียง `patch.ps1` ก็ได้เพราะสามารถสร้างไฟล์โครงเริ่มต้นให้อัตโนมัติ

## กฎ
ห้ามโมดูลแก้ GameLock, QuizWeb service/API, Android, คะแนน, PIN, คูปอง, เวลา, หรือโมดูลอื่น
ไม่ต้องย้ายโฟลเดอร์เมื่อรวมงาน — ตัว GameLock ลิงก์ตรงไปที่ `vocab/index.html`, `diary/index.html`, `games/index.html`
หากอนาคตต้องเชื่อมคะแนน คูปอง หรือเวลาปลดล็อก ให้ทำผ่านแชต GameLock หลักเท่านั้น
