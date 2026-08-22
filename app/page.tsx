"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Step = { title: string; verb: string; desc: string; hint: string; tool: string; mode: "drop" | "rub" };
type TileTrace = { id: string; name: string; subtitle: string; description: string; anchor: [number, number, number]; imagePosition: string };

const tileTraces: TileTrace[] = [
  { id: "cloth", name: "포목흔", subtitle: "기와에 남은 직물의 흔적", description: "기와 안쪽을 가까이 살펴보면 서로 다른 두 방향으로 교차하는 가느다란 선들이 촘촘하게 반복됩니다. 이는 기와를 성형할 때 와통에 씌운 통보(筒布)의 직물조직이 부드러운 점토에 눌려 전사된 포목흔(布目痕)입니다. 통보는 점토가 나무 와통에 직접 달라붙는 것을 막고 성형이 끝난 뒤 기와를 쉽게 분리할 수 있도록 사용되었습니다. 제작이 끝나면서 통보는 사라졌지만, 천의 조직은 기와 내면에 그대로 남았습니다.이 미세한 직물조직을 보다 분명하게 확인하기 위해 3D 스캔으로 취득한 형상에 AO(Ambient Occlusion)를 적용했습니다. AO는 좁은 홈이나 서로 가까이 맞닿은 요철을 상대적으로 어둡게 표현하여, 일반적인 텍스처에서는 흐릿하게 보이는 미세한 선의 윤곽과 연속성을 선명하게 보여주는 가시화 방법입니다. 이를 통해 포목흔을 구성하는 두 방향의 조직을 구분하고, 일정한 영역을 설정하여 실자국의 폭과 간격, 단위면적 안에서 확인되는 조직의 수와 배열을 비교했습니다.여기에서 측정되어 얻을 수 있는 값은 단순히 통보를 구성했던 원단의 모양이 아니라, 점토에 전사되어 현재까지 남은 실자국의 폭과 조직밀도 등의 정보입니다. 조직의 조밀도와 배열, 상대적인 굵기를 통해 제작에 사용된 통보의 특성을 살펴볼 수 있습니다.포목흔은 단순히 기와 표면에 남은 무늬가 아닙니다. 현재는 사라진 통보와 와통 성형과정을 다시 확인할 수 있게 하는 제작의 기록입니다. 웹뷰어에서 원본 3D 데이터와 AO 가시화를 전환하며 두 방향의 직물조직과 그 간격, 밀도의 차이를 직접 살펴보실 수 있습니다.", anchor: [.27, .36, .70], imagePosition: "28% 35%" },
  { id: "paddle", name: "타날흔", subtitle: "타날판이 남긴 반복 문양", description: "점토를 와통에 밀착시키고 두께를 고르게 만들기 위해 타날판으로 두드린 흔적입니다. 문양이 겹친 방향을 관찰하면 타날의 순서와 도구의 움직임을 추정할 수 있습니다.", anchor: [.48, .55, .77], imagePosition: "52% 52%" },
  { id: "knife", name: "인장", subtitle: "두 개의 인장이 남긴 것", description: "기와 외면에는 다른 제작흔과 구별되는 두 개의 원형 압흔이 남아 있습니다. 내부에는 글자로 보이는 획이 확인되며, 육안으로도 어느 정도 형태를 살펴볼 수 있습니다. 이번에는 3D 스캔으로 취득한 형상에 곡률맵(Curvature Map)을 적용하여 압흔 안쪽의 미세한 굴곡을 조금 더 분명하게 확인했습니다. 곡률맵은 표면이 휘거나 꺾이는 정도를 명암이나 색의 차이로 강조해, 얕게 눌린 획과 주변 표면을 구분하기 쉽게 보여주는 가시화 방법입니다. 이를 통해 두 압흔의 내부 획을 살펴본 결과 각각 ‘巳’와 ‘刀’로 읽힐 가능성을 확인했습니다.이처럼 문자나 기호가 새겨진 도장을 기와가 아직 마르기 전에 눌러 찍은 것을 일반적으로 인장와(印章瓦) 또는 인각와(印刻瓦)라 부릅니다. 백제의 인장와는 특히 사비기 유적에서 다수 확인되며, 한 글자만 찍은 경우도 있고 둘 이상의 인장을 조합해 사용한 사례도 있습니다. ‘巳’와 ‘刀’ 역시 백제 수키와에서 함께 확인되는 조합으로 알려져 있어, 이 기와의 두 압흔을 해석할 때 비교할 수 있는 중요한 사례가 됩니다.그렇다면 왜 기와에 이런 글자나 기호를 남겼을까요? 인장와는 단순한 장식으로 보기 어렵습니다. 기와가 대량으로 생산되고 여러 제작집단과 생산공정이 운영되는 과정에서 생산·관리와 관련된 표식으로 사용되었을 가능성이 오래전부터 논의되어 왔습니다. 일부 문자는 제작집단이나 행정단위, 생산 시기 등과 연결해 해석되기도 하지만, 모든 인장의 의미가 명확하게 밝혀진 것은 아닙니다. 같은 문자라도 출토 장소와 다른 인장과의 조합에 따라 의미가 달라질 가능성이 있기 때문에 개별 인장의 기능을 하나로 단정하기는 어렵습니다.따라서 이 기와에서 확인되는 ‘巳’와 ‘刀’ 역시 특정 제작자나 관청을 곧바로 가리킨다고 보지는 않습니다. 중요한 것은 기와 제작 과정에서 일정한 표식을 의도적으로 남겼다는 사실이며, 이러한 인장와가 당시 기와 생산이 단순한 개별 작업을 넘어 일정한 관리와 체계 속에서 이루어졌을 가능성을 보여주는 자료라는 점입니다.웹뷰어에서 실제 표면과 곡률맵을 비교해보세요. 육안으로 보이는 두 압흔과 곡률맵에서 강조되는 획을 살펴보며 ‘巳’와 ‘刀’로 추정한 형태를 직접 확인하실 수 있습니다.", anchor: [.72, .43, .64], imagePosition: "72% 42%" },
  { id: "trim", name: "합철흔", subtitle: "천과 천이 만난 자리", description: "기와 내면의 규칙적인 포목흔을 따라가다 보면 주변의 포목흔과 달리 길게 이어지는 선형 흔적을 발견할 수 있습니다. 그 안에는 작은 종적으로 눌린 압흔도 반복적으로 나타납니다. 이러한 흔적은 와통에 씌운 통보의 양쪽 끝을 서로 꿰매 연결하면서 형성된 합철흔(合綴痕)일 가능성이 있습니다. 통보의 봉제부가 부드러운 점토에 눌리면 직물조직과 다른 형태의 이음매가 기와 안쪽에 남을 수 있습니다.이 흔적의 성격을 확인하기 위해 3D 스캔 데이터를 확대하고 AO와 음영 가시화를 적용했습니다. AO는 깊게 들어간 선과 그 안의 작은 요철을 강조해, 육안으로는 하나의 굵은 선처럼 보이던 영역을 보다 세밀하게 관찰할 수 있게 합니다. 이를 통해 선형 흔적의 진행방향과 폭, 반복되는 작은 압흔의 수와 간격, 흔적 양쪽에서 포목조직이 이어지는 방식을 살펴보았습니다. 일정한 간격으로 압흔이 반복되거나 이음선을 경계로 조직의 흐름이 달라진다면 봉제된 통보가 점토에 전사되었을 가능성을 보다 구체적으로 검토할 수 있습니다.웹뷰어에서 긴 선형 흔적을 따라 이동하며 반복되는 압흔과 주변의 포목조직이 어떻게 이어지는지 직접 비교해보실 수 있습니다.", anchor: [.61, .72, .70], imagePosition: "60% 73%" },
];


