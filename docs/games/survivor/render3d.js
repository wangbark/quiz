/* Word Survivor R11 - faceted, high-angle, non-pixel 3D renderer.
   Procedural models: no CDN, no external engine, no external mesh/texture downloads. */
window.WordSurvivor3D = (() => {
  'use strict';
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const norm=(a)=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  function lookAt(eye,center){const z=norm(eye.map((v,i)=>v-center[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);
    return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
  function ortho(w,h,near,far){return new Float32Array([2/w,0,0,0,0,2/h,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
  function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){
    let n=0;for(let k=0;k<4;k++)n+=a[k*4+r]*b[c*4+k];o[c*4+r]=n;}
    return o;}
  const colorCache=new Map();const hex=s=>{if(colorCache.has(s))return colorCache.get(s);const m=s.replace('#','');const h=m.length===3?m.split('').map(c=>c+c).join(''):m;const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);colorCache.set(s,c);return c;};
  const face=(out,points,n)=>{for(const i of [0,1,2,0,2,3])out.push(...points[i],...n);};
  function cube(){const out=[];let p;
    p=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];face(out,p,[0,0,1]);
    p=[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]];face(out,p,[0,0,-1]);
    p=[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]];face(out,p,[0,1,0]);
    p=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]];face(out,p,[0,-1,0]);
    p=[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]];face(out,p,[1,0,0]);
    p=[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]];face(out,p,[-1,0,0]);return out;}
  function sphere(rows=7,cols=10){const out=[],v=(i,j)=>{
    const a=i/rows*Math.PI,t=j/cols*Math.PI*2;return [Math.sin(a)*Math.cos(t),Math.cos(a),Math.sin(a)*Math.sin(t)];};
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
      const a=v(i,j),b=v(i+1,j),c=v(i+1,j+1),d=v(i,j+1);
      for(const q of [a,b,c,a,c,d])out.push(...q,...q);
    }return out;}
  function cylinder(sides=12,cone=false){const out=[];for(let i=0;i<sides;i++){
    const t=i*2*Math.PI/sides,u=(i+1)*2*Math.PI/sides;
    const a=[Math.cos(t),-.5,Math.sin(t)],b=[Math.cos(u),-.5,Math.sin(u)],c=[Math.cos(u)*(cone?0:1),.5,Math.sin(u)*(cone?0:1)],d=[Math.cos(t)*(cone?0:1),.5,Math.sin(t)*(cone?0:1)];
    const n=norm([Math.cos((t+u)/2),cone?.6:0,Math.sin((t+u)/2)]);
    for(const v of [a,b,c,a,c,d])out.push(...v,...n);
    for(const v of [[0,-.5,0],b,a])out.push(...v,0,-1,0);
    if(!cone)for(const v of [[0,.5,0],d,c])out.push(...v,0,1,0);
  }return out;}
  function create(canvas){
    const gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:false,powerPreference:'default'});
    if(!gl)return null;
    const vs=`attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uVP;uniform vec3 uCenter;uniform vec3 uSize;uniform float uYaw;uniform float uPitch;varying float vLight;
      void main(){vec3 p=aPos*uSize;float ca=cos(uPitch),sa=sin(uPitch);p=vec3(p.x,p.y*ca-p.z*sa,p.y*sa+p.z*ca);
      float c=cos(uYaw),s=sin(uYaw);p=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);
      vec3 n=aNormal;vec3 rn=normalize(vec3(n.x*c-n.z*s,n.y,n.x*s+n.z*c));vLight=max(.0,dot(rn,normalize(vec3(-.52,.84,.64))));
      gl_Position=uVP*vec4(p+uCenter,1.0);}`;
    const fs=`precision mediump float;uniform vec3 uColor;uniform float uGlow;uniform float uAlpha;varying float vLight;
      void main(){gl_FragColor=vec4(uColor*(.46+.60*vLight)+uGlow*uColor,uAlpha);}`;
    function shader(src,type){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
    const prog=gl.createProgram();gl.attachShader(prog,shader(vs,gl.VERTEX_SHADER));gl.attachShader(prog,shader(fs,gl.FRAGMENT_SHADER));gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
    const loc={p:gl.getAttribLocation(prog,'aPos'),n:gl.getAttribLocation(prog,'aNormal'),vp:gl.getUniformLocation(prog,'uVP'),center:gl.getUniformLocation(prog,'uCenter'),size:gl.getUniformLocation(prog,'uSize'),yaw:gl.getUniformLocation(prog,'uYaw'),pitch:gl.getUniformLocation(prog,'uPitch'),color:gl.getUniformLocation(prog,'uColor'),glow:gl.getUniformLocation(prog,'uGlow'),alpha:gl.getUniformLocation(prog,'uAlpha')};
    const shapeData=[['box',cube()],['sphere',sphere()],['cylinder',cylinder()],['cone',cylinder(12,true)]];
    const shapes={},verts=[];for(const [name,arr] of shapeData){shapes[name]={first:verts.length/6,count:arr.length/6};verts.push(...arr);}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc.p);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,24,12);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    let vp=null,width=1,height=1,cameraX=0,cameraZ=0,init=false,renderCount=0;
    const RGB={shadow:hex('#31453c'),grass:hex('#6d9378'),rock:hex('#8b9a90'),dirt:hex('#5d775e'),white:hex('#ffffff')};
    function part(mesh,x,y,z,sx,sy,sz,color,yaw=0,pitch=0,glow=0,alpha=1){
      const m=shapes[mesh];if(!m)return;
      const c=typeof color==='string'?hex(color):color;
      gl.uniform3f(loc.center,x-cameraX,y,z-cameraZ);gl.uniform3f(loc.size,sx,sy,sz);gl.uniform1f(loc.yaw,yaw);gl.uniform1f(loc.pitch,pitch);
      gl.uniform3fv(loc.color,c);gl.uniform1f(loc.glow,glow);gl.uniform1f(loc.alpha,alpha);
      gl.drawArrays(gl.TRIANGLES,m.first,m.count);
    }
    const tile=(x,z,w,h,col)=>part('box',x,-5,z,w,8,h,col);
    function shadow(x,z,r){part('sphere',x,1,z,r*1.25,.55,r*.73,RGB.shadow,0,0,0,.46);}
    function hero(p,s){
      const h=s.hero,tt=s.time*9,moving=p.moving||false,sw=Math.sin(tt)*(moving?.65:.055),bob=(moving?Math.abs(Math.sin(tt))*.95:Math.sin(tt*.36)*.35),f=p.facing||0;
      const colors=h==='warrior'?['#55ceb5','#276d80','#f9c98d']:h==='archer'?['#e9a54d','#8b6c41','#f9c98d']:['#b394fa','#6955b2','#f9c98d'];
      const x=p.x,z=p.y;shadow(x,z,p.r+5);
      for(let i of [-1,1]){
        part('cylinder',x+i*6,8+bob,z+i*sw*6,4.5,16,4.5,h==='warrior'?'#293f57':'#303a5c',f,sw*i*.75);
        part('sphere',x+i*6,2+bob,z+i*sw*7+3,6,3.5,8,'#243442');
      }
      part('sphere',x,23+bob,z,13,16,10,colors[0],f);
      part('box',x,24+bob,z,13,18,13,colors[1],f);
      part('sphere',x,43+bob,z,11,12,10,colors[2],f);
      part('sphere',x-4,45+bob,z+9,1.45,1.7,1.7,'#172938');part('sphere',x+4,45+bob,z+9,1.45,1.7,1.7,'#172938');
      part('sphere',x,51+bob,z,12.5,4,11.5,h==='warrior'?'#c2d7e3':h==='archer'?'#8f683d':'#765ccc');
      if(h==='mage')part('cone',x,61+bob,z,12,20,12,'#9978e9');
      const hit=(p.attackPose||0)/.33;
      for(const side of [-1,1]){
        const swing=side===1?hit*1.35:sw*.25;
        part('cylinder',x+side*16,28+bob+hit*3,z+side*sw*3,4.5,18,4.5,colors[0],f,swing);
        part('sphere',x+side*16,19+bob+hit*3,z+side*sw*3,4,4,4,colors[2]);
      }
      if(h==='warrior'){
        part('box',x+22,26+bob+hit*15,z+hit*8,3.5,28,4,'#bce8f0',-hit*1.3,hit*.8,0.18);
        part('box',x+20,17+bob+hit*15,z+hit*8,12,3,5,'#f6cd77');
        part('cylinder',x-23,25+bob,z,2.5,20,2.5,'#c8ab73');part('sphere',x-23,25+bob,z,10,13,4,'#54a8aa');
      }else if(h==='archer'){
        part('cylinder',x+21,30+bob+hit*8,z,2.5,30,2.5,'#b67a4e',.15+hit*.6);
        part('sphere',x+21,30+bob+hit*8,z,4,18,5,'#e2bc72');
      }else{
        part('cylinder',x+21,32+bob+hit*7,z,3,40,3,'#d7bf8c',.2+hit*.4);
        part('sphere',x+21,54+bob+hit*7,z,7,7,7,'#be8fff',0,0,.65);
      }
      if(p.invuln>0){part('sphere',x,28,z,25,29,25,'#81ffdb',0,0,.32,.20);}
    }
    function enemy(e,t){
      const x=e.x,z=e.y,R=e.r,osc=Math.sin(t*5+e.id)*1.7,boss=e.boss,elite=e.elite;
      const species=boss?'boss':e.kind||'slime';
      const palettes={slime:['#4ab99c','#b2f4be'],bat:['#8f81db','#d5b7fa'],skeleton:['#e5e4d2','#ffffff'],golem:['#888eaa','#c1c7d9'],wisp:['#7ac9db','#d3f6ff'],boss:['#d96890','#ffc5a6']};
      const [body,face]=palettes[species]||palettes.slime;
      shadow(x,z,R);
      const y=12+R*.30+osc,hit=e.hit?'#fff1cc':body;
      if(species==='bat'){
        for(const dir of [-1,1])part('cone',x+dir*R*.80,y+4,z, R*.9,8,R*.34,'#7765be',0,dir*.30);
      }
      if(species==='golem'){
        part('box',x,y-1,z,R*1.65,R*1.55,R*1.45,hit,.17);
        part('box',x,y+R*.67,z+2,R*1.16,R*.61,R*1.15,face);
        for(const dir of [-1,1])part('box',x+dir*R*.80,y-8,z,9,15,12,'#66768b');
      }else if(species==='skeleton'){
        part('cylinder',x,y-8,z,9,17,8,hit);
        part('sphere',x,y+R*.62,z, R*.75,R*.65,R*.68,face);
      }else if(species==='wisp'){
        part('sphere',x,y+11,z,R*.76,R*1.04,R*.70,hit,0,0,.14);
        part('cone',x,y-3,z,R*.62,R*1.25,R*.62,face,0,Math.PI);
      }else{
        part('sphere',x,y,z,R*.91,R*.86,R*.80,hit);
        part('sphere',x,y+R*.39,z+4,R*.70,R*.47,R*.64,face);
      }
      const eyeHeight=species==='skeleton'?y+R*.65:y+R*.38;
      for(const dir of [-1,1]){
        part('sphere',x+dir*R*.27,eyeHeight,z+R*.70,Math.max(2,R*.13),Math.max(2,R*.15),2.4,'#24394d');
        part('sphere',x+dir*R*.27+1,eyeHeight+1,z+R*.74,1.15,1.3,1.0,'#ffffff',0,0,.12);
      }
      if(species==='slime'||species==='bat')for(const dir of [-1,1])part('cone',x+dir*R*.48,y+R*.62,z-4,Math.max(3,R*.19),R*.52,Math.max(3,R*.19),face);
      if(boss){
        part('cylinder',x,y+R*1.07,z,14,5,14,'#eebc63');
        for(let i=-1;i<=1;i++)part('cone',x+i*12,y+R*1.29,z,5,18,5,'#ffe19c');
      }else if(elite){part('sphere',x,y+R*.96,z,6,6,6,'#ffe5a5',0,0,.32);}
    }
    function drop(d,t){const x=d.x,z=d.y,bob=2.6*Math.sin(d.phase),r=d.r;
      shadow(x,z,r+3);const golden=d.gold,col=golden?'#ffcb58':'#66f2d1';
      part('cone',x,15+bob,z,r+2,21,r+2,col,d.phase*.24,0,.4);
      part('cone',x,12+bob,z,r+2,15,r+2,golden?'#fff0ac':'#c4fff0',d.phase*.24,Math.PI,.24);
      part('sphere',x,20+bob,z,r*.35,r*.55,r*.35,'#ffffff',0,0,.55);
    }
    function decor(x,z,n,t){if(n%3===0){part('sphere',x,6,z,22,11,17,'#7a9f97');part('sphere',x-5,12,z-4,12,5,10,'#b4d6bd');}
      else if(n%3===1){part('cylinder',x,15,z,4,28,4,'#8d8268');part('cone',x,28,z,20,37,20,'#4caa7f');part('cone',x,38,z,15,32,15,'#80c990');}
      else{part('sphere',x,4,z,13,6,11,'#5bad82');part('sphere',x+7,6,z-4,8,8,8,'#7bca9b');}}
    function render(s,w,h,dpr){
      width=w;height=h;const W=Math.min(1800,Math.max(300,Math.round(w*dpr))),H=Math.min(1200,Math.max(300,Math.round(h*dpr)));
      if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
      gl.viewport(0,0,W,H);gl.clearColor(.41,.56,.45,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      if(!s.player){cameraX=1050;cameraZ=725;init=false;}else if(!init){cameraX=s.player.x;cameraZ=s.player.y;init=true;}
      else{cameraX+=(s.player.x-cameraX)*.16;cameraZ+=(s.player.y-cameraZ)*.16;}
      const viewHeight=clamp(h>550?660:700,620,750),viewWidth=viewHeight*w/h;
      const eye=[260,1180,1340],target=[0,0,0]; // R12: more Diablo-like oblique camera, higher but clearly slanted for a calmer reading angle.
      vp=mul(ortho(viewWidth,viewHeight,.1,3200),lookAt(eye,target));gl.uniformMatrix4fv(loc.vp,false,vp);
      // A genuine depth-tested 3D arena viewed by an orthographic isometric camera.
      part('box',cameraX,-14,cameraZ,viewWidth*2,20,viewHeight*2,'#739d80');
      const grid=108,minX=Math.floor((cameraX-viewWidth)/grid),maxX=Math.ceil((cameraX+viewWidth)/grid),minZ=Math.floor((cameraZ-viewHeight)/grid),maxZ=Math.ceil((cameraZ+viewHeight)/grid);
      for(let i=minX;i<=maxX;i++)for(let j=minZ;j<=maxZ;j++){
        const x=(i+.5)*grid,z=(j+.5)*grid;
        const d=Math.abs(Math.sin(i*19.77+j*41.3));
        tile(x,z,grid-3,grid-3, (i+j)%2?'#789e81':'#6f9478');
        if(d>.88&&Math.hypot(x-(s.player?.x||cameraX),z-(s.player?.y||cameraZ))>170)decor(x+18,z+22,Math.abs(i*13+j*7)%3,s.time||0);
      }
      if(!s.player)return;
      // Opaque scene draws use true 3D geometry and depth testing.
      const t=s.time;
      for(const d of s.drops){if(Math.abs(d.x-cameraX)<viewWidth*.65&&Math.abs(d.y-cameraZ)<viewHeight*.72)drop(d,t);}
      for(const e of s.enemies){if(!e.dead&&Math.abs(e.x-cameraX)<viewWidth*.65+e.r&&Math.abs(e.y-cameraZ)<viewHeight*.72+e.r)enemy(e,t);}
      hero(s.player,s);
      for(const q of s.shots){
        if(q.hero==='archer'){
          const yaw=Math.atan2(q.vy,q.vx)+Math.PI/2;
          part('cylinder',q.x,24,q.y,1.8,16,1.8,'#ffd18a',yaw,1.57,.22);
          part('cone',q.x,24,q.y,3.2,8,3.2,'#fff1c6',yaw,1.57,.10);
        }else if(q.hero==='mage'){
          part('sphere',q.x,28,q.y,q.r,q.r,q.r,q.color,0,0,.68);
          part('sphere',q.x,28,q.y,q.r*.45,q.r*.45,q.r*.45,'#ffffff',0,0,.25);
        }else{
          part('sphere',q.x,26,q.y,q.r,q.r,q.r,q.color,0,0,.60);
        }
      }
      for(const q of s.enemyShots)part('sphere',q.x,23,q.y,q.r,q.r,q.r,'#ff679b',0,0,.4);
      for(let i=0;i<Math.min(s.particles.length,85);i++){const p=s.particles[i];part('sphere',p.x,8+(1-p.life/p.max)*16,p.y,p.r,p.r,p.r,p.color,0,0,.22);}
      if(s.stats.orbit){for(let i=0;i<Math.min(12,s.stats.orbit);i++){const a=t*3+i/Math.max(1,s.stats.orbit)*6.283;
        part('cone',s.player.x+Math.cos(a)*57,32,s.player.y+Math.sin(a)*57,7,27,7,'#b1ffea',a,0,.23);}}
    }
    function project(x,y,z){if(!vp)return {x:-100,y:-100,visible:false};x-=cameraX;z-=cameraZ;const a=vp;
      const X=a[0]*x+a[4]*y+a[8]*z+a[12],Y=a[1]*x+a[5]*y+a[9]*z+a[13],Z=a[2]*x+a[6]*y+a[10]*z+a[14],T=a[3]*x+a[7]*y+a[11]*z+a[15];
      return{x:(X/T*.5+.5)*width,y:(.5-Y/T*.5)*height,visible:Z/T>-1&&Z/T<1};}
    function resetCamera(){init=false;}
    let ready=true;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;canvas.style.visibility='hidden';},false);
    return {get ready(){return ready;},render,project,resetCamera};
  }
  return {create};
})();
