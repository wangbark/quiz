# QuizWeb Reward Core R2 — 4 การ์ดและเกณฑ์จากหน้า Admin

**รองรับ quiz / vocab / diary / games ทั้งหมด** ด้วยข้อมูลกลาง schemaVersion 1 และ Reward API ที่ port 770

## API Reward (port 770)
- `GET /api/reward/v1/health` ตรวจระบบ
- `GET /api/reward/v1/contract` ตรวจ contract
- `GET /api/reward/v1/policy` อ่านกติกา preview (ไม่ปลดล็อก)
- `POST /api/reward/v1/results` รับผลและป้องกันซ้ำ
- `GET /api/reward/v1/admin/summary` สรุปเฉพาะเครื่องเซิร์ฟเวอร์

POST /api/reward/v1/results ส่ง JSON แบบนี้:
```json
{
  "schemaVersion": 1,
  "module": "games",
  "activityId": "memory-game-1",
  "attemptId": "26f5ad7a-64b3-4c6b-9642-c7847a8140f2",
  "score": 24,
  "maxScore": 30,
  "completed": true
}
```
`module` เป็น quiz/vocab/diary/games เท่านั้น, `attemptId` ต้อง UUID ใหม่ต่อการเล่นหนึ่งรอบ (retry ใช้เดิม), `activityId` ตัวพิมพ์เล็ก ASCII ใช้ a-z, 0-9, จุด, ขีด, underscore, colon, ยาวสูงสุด 64 ตัวอักษร. คะแนนเต็ม 1..10000 และ score 0..maxScore.

เว็บโมดูลควรโหลด `../reward/reward-client.js` แล้วใช้ `QuizWebReward.newAttemptId()` และ `QuizWebReward.submitResult(...)` เมื่อจบกิจกรรมหนึ่งครั้ง โดยไม่ hardcode เกณฑ์เวลาและไม่เรียก unlock API

## Admin กลาง (port 771)
กด `ตั้งค่า Reward (4 การ์ด)` ที่ `http://localhost:771/`
- เกณฑ์ตามโมดูลและ activityId (หรือ `*` เพื่อใช้ทั้งโมดูล)
- `raw`: คะแนนดิบโดยคะแนนเต็มต้องตรง
- `percent`: เปรียบเทียบอัตราคะแนนเป็นเปอร์เซ็นต์
- เปิด/ปิดเงื่อนไข, จำนวนเวลานาที 0..1440, สร้างหลายระดับรางวัล
- Policy: `C:\ProgramData\QuizWeb\Rewards\policy.json`
- `GET /api/reward/policy` (loopback only), `POST /api/reward/policy` (loopback + same-origin + `X-QuizWeb-Admin:1`)

## ขอบเขตสำคัญของ R2
**R2 เป็น policy preview / inbox only:** ทุกผลยัง `unverified` และ `grantedMinutes=0` แม้ policy จะตรงเกณฑ์. ค่า `potentialMinutes` เป็นเพียงค่าจำลองที่ได้จาก policy ห้ามนำไปปลดล็อกจริง
กติกาเริ่มต้นของ quiz ในหน้า Admin คือ 26/30 ได้ 60 นาที, 29/30 ได้ 120 นาที แต่ **GameLock Service เครื่องลูกยังใช้โค้ด scoring เดิม ไม่อ่าน Admin policy ใน R2**; ต้องทำ one-time trusted bridge ของ GameLock ก่อน Admin จึงจะควบคุมการปลดล็อก quiz จริงได้

รับคะแนนโดยตรงจากเบราว์เซอร์ไม่สามารถยืนยันว่าผู้เล่นทำกิจกรรมจริง ห้ามใช้คะแนนนี้ปลดเวลาเอง. รอ server-side verification และ client-session binding ก่อนเปิดการจ่ายจริง
ห้ามส่งชื่อเด็ก, ข้อมูลส่วนตัว หรือเนื้อหาบันทึกประจำวันลงผล Reward

## Build / deployment
ติดตั้งด้วย `patchreward.ps1` จาก R2; ใช้ .NET 8 framework-dependent **multi-file publish** ไม่ใช้ GenerateBundle/PublishSingleFile จึงลดปัญหา paging file. สำรองก่อนติดตั้งและ rollback ทั้ง QuizWeb 770 กับ Content Manager 771 เมื่อ probe ไม่ผ่าน