function ParticleStory() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const textureCanvas = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const splitRef = useRef(.5);
  const splitDragOffset = useRef(0);
  const splitDragging = useRef(false);
  const [split, setSplit] = useState(50);
  const [meshReady, setMeshReady] = useState(false);
  const [activeTrace, setActiveTrace] = useState<TileTrace | null>(null);

  useEffect(()=>{
    if(!activeTrace) return;
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape") setActiveTrace(null)};
    addEventListener("keydown",close);
    return()=>removeEventListener("keydown",close);
  },[activeTrace]);

  useEffect(()=>{
    const move=(event:globalThis.PointerEvent)=>{
      if(!splitDragging.current) return;
      const sticky=section.current?.querySelector<HTMLElement>(".particle-sticky");
      if(!sticky) return;
      const bounds=sticky.getBoundingClientRect();
      const next=Math.max(8,Math.min(92,((event.clientX-splitDragOffset.current-bounds.left)/bounds.width)*100));
      splitRef.current=next/100;
      setSplit(next);
    };
    const stop=()=>{splitDragging.current=false};
    addEventListener("pointermove",move);
    addEventListener("pointerup",stop);
    addEventListener("pointercancel",stop);
    return()=>{removeEventListener("pointermove",move);removeEventListener("pointerup",stop);removeEventListener("pointercancel",stop)};
  },[]);

  useEffect(() => {
    let points: number[][] = [], faces: number[][] = [], landmarkFaces: number[][] = [], frame = 0, progress = 0, lastDraw = 0, center = [0,0,0];
    let alive = true, comparisonEnabled = false, yaw = 0, pitch = 0, yawVelocity = 0, pitchVelocity = 0, dragging = false, lastX = 0, lastY = 0;
    let gl: WebGLRenderingContext | null = null, glProgram: WebGLProgram | null = null, glIndexCount = 0, textureImage: HTMLImageElement | null = null;
    let glUniforms: { center: WebGLUniformLocation | null; modelMin: WebGLUniformLocation | null; modelRange: WebGLUniformLocation | null; viewport: WebGLUniformLocation | null; scale: WebGLUniformLocation | null; yaw: WebGLUniformLocation | null; pitch: WebGLUniformLocation | null } | null = null;
    let glModelMin=[0,0,0],glModelRange=[1,1,1];
    const seeds = (i: number) => {
      const a = Math.sin(i * 91.733) * 43758.5453;
      const b = Math.sin(i * 47.113 + 2) * 24634.6345;
      return [a - Math.floor(a), b - Math.floor(b)];
    };
    fetch("/tile-model/tile.obj").then(r => r.text()).then(text => {
      const lines = text.split("\n");
      const vertexRows=lines.filter(l => l.startsWith("v ")).map(l => l.trim().split(/\s+/).slice(1).map(Number));
      points = vertexRows.map(row=>row.slice(0,3));
      faces = lines.filter(l => l.startsWith("f ")).map(l => l.trim().split(/\s+/).slice(1).map(x=>Number(x)-1));
      center = [0,1,2].map(axis => { const values=points.map(p=>p[axis]); return (Math.min(...values)+Math.max(...values))/2; });
      const mins=[0,1,2].map(axis=>Math.min(...points.map(p=>p[axis]))), maxs=[0,1,2].map(axis=>Math.max(...points.map(p=>p[axis])));
      landmarkFaces=tileTraces.map(trace=>{
        const target=trace.anchor.map((ratio,axis)=>mins[axis]+(maxs[axis]-mins[axis])*ratio);
        let nearest=faces[0], nearestDistance=Infinity;
        for(const face of faces){
          const centroid=[0,1,2].map(axis=>face.reduce((sum,index)=>sum+points[index][axis],0)/face.length);
          const distance=centroid.reduce((sum,value,axis)=>sum+(value-target[axis])**2,0);
          if(distance<nearestDistance){nearestDistance=distance;nearest=face;}
        }
        return nearest;
      });
    });
    const compileShader=(context:WebGLRenderingContext,type:number,source:string)=>{const shader=context.createShader(type)!;context.shaderSource(shader,source);context.compileShader(shader);if(!context.getShaderParameter(shader,context.COMPILE_STATUS))throw new Error(context.getShaderInfoLog(shader)||"WebGL shader error");return shader};
    const loadTextureModel=async()=>{
      const target=textureCanvas.current;if(!target)return;
      const [binary,imageBlob]=await Promise.all([fetch("/tile-model/tile-webgl-v2.bin").then(response=>response.arrayBuffer()),fetch("/tile-model/tile-texture-4k-v2.webp").then(response=>response.blob())]);
      if(!alive)return;
      const imageUrl=URL.createObjectURL(imageBlob);textureImage=new Image();textureImage.src=imageUrl;await textureImage.decode();URL.revokeObjectURL(imageUrl);
      gl=target.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;
      const vertexShader=compileShader(gl,gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec2 aUv;uniform vec3 uCenter;uniform vec3 uModelMin;uniform vec3 uModelRange;uniform vec2 uViewport;uniform float uScale;uniform float uYaw;uniform float uPitch;varying vec2 vUv;void main(){vec3 p=(uModelMin+aPosition*uModelRange)-uCenter;float cy=cos(uYaw),sy=sin(uYaw);float xr=p.x*cy+p.z*sy;float zr=-p.x*sy+p.z*cy;float cp=cos(uPitch),sp=sin(uPitch);float yr=p.y*cp-zr*sp;float depth=p.y*sp+zr*cp;gl_Position=vec4(2.0*xr*uScale/uViewport.x,2.0*(yr-depth*.12)*uScale/uViewport.y,-depth/420.0,1.0);vUv=aUv;}`);
      const fragmentShader=compileShader(gl,gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D uTexture;varying vec2 vUv;void main(){vec3 color=texture2D(uTexture,vUv).rgb;color=(color-.5)*1.06+.54;gl_FragColor=vec4(color,1.0);}`);
      glProgram=gl.createProgram()!;gl.attachShader(glProgram,vertexShader);gl.attachShader(glProgram,fragmentShader);gl.linkProgram(glProgram);gl.useProgram(glProgram);
      const view=new DataView(binary),vertexCount=view.getUint32(0,true),indexCount=view.getUint32(4,true),positionOffset=32,uvOffset=positionOffset+vertexCount*6,indexOffset=(uvOffset+vertexCount*4+3)&~3;
      glModelMin=[view.getFloat32(8,true),view.getFloat32(12,true),view.getFloat32(16,true)];glModelRange=[view.getFloat32(20,true),view.getFloat32(24,true),view.getFloat32(28,true)];
      if(!gl.getExtension("OES_element_index_uint"))throw new Error("32-bit WebGL indices are not supported");
      const positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Uint16Array(binary,positionOffset,vertexCount*3),gl.STATIC_DRAW);const positionLocation=gl.getAttribLocation(glProgram,"aPosition");gl.enableVertexAttribArray(positionLocation);gl.vertexAttribPointer(positionLocation,3,gl.UNSIGNED_SHORT,true,0,0);
      const uvBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Uint16Array(binary,uvOffset,vertexCount*2),gl.STATIC_DRAW);const uvLocation=gl.getAttribLocation(glProgram,"aUv");gl.enableVertexAttribArray(uvLocation);gl.vertexAttribPointer(uvLocation,2,gl.UNSIGNED_SHORT,true,0,0);
      const indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(binary,indexOffset,indexCount),gl.STATIC_DRAW);glIndexCount=indexCount;
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,textureImage);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);
      glUniforms={center:gl.getUniformLocation(glProgram,"uCenter"),modelMin:gl.getUniformLocation(glProgram,"uModelMin"),modelRange:gl.getUniformLocation(glProgram,"uModelRange"),viewport:gl.getUniformLocation(glProgram,"uViewport"),scale:gl.getUniformLocation(glProgram,"uScale"),yaw:gl.getUniformLocation(glProgram,"uYaw"),pitch:gl.getUniformLocation(glProgram,"uPitch")};gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
    };
    loadTextureModel().catch(error=>console.error("Tile WebGL initialization failed",error));
    const onScroll = () => {
      if (!section.current) return;
      const r = section.current.getBoundingClientRect();
      progress = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
      comparisonEnabled = progress >= .78; setMeshReady(comparisonEnabled);
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (progress < .55 || !canvas.current) return;
      dragging = true; yawVelocity = 0; pitchVelocity = 0; lastX = event.clientX; lastY = event.clientY;
      canvas.current.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: globalThis.PointerEvent) => {
      if (!dragging) return;
      const deltaX = event.clientX - lastX, deltaY = event.clientY - lastY;
      yaw += deltaX * .012; pitch += deltaY * .012;
      yawVelocity = deltaX * .0018; pitchVelocity = deltaY * .0018;
      lastX = event.clientX; lastY = event.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const draw = (time = 0) => {
      if (!alive || !canvas.current) return;
      if (time - lastDraw < 32) { frame=requestAnimationFrame(draw); return; }
      lastDraw = time;
      const c = canvas.current, ctx = c.getContext("2d")!;
      const dpr = Math.min(devicePixelRatio, innerWidth < 760 ? 1.15 : 1.5), w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w*dpr || c.height !== h*dpr) { c.width=w*dpr; c.height=h*dpr; }
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.clearRect(0,0,w,h);
      const eased = progress < .08 ? 0 : 1 - Math.pow(1 - Math.min(1,(progress-.08)/.7), 3);
      const scale = Math.min(w/460,h/270) * (.72 + eased*.24);
      if (eased > .82 && !dragging) {
        yaw += .0022 + yawVelocity; pitch += pitchVelocity;
        yawVelocity *= .94; pitchVelocity *= .94;
      }
      const rot = (1-eased)*.42 + yaw*eased;
      const projected: Point[] = new Array(points.length);
      for(let i=0;i<points.length;i++){
        const [vx,vy,vz]=points[i], x=vx-center[0], y=vy-center[1], z=vz-center[2], [rx,ry]=seeds(i);
        const xr=x*Math.cos(rot)+z*Math.sin(rot), zr=-x*Math.sin(rot)+z*Math.cos(rot);
        const yr=y*Math.cos(pitch)-zr*Math.sin(pitch), depth=y*Math.sin(pitch)+zr*Math.cos(pitch);
        const tx=xr*scale, ty=(-yr+depth*.12)*scale;
        const sx=(rx-.5)*w*1.8, sy=(ry-.5)*h*1.7;
        const px=w/2+sx*(1-eased)+tx*eased, py=h/2+sy*(1-eased)+ty*eased;
        projected[i] = {x:px,y:py};
      }
      const comparisonReady = comparisonEnabled;
      const dividerX = comparisonReady ? w * splitRef.current : w;
      if(gl&&glProgram&&glUniforms&&textureCanvas.current){
        const textureDpr=Math.min(devicePixelRatio,innerWidth<760?1:1.25),textureTarget=textureCanvas.current;
        if(textureTarget.width!==w*textureDpr||textureTarget.height!==h*textureDpr){textureTarget.width=w*textureDpr;textureTarget.height=h*textureDpr;gl.viewport(0,0,textureTarget.width,textureTarget.height)}
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(glProgram);gl.uniform3f(glUniforms.center,center[0]||0,center[1]||0,center[2]||0);gl.uniform3f(glUniforms.modelMin,glModelMin[0],glModelMin[1],glModelMin[2]);gl.uniform3f(glUniforms.modelRange,glModelRange[0],glModelRange[1],glModelRange[2]);gl.uniform2f(glUniforms.viewport,w,h);gl.uniform1f(glUniforms.scale,scale);gl.uniform1f(glUniforms.yaw,rot);gl.uniform1f(glUniforms.pitch,pitch);gl.drawElements(gl.TRIANGLES,glIndexCount,gl.UNSIGNED_INT,0);
      }
      ctx.save(); ctx.beginPath(); ctx.rect(0,0,dividerX,h); ctx.clip();
      ctx.fillStyle = `rgba(245,245,240,${.18 + eased*.72})`;
      const size=eased>.75?1.15:.8;
      for (const point of projected) if(point) ctx.fillRect(point.x,point.y,size,size);
      ctx.restore();
      for(let markerIndex=0;markerIndex<landmarkFaces.length;markerIndex++){
        const marker=markerRefs.current[markerIndex], face=landmarkFaces[markerIndex];
        if(!marker || !face) continue;
        const surface=face.map(index=>projected[index]).filter(Boolean);
        if(surface.length<3) continue;
        const px=surface.reduce((sum,point)=>sum+point.x,0)/surface.length, py=surface.reduce((sum,point)=>sum+point.y,0)/surface.length;
        const [a,b,d]=surface, isFrontFacing=(b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x)<=0;
        marker.style.transform=`translate3d(${px}px,${py}px,0)`;
        const isOnTexture=comparisonReady && isFrontFacing && px>dividerX+18 && px<w-30 && py>30 && py<h-30;
        marker.style.opacity=isOnTexture ? "1" : "0";
        marker.style.pointerEvents=isOnTexture ? "auto" : "none";
      }
      frame=requestAnimationFrame(draw);
    };
    const target = canvas.current;
    addEventListener("scroll",onScroll,{passive:true}); addEventListener("resize",onScroll);
    target?.addEventListener("pointerdown",onPointerDown); target?.addEventListener("pointermove",onPointerMove);
    target?.addEventListener("pointerup",onPointerUp); target?.addEventListener("pointercancel",onPointerUp);
    onScroll(); draw();
    return()=>{alive=false;if(textureImage)textureImage.src="";cancelAnimationFrame(frame);removeEventListener("scroll",onScroll);removeEventListener("resize",onScroll);target?.removeEventListener("pointerdown",onPointerDown);target?.removeEventListener("pointermove",onPointerMove);target?.removeEventListener("pointerup",onPointerUp);target?.removeEventListener("pointercancel",onPointerUp)};
  },[]);

  const setComparisonSplit = (value: number) => {
    const next = Math.max(8, Math.min(92, value));
    splitRef.current = next / 100;
    setSplit(next);
  };
  const startComparisonHandle = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const bounds = event.currentTarget.getBoundingClientRect();
    splitDragOffset.current = event.clientX - (bounds.left + bounds.width / 2);
    splitDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return <>
    <section className="black-intro" id="top"><div className="intro-index">瓦 · DIGITAL ARCHIVE</div><h1>기와가<br/>기억하는 손</h1><p>아래로 천천히 스크롤하세요</p><i/></section>
    <section className="particle-story" ref={section}><div className="particle-sticky"><canvas ref={textureCanvas} className={`texture-canvas ${meshReady?"ready":""}`} style={{clipPath:`inset(0 0 0 ${split}%)`}} aria-hidden="true"/><canvas ref={canvas} className="particle-canvas" aria-label="처음에는 점으로 형성되고 완성 후 왼쪽 점군과 오른쪽 고화질 텍스처로 비교하는 3D 기와"/><div className={`mesh-split ${meshReady?"ready":""}`} style={{left:`${split}%`}}><i/><span>POINT</span><b>TEXTURE</b></div><button className={`mesh-handle ${meshReady?"ready":""}`} style={{left:`${split}%`}} type="button" role="slider" aria-label="점군과 텍스처 비교 막대" aria-valuemin={8} aria-valuemax={92} aria-valuenow={Math.round(split)} onPointerDown={startComparisonHandle} onPointerUp={()=>{splitDragging.current=false}} onPointerCancel={()=>{splitDragging.current=false}} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowDown"){event.preventDefault();setComparisonSplit(split-2)}else if(event.key==="ArrowRight"||event.key==="ArrowUp"){event.preventDefault();setComparisonSplit(split+2)}else if(event.key==="Home"){event.preventDefault();setComparisonSplit(8)}else if(event.key==="End"){event.preventDefault();setComparisonSplit(92)}}}>↔</button>{tileTraces.map((trace,index)=><button key={trace.id} ref={element=>{markerRefs.current[index]=element}} className={`trace-marker ${meshReady?"ready":""}`} onClick={()=>setActiveTrace(trace)} aria-label={`${trace.name} 상세 보기`}><i/><span>{String(index+1).padStart(2,"0")}</span><b>{trace.name}</b></button>)}<div className="particle-copy"><span>01 · 형상의 기록</span><h2>점에서 질감으로<br/>형상을 비교합니다</h2><p>{meshReady?"표면의 번호를 눌러 제작 흔적을 자세히 살펴보세요":"점들이 모두 모이면 막대를 움직여 점군과 실제 표면 질감을 비교할 수 있습니다"}</p></div><div className="scroll-meter"><i/></div></div></section>
    {activeTrace&&<div className="trace-modal" role="dialog" aria-modal="true" aria-labelledby="trace-title" onClick={()=>setActiveTrace(null)}><article onClick={event=>event.stopPropagation()}><button className="trace-close" onClick={()=>setActiveTrace(null)} aria-label="상세 창 닫기">×</button><div className="trace-photo"><img src="/tile-model/tile-texture-4k-v2.webp" alt={`${activeTrace.name} 고화질 사진`} style={{objectPosition:activeTrace.imagePosition}}/><span>HIGH RESOLUTION DETAIL</span></div><div className="trace-content"><span>PRODUCTION TRACE · {String(tileTraces.indexOf(activeTrace)+1).padStart(2,"0")}</span><h2 id="trace-title">{activeTrace.name}</h2><h3>{activeTrace.subtitle}</h3><p>{activeTrace.description}</p><small>고화질 사진에서 표면의 미세한 요철과 도구 흔적을 관찰해 보세요.</small></div></article></div>}
    <section className="film-section" id="film"><div className="film-heading"><span>02 · 영상 기록</span><h2>흙에서 지붕까지</h2><p>제작 과정 영상이 준비되면 이 공간에 연결됩니다.</p></div><div className="film-frame"><div className="film-placeholder"><button aria-label="영상 재생 자리">▶</button><b>FILM PLACEHOLDER</b><span>16 : 9 · VIDEO</span></div></div></section>
  </>;
}

