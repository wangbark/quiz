/* QuizWeb Games / Word Survivor R9 - local-only P3 progressive vocabulary.
   The used Set in the game prevents repeating any prompt during one run. */
window.WordSurvivorWords = (() => {
  'use strict';
  const th = [
    ['แมว','สุนัข','นก','ปลา','ปู','ม้า','หมู','บ้าน','สวน','ฝน','ดาว','ป่า','รถ','เสือ','ไก่','ข้าว','ไข่','ดิน','น้ำ','ทะเล','ต้นไม้','ดอกไม้','หนังสือ','ดินสอ','ยางลบ','ขนม','กล้วย','ส้ม','มะม่วง','มะนาว','ห้อง','โต๊ะ','เก้าอี้','ขวด','ช้อน','จาน','แก้ว','ปากกา','พ่อ','แม่','น้อง','พี่','เพื่อน','ครู','นักเรียน','รองเท้า','เสื้อ','กระเป๋า','หมอน','ผ้าห่ม','ภูเขา','แม่น้ำ'],
    ['โรงเรียน','ครอบครัว','ห้องสมุด','ธรรมชาติ','สีม่วง','จักรยาน','พยาบาล','คุณหมอ','ชาวนา','ชาวสวน','นาฬิกา','กระต่าย','ผีเสื้อ','แมลงปอ','ดวงอาทิตย์','สายรุ้ง','สายลม','ขอบคุณ','ขอโทษ','ขยัน','ประหยัด','แบ่งปัน','ซื่อสัตย์','สุขภาพ','อากาศ','อาหาร','รอยยิ้ม','ความสุข','ความรัก','เพื่อนสนิท','สนามเด็กเล่น','การบ้าน','ตลาด','หมู่บ้าน','ท้องฟ้า','วันหยุด','ผักบุ้ง','ฟักทอง','แตงโม'],
    ['สิ่งแวดล้อม','ความรับผิดชอบ','ความสามัคคี','ความพยายาม','การประดิษฐ์','อาสาสมัคร','ความปลอดภัย','การเดินทาง','การศึกษา','ความคิดสร้างสรรค์','การช่วยเหลือ','ประสบการณ์','ห้องทดลอง','คณิตศาสตร์','วิทยาศาสตร์','ภาษาอังกฤษ','การอนุรักษ์','อาณาจักร','การเปลี่ยนแปลง','การสังเกต','ความอดทน','พลังงาน','ภูมิประเทศ','อารยธรรม']
  ];
  const en = [
    ['CAT','DOG','PIG','SUN','MOON','STAR','RED','BLUE','GREEN','HAT','BAG','CUP','PEN','MAP','BOX','BUS','CAR','TREE','BIRD','FISH','BOOK','MILK','RAIN','FROG','BALL','CAKE','RICE','EGG','COW','GOAT','FARM','HOME','ROOM','HAND','FOOT','WIND','NEST','SAND','PLAY','JUMP','READ','WALK','SING','DANCE','SMILE','HAPPY','APPLE','CHAIR','TABLE','PENCIL','PAPER','RIVER','WATER','BREAD','GRASS'],
    ['SCHOOL','FAMILY','FLOWER','GARDEN','FRIEND','ORANGE','BANANA','POTATO','MARKET','WINDOW','ANIMAL','NATURE','YELLOW','PURPLE','SUMMER','WINTER','SPRING','AUTUMN','TEACHER','STUDENT','MORNING','EVENING','LANTERN','LIBRARY','PRESENT','HOLIDAY','RAINBOW','FARMER','DOCTOR','DENTIST','PLANET','FOREST','ISLAND','GUITAR','ROCKET','CASTLE','SISTER','BROTHER','PARENT','FATHER','MOTHER','BOTTLE','PILLOW'],
    ['BUTTERFLY','WONDERFUL','ADVENTURE','IMPORTANT','FRIENDSHIP','BEAUTIFUL','DIFFERENT','DISCOVERY','CHOCOLATE','HOSPITAL','EXERCISE','TOMORROW','YESTERDAY','CAREFULLY','EXCELLENT','KNOWLEDGE','LANGUAGE','VEGETABLE','NOTEBOOK','SUNSHINE','BACKPACK','MOUNTAIN','ELEPHANT','SQUIRREL','DINOSAUR','UMBRELLA','TOGETHER','SUDDENLY']
  ];
  const enPhrases = [
    ['I LIKE CATS','ฉันชอบแมว'],['WE PLAY BALL','เราเล่นบอล'],['I CAN READ','ฉันอ่านได้'],['SHE IS HAPPY','เธอมีความสุข'],['HE HAS A DOG','เขามีสุนัข'],['THE SKY IS BLUE','ท้องฟ้าสีฟ้า'],['WE LOVE BOOKS','เรารักหนังสือ'],['I EAT RICE','ฉันกินข้าว'],['MY FRIEND IS KIND','เพื่อนฉันใจดี'],['THE SUN IS HOT','ดวงอาทิตย์ร้อน'],['I GO TO SCHOOL','ฉันไปโรงเรียน'],['THE FROG CAN JUMP','กบกระโดดได้'],['I SEE A RAINBOW','ฉันเห็นสายรุ้ง'],['MY MOTHER CAN COOK','แม่ของฉันทำอาหารได้'],['WE KEEP OUR ROOM CLEAN','เรารักษาห้องให้สะอาด'],['THE FLOWERS ARE PRETTY','ดอกไม้สวย'],['I LIKE TO DRAW PICTURES','ฉันชอบวาดรูป'],['OUR FAMILY EATS TOGETHER','ครอบครัวกินข้าวด้วยกัน'],['SHE SHARES HER PENCILS','เธอแบ่งดินสอ'],['WE HELP OUR TEACHER','เราช่วยคุณครู'],['THE LITTLE BIRD CAN FLY','นกตัวเล็กบินได้'],['I WASH MY HANDS EVERY DAY','ฉันล้างมือทุกวัน'],['THE GREEN TREE IS VERY TALL','ต้นไม้สีเขียวสูงมาก'],['I READ A STORY BEFORE BED','ฉันอ่านนิทานก่อนนอน'],['MY FRIENDS ARE PLAYING OUTSIDE','เพื่อนกำลังเล่นนอกบ้าน'],['WE LEARN SOMETHING NEW TODAY','วันนี้เราเรียนรู้สิ่งใหม่'],['PLEASE PUT THE BOOK ON THE TABLE','กรุณาวางหนังสือบนโต๊ะ'],['I ALWAYS HELP MY FRIENDS AT SCHOOL','ฉันช่วยเพื่อนที่โรงเรียนเสมอ'],['THE LITTLE CAT IS SLEEPING UNDER A TREE','แมวตัวเล็กนอนใต้ต้นไม้'],['WE TAKE CARE OF OUR BEAUTIFUL GARDEN','เราดูแลสวนที่สวยงาม'],['MY FAMILY WILL VISIT THE PARK TOMORROW','ครอบครัวจะไปสวนสาธารณะพรุ่งนี้'],['THE CHILDREN ARE READING IN THE LIBRARY','เด็ก ๆ อ่านหนังสือในห้องสมุด']
  ];
  const thPhrases = [
    ['ฉันรักแม่','แสดงความรัก'],['แมววิ่งเร็ว','สัตว์กำลังวิ่ง'],['นกบินบนฟ้า','นกกำลังบิน'],['เราชอบอ่าน','รักการอ่าน'],['วันนี้ฝนตก','สภาพอากาศ'],['ฉันมีเพื่อน','เพื่อนของเรา'],['แม่ทำอาหาร','ทำอาหาร'],['ฉันรักบ้าน','บ้านของฉัน'],['เด็กเล่นบอล','เล่นกีฬา'],['พ่อไปทำงาน','การทำงาน'],['ฉันไปโรงเรียน','ไปเรียนหนังสือ'],['เพื่อนแบ่งขนม','การแบ่งปัน'],['เราช่วยกันปลูกต้นไม้','ปลูกต้นไม้'],['คุณครูอ่านนิทาน','ครูเล่าเรื่อง'],['ฉันชอบวาดรูป','งานศิลปะ'],['วันนี้อากาศดีมาก','อากาศสดใส'],['กระต่ายกระโดดในสวน','สัตว์ในสวน'],['ฉันทำการบ้านเสร็จแล้ว','รับผิดชอบหน้าที่'],['เราทิ้งขยะลงถัง','รักษาความสะอาด'],['คุณยายยิ้มอย่างมีความสุข','รอยยิ้ม'],['ทุกคนช่วยกันดูแลโรงเรียน','ร่วมมือ'],['เด็กนักเรียนอ่านหนังสือในห้องสมุด','การอ่าน'],['พวกเราช่วยกันรักษาธรรมชาติ','ดูแลโลก'],['แม่ปลูกดอกไม้สีสวยหน้าบ้าน','สวนหน้าบ้าน'],['ฉันตั้งใจเรียนและช่วยเหลือเพื่อน','เป็นเพื่อนที่ดี'],['น้องชายของฉันชอบเล่นฟุตบอลกับเพื่อน','เล่นกีฬา'],['วันเสาร์ครอบครัวของเราไปเที่ยวสวนสัตว์','วันหยุด'],['ทุกเช้าฉันแปรงฟันแล้วกินอาหารเช้า','สุขภาพ'],['เราเรียนรู้เรื่องสัตว์และพืชในธรรมชาติ','วิทยาศาสตร์']
  ];
  const enSubjects=['MY FRIEND','THE TEACHER','OUR FAMILY','THE LITTLE CAT','THE HAPPY CHILD','THE BRAVE STUDENT','THE DOG','OUR CLASS','MY BROTHER','THE FARMER'];
  const enVerbs=['LIKES TO READ','HELPS TO CLEAN','WANTS TO LEARN','IS READY TO PLAY','TRIES TO DRAW','LOVES TO EXPLORE','IS LEARNING ABOUT','WILL REMEMBER','CARES ABOUT','IS THINKING ABOUT'];
  const enEnds=['AT SCHOOL','IN THE GARDEN','WITH GOOD FRIENDS','IN THE MORNING','ON A SUNNY DAY','BEFORE LUNCH','AFTER CLASS','AT HOME','NEAR THE RIVER','DURING THE HOLIDAY'];
  const thSubjects=['เพื่อนของฉัน','คุณครู','ครอบครัวของเรา','เด็กนักเรียน','น้องสาวของฉัน','คุณพ่อ','คุณแม่','เด็กทุกคน','ชาวสวน','คุณยาย'];
  const thVerbs=['ตั้งใจเรียน','ชอบอ่านหนังสือ','ช่วยกันทำงาน','กำลังปลูกต้นไม้','ออกกำลังกาย','ช่วยดูแลสัตว์','เรียนรู้เรื่องธรรมชาติ','วาดภาพสวยงาม','แบ่งปันขนม','ช่วยเหลือเพื่อน'];
  const thEnds=['ที่โรงเรียน','ในวันหยุด','อย่างมีความสุข','ทุกวัน','กับเพื่อนสนิท','ที่บ้าน','ในสวน','ตอนเช้า','อย่างตั้งใจ','หลังเลิกเรียน'];
  const runCounters=new WeakMap();
  const wrapWords=lang=> (lang==='th'?th:en).map((tier,i)=>tier.map(t=>({text:t,meaning:lang==='th'?'คำศัพท์ภาษาไทย':'คำศัพท์ภาษาอังกฤษ',lang,tier:i})));
  const catalog={th:wrapWords('th'),en:wrapWords('en')};
  function generated(lang,n){
    const subjects=lang==='th'?thSubjects:enSubjects,verbs=lang==='th'?thVerbs:enVerbs,ends=lang==='th'?thEnds:enEnds;
    const a=subjects[n%10],b=verbs[Math.floor(n/10)%10],c=ends[Math.floor(n/100)%10];
    const suffix=Math.floor(n/1000)+1;
    return {lang,text:lang==='th'?`${a}${b}${c} ครั้งที่ ${suffix}`:`${a} ${b} ${c} ON DAY ${suffix}`,
      meaning:lang==='th'?'ฝึกอ่านประโยคยาว':'ประโยคฝึกอ่านภาษาอังกฤษ',tier:4};
  }
  function pick(lang,level,phraseStart,used){
    const tier = phraseStart?Math.max(3,level<8?3:level<17?3:4):level<4?0:level<8?1:level<12?2:level<18?3:4;
    const possibilities=[];
    if(tier<=2){
      const categories=tier===0?[0]:tier===1?[1,0]:[2,1];
      for(const t of categories)for(const e of catalog[lang][t])if(!used.has(e.text))possibilities.push(e);
    }else{
      for(const row of (lang==='th'?thPhrases:enPhrases)){
        const len=Array.from(row[0]).length;
        if((tier===3&&len<=35)||(tier===4&&len>=24)){
          if(!used.has(row[0]))possibilities.push({text:row[0],meaning:row[1],lang,tier});
        }
      }
    }
    if(possibilities.length){const chosen=possibilities[Math.floor(Math.random()*possibilities.length)];used.add(chosen.text);return chosen;}
    // Exhausted finite tier? Grow vocabulary (no recycling) and eventually use a productive sentence pattern.
    if(tier<3){for(const group of catalog[lang])for(const e of group)if(!used.has(e.text)){used.add(e.text);return e;}}
    let counter=runCounters.get(used);if(!counter){counter={th:0,en:0};runCounters.set(used,counter);}
    let candidate;do{candidate=generated(lang,counter[lang]++);}while(used.has(candidate.text));
    used.add(candidate.text);return candidate;
  }
  return {pick};
})();
