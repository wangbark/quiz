# QuizWeb Reward Core v1 — สัญญาส่งผลคะแนนกลาง

**สถานะปัจจุบัน: บันทึกผลเท่านั้น (unverified) / ไม่มีการแจกเวลา / ไม่มีคูปอง**

## โครงสร้าง
- Backend: QuizWeb Service :770 เพิ่ม `QuizWebRewardCore.cs`, ติดตั้งด้วย `patchreward.ps1`
- Client adapter: `docs/reward/reward-client.js`, เปิดหน้าเว็บที่ให้บริการจาก QuizWeb :770
- พื้นที่ข้อมูล: `C:\ProgramData\QuizWeb\Rewards\inbox\<module>\<attemptId>.json`
- ไม่แก้ Windows GameLock Service (port 773), Android, port 771 หรือแบบทดสอบเดิม

## API
- `GET /api/reward/v1/health` สถานะ
- `GET /api/reward/v1/contract` รูปแบบข้อมูล
- `POST /api/reward/v1/results` เก็บผล (HTTP 202, unverified, grantedMinutes=0)
- `GET /api/reward/v1/admin/summary` จำนวนผลแยกโมดูล เฉพาะเครื่องเซิร์ฟเวอร์ (loopback)

### ส่งคะแนน
```json
{
  "schemaVersion":1,
  "module":"vocab",
  "activityId":"th-vocab-lesson-01",
  "attemptId":"26f5ad7a-64b3-4c6b-9642-c7847a8140f2",
  "score":24,
  "maxScore":30,
  "completed":true,
  "durationMs":120000
}
```

- `module`: `vocab`/`diary`/`games`
- `activityId`: lowercase ASCII letters, numbers, `._:-` ความยาวไม่เกิน 64 ตัวอักษร
- `attemptId`: UUID ใหม่สำหรับแต่ละครั้ง; ใช้ UUID เดิมหากต้อง retry
- `score` / `maxScore`: จำนวนเต็ม 0..10000, 1..10000, score ไม่เกิน maxScore
- `completed`: boolean
- `durationMs`: optional 0..86400000
- `clientSessionId`: optional UUID เพื่อเชื่อมผลการเล่นในอนาคต ไม่ใช่หลักฐานตัวตน

### ใช้ Adapter ในโมดูล
```html
<script src="../reward/reward-client.js"></script>
<script>
  const attemptId = QuizWebReward.newAttemptId(); // สร้างตอนเริ่มกิจกรรม
  async function finish(score,total) {
    const result = await QuizWebReward.submitResult({
      module:'vocab', activityId:'th-vocab-lesson-01', attemptId,
      score, maxScore:total, completed:true
    });
    console.log(result.status); // "unverified"; grantedMinutes=0
  }
</script>
```

## ข้อห้ามที่ต้องรักษา
- รับคะแนนจาก browser **ยังไม่พิสูจน์ว่าทำกิจกรรมจริง** ห้ามนำคะแนนนี้ไปปลดเวลาโดยตรง
- อย่าให้เว็บโมดูลเรียก GameLock unlock API หรือ API Admin
- ไม่ต้องทำคะแนนเป็นคูปอง; กติกาจ่ายเวลาจะวางในแชต GameLock หลักหลังพัฒนากิจกรรม
- ไม่ส่งข้อความบันทึกส่วนบุคคลหรือข้อมูลเด็กลง payload นี้
- หน้าเว็บเปิดจาก GitHub Pages ข้าม origin ยังไม่ส่งเข้า :770 ได้โดยตรง; ต้องเปิดโมดูลผ่าน QuizWeb :770 หรือพัฒนาช่องทางที่ตรวจสอบได้ในรอบถัดไป

## งานแชตแต่ละโมดูล
พัฒนาเฉพาะการวัดผลและส่งข้อมูลด้วย adapter; ห้ามเปลี่ยน GameLock, port 770 Service, 771 Admin, ระบบคะแนนแบบทดสอบ, PIN/คูปอง/เวลา
