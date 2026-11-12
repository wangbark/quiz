# เริ่มแชตใหม่ — เว็บคำศัพท์ QuizWeb

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
พัฒนาเว็บ **คำศัพท์** หนึ่งเว็บที่รวม **ภาษาไทยและภาษาอังกฤษ** ผ่านเมนูสลับภาษา ภายใน docs/vocab/ เท่านั้น
ตรวจไฟล์ docs/vocab/index.html ปัจจุบันก่อนแก้ ให้แก้ต่อจากของเดิม ไม่สร้างใหม่ทับโดยไม่จำเป็น
ให้ทำการ์ดคำศัพท์ ความหมาย ตัวอย่างประโยค หมวดหมู่ และแบบฝึกได้ตามที่ผู้ใช้สั่งในแชตนี้เป็นรายขั้น
อย่าเชื่อมคะแนนเข้า GameLock หรือเปลี่ยน flow แบบทดสอบเดิมโดยพลการ
ผลลัพธ์แต่ละรอบ: ไฟล์ patchvocab.ps1 ฉบับเต็ม พร้อมไฟล์ที่เปลี่ยน และวิธีรัน powershell -ExecutionPolicy Bypass -File C:\QuizWeb\patchvocab.ps1

## หลังบ้าน Content Manager (เพิ่มเติม)
หลังบ้านกลางอยู่ที่ http://localhost:771/ ผ่าน QuizWebContentManagerService (แยกจาก QuizWeb port 770) ไม่ใช่ docs/lock.html
โมดูลนี้ต้องมีส่วนจัดการคำศัพท์ไทย/อังกฤษในหลังบ้านกลาง (เพิ่ม/แก้/ลบคำศัพท์และหมวดหมู่, นำเข้า/ส่งออก, สถานะเผยแพร่) โดยคงแบบทดสอบเดิม
ห้ามเปลี่ยน route/compile/service เดิมด้วยการเดา; ก่อนเชื่อมให้ตรวจ C:\ProgramData\QuizWeb\ContentManager\QuizWebContentManagerService.cs เวอร์ชันใช้งานจริง และสำรอง
การพัฒนาในแชตนี้จำกัดการจัดการฝั่งโมดูล vocab เท่านั้น; เมนูรวม/สิทธิ์/การเปิด route ที่ port 771 ให้แชต GameLock หลักรับผิดชอบ
คำศัพท์ไทยและอังกฤษอยู่ในโมดูล vocab เดียวกัน

### API หลังบ้านโมดูล (หลังติดตั้ง patchadmin.ps1)
- GET `http://127.0.0.1:771/api/modules/vocab` => `{ok:true,module:"vocab",data:{version:1,items:[...]}}` (รันได้บนเครื่อง Content Manager เท่านั้น)
- POST route เดียวกันส่ง JSON `{version:1,items:[...]}`, ต้องมี header `X-QuizWeb-Admin: 1` และ same-origin จาก localhost:771
- รายการมี `id,lang(th|en),word,reading,meaning,example,category,enabled`; เก็บใน `C:\ProgramData\QuizWeb\ContentManager\modules\vocab.json`
- ฝั่งเว็บคำศัพท์ (port 770 / GitHub Pages) ยังไม่ได้เชื่อม data จาก localhost:771 โดยอัตโนมัติ ห้ามเรียก API loopback จากเครื่องผู้เรียน ต้องวางเส้นทางเผยแพร่ข้อมูลสาธารณะอย่างปลอดภัยก่อน

## เชื่อม Reward Core รุ่นกลาง (หลังติดตั้ง patchreward.ps1)

ให้ทำเฉพาะการส่งผลกิจกรรมคำศัพท์เข้า Reward Core v1 ของ QuizWeb port 770 โดยอ่าน `docs/reward/REWARD_CONTRACT.md` และใช้ `../reward/reward-client.js`.
หลังแบบฝึกหัดจบ ส่ง `module:"vocab"`, `activityId`, `attemptId` UUID เดียวตลอดรอบ, `score`, `maxScore`, `completed` ผ่าน `QuizWebReward.submitResult(...)`.
ห้ามตั้งเกณฑ์ชั่วโมง, ห้ามแจกเวลา/คูปอง, ห้ามแก้ GameLock Service/QuizWeb Service/port 771; ค่าที่ส่งเป็น unverified และยังไม่ปลดล็อกจริง. ถ้าหน้าเว็บรันจาก GitHub Pages ต้องแจ้งเรื่อง origin ก่อนเชื่อม อย่าเปิด CORS กว้างเอง.

## Reward Core R2: เกณฑ์อยู่ที่ Admin และใช้ร่วมทั้ง 4 การ์ด
ให้พัฒนากิจกรรมในโมดูลนี้โดยส่งเฉพาะ `module`, `activityId`, `attemptId`, `score`, `maxScore`, `completed` ผ่าน `../reward/reward-client.js` ตาม `docs/reward/REWARD_CONTRACT.md` รุ่น R2.
เกณฑ์คะแนน/ชั่วโมง เปลี่ยนในหลังบ้าน `http://localhost:771/` เท่านั้น **ห้าม hardcode เกณฑ์นาทีไว้ในเว็บ** และห้ามแก้ GameLock, QuizWeb Service หรือ API กลาง.
Admin ตั้งคะแนนแบบ raw/percent และเกณฑ์ราย activityId ได้โดยไม่ต้องแก้หน้าเว็บอีก ถ้าใช้ activityId เดิม.
R2 ยังเป็น `unverified` / `grantedMinutes=0` จนกว่าจะตรวจสอบผลฝั่ง server และเชื่อม GameLock Service เครื่องลูกในแชตหลัก.