const steps: Step[] = [
  { title: "흙 고르기", verb: "모든 기와는, 흙을 고르는 일에서 시작됩니다.", desc: "기와 만들기는 알맞은 흙을 준비하는 것에서 시작합니다. 채취한 흙에 섞인 돌과 뿌리 같은 이물질을 골라내고, 점토의 상태가 고르게 되도록 다듬습니다. 이렇게 준비한 점토는 이후 일정한 두께와 형태를 만들고, 건조와 소성 과정에서 기와가 안정적으로 형태를 유지할 수 있는 바탕이 됩니다", hint: "가는 점토·고운 점토·굵은 모래, 세 가지 재료를 고르세요.", tool: "흙", mode: "drop" },
  { title: "소지 작업", verb: "둥근 기와도 처음에는 평평한 흙판이었습니다.", desc: "잘 고른 점토를 충분히 다지고 일정한 크기로 나눈 뒤, 겹쳐 쌓아 하나의 점토 덩어리로 만듭니다. 이를 다시 일정한 두께로 잘라 기와의 몸체가 될 점토판을 마련합니다. 아직은 평평한 흙판이지만, 이 점토판이 다음 단계에서 와통의 곡면을 따라 둥근 수키와의 형태를 갖추게 됩니다", hint: "왼쪽 점토 3개를 틀에 쌓고, 쨀줄로 3장의 흙판을 가로로 잘라내세요.", tool: "쨀줄", mode: "rub" },
  { title: "통보 씌우기", verb: "기와를 만들기 위한 조연들", desc: "점토판을 붙이기 전에 나무로 만든 와통에 통보(筒布)를 고르게 둘러줍니다. 통보는 점토가 와통에 직접 달라붙는 것을 막아 나중에 쉽게 분리할 수 있도록 돕습니다. 점토가 통보 위에서 눌리면 천의 직물조직과 이음매가 그대로 전사되어 완성된 기와 안쪽에 포목흔과 합철흔으로 남게 됩니다.", hint: "접힌 천을 원통와통 중앙으로 옮기세요.", tool: "통보", mode: "drop" },
  { title: "와통에 흙 붙이기", verb: "평평한 흙에서, 곡선의 기와로", desc: "통보를 씌운 와통 둘레에 준비한 점토판을 감아 붙입니다. 점토판의 양 끝이 맞닿는 부분을 연결하고, 손이나 도구로 누르고 두드리며 와통의 곡면에 밀착시킵니다. 이 과정에서 평평했던 점토판은 와통의 형태를 따라 둥근 곡면을 얻고, 기와의 기본적인 두께와 형태도 함께 만들어집니다.", hint: "흙판을 원통와통 중앙으로 옮기세요.", tool: "흙판", mode: "drop" },
  { title: "외면 다듬기", verb: "손질은 또다른 흔적으로", desc: "와통 위에서 기본 형태를 갖춘 점토의 외면을 다시 다듬습니다. 물을 묻혀 문지르거나 손, 솔과 같은 여러 도구를 이용하면 성형 과정에서 생긴 거친 요철을 줄이고 표면을 정리할 수 있습니다. 이러한 마무리 과정은 기와의 표면을 고르게 만드는 동시에, 사용한 손과 도구의 움직임을 새로운 제작흔으로 남기기도 합니다.", hint: "붓을 잡고 거친 흙 표면 전체를 문질러보세요.", tool: "붓", mode: "rub" },
  { title: "와통 분리", verb: "뿌리는 흔적을 남긴다.", desc: "점토가 형태를 유지할 만큼 굳으면 성형을 위해 사용했던 와통과 통보를 조심스럽게 빼냅니다. 와통과 천은 기와에서 사라지지만, 와통이 만든 곡면과 통보의 조직은 점토에 그대로 남습니다. 앞에서 살펴본 포목흔과 합철흔도 바로 이 단계에서 도구를 걷어낸 뒤 기와의 안쪽에 모습을 드러냅니다.", hint: "와통 손잡이를 잡고 위쪽으로 여러 번 끌어올리세요.", tool: "와통", mode: "rub" },
  { title: "분할 및 건조", verb: "지붕의 유려한 궁륭으로", desc: "둥글게 성형된 점토는 그대로 사용하는 것이 아니라 두 장의 수키와로 나누어야 합니다. 와도(瓦刀)를 이용해 성형체의 양쪽에 길게 분할선을 내어 이후 일정한 방향으로 갈라질 수 있도록 합니다. 이때 점토를 완전히 잘라내기보다 일정한 깊이의 홈을 내고, 형태가 흐트러지지 않도록 충분히 건조합니다.", hint: "와도를 잡고 점선을 따라 위에서 아래로 그으세요.", tool: "와도", mode: "rub" },
  { title: "와도질", verb: "다른 기와와 만나기 위해", desc: "와통에서 분리한 기와는 끝부분과 안쪽의 불필요하거나 두꺼운 점토를 다시 깎아 형태를 정리합니다. 특히 광단부의 내면을 얇고 평탄하게 다듬은 사례가 많이 확인되는데, 이는 지붕 위에서 앞뒤의 수키와가 서로 자연스럽게 겹쳐지도록 하기 위한 기능적인 조정으로 볼 수 있습니다. 마지막 와도질을 통해 한 장의 기와 형태가 완성됩니다.", hint: "칼을 잡고 기와 안쪽을 골고루 훑으세요.", tool: "손질칼", mode: "rub" },
  { title: "굽기", verb: "흙에서 기와로", desc: "모든 성형과 마무리가 끝난 기와는 가마에 넣기 전에 충분히 건조합니다. 수분이 많이 남은 상태에서 높은 열을 받으면 갈라지거나 깨질 수 있기 때문입니다. 충분히 마른 기와를 가마에서 높은 온도로 구우면 점토의 성질이 변하며 단단해지고, 오랫동안 지붕을 덮을 수 있는 건축재로 완성됩니다", hint: "부채를 잡고 불씨 위를 빠르게 부쳐보세요.", tool: "부채", mode: "rub" },];

