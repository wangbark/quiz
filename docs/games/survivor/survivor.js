/* QuizWeb Games / Word Survivor R17 — genuine 62% camera zoom and time-based stabilized follow.
   No requests to GameLock, admin API, rewards or other modules. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('arena'), ctx = canvas.getContext('2d');
  // R15 draws the same D2-like oblique 2.5D scene on every browser with a wider calmer camera.
  // This intentionally supersedes the visually flat legacy WebGL renderer.
  const art=window.WordSurvivorSoftArt;
  const renderer3d=null;
  const stage = $('stage');
  stage.dataset.renderer='isometric-canvas-r16-zoom062';
  const WORLD = { w: 24000, h: 24000 }; // R15 uses compact world coordinates to reduce precision jitter and camera shimmer.
  // The game remains effectively endless for players, but rendering stays numerically stable.
  const VIEW = { a:.72, b:.39, c:-.72, d:.39 };
  // R16: true uniform WORLD zoom. Unlike changing VIEW coefficients, this
  // scales the upright characters, scenery, items and projectiles TOGETHER.
  const CAMERA_ZOOM = .62;
  const groundMatrix = () => ctx.transform(VIEW.a,VIEW.b,VIEW.c,VIEW.d,0,0);
  const upright = () => {
    const det=VIEW.a*VIEW.d-VIEW.b*VIEW.c;
    ctx.transform(VIEW.d/det,-VIEW.b/det,-VIEW.c/det,VIEW.a/det,0,0);
  };
  // World positions remain unchanged; only their presentation is transformed.
  function visibleWorldBounds(margin=300){
    // Screen corners are inverted through BOTH the isometric view and real zoom.
    const det=VIEW.a*VIEW.d-VIEW.b*VIEW.c;
    const xs=[-cw/2,cw/2],ys=[-ch/2,ch/2];
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(const xx of xs)for(const yy of ys){
      const sx=xx/CAMERA_ZOOM, sy=yy/CAMERA_ZOOM;
      const wx=camera.x+(VIEW.d*sx-VIEW.c*sy)/det;
      const wy=camera.y+(-VIEW.b*sx+VIEW.a*sy)/det;
      minX=Math.min(minX,wx);maxX=Math.max(maxX,wx);
      minY=Math.min(minY,wy);maxY=Math.max(maxY,wy);
    }
    return {minX:minX-margin,maxX:maxX+margin,minY:minY-margin,maxY:maxY+margin};
  }
  const HEROES = {
    warrior: { title:'นักดาบ', icon:'🛡️', weapon:'ดาบกวาด', emoji:'⚔️', role:'ระยะใกล้ ถึก และฟันเป็นวงกว้าง', color:'#77efd2', hp:162, speed:214, damage:31, cooldown:.72, range:126 },
    archer:  { title:'นักธนู', icon:'🏹', weapon:'ธนูทะลุ', emoji:'🏹', role:'ยิงไกล รัวไว และกระจายลูกศร', color:'#ffce7d', hp:102, speed:272, damage:18, cooldown:.43, range:520 },
    mage:    { title:'นักเวท', icon:'🪄', weapon:'ลูกแก้วเวท', emoji:'✨', role:'เวทระเบิดเป็นวงและลูกโซ่สายฟ้า', color:'#c7aaff', hp:96, speed:224, damage:25, cooldown:.64, range:410 }
  };
  const WORDS = {
    th: [ ['แมว','สัตว์เลี้ยง'],['ปลา','สัตว์ในน้ำ'],['บ้าน','ที่อยู่อาศัย'],['ต้นไม้','พืช'],['ดอกไม้','พืชมีดอก'],['นก','สัตว์มีปีก'],['ฝน','น้ำจากฟ้า'],['โรงเรียน','สถานที่เรียน'],['เพื่อน','คนที่เราสนิท'],['ส้ม','ผลไม้'],['รถไฟ','ยานพาหนะ'],['หนังสือ','ใช้สำหรับอ่าน'],['ดวงดาว','อยู่บนท้องฟ้า'],['กระต่าย','สัตว์หูยาว'],['คุณครู','ผู้สอน'],['ดินสอ','ใช้เขียน'],['สีฟ้า','สีของท้องฟ้า'] ],
    en: [ ['CAT','แมว'],['DOG','สุนัข'],['TREE','ต้นไม้'],['BOOK','หนังสือ'],['APPLE','แอปเปิล'],['WATER','น้ำ'],['SCHOOL','โรงเรียน'],['HAPPY','มีความสุข'],['FRIEND','เพื่อน'],['HOUSE','บ้าน'],['BIRD','นก'],['RIVER','แม่น้ำ'],['GREEN','สีเขียว'],['FAMILY','ครอบครัว'],['STAR','ดาว'],['PENCIL','ดินสอ'],['FLOWER','ดอกไม้'] ]
  };
  const PHRASES = {
    th: [ ['ฉันรักแม่','แสดงความรัก'],['แมววิ่งเร็ว','สัตว์กำลังวิ่ง'],['นกบินบนฟ้า','นกกำลังบิน'],['เราชอบอ่าน','รักการอ่าน'],['วันนี้ฝนตก','สภาพอากาศ'],['ฉันมีเพื่อน','เพื่อนของเรา'],['แม่ทำอาหาร','ทำอาหาร'],['ฉันรักบ้าน','บ้านของฉัน'],['เด็กเล่นบอล','เล่นกีฬา'],['พ่อไปทำงาน','การทำงาน'] ],
    en: [ ['I LOVE CATS','ฉันรักแมว'],['WE PLAY GAMES','เราเล่นเกม'],['THE SUN IS HOT','ดวงอาทิตย์ร้อน'],['I READ BOOKS','ฉันอ่านหนังสือ'],['I LIKE APPLES','ฉันชอบแอปเปิล'],['MY DOG IS BIG','สุนัขฉันตัวใหญ่'],['SHE IS HAPPY','เธอมีความสุข'],['IT IS A BIRD','มันคือนก'],['I GO TO SCHOOL','ฉันไปโรงเรียน'] ]
  };
  const UPGRADE_POOL = [
    { id:'speed',icon:'👟',title:'ฝีเท้าไว',desc:'เดินเร็วขึ้น 13%',apply:s=>{s.stats.speed*=1.13;} },
    { id:'hp',icon:'❤️',title:'เพิ่มหัวใจ',desc:'HP สูงสุด +30 และฟื้นฟู',apply:s=>{s.stats.maxHp+=30;s.player.hp=Math.min(s.stats.maxHp,s.player.hp+55);} },
    { id:'magnet',icon:'🧲',title:'ดูดอักษร',desc:'เก็บอักษรจากระยะไกลขึ้น',apply:s=>{s.stats.magnet+=54;} },
    { id:'regen',icon:'🍀',title:'ฟื้นพลัง',desc:'ฟื้น 2 HP ต่อวินาที',apply:s=>{s.stats.regen+=2;} },
    { id:'luck',icon:'💎',title:'โชคอักษร',desc:'เพิ่มโอกาสดรอปตัวอักษร 5%',apply:s=>{s.stats.luck+=.05;} },
    { id:'armor',icon:'🛡️',title:'เกราะแข็ง',desc:'ลดความเสียหายที่ได้รับ',apply:s=>{s.stats.armor+=2;} },
    { id:'swordPower',hero:'warrior',icon:'💥',title:'คมดาบหนัก',desc:'พลังโจมตีระยะใกล้เพิ่ม 24%',apply:s=>{s.stats.damage*=1.24;} },
    { id:'cleave',hero:'warrior',icon:'🌀',title:'ฟันวงกว้าง',desc:'ดาบกวาดกว้างขึ้นและแรงขึ้น',apply:s=>{s.stats.cleave+=.14;s.stats.damage*=1.06;} },
    { id:'guard',hero:'warrior',icon:'🧱',title:'ยืนชนได้',desc:'ลดดาเมจเพิ่มและกระแทกมอนรอบตัว',apply:s=>{s.stats.guard+=.10;s.stats.armor+=1;} },
    { id:'orbit',hero:'warrior',icon:'🛞',title:'โล่หมุน',desc:'เพิ่มโล่หมุนรอบตัว 1 อัน',apply:s=>{s.stats.orbit++;} },
    { id:'battleCry',hero:'warrior',icon:'🔥',title:'จังหวะนักสู้',desc:'ฟันเร็วขึ้น 14%',apply:s=>{s.stats.cooldown=Math.max(.18,s.stats.cooldown*.86);} },
    { id:'archerShot',hero:'archer',icon:'🎯',title:'ธนูคม',desc:'ลูกศรแรงขึ้น 18%',apply:s=>{s.stats.damage*=1.18;} },
    { id:'multishot',hero:'archer',icon:'🏹',title:'ยิงเพิ่ม',desc:'ยิงเพิ่ม 1 ลูก',apply:s=>{s.stats.multishot++;} },
    { id:'pierce',hero:'archer',icon:'➡️',title:'ยิงทะลุ',desc:'ลูกศรทะลุศัตรูเพิ่ม 1 ตัว',apply:s=>{s.stats.pierce++;} },
    { id:'volley',hero:'archer',icon:'🌧️',title:'ฝนลูกศร',desc:'เพิ่มจำนวนลูกศรเป็นชุดยิง',apply:s=>{s.stats.volley++;} },
    { id:'focus',hero:'archer',icon:'🎯',title:'ยิงแม่น',desc:'เพิ่มคริติคอลและยิงเร็วขึ้น',apply:s=>{s.stats.crit+=.08;s.stats.cooldown=Math.max(.16,s.stats.cooldown*.92);} },
    { id:'magePower',hero:'mage',icon:'💫',title:'เวทแรงขึ้น',desc:'เวทแรงขึ้น 18%',apply:s=>{s.stats.damage*=1.18;} },
    { id:'splash',hero:'mage',icon:'💥',title:'ระเบิดเวท',desc:'วงระเบิดของลูกแก้วกว้างขึ้น',apply:s=>{s.stats.splash+=16;} },
    { id:'chain',hero:'mage',icon:'⚡',title:'เวทลูกโซ่',desc:'กระโดดไปศัตรูอื่นเพิ่ม 1 ตัว',apply:s=>{s.stats.chain++;} },
    { id:'lightning',hero:'mage',icon:'🌩️',title:'สายฟ้าเสริม',desc:'ปล่อยสายฟ้าอัตโนมัติทุก 4 วินาที',apply:s=>{s.stats.lightning++;} },
    { id:'manaFlow',hero:'mage',icon:'🔮',title:'ไหลเวท',desc:'ร่ายเร็วขึ้นและเพิ่มลูกเวท 1 ลูก',apply:s=>{s.stats.cooldown=Math.max(.16,s.stats.cooldown*.9);s.stats.multishot++;} }
  ];
  const AWAKEN_POOL = [
    {id:'bladeStorm',hero:'warrior',icon:'🗡️',title:'AWAKE · พายุดาบ',desc:'ปล่อยคมดาบหมุนแรงขึ้นรอบตัว',apply:s=>{s.stats.awake.bladeStorm=(s.stats.awake.bladeStorm||0)+1;s.stats.orbit+=2;s.stats.damage*=1.08;}},
    {id:'berserk',hero:'warrior',icon:'🔥',title:'AWAKE · คลั่งศึก',desc:'ฟันเร็วและแรงขึ้น พร้อมฟื้นเลือดตอนฆ่ามอน',apply:s=>{s.stats.awake.berserk=(s.stats.awake.berserk||0)+1;s.stats.cooldown=Math.max(.14,s.stats.cooldown*.84);s.stats.damage*=1.16;s.stats.regen+=.6;}},
    {id:'aegis',hero:'warrior',icon:'🛡️',title:'AWAKE · โล่พิทักษ์',desc:'เกราะและพลังชีวิตสูงขึ้นมาก',apply:s=>{s.stats.awake.aegis=(s.stats.awake.aegis||0)+1;s.stats.maxHp+=70;s.player.hp=Math.min(s.stats.maxHp,s.player.hp+90);s.stats.armor+=3;s.stats.guard+=.08;}},
    {id:'phantomShot',hero:'archer',icon:'🏹',title:'AWAKE · วิถีเงา',desc:'ลูกศรเพิ่มและทะลุไกลขึ้น',apply:s=>{s.stats.awake.phantomShot=(s.stats.awake.phantomShot||0)+1;s.stats.multishot+=2;s.stats.pierce+=1;s.stats.cooldown=Math.max(.14,s.stats.cooldown*.88);}},
    {id:'rainArrows',hero:'archer',icon:'🌠',title:'AWAKE · ห่าธนู',desc:'ฝนลูกศรยิงเป็นชุดกว้างขึ้น',apply:s=>{s.stats.awake.rainArrows=(s.stats.awake.rainArrows||0)+1;s.stats.volley+=2;s.stats.damage*=1.1;}},
    {id:'eagleEye',hero:'archer',icon:'🦅',title:'AWAKE · อินทรีย์เพ่ง',desc:'คริติคอลและระยะยิงสูงขึ้น',apply:s=>{s.stats.awake.eagleEye=(s.stats.awake.eagleEye||0)+1;s.stats.crit+=.16;s.stats.range+=70;s.stats.damage*=1.07;}},
    {id:'meteor',hero:'mage',icon:'☄️',title:'AWAKE · ดาวตก',desc:'ลูกเวทระเบิดแรงและกว้างขึ้น',apply:s=>{s.stats.awake.meteor=(s.stats.awake.meteor||0)+1;s.stats.splash+=34;s.stats.damage*=1.14;s.stats.multishot+=1;}},
    {id:'arcaneTempest',hero:'mage',icon:'🌌',title:'AWAKE · พายุเวท',desc:'เวทลูกโซ่และสายฟ้ารุนแรงขึ้น',apply:s=>{s.stats.awake.arcaneTempest=(s.stats.awake.arcaneTempest||0)+1;s.stats.chain+=2;s.stats.lightning+=1;}},
    {id:'frostNova',hero:'mage',icon:'❄️',title:'AWAKE · วงแหวนเยือกแข็ง',desc:'มอนรอบตัวช้าลงมากและรับดาเมจเพิ่ม',apply:s=>{s.stats.awake.frostNova=(s.stats.awake.frostNova||0)+1;s.stats.ice+=.40;s.stats.regen+=.4;s.stats.splash+=10;}}
  ];
  const state = { phase:'setup', hero:'warrior',language:'en',type:'word', level:1,words:0,time:0,killCount:0,
    stats:null,player:null,quest:null,enemies:[],shots:[],queuedArrows:[],enemyShots:[],drops:[],particles:[],arcs:[],boss:null,
    spawnIn:0,attackIn:0,lightningIn:3.5,orbitHitIn:0,alertIn:0,chosenUpgrades:[],dropSerial:0,wordDeck:{th:[],en:[]},queueBoss:false,
    runId:0,fx:[],usedWords:new Set(),skillRanks:{},awakeCount:0,score:0,bossKills:0,lastDropKill:0,awakeningIn:6,wave:1 }; 
  let cw=1,ch=1,dpr=1,camera={x:0,y:0,targetX:0,targetY:0},noteTimeout=0,stickPointer=null;
  const CAMERA = { deadX:40, deadY:32, followHz:5.5 };
  const keys=new Set(),stick={x:0,y:0};
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  // Spreadsheet-like wave names: A ... Z, AA, AB, AC ...; wave changes every 35 seconds.
  function waveName(value){let n=Math.max(1,Math.floor(value)),s='';while(n>0){n--;s=String.fromCharCode(65+(n%26))+s;n=Math.floor(n/26);}return s;}
  function waveAt(seconds){return 1+Math.floor(Math.max(0,seconds)/35);}
  function waveTier(wave){return wave<3?0:wave<5?1:wave<9?2:wave<15?3:4;}
  const segment = text => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) return [...new Intl.Segmenter('th',{granularity:'grapheme'}).segment(text)].map(e=>e.segment);
    return Array.from(text);
  };
  function selectGroup(container,attr,key){
    $(container).addEventListener('click',e=>{
      const b=e.target.closest('button[data-'+attr+']');if(!b)return;
      state[key]=b.dataset[attr];
      $(container).querySelectorAll('button').forEach(t=>t.classList.toggle('selected',t===b));
    });
  }
  selectGroup('heroChoices','hero','hero');selectGroup('languageChoices','language','language');selectGroup('typeChoices','type','type');
  function show(id,yes){$(id).hidden=!yes;}
  function notify(text){const el=$('floatNote');el.textContent=text;el.classList.add('show');clearTimeout(noteTimeout);noteTimeout=setTimeout(()=>el.classList.remove('show'),1300);}
  function resize(){const box=canvas.getBoundingClientRect();dpr=clamp(window.devicePixelRatio||1,1,2);cw=Math.max(300,box.width);ch=Math.max(300,box.height);canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);
  function updateCamera(dt){
    if(!state.player||dt<=0)return;
    const p=state.player;
    // Soft dead-zone keeps scenery still for tiny walking movements.
    const dx=p.x-camera.targetX,dy=p.y-camera.targetY;
    if(Math.abs(dx)>CAMERA.deadX)camera.targetX+=Math.sign(dx)*(Math.abs(dx)-CAMERA.deadX);
    if(Math.abs(dy)>CAMERA.deadY)camera.targetY+=Math.sign(dy)*(Math.abs(dy)-CAMERA.deadY);
    // Stable across 30/60/120 FPS; no world-coordinate rounding/snap jitter.
    const follow=1-Math.exp(-CAMERA.followHz*Math.min(.05,dt));
    camera.x+=(camera.targetX-camera.x)*follow;
    camera.y+=(camera.targetY-camera.y)*follow;
    if(Math.abs(camera.targetX-camera.x)<.001)camera.x=camera.targetX;
    if(Math.abs(camera.targetY-camera.y)<.001)camera.y=camera.targetY;
  }

  function pickWord(){
    const lang=state.language==='mix'?(state.words%2?'th':'en'):state.language;
    const picked=window.WordSurvivorWords.pick(lang,state.level,state.type==='phrase',state.usedWords);
    return {lang,entry:[picked.text,picked.meaning]};
  }
  function announceWord(){
    if(state.quest) speak(state.quest.text,state.quest.lang);
  }
  function speak(text,lang){
    // All games use the same strict Thai-language TTS voice and Thai-script pronunciation.
    window.QuizWebGamesSpeech?.say(text);
  }
  function newQuest(){
    const {lang,entry}=pickWord();const raw=segment(entry[0]);const letters=raw.filter(c=>c.trim().length>0);
    state.quest={text:entry[0],meaning:entry[1],lang,raw,letters,got:new Array(letters.length).fill(false)};
    $('questText').textContent=entry[0];$('questMeaning').textContent=entry[1];
    updateQuestUI();announceWord();
  }
  function updateQuestUI(){
    const q=state.quest;if(!q)return;
    const wrap=$('letterSlots');wrap.textContent='';let i=0;
    q.raw.forEach(char=>{
      const el=document.createElement('span');const space=!char.trim();el.className='letter-slot'+(space?' space':q.got[i]?' got':'');
      el.textContent=space?' ':char;if(!space)i++;wrap.appendChild(el);
    });
    const done=q.got.filter(Boolean).length;$('letterBar').style.width=(done/q.letters.length*100)+'%';
    wrap.setAttribute('aria-label','เก็บแล้ว '+done+' จาก '+q.letters.length+' ตัวอักษร');
  }
  function begin(){
    window.QuizWebGamesSpeech?.cancel();
    const hero=HEROES[state.hero];state.runId++;state.level=1;state.words=0;state.time=0;state.killCount=0;state.dropSerial=0;
    state.player={x:WORLD.w/2,y:WORLD.h/2,r:17,hp:hero.hp,invuln:0,hitFlash:0,attackPose:0,moving:false,facing:0};
    camera.x=state.player.x;camera.y=state.player.y;camera.targetX=state.player.x;camera.targetY=state.player.y;
    state.stats={maxHp:hero.hp,speed:hero.speed,damage:hero.damage,cooldown:hero.cooldown,range:hero.range,magnet:100,multishot:state.hero==='archer'?2:1,pierce:state.hero==='archer'?1:0,crit:state.hero==='archer'?0.05:0,volley:0,splash:state.hero==='mage'?54:0,chain:0,ice:state.hero==='mage'?0.08:0,regen:0,lightning:state.hero==='mage'?1:0,orbit:0,luck:0,armor:state.hero==='warrior'?1:0,guard:state.hero==='warrior'?0.08:0,cleave:0,awake:{}};
    state.enemies=[];state.shots=[];state.queuedArrows=[];state.enemyShots=[];state.drops=[];state.particles=[];state.arcs=[];state.boss=null;
    state.spawnIn=1;state.attackIn=.45;state.lightningIn=4;state.orbitHitIn=0;state.alertIn=0;
    state.wordDeck={th:[],en:[]};state.usedWords=new Set();state.queueBoss=false;state.chosenUpgrades=[];state.skillRanks={};
    state.awakeCount=0;state.score=0;state.bossKills=0;state.lastDropKill=0;state.awakeningIn=6;state.wave=1;keys.clear();resetStick();
    if(renderer3d)renderer3d.resetCamera();
    $('currentWeapon').textContent=hero.emoji+' '+hero.weapon+' · '+hero.role;
    show('setupOverlay',false);show('endOverlay',false);show('upgradeOverlay',false);show('pauseOverlay',false);
    $('pauseBtn').disabled=false;$('pauseBtn').textContent='⏸ พัก';$('bestText').textContent='';
    state.phase='running';newQuest();updateHUD();
    for(let i=0;i<4;i++) spawnEnemy();
  }
  function resetStick(){stick.x=0;stick.y=0;$('stickKnob').style.transform='translate(0,0)';}
  function spawnEnemy(boss=false){
    if(!state.player)return;
    const angle=rand(0,Math.PI*2),radius=boss?Math.max(240,Math.min(cw,ch)*.43):Math.max(175,Math.min(cw,ch)*.43)+rand(22,85);
    const x=clamp(state.player.x+Math.cos(angle)*radius,38,WORLD.w-38);
    const y=clamp(state.player.y+Math.sin(angle)*radius,38,WORLD.h-38);
    const wave=state.wave||1,tier=waveTier(wave);
    const elite=!boss&&Math.random()<Math.min(.22,.055+wave*.004);
    const kind=boss?'boss':tier===0?'slime':tier===1?(Math.random()<.55?'slime':'bat'):
      tier===2?(['slime','bat','skeleton'][Math.floor(rand(0,3))]):
      tier===3?(['bat','skeleton','golem'][Math.floor(rand(0,3))]):
      (['skeleton','golem','wisp','bat'][Math.floor(rand(0,4))]);
    // Monster durability/speed scale with WAVES independently from player levels.
    const strength=1+Math.min(16,(wave-1)*.16);
    const baseHp=boss?210+state.level*100:elite?75+state.level*12:28+state.level*6;
    const hp=Math.round(baseHp*strength);
    const baseSpeed=boss?65+Math.min(state.level,60):elite?90:rand(62,96)+Math.min(state.level,50)*1.75;
    const e={id:++state.dropSerial,x,y,r:boss?41:elite?25:17,hp,maxHp:hp,
      speed:Math.min(255,baseSpeed+Math.min(75,(wave-1)*2.5)),
      kind,wave,boss,elite,dead:false,slow:0,hit:0,attackIn:rand(.3,1.1),angle:0};
    state.enemies.push(e);if(boss)state.boss=e;
    return e;
  }
  function spawnBoss(){
    if(state.boss)return;
    spawnEnemy(true);state.alertIn=2.8;$('bossAlert').hidden=false;
    notify('👑 บอสมาแล้ว!');
  }
  function particles(x,y,color,n=7){for(let i=0;i<n;i++){if(state.particles.length>240)break;const a=rand(0,6.28),v=rand(30,165);state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.22,.6),max:.65,r:rand(2,5),color});}}
  function dropLetter(x,y,force=false){
    const q=state.quest;if(!q)return;
    if(state.drops.length>115)return;
    const missing=q.letters.filter((_,i)=>!q.got[i]);if(!missing.length)return;
    // R8 dropped a useful letter after every kill; R9 drops by chance, with a pity ceiling.
    // Long sentences get a small accessibility bonus, but chance is never guaranteed.
    const chance=Math.min(.46,.25+state.stats.luck+Math.min(.11,q.letters.length*.0025));
    if(!force&&Math.random()>=chance&&state.killCount-state.lastDropKill<6)return;
    state.lastDropKill=state.killCount;
    const letter=missing[Math.floor(Math.random()*missing.length)];
    state.drops.push({x:x+rand(-16,16),y:y+rand(-16,16),char:letter,life:24,r:12,phase:rand(0,6.2),gold:false});
  }
  function damageEnemy(e,dmg){if(e.dead)return;e.hp-=dmg;e.hit=.14;if(state.stats.ice)e.slow=Math.max(e.slow,.55+state.stats.ice*.14);
    particles(e.x,e.y,e.boss?'#ffd37c':'#a8ffdd',2);
    if(e.hp>0)return;
    e.dead=true;state.killCount++;state.score+=e.boss?400+state.level*28:e.elite?60:10;
    if(state.stats.awake.vampire)state.player.hp=Math.min(state.stats.maxHp,state.player.hp+Math.min(10,1.4*state.stats.awake.vampire));
    if(state.stats.awake.berserk)state.player.hp=Math.min(state.stats.maxHp,state.player.hp+.8*state.stats.awake.berserk);
    particles(e.x,e.y,e.boss?'#ffde9f':'#b2ffe7',e.boss?22:8);
    if(e.boss){state.boss=null;state.bossKills++;state.drops.push({x:e.x,y:e.y,char:'★',life:28,r:19,gold:true,phase:0});
      dropLetter(e.x+22,e.y,true);dropLetter(e.x-22,e.y-18,true);notify('🏆 ชนะบอส!');}
    else{dropLetter(e.x,e.y,e.elite);if(e.elite&&Math.random()<.65)dropLetter(e.x+16,e.y-15,true);}
  }
  function findTarget(maxRange=900){let best=null,bestD=maxRange;
    for(const e of state.enemies){if(e.dead)continue;const d=dist(e,state.player);if(d<bestD){best=e;bestD=d;}}
    return best;
  }
  function attack(){const s=state.stats, p=state.player, hero=state.hero;
    const target=findTarget(hero==='warrior'?s.range+24:s.range);
    if(!target)return;
    const angle=Math.atan2(target.y-p.y,target.x-p.x);
    p.facing=angle;p.attackPose=.33;
    if(hero==='warrior'){
      const size=Math.min(3.14,1.00+s.cleave+Math.max(0,s.multishot-1)*.08);
      state.arcs.push({x:p.x,y:p.y,angle,life:.20,max:.20,range:s.range,width:size});
      for(const e of state.enemies){if(e.dead)continue;const distance=dist(p,e);if(distance>s.range+e.r)continue;
        let delta=Math.atan2(e.y-p.y,e.x-p.x)-angle;delta=Math.atan2(Math.sin(delta),Math.cos(delta));
        if(Math.abs(delta)<size){damageEnemy(e,s.damage*(1+Math.max(0,s.guard-.08)*.4));if(s.guard>.12&&distance<58)damageEnemy(e,s.damage*.25);}
      }
      particles(p.x+Math.cos(angle)*s.range*.6,p.y+Math.sin(angle)*s.range*.6,'#c0ffeb',7);
    }else if(hero==='archer'){
      const count=Math.min(10,s.multishot+s.volley);
      for(let i=0;i<count;i++){
        const crit=Math.random()<(s.crit||0)?1.55:1;
        // R17: a single target, no spread. Release arrows sequentially.
        state.queuedArrows.push({delay:i*.09,targetId:target.id,tx:target.x,ty:target.y,
          damage:s.damage*crit,pierce:s.pierce||0});
      }
        }else{
      const count=Math.min(6,s.multishot);
      const spread=.11+.02*Math.max(0,count-1);
      for(let i=0;i<count;i++){
        const a=angle+(i-(count-1)/2)*spread;
        const speed=380;
        state.shots.push({hero:'mage',x:p.x,y:p.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:1.85,r:11,damage:s.damage,
          mage:true,color:'#d7b4ff',hitIds:new Set(),pierce:0,chain:s.chain||0,splash:s.splash||54});
      }
    }
  }
  function lightning(){
    const target=findTarget(390);if(!target)return;
    state.arcs.push({x:state.player.x,y:state.player.y,x2:target.x,y2:target.y,life:.20,max:.20,lightning:true});
    damageEnemy(target,25+state.level*6+state.stats.lightning*9);
  }
  function update(dt){
    const p=state.player,s=state.stats;
    state.time+=dt;const nextWave=waveAt(state.time);
    if(nextWave!==state.wave){state.wave=nextWave;notify('🌊 WAVE '+waveName(nextWave)+' · มอนสเตอร์แข็งแกร่งขึ้น!');}
    p.invuln=Math.max(0,p.invuln-dt);p.hitFlash=Math.max(0,p.hitFlash-dt);p.attackPose=Math.max(0,p.attackPose-dt);
    if(s.regen) p.hp=Math.min(s.maxHp,p.hp+s.regen*dt);
    let dx=+(keys.has('d')||keys.has('arrowright'))-+(keys.has('a')||keys.has('arrowleft'));
    let dy=+(keys.has('s')||keys.has('arrowdown'))-+(keys.has('w')||keys.has('arrowup'));
    if(Math.hypot(stick.x,stick.y)>.1){dx=stick.x;dy=stick.y;}
    // On an oblique view, WASD/arrow directions still follow the screen.
    const screenX=dx,screenY=dy;
    const det=VIEW.a*VIEW.d-VIEW.b*VIEW.c;
    dx=(VIEW.d*screenX-VIEW.c*screenY)/det;
    dy=(-VIEW.b*screenX+VIEW.a*screenY)/det;
    const mag=Math.hypot(dx,dy);p.moving=mag>.08;
    if(mag>0){dx/=mag;dy/=mag;p.x+=dx*s.speed*dt;p.y+=dy*s.speed*dt;if(p.attackPose<=0)p.facing=Math.atan2(dy,dx);}
    updateCamera(dt);
    state.spawnIn-=dt;
    const maxEnemies=cw<600?Math.min(65,30+state.wave*2):Math.min(100,56+state.wave*2);
    if(state.spawnIn<=0&&state.enemies.length<maxEnemies){spawnEnemy();state.spawnIn=clamp(1.2-state.level*.020-state.wave*.013,.20,1.2)*rand(.7,1.2);}
    state.attackIn-=dt;if(state.attackIn<=0){attack();state.attackIn=s.cooldown;}
    // Consecutive arrows follow one target on the same line, 90 ms apart.
    for(const queued of state.queuedArrows){
      queued.delay-=dt;
      if(queued.delay>0)continue;
      const enemy=state.enemies.find(e=>!e.dead&&e.id===queued.targetId);
      const tx=enemy?enemy.x:queued.tx,ty=enemy?enemy.y:queued.ty;
      const angle=Math.atan2(ty-p.y,tx-p.x);
      const speed=665;
      state.shots.push({hero:'archer',x:p.x,y:p.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        life:1.9,r:5.5,damage:queued.damage,color:'#fff1b4',hitIds:new Set(),
        pierce:queued.pierce,chain:0,splash:0});
    }
    state.queuedArrows=state.queuedArrows.filter(queued=>queued.delay>0);
    state.lightningIn-=dt;if(s.lightning&&state.lightningIn<=0){for(let i=0;i<Math.min(5,1+(s.awake.storm||0));i++)lightning();state.lightningIn=Math.max(1.1,4.6-s.lightning*.4);}
    state.awakeningIn-=dt;if(s.awake.nova&&state.awakeningIn<=0){const area=130+20*s.awake.nova;for(const e of state.enemies)if(!e.dead&&dist(e,p)<area)damageEnemy(e,30*s.awake.nova+s.damage*.48);
      particles(p.x,p.y,'#ffd87b',30);state.awakeningIn=Math.max(2.4,6-s.awake.nova*.4);}
    state.orbitHitIn-=dt;if(s.orbit>0&&state.orbitHitIn<=0){
      for(const e of state.enemies){if(!e.dead&&dist(e,p)<65+s.orbit*8)damageEnemy(e,9+s.orbit*6);}
      state.orbitHitIn=.5;
    }
    for(const e of state.enemies){if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);
      const vx=p.x-e.x,vy=p.y-e.y,d=Math.hypot(vx,vy)||1;
      if(d>e.r+p.r-2){const mult=e.slow>0?clamp(.55-s.ice*.02,.18,.55):1;e.x+=vx/d*e.speed*mult*dt;e.y+=vy/d*e.speed*mult*dt;}
      if(d<e.r+p.r&&p.invuln<=0){p.hp-=Math.max(2,((e.boss?24:e.elite?15:9)+Math.floor(state.level/7)+Math.min(75,Math.floor((state.wave-1)*1.6))-s.armor)*(1-Math.min(.35,s.guard||0)));p.invuln=.62;p.hitFlash=.25;particles(p.x,p.y,'#ff8495',13);if(p.hp<=0){p.hp=0;finish();return;}}
      if(e.boss){e.attackIn-=dt;if(e.attackIn<=0){for(let i=0;i<9;i++){const a=i*Math.PI*2/9+state.time*.2;state.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*180,vy:Math.sin(a)*180,life:3.4,r:7});}e.attackIn=3.8;}}
    }
    state.enemies=state.enemies.filter(e=>!e.dead);
    for(const shot of state.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
      for(const e of state.enemies){if(e.dead||shot.hitIds.has(e.id))continue;
        if(dist(e,shot)<e.r+shot.r){shot.hitIds.add(e.id);damageEnemy(e,shot.damage);if(shot.mage){
            const splash=shot.splash||56;
            let chained=0;
            for(const other of state.enemies){if(!other.dead&&other!==e&&dist(shot,other)<splash)damageEnemy(other,shot.damage*.48);}
            if((shot.chain||0)>0){
              const others=state.enemies.filter(other=>!other.dead&&other!==e&&!shot.hitIds.has(other.id)).sort((a,b)=>dist(e,a)-dist(e,b));
              for(const other of others.slice(0,shot.chain)){damageEnemy(other,shot.damage*.55);chained++;state.arcs.push({x:e.x,y:e.y,x2:other.x,y2:other.y,life:.14,max:.14,lightning:true});}
            }
            particles(shot.x,shot.y,'#cfafff',13+Math.min(8,chained*2));
          }
          if((shot.pierce||0)<=0)shot.life=0;else shot.pierce--;break;
        }
      }
    }
    state.shots=state.shots.filter(q=>q.life>0);
    for(const shot of state.enemyShots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
      if(p.invuln<=0&&dist(shot,p)<shot.r+p.r){p.hp-=Math.max(2,(13+Math.floor(state.level/8)+Math.min(75,Math.floor((state.wave-1)*1.5))-s.armor)*(1-Math.min(.35,s.guard||0)));p.invuln=.55;p.hitFlash=.22;shot.life=0;particles(p.x,p.y,'#ff7491',9);if(p.hp<=0){p.hp=0;finish();return;}}
    }
    state.enemyShots=state.enemyShots.filter(q=>q.life>0);
    for(const d of state.drops){d.life-=dt;d.phase+=dt*3;const distance=dist(d,p);
      const magnet=s.magnet+(d.gold?60:0);
      if(distance<mag&&distance>0){const speed=clamp((mag-distance)*6,115,570);d.x+=(p.x-d.x)/distance*speed*dt;d.y+=(p.y-d.y)/distance*speed*dt;}
      if(distance<23+p.r){d.life=0;collectDrop(d);if(state.phase!=='running')break;}
    }
    state.drops=state.drops.filter(d=>d.life>0);
    for(const fx of state.particles){fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;fx.vx*=.97;fx.vy*=.97;fx.life-=dt;}
    state.particles=state.particles.filter(fx=>fx.life>0);state.arcs.forEach(a=>a.life-=dt);state.arcs=state.arcs.filter(a=>a.life>0);
    state.alertIn-=dt;if(state.alertIn<=0)$('bossAlert').hidden=true;
    updateHUD();
  }
  function collectDrop(d){
    if(d.gold){particles(d.x,d.y,'#ffeb9c',30);openUpgrade(true);return;}
    const q=state.quest;if(!q)return;
    const i=q.letters.findIndex((ch,i)=>!q.got[i]&&ch===d.char);
    if(i<0){particles(d.x,d.y,'#b4d7dc',5);return;}
    q.got[i]=true;particles(d.x,d.y,'#a3fef0',14);updateQuestUI();
    if(q.got.every(Boolean)) completeWord();
  }
  function completeWord(){
    const old=state.quest.text;state.words++;state.level++;
    state.score+=100+state.level*45+Math.round(state.quest.letters.length*5);
    particles(state.player.x,state.player.y,'#ffe6aa',35);notify('✨ '+old+' สำเร็จ!');
    state.queueBoss=state.words%5===0;
    newQuest();updateHUD();openUpgrade(false);
  }
  function upgradeOptions(){
    const usable=UPGRADE_POOL.filter(u=>!u.hero||u.hero===state.hero);
    const heroPool=usable.filter(u=>u.hero===state.hero).sort(()=>Math.random()-.5);
    const generalPool=usable.filter(u=>!u.hero).sort(()=>Math.random()-.5);
    const picked=[];
    if(heroPool[0])picked.push(heroPool.shift());
    if(heroPool[0])picked.push(heroPool.shift());
    while(picked.length<3&&generalPool.length)picked.push(generalPool.shift());
    while(picked.length<3){
      const extra=usable.find(u=>!picked.some(p=>p.id===u.id));
      if(!extra)break;picked.push(extra);
    }
    return picked.sort(()=>Math.random()-.5).slice(0,3);
  }
  function openUpgrade(fromChest){
    state.phase='upgrade';show('pauseOverlay',false);show('upgradeOverlay',true);resetStick();
    const isAwake=!fromChest&&state.level%10===0;
    $('upgradeOverlay').classList.toggle('awakening',isAwake);
    $('upgradeOverlay').querySelector('h2').textContent=isAwake?'✨ AWAKENING!':fromChest?'👑 ของรางวัลบอส':'เลเวลอัป!';
    $('upgradeOverlay').querySelector('.sub').textContent=isAwake?'เลือกพลังปลุกตื่นเฉพาะสาย '+HEROES[state.hero].title:fromChest?'เลือกพลังเพิ่มอีก 1 อย่าง':'เลือกพลัง 1 อย่าง';
    const wrap=$('upgradeChoices');wrap.textContent='';
    const awakenUsable=AWAKEN_POOL.filter(u=>u.hero===state.hero);
    const pool=isAwake?awakenUsable.sort(()=>Math.random()-.5).slice(0,3):upgradeOptions();
    for(const u of pool){const b=document.createElement('button');b.type='button';b.className='upgrade-btn';
      const ico=document.createElement('span');ico.textContent=u.icon;const name=document.createElement('strong');
      const rank=state.skillRanks[u.id]||0;name.textContent=u.title+'  Lv.'+(rank+1);
      const desc=document.createElement('small');desc.textContent=u.desc;
      b.append(ico,name,desc);b.addEventListener('click',()=>{
        u.apply(state);state.chosenUpgrades.push(u.id);state.skillRanks[u.id]=(state.skillRanks[u.id]||0)+1;
        if(isAwake)state.awakeCount++;show('upgradeOverlay',false);
        state.phase='running';if(state.queueBoss){state.queueBoss=false;spawnBoss();}
        updateHUD();
      });wrap.appendChild(b);
    }
  }
  function updateHUD(){
    if(!state.stats||!state.player)return;
    $('levelText').textContent=state.level;$('wordsText').textContent=state.words;
    $('scoreText').textContent=state.score.toLocaleString('en-US');
    $('waveText').textContent='WAVE '+waveName(state.wave);
    $('waveText').title='Wave '+state.wave+' · มอนสเตอร์เก่งขึ้นทุก 35 วินาที';
    $('awakeText').textContent=state.awakeCount?('AWAKE '+state.awakeCount):'ENDLESS';
    $('timeText').textContent=String(Math.floor(state.time/60)).padStart(2,'0')+':'+String(Math.floor(state.time%60)).padStart(2,'0');
    $('hpText').textContent=Math.ceil(state.player.hp)+' / '+state.stats.maxHp;
    $('hpBar').style.width=clamp(state.player.hp/state.stats.maxHp*100,0,100)+'%';
  }
  function finish(){
    state.phase='end';show('upgradeOverlay',false);show('pauseOverlay',false);show('endOverlay',true);
    $('pauseBtn').disabled=true;resetStick();keys.clear();
    $('endIcon').textContent='💔';$('endTitle').textContent='จบรอบแล้ว';
    $('endSummary').textContent=`WAVE ${waveName(state.wave)} · คะแนน ${state.score.toLocaleString('en-US')} · สะกด ${state.words} คำ/ประโยค · เลเวล ${state.level} · ปราบบอส ${state.bossKills} · รอด ${Math.floor(state.time/60)} นาที ${Math.floor(state.time%60)} วินาที · ปลุกพลัง ${state.awakeCount}`;
    const key='quizweb.games.survivor.endless.best.v2';try{
      const prev=Number(localStorage.getItem(key)||0);if(state.score>prev)localStorage.setItem(key,String(state.score));
      $('bestText').textContent='คะแนนสูงสุด '+Number(localStorage.getItem(key)||0).toLocaleString('en-US');
    }catch(_){$('bestText').textContent='';}
    window.QuizWebGamesSpeech?.cancel();
  }
  function togglePause(){if(state.phase==='running'){state.phase='pause';show('pauseOverlay',true);$('pauseBtn').textContent='▶ เล่นต่อ';resetStick();}
    else if(state.phase==='pause'){state.phase='running';show('pauseOverlay',false);$('pauseBtn').textContent='⏸ พัก';}}
  $('startBtn').addEventListener('click',begin);$('retryBtn').addEventListener('click',begin);
  $('changeHeroBtn').addEventListener('click',()=>{state.phase='setup';show('endOverlay',false);show('setupOverlay',true);});
  $('pauseBtn').addEventListener('click',togglePause);$('resumeBtn').addEventListener('click',togglePause);
  $('speakBtn').addEventListener('click',()=>{if(state.quest)announceWord();});
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){
      if(state.phase==='running'){keys.add(k);e.preventDefault();}
    }
    if(k==='escape'&&(state.phase==='running'||state.phase==='pause')){togglePause();e.preventDefault();}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();resetStick();});
  const touch=$('touchStick');
  function stickPosition(e){const r=touch.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),d=Math.hypot(x,y);
    stick.x=d?x/Math.max(d,48):0;stick.y=d?y/Math.max(d,48):0;const rx=stick.x*Math.min(35,d),ry=stick.y*Math.min(35,d);
    $('stickKnob').style.transform=`translate(${rx}px,${ry}px)`;
  }
  touch.addEventListener('pointerdown',e=>{if(state.phase!=='running')return;stickPointer=e.pointerId;touch.setPointerCapture(e.pointerId);stickPosition(e);e.preventDefault();});
  touch.addEventListener('pointermove',e=>{if(e.pointerId!==stickPointer)return;stickPosition(e);e.preventDefault();});
  const clearPointer=e=>{if(e.pointerId!==stickPointer)return;stickPointer=null;resetStick();};
  touch.addEventListener('pointerup',clearPointer);touch.addEventListener('pointercancel',clearPointer);
  // Calm, soft-colored faceted ground with a raised stone edge. No pixel grid.
  function paintFloor(){
    // No square checkerboard: broad organic earth, moss and grass patches.
    const bounds=visibleWorldBounds(270);
    ctx.fillStyle='#698c6c';ctx.fillRect(bounds.minX,bounds.minY,bounds.maxX-bounds.minX,bounds.maxY-bounds.minY);
    const unit=185;
    const minX=Math.floor(bounds.minX/unit),maxX=Math.ceil(bounds.maxX/unit);
    const minY=Math.floor(bounds.minY/unit),maxY=Math.ceil(bounds.maxY/unit);
    for(let ix=minX;ix<=maxX;ix++)for(let iy=minY;iy<=maxY;iy++){
      const n=Math.abs(Math.sin(ix*92.73+iy*45.61)*Math.cos(iy*27.19-ix*11.47));
      const x=(ix+.37+n*.21)*unit,y=(iy+.31+n*.12)*unit;
      if(n>.19){
        const col=n>.76?'#426f58':n>.5?'#4f795f':'#779c73';
        ctx.globalAlpha=.11+n*.13;ctx.fillStyle=col;
        ctx.beginPath();ctx.ellipse(x,y,80+n*95,54+n*66,.16+n*.45,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }
      if(n>.70){
        ctx.fillStyle='#b5b98c';ctx.globalAlpha=.16;
        for(let j=0;j<3;j++){
          const px=x+Math.sin(ix*3+iy+j*7)*54,py=y+Math.cos(iy*4+ix+j*6)*50;
          ctx.beginPath();ctx.ellipse(px,py,11+n*6,4+n*3,.2,0,Math.PI*2);ctx.fill();
        }ctx.globalAlpha=1;
      }
    }
  }
  function paintScenery(){
    const grid=280,bounds=visibleWorldBounds(260);
    const minX=Math.floor(bounds.minX/grid),maxX=Math.ceil(bounds.maxX/grid);
    const minY=Math.floor(bounds.minY/grid),maxY=Math.ceil(bounds.maxY/grid);
    for(let i=minX;i<=maxX;i++)for(let j=minY;j<=maxY;j++){
      const v=Math.abs(Math.sin(i*19.73+j*44.1)*Math.cos(i*7.6-j*13.73));
      if(v<.67)continue;
      const x=(i+.42)*grid+Math.sin(i*7.7+j)*52;
      const y=(j+.46)*grid+Math.cos(j*5.6+i)*46;
      if(Math.hypot(x-camera.x,y-camera.y)<165)continue;
      ctx.save();ctx.translate(x,y);
      ctx.fillStyle='#1b3d3560';ctx.beginPath();ctx.ellipse(8,6,25,13,-.12,0,6.283);ctx.fill();
      if(v>.89){ // stone, faceted but smooth, with visible raised side
        ctx.fillStyle='#596c67';ctx.beginPath();ctx.moveTo(-27,-4);ctx.lineTo(-12,-17);ctx.lineTo(12,-20);ctx.lineTo(26,-5);ctx.lineTo(19,12);ctx.lineTo(-16,12);ctx.closePath();ctx.fill();
        ctx.fillStyle='#a6b2a4';ctx.beginPath();ctx.moveTo(-27,-4);ctx.lineTo(-12,-17);ctx.lineTo(12,-20);ctx.lineTo(1,0);ctx.lineTo(-16,6);ctx.closePath();ctx.fill();
        ctx.fillStyle='#748c80';ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(12,-20);ctx.lineTo(26,-5);ctx.lineTo(19,12);ctx.closePath();ctx.fill();
      }else{ // short grove / tree with an elevated canopy
        ctx.fillStyle='#665d45';ctx.fillRect(-5,-13,10,23);
        ctx.fillStyle='#275c48';ctx.beginPath();ctx.moveTo(-26,-10);ctx.lineTo(-4,-58);ctx.lineTo(20,-20);ctx.lineTo(25,-6);ctx.lineTo(2,5);ctx.closePath();ctx.fill();
        ctx.fillStyle='#6eae7c';ctx.beginPath();ctx.moveTo(-26,-10);ctx.lineTo(-4,-58);ctx.lineTo(4,-16);ctx.lineTo(-3,2);ctx.closePath();ctx.fill();
        ctx.fillStyle='#498b64';ctx.beginPath();ctx.moveTo(-4,-58);ctx.lineTo(20,-20);ctx.lineTo(25,-6);ctx.lineTo(4,-16);ctx.closePath();ctx.fill();
      }ctx.restore();
    }
  }
  function groundShadow(r,alpha=.5){
    ctx.fillStyle=`rgba(5,22,26,${alpha})`;
    ctx.beginPath();ctx.ellipse(8,9,r*1.52,r*.62,-.08,0,6.283);ctx.fill();
  }
  function draw3dOverlay(){
    ctx.clearRect(0,0,cw,ch);
    if(!state.player)return;
    const proj=(x,y,z)=>renderer3d.project(x,y,z);
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 16px Sarabun,"Segoe UI",sans-serif';
    // Enemy names have been removed; only genuine dropped items contain letters.
    for(const drop of state.drops){const a=proj(drop.x,46+Math.sin(drop.phase)*3,drop.y);
      if(a.x<-30||a.x>cw+30||a.y<-30||a.y>ch+30)continue;
      ctx.shadowBlur=19;ctx.shadowColor=drop.gold?'#ffe68b':'#7dffe8';ctx.fillStyle=drop.gold?'#ffe499':'#eafff2';
      ctx.font='800 19px Sarabun,"Segoe UI",sans-serif';ctx.fillText(drop.char,a.x,a.y,54);ctx.shadowBlur=0;
    }
    for(const a of state.arcs){const from=proj(a.x,25,a.y);ctx.globalAlpha=clamp(a.life/a.max,0,1);
      ctx.strokeStyle=a.lightning?'#fff296':'#bcfff1';ctx.lineWidth=a.lightning?3:9;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=13;
      ctx.beginPath();if(a.lightning){const to=proj(a.x2,26,a.y2);ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);}else{
        const end=proj(a.x+Math.cos(a.angle)*a.range,22,a.y+Math.sin(a.angle)*a.range);ctx.moveTo(from.x,from.y);ctx.lineTo(end.x,end.y);}
      ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function draw(){

    ctx.clearRect(0,0,cw,ch);
    const sky=ctx.createLinearGradient(0,0,cw,ch);sky.addColorStop(0,'#9bb39c');sky.addColorStop(.45,'#6d826f');sky.addColorStop(1,'#445248');
    ctx.fillStyle=sky;ctx.fillRect(0,0,cw,ch);
    if(!state.player){drawWaiting();return;}
    ctx.save();
    ctx.translate(cw/2,ch/2);
    ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM); // Real zoom: actor pixel size and arena geometry both shrink.
    groundMatrix();
    ctx.translate(-camera.x,-camera.y);
    paintFloor();paintScenery();
    // Painter order: an actor further down the tilted map is drawn in front.
    const actors=[{kind:'player',y:state.player.y,x:state.player.x}];
    for(const e of state.enemies)if(!e.dead)actors.push({kind:'enemy',y:e.y,x:e.x,obj:e});
    for(const d of state.drops)actors.push({kind:'drop',y:d.y,x:d.x,obj:d});
    actors.sort((a,b)=>(a.x*VIEW.b+a.y*VIEW.d)-(b.x*VIEW.b+b.y*VIEW.d));
    for(const a of actors){
      if(a.kind==='player')drawPlayer();
      else if(a.kind==='enemy')drawEnemy(a.obj);
      else drawDrop(a.obj);
    }
    for(const shot of state.shots){
      ctx.save();ctx.translate(shot.x,shot.y);groundShadow(shot.r,.26);upright();
      if(shot.hero==='archer'){
        // Render ONLY the triangular arrowhead, no shaft/tail; project direction to screen axes.
        const screenX=VIEW.a*shot.vx+VIEW.c*shot.vy;
        const screenY=VIEW.b*shot.vx+VIEW.d*shot.vy;
        ctx.rotate(Math.atan2(screenY,screenX));
        ctx.translate(0,-13);
        ctx.shadowBlur=9;ctx.shadowColor='#fff0b3';
        ctx.fillStyle='#fff5c8';ctx.strokeStyle='#a77b40';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-7,-7);ctx.lineTo(-3,0);ctx.lineTo(-7,7);ctx.closePath();
        ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      }else{
        const glow=ctx.createRadialGradient(0,-15,2,0,-15,22);
        glow.addColorStop(0,'#ffffff');glow.addColorStop(.3,'#dbb7ff');glow.addColorStop(1,'#7b49e900');
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-15,22,0,6.283);ctx.fill();
        ctx.fillStyle='#d49fff';ctx.beginPath();ctx.arc(0,-15,Math.max(7,shot.r),0,6.283);ctx.fill();
      }ctx.restore();
    }
    for(const shot of state.enemyShots){
      ctx.save();ctx.translate(shot.x,shot.y);groundShadow(shot.r,.27);upright();
      ctx.shadowBlur=10;ctx.shadowColor='#fe6c9b';ctx.fillStyle='#fb729b';
      ctx.beginPath();ctx.arc(0,-14,shot.r,0,6.283);ctx.fill();ctx.restore();
    }
    for(const arc of state.arcs)drawArc(arc);
    if(state.stats.orbit){for(let i=0;i<state.stats.orbit;i++){
      const a=state.time*3+i/Math.max(1,state.stats.orbit)*Math.PI*2;
      ctx.save();ctx.translate(state.player.x+Math.cos(a)*57,state.player.y+Math.sin(a)*57);
      groundShadow(6,.3);upright();ctx.rotate(a);ctx.fillStyle='#d5fff0';ctx.fillRect(-5,-25,10,24);ctx.restore();
    }}
    for(const part of state.particles){ctx.globalAlpha=clamp(part.life/part.max,0,1);ctx.fillStyle=part.color;
      ctx.beginPath();ctx.arc(part.x,part.y-8,part.r,0,6.283);ctx.fill();ctx.globalAlpha=1;}
    ctx.restore();
    // Soft atmospheric vignette. The camera follows the hero in world coordinates.
    const shade=ctx.createRadialGradient(cw*.5,ch*.46,Math.min(cw,ch)*.18,cw*.5,ch*.5,Math.max(cw,ch)*.78);
    shade.addColorStop(0,'#ffffff00');shade.addColorStop(1,'#26604c28');
    ctx.fillStyle=shade;ctx.fillRect(0,0,cw,ch);
    const mW=93,mH=59,mX=cw-110,mY=15;
    if(cw>520){ctx.fillStyle='#0b2a2bcc';roundRect(mX,mY,mW,mH,10);ctx.fill();ctx.strokeStyle='#7dbaa47a';ctx.stroke();
      ctx.fillStyle='#f7f0a1';ctx.beginPath();ctx.arc(mX+mW/2,mY+mH/2,3,0,6.283);ctx.fill();
      if(state.boss){ctx.fillStyle='#ff8697';ctx.beginPath();ctx.arc(clamp(mX+mW/2+(state.boss.x-state.player.x)*.095,mX+5,mX+mW-5),clamp(mY+mH/2+(state.boss.y-state.player.y)*.095,mY+5,mY+mH-5),4,0,6.283);ctx.fill();}}
  }
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function drawWaiting(){
    camera.x=WORLD.w/2;camera.y=WORLD.h/2;camera.targetX=camera.x;camera.targetY=camera.y;
    ctx.save();ctx.translate(cw/2,ch/2);ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM);groundMatrix();ctx.translate(-camera.x,-camera.y);
    paintFloor();paintScenery();ctx.restore();
  }
  function drawPlayer(){
    const p=state.player;
    ctx.save();ctx.translate(p.x,p.y);groundShadow(p.r*1.48,.52);upright();ctx.scale(1.52,1.52);
    art.drawHero(ctx,p,state.hero,state.time);
    if(p.invuln>0){ctx.strokeStyle='#c7fff4a8';ctx.lineWidth=2;ctx.strokeRect(-30,-66,60,65);}
    ctx.restore();
  }
  function drawEnemy(e){
    ctx.save();ctx.translate(e.x,e.y);groundShadow(e.r*1.35,.54);upright();ctx.scale(e.boss?1.62:(e.elite?1.32:1.15),e.boss?1.62:(e.elite?1.32:1.15));
    art.drawMonster(ctx,e,state.time);
    if(e.boss||e.elite){const w=e.boss?78:46,y=e.boss?-87:-62;
      ctx.fillStyle='#132e34';ctx.fillRect(-w/2,y,w,6);
      ctx.fillStyle=e.boss?'#ff8c95':'#ffd079';ctx.fillRect(-w/2,y,w*clamp(e.hp/e.maxHp,0,1),6);
    }
    ctx.restore();
  }
  function drawDrop(d){
    const gold=d.gold,r=d.r;
    ctx.save();ctx.translate(d.x,d.y);groundShadow(r*1.25,.40);upright();ctx.scale(1.70,1.70);
    const bob=Math.sin(d.phase)*3;
    ctx.translate(0,-18-bob);
    ctx.shadowColor=gold?'#ffe78b':'#6dfff3';ctx.shadowBlur=gold?24:19;
    ctx.fillStyle=gold?'#f2bc67':'#ddfff8';ctx.strokeStyle=gold?'#8c5c23':'#166d6f';ctx.lineWidth=2.6;
    ctx.beginPath();ctx.moveTo(0,-r-7);ctx.lineTo(r+10,0);ctx.lineTo(0,r+8);ctx.lineTo(-r-10,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=gold?'#fff0bb':'#73d9ca';ctx.beginPath();ctx.moveTo(0,-r-5);ctx.lineTo(r+5,-1);ctx.lineTo(0,4);ctx.lineTo(-r-6,-1);ctx.closePath();ctx.fill();
    // Large, high-contrast letter: Thai diacritics remain visible and distinguishable.
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${gold?24:23}px Sarabun,"Segoe UI",sans-serif`;
    ctx.lineJoin='round';ctx.lineWidth=3.8;ctx.strokeStyle='#f8fffd';ctx.strokeText(d.char,0,0,2*r+25);
    ctx.fillStyle='#103b40';ctx.fillText(d.char,0,0,2*r+25);
    ctx.restore();
  }
  function drawArc(a){ctx.save();const life=a.life/a.max;ctx.globalAlpha=life;if(a.lightning){ctx.strokeStyle='#f6ec98';ctx.shadowColor='#e9ee8a';ctx.shadowBlur=23;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(a.x,a.y);
      for(let t=1;t<5;t++){const r=t/5;ctx.lineTo(a.x+(a.x2-a.x)*r+rand(-8,8),a.y+(a.y2-a.y)*r+rand(-8,8));}ctx.lineTo(a.x2,a.y2);ctx.stroke();
    }else{ctx.strokeStyle='#ccfff3';ctx.shadowColor='#a3f2df';ctx.shadowBlur=20;ctx.lineWidth=14;ctx.beginPath();ctx.arc(a.x,a.y,a.range*.72,a.angle-a.width,a.angle+a.width);ctx.stroke();}
    ctx.restore();}
  let lastTime=performance.now();function frame(now){const dt=clamp((now-lastTime)/1000,0,.045);lastTime=now;
    if(state.phase==='running')update(dt);draw();requestAnimationFrame(frame);}
  resize();requestAnimationFrame(frame);
})();
