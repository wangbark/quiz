/* Word Survivor R14 - non-pixel 2.5D fallback, D2-like proportions and stronger class silhouettes.
   Called only when WebGL is unavailable. No external sprites, images or fonts. */
window.WordSurvivorSoftArt = (() => {
  'use strict';
  const PI=Math.PI;
  function poly(c,pts,fill,stroke){c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.7;c.stroke();}}
  function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*PI);c.fillStyle=fill;c.fill();}
  function circle(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,2*PI);c.fillStyle=fill;c.fill();}
  function limb(c,a,b,w,color){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
  function hero(c,p,kind,t){
    const color={warrior:['#41c5ad','#187d83','#a9f0d6'],archer:['#e5aa55','#b57942','#ffe4ac'],mage:['#ae8ce7','#7758bf','#ebd6ff']}[kind]||['#41c5ad','#187d83','#a9f0d6'];
    const stride=p.moving?Math.sin(t*10)*4.6:0,hit=Math.min(1,(p.attackPose||0)/.33),bob=p.moving?Math.abs(Math.sin(t*10))*2.4:Math.sin(t*2)*.7;
    c.save();c.translate(0,-bob);
    oval(c,1,-2,22,9,'#18313977');
    limb(c,[-7,-17],[-8+stride,-5],7,'#4a5369');limb(c,[7,-17],[8-stride,-5],7,'#394759');
    oval(c,-8+stride,-6,6,4,'#273b50');oval(c,8-stride,-6,6,4,'#273b50');
    // Body is a small colored faceted tunic, not a pixel sprite.
    poly(c,[[-15,-42],[10,-43],[17,-26],[13,-13],[-13,-13],[-19,-27]],color[1],'#295464');
    poly(c,[[-14,-42],[2,-43],[4,-15],[-13,-15],[-18,-27]],color[0]);
    poly(c,[[1,-42],[13,-40],[17,-26],[12,-14],[4,-15]],color[2]);
    limb(c,[-15,-35],[-21,-22],8,color[0]);
    limb(c,[14,-35],[23+hit*2,-24-hit*6],8,color[0]);
    circle(c,-21,-21,4,'#f7c998');circle(c,23+hit*2,-24-hit*6,4,'#f7c998');
    oval(c,0,-49,11,11,'#f6ceaa');
    // Angular hat or helmet and clearly readable face.
    if(kind==='warrior'){
      poly(c,[[-13,-54],[-7,-63],[9,-63],[14,-53],[9,-49],[-10,-49]],'#c7dfdf','#658989');
      poly(c,[[-8,-61],[0,-64],[2,-53],[-8,-53]],'#f7ffff');
    }else if(kind==='mage'){
      poly(c,[[-15,-51],[-7,-65],[1,-78],[10,-56],[15,-49]],'#8d6ada','#6a4a9a');
      poly(c,[[-10,-56],[1,-76],[2,-54]],'#c8a6ff');
    }else{
      poly(c,[[-13,-55],[-9,-62],[4,-65],[14,-56],[10,-52],[-11,-52]],'#9d704d');
      poly(c,[[-9,-59],[3,-64],[1,-56],[-10,-55]],'#efd69a');
    }
    circle(c,-4,-46,1.6,'#254356');circle(c,4,-46,1.6,'#254356');
    // Hero weapons, swung on attack without affecting combat physics.
    c.save();c.translate(24+hit*2,-24-hit*6);c.rotate(hit*.85);
    if(kind==='warrior'){
      poly(c,[[0,0],[5,-2],[8,-26],[5,-37],[1,-26]],'#c9f6f2','#59798e');
      poly(c,[[3,-31],[5,-37],[7,-28],[6,-14]],'#ffffff');
      limb(c,[-3,-2],[9,-2],4,'#e5b971');limb(c,[3,0],[3,7],4,'#775a54');
    }else if(kind==='archer'){
      c.beginPath();c.arc(0,-16,24,-1.28,1.28);c.strokeStyle='#a76c34';c.lineWidth=4.8;c.stroke();
      limb(c,[7,-38],[7,6],1.8,'#fff8de');
      limb(c,[-8,-16],[17-hit*4,-16-hit*2],2.4,'#f3e9c9');
      poly(c,[[18-hit*4,-16-hit*2],[9-hit*4,-21-hit*2],[9-hit*4,-11-hit*2]],'#f0d29d');
      poly(c,[[-6,-37],[-1,-43],[2,-35],[-3,-30]],'#d8b06e');
    }else{
      limb(c,[2,5],[5,-36],5,'#8c704c');
      poly(c,[[-2,-40],[5,-47],[12,-39],[5,-32]],'#dfbbff','#7855d2');
      c.shadowBlur=10;c.shadowColor='#bd8dff';circle(c,5,-40,4,'#f3e5ff');c.shadowBlur=0;
    }
    c.restore();
    if(p.hitFlash>0){c.globalAlpha=.35;oval(c,0,-36,22,33,'#fff4c9');c.globalAlpha=1;}
    if(p.invuln>0){c.strokeStyle='#fcffffae';c.lineWidth=2;c.beginPath();c.ellipse(0,-34,24,37,0,0,2*PI);c.stroke();}
    c.restore();
  }
  function monster(c,e,t){
    const k=e.boss?'boss':e.kind||'slime';const r=e.boss?38:e.elite?24:17,cycle=Math.sin(t*5+e.id)*2;
    const colors={slime:['#5cc8ae','#b4f1c5','#26927f'],bat:['#9c8ce7','#d4c9ff','#6255a9'],skeleton:['#d7ddcf','#fffef0','#8a9d9c'],golem:['#8b9eb1','#d1d9df','#687e95'],wisp:['#79c9df','#e4fbff','#5492bf'],boss:['#da708d','#ffb7ab','#9c476d']}[k]||['#5cc8ae','#b4f1c5','#26927f'];
    c.save();c.translate(0,cycle);oval(c,2,0,r*1.1,7,'#204f4d64');
    if(k==='golem'){
      poly(c,[[-r,-20],[-r*.75,-43],[r*.72,-43],[r,-20],[r,-5],[-r,-5]],colors[2]);
      poly(c,[[-r,-43],[r*.72,-43],[r,-20],[-r,-22]],colors[1]);
    }else if(k==='skeleton'){
      limb(c,[-7,-20],[-8,-6],6,'#a7b2af');limb(c,[7,-20],[8,-6],6,'#a7b2af');
      poly(c,[[-12,-38],[10,-39],[15,-19],[-14,-19]],colors[2]);
      oval(c,0,-44,16,16,colors[1]);
    }else if(k==='bat'){
      poly(c,[[-5,-35],[-r*1.8,-47],[-r*1.3,-20],[-8,-26]],colors[2]);
      poly(c,[[5,-35],[r*1.8,-47],[r*1.3,-20],[8,-26]],colors[2]);
      oval(c,0,-33,r*.8,r*.75,colors[0]);
      poly(c,[[-12,-41],[-9,-55],[-1,-44]],colors[1]);poly(c,[[12,-41],[9,-55],[1,-44]],colors[1]);
    }else if(k==='wisp'){
      c.shadowBlur=14;c.shadowColor='#7ddcf4';
      poly(c,[[0,-62],[r,-34],[r*.62,-10],[0,-25],[-r*.63,-10],[-r,-34]],colors[0]);
      poly(c,[[0,-59],[r*.68,-34],[0,-26],[-r*.56,-34]],colors[1]);c.shadowBlur=0;
    }else{
      // Bright faceted jelly critter with a soft outline.
      poly(c,[[-r,-20],[-r*.85,-39],[0,-53],[r*.85,-39],[r,-18],[r*.57,-6],[-r*.58,-6]],colors[2]);
      poly(c,[[-r,-22],[-r*.80,-39],[0,-51],[0,-14],[-r*.62,-7]],colors[0]);
      poly(c,[[0,-51],[r*.84,-39],[r,-22],[r*.61,-8],[0,-14]],colors[1]);
      if(k==='boss'){
        poly(c,[[-17,-51],[-16,-67],[-7,-59],[-1,-73],[8,-59],[18,-67],[18,-50]],'#f3c168');
      }
    }
    // No letters are painted on monsters. Their eyes convey expression.
    const ey=k==='skeleton'?-46:k==='golem'?-27:k==='wisp'?-38:-29;
    oval(c,-r*.30,ey,Math.max(2,r*.16),3.5,'#21384c');oval(c,r*.30,ey,Math.max(2,r*.16),3.5,'#21384c');
    circle(c,-r*.30+1,ey-1,1.1,'#fff');circle(c,r*.30+1,ey-1,1.1,'#fff');
    if(e.hit>0){c.globalAlpha=.26;oval(c,0,-30,r*1.2,r*1.3,'#fff7d4');c.globalAlpha=1;}
    c.restore();
  }
  return {drawHero:hero,drawMonster:monster};
})();