const stepVideos: { src: string | null; label: string; filename: string }[] = [
  { src: "/videos/step-01.mp4", label: "흙을 살피고 고르는 실제 과정", filename: "STEP 01 흙 고르기.mp4" },
  { src: "/videos/step-02.mp4", label: "점토를 준비하고 소지를 만드는 과정", filename: "STEP 02 소지 작업.mp4" },
  { src: "/videos/step-03.mp4", label: "와통에 통보를 씌우는 과정", filename: "STEP 03 와통에 통보 씌우기.mp4" },
  { src: "/videos/step-04.mp4", label: "통보 위에 점토판을 붙이는 과정", filename: "STEP 04 와통에 점토판 붙이기.mp4" },
  { src: "/videos/step-05.mp4", label: "기와 외면을 정리하고 마무리하는 과정", filename: "STEP 05 외면 마무리.mp4" },
  { src: "/videos/step-06.mp4", label: "와통과 통보를 성형체에서 꺼내는 과정", filename: "STEP 06 와통과 통보 꺼내기.mp4" },
  { src: "/videos/step-07.mp4", label: "성형체를 2분할하고 건조하는 과정", filename: "STEP 07 2분할 및 건조.mp4" },
  { src: "/videos/step-08.mp4", label: "와도로 기와를 손질하는 과정", filename: "STEP 08 와도질.mp4" },
  { src: "/videos/step-09.mp4", label: "가마에서 기와를 소성하는 과정", filename: "STEP 09 소성.mp4" },
];

