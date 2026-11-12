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

## หลังบ้านส่วนกลางที่ http://localhost:771/

- QuizWeb port 770 = หน้าเว็บใช้งาน/เกมล็อก; QuizWebContentManagerService port 771 = หลังบ้านแบบทดสอบเดิม
- ต้องเพิ่มเมนูส่วนกลาง 4 ส่วน: แบบทดสอบ (เดิม), คำศัพท์, บันทึกประจำวัน, เกม
- ให้คงแบบทดสอบเดิมอย่างครบถ้วน; ไม่เปลี่ยนคะแนน/คูปอง/ปลดล็อก/Android
- เมนูหลัก, การยืนยันตัวตน, routing และ deployment ของหลังบ้าน 771 อยู่ในความรับผิดชอบแชต QuizWeb/GameLock หลัก
- ส่วนฟอร์มจัดการและ API/data ของแต่ละโมดูลพัฒนาในแชต vocab/diary/games ตาม CHAT_PROMPT.md ของตัวเอง
- จุดติดตั้ง Content Manager ที่เคยใช้งาน: C:\ProgramData\QuizWeb\ContentManager\QuizWebContentManagerService.cs; ต้องตรวจ source/version จริงก่อนเปลี่ยน service
- ห้ามถือว่า docs/lock.html เป็นหลังบ้าน port 771 และห้ามแก้โค้ด service โดยเดา
- ห้ามเผยแพร่ข้อมูลบันทึกประจำวันหรือ API จัดการข้อมูลสู่ GitHub Pages; ยืนยันตัวตนและสิทธิ์ต้องบังคับจาก server ไม่ใช่ซ่อนเมนูเฉย ๆ

## Reward Core กลาง (รับผลเท่านั้น; ยังไม่ปลดล็อกเวลา)
- ติดตั้งบน QuizWeb Service :770 ด้วย `patchreward.ps1` (เป็นแพตช์แยกจาก patch.ps1 และ patchadmin.ps1)
- API: `GET /api/reward/v1/contract`, `POST /api/reward/v1/results`, `GET /api/reward/v1/health`
- Adapter กลาง: `docs/reward/reward-client.js`; ข้อตกลง: `docs/reward/REWARD_CONTRACT.md`
- เว็บ vocab/diary/games ส่ง `module,activityId,attemptId,score,maxScore,completed` โดยไม่ต้องแก้ GameLock
- **Score ที่รับมาเป็น unverified เท่านั้น**; ทุกผลตอบ `grantedMinutes=0`, ไม่แจกคูปอง, ยังไม่เปลี่ยนเกณฑ์แบบทดสอบ
- เมื่อเว็บแยกพัฒนาเสร็จ ค่อยเพิ่ม server-side verification, binding session เครื่องลูก และเกณฑ์เวลาที่แชต GameLock หลัก
