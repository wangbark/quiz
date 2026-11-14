/* QuizWeb Games R22 — REPAIRED Thai speech syntax and short Thai meanings.
 * Prefer Thai voices (Google Thai if exposed), otherwise ALWAYS use the
 * browser's default speechSynthesis voice. No Premwadee requirement.
 * Every game uses this shared module; no external API, keys or GameLock.
 */
window.QuizWebGamesSpeech = (() => {
  'use strict';
  const readings = {
    A:'อะ',HELLO:'เฮลโล',WORLD:'เวิลด์',COLUMNS:'คอลัมน์',ABOUT:'อะเบาต์',ADVENTURE:'แอดเวนเจอร์',AFTER:'อาฟเตอร์',ALWAYS:'ออลเวย์ส',ANIMAL:'แอนิมอล',ANT:'แอนต์',APPLE:'แอปเปิล',ARE:'อาร์',AT:'แอท',AUTUMN:'ออทัม',BACKPACK:'แบ็กแพ็ก',BAG:'แบ็ก',BALL:'บอล',BANANA:'บานานา',BEAUTIFUL:'บิวทิฟูล',BED:'เบด',BEFORE:'บีฟอร์',BIRD:'เบิร์ด',BLUE:'บลู',BOOK:'บุ๊ก',BOOKS:'บุ๊กส์',BOTTLE:'บอตเทิล',BOX:'บ็อกซ์',BRAVE:'เบรฟ',BREAD:'เบรด',BROTHER:'บราเธอร์',BUS:'บัส',BUTTERFLY:'บัตเตอร์ฟลาย',CAKE:'เค้ก',CAN:'แคน',CAR:'คาร์',CARE:'แคร์',CAREFULLY:'แคร์ฟูลลี',CARES:'แคร์ส',CASTLE:'แคสเซิล',CAT:'แคต',CATS:'แคตส์',CHAIR:'แชร์',CHILD:'ไชลด์',CHILDREN:'ชิลเดรน',CHOCOLATE:'ช็อกโกแลต',CLASS:'คลาส',CLEAN:'คลีน',CLOUD:'คลาวด์',COOK:'คุก',COW:'คาว',CUP:'คัพ',DANCE:'แดนซ์',DAY:'เดย์',DENTIST:'เดนทิสต์',DIFFERENT:'ดิฟเฟอเรนต์',DINOSAUR:'ไดโนซอร์',DISCOVERY:'ดิสคัฟเวอรี',DOCTOR:'ดอกเตอร์',DOG:'ด็อก',DRAW:'ดรอ',DURING:'ดิวริง',EAT:'อีต',EATS:'อีตส์',EGG:'เอ็ก',ELEPHANT:'เอลละเฟินต์',EVENING:'อีฟนิง',EVERY:'เอฟวรี',EXCELLENT:'เอ็กเซลเลนต์',EXERCISE:'เอ็กเซอร์ไซซ์',EXPLORE:'เอ็กซ์พลอร์',FAMILY:'แฟมิลี',FARM:'ฟาร์ม',FARMER:'ฟาร์เมอร์',FATHER:'ฟาเธอร์',FISH:'ฟิช',FLOWER:'ฟลาวเวอร์',FLOWERS:'ฟลาวเวอร์ส',FLY:'ฟลาย',FOOT:'ฟุต',FOREST:'ฟอเรสต์',FRIEND:'เฟรนด์',FRIENDS:'เฟรนด์ส',FRIENDSHIP:'เฟรนด์ชิป',FROG:'ฟร็อก',GARDEN:'การ์เดน',GO:'โก',GOAT:'โกต',GOOD:'กูด',GRASS:'กราส',GREAT:'เกรต',GREEN:'กรีน',GUITAR:'กีตาร์',HAND:'แฮนด์',HANDS:'แฮนด์ส',HAPPY:'แฮปปี',HAS:'แฮซ',HAT:'แฮต',HE:'ฮี',HELP:'เฮลป์',HELPS:'เฮลป์ส',HER:'เฮอร์',HOLIDAY:'ฮอลิเดย์',HOME:'โฮม',HORSE:'ฮอร์ส',HOSPITAL:'ฮอสพิทัล',HOT:'ฮอต',HOUSE:'เฮาส์',IMPORTANT:'อิมพอร์แทนต์',IN:'อิน',INPUT:'อินพุต',IS:'อิส',ISLAND:'ไอแลนด์',I:'ไอ',JUMP:'จัมป์',KEEP:'คีป',KIND:'ไคนด์',KNOWLEDGE:'นอลเลจ',LANGUAGE:'แลงกวิจ',LANTERN:'แลนเทิร์น',LEARN:'เลิร์น',LEARNING:'เลิร์นนิง',LEMON:'เลมอน',LIBRARY:'ไลบรารี',LIKE:'ไลก์',LIKES:'ไลก์ส',LION:'ไลออน',LITTLE:'ลิตเทิล',LOVE:'เลิฟ',LOVES:'เลิฟส์',LUNCH:'ลันช์',MAP:'แมป',MARKET:'มาร์เก็ต',MILK:'มิลก์',MISS:'มิส',MOON:'มูน',MORNING:'มอร์นิง',MOTHER:'มาเธอร์',MOUNTAIN:'เมาน์เทน',MUSIC:'มิวสิก',MY:'มาย',NATURE:'เนเชอร์',NEAR:'เนียร์',NEST:'เนสต์',NEW:'นิว',NOTEBOOK:'โน้ตบุ๊ก',OF:'ออฟ',ON:'ออน',ORANGE:'ออเรนจ์',OUR:'อาวเออร์',OUTSIDE:'เอาต์ไซด์',PAPER:'เพเพอร์',PARENT:'แพเรนต์',PARK:'พาร์ก',PEN:'เพน',PENCIL:'เพนซิล',PENCILS:'เพนซิลส์',PERFECT:'เพอร์เฟกต์',PICTURES:'พิกเชอร์ส',PIG:'พิก',PILLOW:'พิลโลว์',PLANET:'แพลเน็ต',PLANT:'แพลนต์',PLAY:'เพลย์',PLAYING:'เพลย์อิง',PLEASE:'พลีซ',POTATO:'โพเทโท',PRESENT:'เพรเซนต์',PRETTY:'พริตตี',PURPLE:'เพอร์เพิล',PUT:'พุต',RAIN:'เรน',RAINBOW:'เรนโบว์',READ:'รีด',READING:'รีดดิง',READY:'เรดี',RED:'เรด',REMEMBER:'รีเมมเบอร์',RICE:'ไรซ์',RIVER:'ริเวอร์',ROCKET:'ร็อกเก็ต',ROOM:'รูม',SAND:'แซนด์',SCHOOL:'สกูล',SEE:'ซี',SELECT:'ซีเล็กต์',SHARES:'แชร์ส',SHE:'ชี',SHEEP:'ชีป',SING:'ซิง',SISTER:'ซิสเตอร์',SKY:'สกาย',SLEEPING:'สลีปปิง',SMILE:'สไมล์',SOMETHING:'ซัมธิง',SPRING:'สปริง',SQUIRREL:'สเควอเรล',STAR:'สตาร์',STORY:'สตอรี',STUDENT:'สติวเดนต์',SUDDENLY:'ซัดเดนลี',SUMMER:'ซัมเมอร์',SUN:'ซัน',SUNNY:'ซันนี',SUNSHINE:'ซันไชน์',TABLE:'เทเบิล',TAKE:'เทก',TALL:'ทอล',TEACHER:'ทีเชอร์',TEXTAREA:'เท็กซ์แอเรีย',THE:'เดอะ',THINKING:'ธิงกิง',TIGER:'ไทเกอร์',TO:'ทู',TODAY:'ทูเดย์',TOGETHER:'ทูเกเธอร์',TOMORROW:'ทูมอร์โรว์',TOTAL:'โททัล',TRAIN:'เทรน',TREE:'ทรี',TRIES:'ทรายส์',UMBRELLA:'อัมเบรลลา',UNDER:'อันเดอร์',US:'อัส',VEGETABLE:'เวจทะเบิล',VERY:'เวรี',VISIT:'วิซิต',WALK:'วอล์ก',WANTS:'วอนต์ส',WASH:'วอช',WATER:'วอเทอร์',WE:'วี',WILL:'วิล',WIND:'วินด์',WINDOW:'วินโดว์',WINTER:'วินเทอร์',WITH:'วิธ',WONDERFUL:'วันเดอร์ฟูล',WORDS:'เวิร์ดส์',YELLOW:'เยลโลว์',YESTERDAY:'เยสเตอร์เดย์',YOU:'ยู',YOUR:'ยัวร์',THERE:'แดร์',HERE:'เฮียร์',THIS:'ดิส',THAT:'แดต',THEY:'เดย์',IT:'อิต',AHEAD:'อะเฮด',BE:'บี',AND:'แอนด์',FOR:'ฟอร์',FROM:'ฟรอม',AN:'แอน',DO:'ดู',NOT:'นอต',BIG:'บิก',SMALL:'สมอล',FAST:'ฟาสต์',SLOW:'สโลว์'
  };
  const charRead = {A:'เอ',B:'บี',C:'ซี',D:'ดี',E:'อี',F:'เอฟ',G:'จี',H:'เอช',I:'ไอ',J:'เจ',K:'เค',L:'แอล',M:'เอ็ม',N:'เอ็น',O:'โอ',P:'พี',Q:'คิว',R:'อาร์',S:'เอส',T:'ที',U:'ยู',V:'วี',W:'ดับเบิลยู',X:'เอ็กซ์',Y:'วาย',Z:'แซด'};
  const chunks = [
    ['TION','ชัน'],['SION','ชัน'],['TCH','ช'],['SH','ช'],['CH','ช'],['TH','ธ'],['PH','ฟ'],['WH','ว'],['CK','ก'],['QU','คว'],['NG','ง'],['EE','อี'],['OO','อู'],['EA','อี'],['OU','เอา'],['OW','โอ'],['AI','เอ'],['AY','เอ'],['OA','โอ'],['OI','ออย'],['AR','อาร์'],['ER','เออร์'],['OR','ออร์'],['IR','เออร์'],['UR','เออร์'],['AU','ออ'],['AW','ออ'],['IGHT','ไอต์'],['IGH','ไอ'],['IGH','ไอ']
  ];
  const letters={A:'แอ',B:'บ',C:'ค',D:'ด',E:'เอ',F:'ฟ',G:'ก',H:'ฮ',I:'อิ',J:'จ',K:'ค',L:'ล',M:'ม',N:'น',O:'ออ',P:'พ',Q:'ค',R:'ร',S:'ส',T:'ต',U:'อุ',V:'ว',W:'ว',X:'กซ์',Y:'ย',Z:'ซ'};
  let seq=0,timeout=0,active=null;
  const noticeId='quizweb-games-speech-warning';
  const engine=()=>typeof window!=='undefined'&&window.speechSynthesis;
  function availableVoices(){
    try{return [...(engine()?.getVoices?.()||[])];}catch(_){return [];}
  }
  function thaiVoice(){
    const th=availableVoices().filter(v=>/^th(?:-|$)/i.test(String(v.lang||'')));
    return th.find(v=>/google/i.test(v.name||''))||
      th.find(v=>/ไทย|thai/i.test(v.name||''))||
      th.find(v=>v.default)||th[0]||null;
  }
  function fallbackWord(word){
    let x=word.toUpperCase().replace(/[^A-Z]/g,'');
    if(!x)return '';
    let out='';while(x){let matched=false;
      for(const [k,v] of chunks){if(x.startsWith(k)){out+=v;x=x.slice(k.length);matched=true;break;}}
      if(!matched){out+=letters[x[0]]||'';x=x.slice(1);}
    }
    return out||Array.from(word.toUpperCase()).map(c=>charRead[c]||'').join(' ');
  }
  function thaiReading(text){
    const source=String(text||'').normalize('NFC').trim();
    return source.replace(/[A-Za-z]+/g,token=>readings[token.toUpperCase()]||fallbackWord(token))
      .replace(/[.!?]+/g,' เว้นวรรค ')
      .replace(/\s+/g,' ').trim();
  }
  function warn(message){
    if(typeof document==='undefined')return;
    let el=document.getElementById(noticeId);
    if(!el){el=document.createElement('div');el.id=noticeId;el.setAttribute('role','status');
      el.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;background:#243a38;color:#fff;border-radius:12px;padding:10px 16px;font:600 14px Sarabun,system-ui,sans-serif;box-shadow:0 4px 18px #0002;max-width:min(90vw,500px);text-align:center;pointer-events:none;';
      (document.body||document.documentElement).appendChild(el);}
    el.textContent=message;
    clearTimeout(el._hideTimer);el._hideTimer=setTimeout(()=>el.remove(),4600);
  }
  function cancel(){
    seq++;if(timeout)clearTimeout(timeout);timeout=0;active=null;
    try{engine()?.cancel();}catch(_){}
  }
  // A word is pronounced in Thai transcription followed immediately by its Thai meaning.
  // "FISH" + "ปลา" -> "ฟิช ปลา". No intro words or labels.
  // Third argument is optional. Legacy say(text, onDone) remains supported.
  function say(text,onDone=()=>{},meaning=''){
    cancel();
    const ticket=seq;
    const synth=engine();
    const original=String(text??'').trim();
    const translation=String(meaning??'').trim();
    const pronounced=/[A-Za-z]/.test(original)?thaiReading(original):original;
    const spoken=(translation&&/[A-Za-z]/.test(original)?pronounced+' '+translation:pronounced).trim();
    let completed=false,tryIndex=-1,utterance=null,watchdog=0;
    function finish(){
      if(completed||ticket!==seq)return;
      completed=true;
      clearTimeout(watchdog);watchdog=0;
      clearTimeout(timeout);timeout=0;active=null;
      if(typeof onDone==='function')try{onDone();}catch(err){console.error('QuizWeb TTS callback failed',err);}
    }
    if(!spoken){timeout=setTimeout(finish,25);return;}
    if(!synth||typeof SpeechSynthesisUtterance==='undefined'){
      warn('เบราว์เซอร์ไม่รองรับเสียงพูด · กดฟังคำใน Chrome หรือ Edge');
      timeout=setTimeout(finish,150);return;
    }
    const voices=availableVoices();
    const preferred=thaiVoice();
    const systemDefault=voices.find(v=>v.default&&!(/^th(?:-|$)/i.test(v.lang||'')))||null;
    const candidates=[];
    if(preferred)candidates.push({voice:preferred,label:'Thai voice'});
    candidates.push({voice:null,label:'Browser default Thai'});
    if(systemDefault)candidates.push({voice:systemDefault,label:'System default voice'});
    function tryNext(){
      if(completed||ticket!==seq)return;
      clearTimeout(watchdog);watchdog=0;
      tryIndex++;
      if(tryIndex>=candidates.length){
        warn('เสียงอ่านยังไม่ทำงาน · แตะปุ่ม 🔊 ฟังคำอีกครั้ง และตรวจเสียงของเบราว์เซอร์');
        finish();return;
      }
      try{
        // Browser engines sometimes remain paused after a prior cancellation.
        synth.cancel();
        if(synth.paused&&typeof synth.resume==='function')synth.resume();
        const current=candidates[tryIndex];
        const u=new SpeechSynthesisUtterance(spoken);
        utterance=u;active=u;
        if(current.voice)u.voice=current.voice;
        u.lang='th-TH';
        u.rate=.87;u.pitch=1;u.volume=1;
        let started=false,startAt=0;
        u.onstart=()=>{
          if(ticket!==seq||completed||utterance!==u)return;
          started=true;startAt=Date.now();
          clearTimeout(watchdog);
          // Guard against a missing onend without blocking gameplay indefinitely.
          watchdog=setTimeout(finish,Math.min(16000,5000+spoken.length*350));
        };
        u.onend=()=>{
          if(ticket!==seq||completed||utterance!==u)return;
          // A zero-length 'speech' on a missing engine is not a successful read.
          if((!started||Date.now()-startAt<120)&&tryIndex<candidates.length-1){tryNext();return;}
          finish();
        };
        u.onerror=()=>{
          if(ticket!==seq||completed||utterance!==u)return;
          tryNext();
        };
        synth.speak(u);
        // On some Chromium/WebView builds neither onstart nor onerror fires.
        watchdog=setTimeout(()=>{if(!started&&ticket===seq&&!completed)tryNext();},2800);
      }catch(err){tryNext();}
    }
    tryNext();
  }
  return {say,cancel,thaiReading,hasThaiVoice:()=>!!thaiVoice(),getPreferredVoice:thaiVoice};
})();