const clayPieces = [
  { x: 10, y: 45, good: true, c: "#a84e32", name: "가는 점토", detail: "점성이 좋고 입자가 고와요" },
  { x: 23, y: 41, good: false, c: "#c59a65", name: "잔돌이 많은 흙", detail: "성형하기 어렵고 균열가능성이 있어요" },
  { x: 36, y: 47, good: true, c: "#d1ad78", name: "굵은 모래", detail: "점토의 수축과 갈라짐을 줄이는 재료예요" },
  { x: 12, y: 63, good: false, c: "#5f5843", name: "유기질 흙", detail: "불순물이 많이 섞였어요" },
  { x: 25, y: 66, good: true, c: "#b05739", name: "고운 점토", detail: "매끈하고 잘 뭉쳐져요" },
  { x: 38, y: 62, good: false, c: "#777062", name: "자갈 섞인 흙", detail: "큰 돌 알갱이가 있어 성형에 방해돼요" },
];

function CraftGame({ step, onFinish }: { step: number; onFinish: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const finishFired = useRef(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [pos, setPos] = useState<Point>({ x: 14, y: 70 });
  const [rub, setRub] = useState(0);
  const [caught, setCaught] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [marks, setMarks] = useState<Point[]>([]);
  const [covered, setCovered] = useState<string[]>([]);
  const [stacked, setStacked] = useState(0);
  const brushPercent = Math.round((covered.length / 49) * 100);
  const cutCount = step === 1 ? Math.min(3, Math.floor(rub / 33)) : 0;
  const visibleClayLayers = step === 1 ? (stacked < 3 ? stacked : Math.max(0, 3 - cutCount)) : 0;
  const finished = step === 0 ? caught.length === 3 : step === 1 ? stacked >= 3 && rub >= 100 : step === 4 ? brushPercent >= 86 : rub >= 100;

  useEffect(() => { finishFired.current = false; setDrag(null); setPos({ x: 14, y: 70 }); setRub(0); setCaught([]); setWrong(null); setMarks([]); setCovered([]); setStacked(0); }, [step]);
  useEffect(() => {
    if (!finished || finishFired.current) return;
    finishFired.current = true;
    const t = window.setTimeout(onFinish, 500);
    return () => window.clearTimeout(t);
  }, [finished, onFinish]);

  const point = (e: PointerEvent): Point => {
    const r = box.current!.getBoundingClientRect();
    return { x: Math.max(3, Math.min(97, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(5, Math.min(94, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const start = (e: PointerEvent, id = 99) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(id); setPos(point(e)); };
  const move = (e: PointerEvent) => {
    if (drag === null) return;
    const p = point(e); setPos(p);
    if (steps[step].mode === "rub" && p.x > 24 && p.x < 82 && p.y > 18 && p.y < 82 && !(step === 1 && stacked < 3)) {
      if (step === 4) {
        if (p.x >= 39 && p.x <= 67 && p.y >= 22 && p.y <= 78) {
          const col = Math.max(0, Math.min(6, Math.floor(((p.x - 39) / 28) * 7)));
          const row = Math.max(0, Math.min(6, Math.floor(((p.y - 22) / 56) * 7)));
          const cells: string[] = [];
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const cx = col + dx, cy = row + dy;
            if (cx >= 0 && cx < 7 && cy >= 0 && cy < 7) cells.push(`${cx}-${cy}`);
          }
          setCovered(old => Array.from(new Set([...old, ...cells])));
        }
      } else {
        if (step === 1) {
          if (Math.abs(p.x - pos.x) > 1.2) setRub(v => Math.min(100, v + .82));
        } else if (step !== 5 || p.y < pos.y) setRub(v => Math.min(100, v + (step === 5 ? 1.45 : 1.05)));
        if (step !== 5) setMarks(m => [...m.slice(-78), p]);
      }
    }
  };
  const end = () => {
    if (drag === null) return;
    if (step === 0 && drag < 6) {
      const inBasket = pos.x > 66 && pos.y > 48;
      if (inBasket && clayPieces[drag].good) setCaught(c => c.includes(drag) ? c : [...c, drag]);
      else if (inBasket) { setWrong(drag); window.setTimeout(() => setWrong(null), 650); }
    } else if (step === 1 && drag >= 10 && drag < 15) {
      if (pos.x > 38 && pos.x < 67 && pos.y > 22 && pos.y < 82) setStacked(v => Math.min(3, v + 1));
      setPos({ x: 14, y: 70 });
    } else if (steps[step].mode === "drop") {
      if (pos.x > 39 && pos.x < 70 && pos.y > 22 && pos.y < 83) setRub(100);
      else setPos({ x: 14, y: 70 });
    }
    setDrag(null);
  };

  const toolName = ["", "쨀줄", "통보", "흙판", "붓", "와통 손잡이", "와도", "손질칼", "부채"][step];

  return <div className={`craft-game game-${step} ${finished ? "game-finished" : ""}`} ref={box} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
    <div className="game-head"><span>{finished ? "✓ 체험 성공" : "마우스·손가락으로 직접 움직여보세요"}</span><b>{step === 0 ? `${caught.length}/3` : step === 1 && stacked < 3 ? `${stacked}/3 쌓기` : `${step === 4 ? brushPercent : Math.round(rub)}%`}</b></div>
    {step === 0 ? <>
      <div className="clay-group-label">여러 흙이 섞여 있어요</div>
      {clayPieces.map((p, i) => !caught.includes(i) && <button key={i} aria-label={`${p.name}: ${p.detail}`} data-name={p.name} data-detail={p.detail} className={`clay-piece ${wrong === i ? "wrong" : ""}`} style={{ left: `${drag === i ? pos.x : p.x}%`, top: `${drag === i ? pos.y : p.y}%`, background: p.c }} onPointerDown={e => start(e, i)} />)}
      <div className={`basket ${drag !== null ? "ready" : ""}`}><i/><span>좋은 흙 바구니</span><small>{caught.length ? "●".repeat(caught.length) : "여기에 놓기"}</small></div>
    </> : <>
      <div className={`work-target scene-${step}`}>
        {step === 1 ? <div className={`clay-frame ${visibleClayLayers===0?"frame-empty":""}`}><span>점토 적층 틀</span><div className="stacked-clay">{Array.from({length:visibleClayLayers},(_,i)=><i key={i}/>)}</div>{stacked>=3&&<div className="cut-sheets">{Array.from({length:cutCount},(_,i)=><i key={i}/>)}</div>} {stacked===0&&<small className="empty-label">비어 있음</small>}</div>
        : step === 5 ? <div className="release-scene"><div className="tile-shell"/><div className="mold-pull" style={{ transform: `translateY(${-rub * 1.35}px)` }}><i/></div></div>
        : step === 7 ? <div className="inner-tile"><span>기와 안쪽 · 내면</span>{marks.map((_,i)=><i key={i} className="inner-groove" style={{left:`${20+(i%8)*8}%`,top:`${18+(Math.floor(i/8)%6)*12}%`,transform:`rotate(${-4+(i%3)*4}deg)`}}/>)}</div>
        : step === 8 ? <div className="kiln"><div className="fired-tile"/><div className="fire" style={{ filter: `saturate(${1 + rub / 35})`, transform: `scale(${.7 + rub / 280})` }}>♨</div></div>
        : <div className="target-cylinder bare-mold">
            {(step > 2 || (step === 2 && finished)) && <i className="target-cloth"/>}
            {(step > 3 || (step === 3 && finished)) && <i className="target-clay"/>}
          </div>}
        {step === 4 && <div className="brush-coverage" aria-hidden="true">{Array.from({ length: 49 }, (_, i) => {
          const col = i % 7, row = Math.floor(i / 7), painted = covered.includes(`${col}-${row}`);
          return <i key={i} className={painted ? "painted" : ""} />;
        })}</div>}
        {step !== 7 && step !== 5 && marks.map((m, i) => <i key={i} className="work-mark" style={{ left: `${m.x}%`, top: `${m.y}%`, opacity: .15 + i / 90 }}/>) }
        {step === 6 && <div className="split-tile" style={{ "--split": `${rub / 18}px` } as CSSProperties}><i className="split-left"/><i className="split-right"/><b className="cut-line" style={{ height: `${rub}%` }}/></div>} 
      </div>
      {step === 1 && stacked < 3 ? <div className="vertical-clay-row">{Array.from({length:3-stacked},(_,i)=>{const id=10+stacked+i;return <button key={id} className="stack-lump" style={{left:`${drag===id?pos.x:16}%`,top:`${drag===id?pos.y:35+i*22}%`}} onPointerDown={e=>start(e,id)} aria-label="점토 덩어리 옮기기"/>})}</div> : <button className={`drag-tool tool-${step}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onPointerDown={e => start(e)} aria-label={`${toolName} 드래그`}><i/>{toolName}</button>}
    </>}
    <div className="game-instruction">{finished ? "체험 완료! 영상까지 끝까지 보면 다음 단계가 열립니다." : step===1&&stacked<3 ? "왼쪽 점토 3개를 직사각형 틀 안에 차곡차곡 놓으세요." : step===1 ? "쨀줄을 좌우로 당겨 흙판 3장을 잘라내세요." : steps[step].hint}</div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [craftDone, setCraftDone] = useState<number[]>([]);
  const [videoDone, setVideoDone] = useState<number[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [remoteVideos, setRemoteVideos] = useState<Record<number, string>>({});
  const progress = Math.round(done.length / 9 * 100);
  const unlocked = Math.min(8, done.length);
  const activeVideo = stepVideos[active].src || remoteVideos[active + 1];

  useEffect(() => {
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!projectUrl || !publishableKey) return;

    fetch(`${projectUrl}/rest/v1/step_videos?select=step,video_url&order=step.asc`, {
      headers: { apikey: publishableKey },
    })
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`Supabase ${response.status}`)))
      .then((rows: { step: number; video_url: string | null }[]) => {
        setRemoteVideos(Object.fromEntries(rows.filter(row => row.video_url).map(row => [row.step, row.video_url!])))
      })
      .catch(error => console.warn("단계별 영상 정보를 불러오지 못했습니다.", error));
  }, []);

  useEffect(() => {
    if (done.includes(active) || !craftDone.includes(active) || !videoDone.includes(active)) return;
    setDone(current => current.includes(active) ? current : [...current, active]);
    if (active < 8) {
      const timer = window.setTimeout(() => setActive(current => current === active ? active + 1 : current), 850);
      return () => window.clearTimeout(timer);
    }
    setCelebrate(true);
  }, [active, craftDone, videoDone]);

  const finish = () => setCraftDone(current => current.includes(active) ? current : [...current, active]);
  const finishVideo = () => setVideoDone(current => current.includes(active) ? current : [...current, active]);
  const reset = () => { setActive(0); setDone([]); setCraftDone([]); setVideoDone([]); setCelebrate(false); };

  return <main>
    <header className="topbar dark-nav"><a className="brand" href="#top"><span className="brand-mark">瓦</span><span>와공방</span></a><nav><a href="#film">영상</a><a href="#experience">제작 체험</a></nav><a className="mini-cta" href="#experience">체험 시작</a></header>
    <ParticleStory />

    <section className="learn" id="learn"><div><p className="eyebrow light"><span/> 03 · 도구의 구조</p><h2>와통과 통보,<br/>곡률을 만드는 한 쌍</h2></div><div className="learn-card"><b>瓦桶 <small>와통</small></b><p>기와에 일정한 곡률을 주는 원통형 성형틀입니다. 같은 크기의 기와를 반복해 만들 수 있게 합니다.</p></div><div className="learn-card"><b>筒褓 <small>통보</small></b><p>와통과 점토 사이에 두르는 천입니다. 점토가 붙는 것을 막고 내면에 직물결을 남깁니다.</p></div></section>

    <section className="experience" id="experience"><div className="section-heading"><div><p className="eyebrow"><span/> 04 · 손으로 배우는 아홉 단계</p><h2>기와 제작 체험</h2></div><p>도구를 잡고 작업 영역으로 움직여보세요.<br/>마우스와 터치 모두 사용할 수 있습니다.</p></div>
      <div className="progress-wrap"><div className="progress-meta"><span>나의 제작 여정</span><strong>{progress}% 완성</strong></div><div className="progress"><i style={{width:`${progress}%`}}/></div></div>
      <div className="step-strip">{steps.map((s,i)=><button key={s.title} disabled={i > unlocked} aria-label={i > unlocked ? `${s.title}, 이전 단계를 먼저 완료하세요` : s.title} className={`${active===i?"active":""} ${done.includes(i)?"done":""} ${i>unlocked?"locked":""}`} onClick={()=>{ if(i<=unlocked) setActive(i); }}><span>{done.includes(i)?"✓":i>unlocked?"🔒":String(i+1).padStart(2,"0")}</span><b>{s.title}</b></button>)}</div>
      <article className="workbench interactive"><div className="step-number"><span>STEP</span>{String(active+1).padStart(2,"0")}</div><div className="step-content"><span className="tag">{steps[active].tool} 체험</span><h3>{steps[active].verb}</h3><p>{steps[active].desc}</p>
        <div className="experience-duo">
          <div className="hands-on-panel"><div className="panel-label"><span>INTERACTIVE</span><b>직접 체험</b></div><CraftGame key={active} step={active} onFinish={finish}/></div>
          <div className="step-video-panel"><div className="panel-label"><span>DOCUMENTARY</span><b>{videoDone.includes(active) ? "✓ 영상 시청 완료" : "끝까지 시청해야 완료"}</b></div><div className={`step-video-frame ${videoDone.includes(active) ? "video-complete" : ""}`}>
            {activeVideo ? <video key={`${active}-${activeVideo}`} controls playsInline preload="metadata" src={activeVideo} onEnded={finishVideo}/>
            : <div className="step-video-empty"><i>▶</i><strong>{steps[active].title}</strong><p>{stepVideos[active].label}</p><small>영상 파일 자리 · 16:9</small><code>public/videos/{stepVideos[active].filename}</code></div>}
          </div></div>
        </div>
        <aside><b>장인의 한마디</b><p>{steps[active].hint}</p></aside><div className="actions">{active>0&&<button className="back" onClick={()=>setActive(active-1)}>← 이전 단계</button>}{done.includes(active)&&active<8&&<button className="complete" onClick={()=>setActive(active+1)}>다음 단계 →</button>}</div></div></article>
    </section>

    <footer><div className="brand"><span className="brand-mark">瓦</span><span>와공방</span></div><p>흙에서 지붕까지, 우리 건축의 시간을 잇습니다.</p><button onClick={reset}>체험 처음부터 ↺</button></footer>
    {celebrate&&<div className="celebrate" role="dialog" aria-modal="true"><div><span>瓦</span><p>아홉 번의 손길을 모두 마쳤습니다</p><h2>나만의 기와 완성!</h2><button onClick={reset}>다시 만들어보기</button><button className="close" onClick={()=>setCelebrate(false)}>닫기</button></div></div>}
  </main>;
}
