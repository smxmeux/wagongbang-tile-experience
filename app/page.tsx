"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Step = { title: string; verb: string; desc: string; hint: string; tool: string; mode: "drop" | "rub" };
type TileTrace = { id: string; name: string; subtitle: string; description: string; anchor: [number, number, number]; imagePosition: string };

const tileTraces: TileTrace[] = [
  { id: "cloth", name: "포목흔", subtitle: "기와에 남은 직물의 흔적", description: `기와의 안쪽을 자세히 살펴보면 가느다란 선들이 서로 가로질러 촘촘히 흔적을 남기고 있는 것을 보실 수 있습니다. 이는 기와를 성형할 때 와통에 씌운 통보(筒布)의 직물조직이 부드러운 점토에 눌려 전사된 포목흔(布目痕)입니다. 통보는 점토가 나무 와통에 직접 달라붙는 것을 막고 성형이 끝난 뒤 기와를 쉽게 분리할 수 있도록 사용되었습니다.

이러한 흔적을 보다 분명하게 확인하기 위해서 3D 스캔으로 취득한 형상에 AO(Ambient Occlusion)맵을 적용했습니다. AO맵은 좁은 홈이나 서로 가까이 맞닿은 요철을 상대적으로 어둡게 표현하여, 일반적인 텍스처에서는 흐릿하게 보이는 미세한 선의 윤곽과 연속성을 선명하게 보여주는 가시화 방법입니다. 이를 통해 점토에 찍혀 남아있는 실자국의 폭이나 굵기와 같은 정보를 취득할 수 있습니다. 웹뷰어에서 원본 3D 데이터와 AO맵 가시화를 전환하며 두 방향의 직물조직과 그 간격, 밀도의 차이를 직접 살펴보실 수 있습니다.`, anchor: [.27, .36, .70], imagePosition: "72% 78%" },
  { id: "stitch", name: "합철흔", subtitle: "천과 천이 만난 자리", description: `기와 내면의 규칙적인 포목흔을 따라가다 보면 주변의 포목흔과 달리 길게 이어지는 선형 흔적을 발견할 수 있습니다. 이 흔적의 성격을 확인하기 위해 3D 스캔 데이터를 확대하고 AO와 음영 가시화를 적용했습니다. AO는 깊게 들어간 선과 그 안의 작은 요철을 강조해, 육안으로는 하나의 굵은 선처럼 보이던 영역을 보다 세밀하게 관찰할 수 있게 합니다. 그 안에는 작은 종적으로 눌린 압흔도 반복적으로 나타납니다. 이러한 흔적은 와통에 씌운 통보의 양쪽 끝을 서로 꿰매 연결하면서 형성된 합철흔(合綴痕)일 가능성으로 추론하고 있습니다. 웹뷰어에서 긴 선형 흔적을 따라 이동하며 반복되는 압흔과 주변의 포목조직이 어떻게 이어지는지 직접 비교해보실 수 있습니다.`, anchor: [.61, .72, .70], imagePosition: "52% 15%" },
  { id: "knife", name: "와도질", subtitle: "한 장의 기와를 마무리하다", description: `큰 틀에서의 형태를 만드는 ‘성형’이 끝난 뒤에는 단부와 가장자리의 불필요한 점토를 제거하고 겉면을 매끈하게 조정하는 마무리 작업이 이어지게 됩니다. 이 기와의 경우에도 광단부, 즉 폭이 넓은 하단을 살펴보면 주변과 구별되는 비교적 평탄한 면과 일정한 방향으로 이어지는 선형 흔적을 확인할 수 있습니다. 이는 와도(瓦刀)와 같은 도구로 점토를 깎아 단부를 정리하면서 남은 흔적입니다. 광단부의 깎기흔은 완성된 기와의 형태 뒤에 남아 있는 마지막 조정과 정리의 과정을 보여줍니다. 웹뷰어에서 모델을 직접 돌려보며 원래 표면과 깎여 나간 면의 경계, 절삭선의 방향과 단부의 두께 변화를 살펴보실 수 있습니다.`, anchor: [.38, .09, .58], imagePosition: "10% 55%" },
  { id: "outer", name: "외면부 흔적", subtitle: "빛을 바꾸자 드러난 흔적", description: `기와의 외면에는 성형과 마무리 과정에서 생긴 여러 흔적이 겹쳐 남아 있습니다. 점토를 두드리며 생긴 타날흔, 표면을 쓸거나 문지른 정면(整面)흔, 물을 이용해 요철을 다듬은 물손질흔, 손으로 누르거나 쓸어 생긴 흔적, 단단한 도구로 긁거나 깎은 조정흔 등이 대표적입니다. 일부에서는 나무결과 비슷한 평행선이나 붓·솔과 같은 섬유성 도구를 사용한 것으로 보이는 가느다란 선형 흔적도 확인됩니다. 이러한 미세 흔적은 3D 스캔 데이터에 RS맵(Radiance Scailing)을 적용해 보다 정확히 관찰할 수 있습니다. RS는 표면의 작은 오목·볼록과 곡률에 따른 명암을 강조하여 형상을 변형하지 않고 육안으로 잘 보이지 않는 선과 요철을 보다 선명하게 보여주는 디지털 가시화 방법입니다. 웹뷰어에서 원본 표면과 RS를 전환하며 평소에는 흐릿했던 선들이 어떻게 드러나는지, 그리고 여러 선이 어떤 방향으로 반복되는지 직접 확인해보실 수 있습니다.`, anchor: [.44, .54, .23], imagePosition: "24% 55%" },
  { id: "finger", name: "지두흔", subtitle: "디지털 가시화로 읽어낸 장인의 손길", description: `기와 표면에는 도구의 흔적뿐 아니라 제작자가 점토를 직접 만지면서 남긴 흔적도 있습니다. 일부 영역에서는 주변보다 넓고 완만하게 움푹 들어간 형상이 반복적으로 확인됩니다. 이러한 부분을 3D 형상으로 살펴본 결과, 손가락 끝으로 아직 부드러운 점토를 누르거나 밀어 조정하면서 생긴 지두흔(指頭痕)으로 해석할 수 있었습니다. 지두흔은 특정 제작자의 신원을 알려주는 표식은 아니지만 사람의 손이 직접 개입했던 위치와 움직임을 확인하게 해주는 흔적이라고 할 수 있습니다.

눈으로만 볼 때는 표면의 색 차이나 오염이 실제 요철처럼 보일 수 있기 때문에, 이번 분석에서는 3D 데이터에 주변 표면을 기준으로 어느 부분이 얼마나 깊게 들어가거나 돌출되어 있는지를 색이나 명암의 단계로 보여주는 가시화 방법인 심도맵을 적용했습니다. 이를 통해 텍스처에서 얼룩처럼 보이던 부분이 실제로 점토가 눌려 만들어진 함몰인지, 주변보다 어느 정도 깊은지를 보다 쉽게 구분할 수 있습니다. 웹뷰어에서 원본 표면과 심도맵을 비교하며 손가락이 눌린 것으로 보이는 부분의 형태와 깊이를 직접 확인해보실 수 있습니다.`, anchor: [.30, .64, .23], imagePosition: "65% 55%" },
  { id: "fingerprint", name: "지문", subtitle: "손끝에 남은 가장 작은 흔적", description: `토기나 기와처럼 점토로 만든 유물에는 제작자의 손이 직접 닿으면서 지문이 남기도 합니다. 고고학에서는 토제품 등에서 이러한 지문이 확인되며 제작 과정에서 사람이 유물에 직접 접촉했던 흔적으로 연구되고 있습니다.

토제품에 남은 지문은 오늘날 종이에 찍은 지문처럼 완전한 형태로 남는 경우만 있는 것은 아닙니다. 손가락 일부가 스치거나 눌린 경우에는 몇 줄만 남기도 하며, 이후 표면을 다시 문지르거나 다듬으면 먼저 생긴 지문이 일부 지워질 수도 있습니다.

이 기와에서도 손가락의 융선과 비슷한 미세한 선형 흔적이 일부 관찰됩니다. 이러한 미세한 형상을 살펴보기 위해 3D 데이터를 확대하고 AO맵과 음영맵을 이용할 수 있습니다. AO맵은 좁은 홈을 상대적으로 어둡게 표현해 미세선의 연속성을 쉽게 보이게 하며, 음영맵은 표면이 향한 방향에 따라 빛을 달리 표현하여 작은 홈과 돌출을 구분하는 데 도움을 줍니다. 다만 현재의 형태만으로 이를 지문이라고 확정할 수는 없습니다. 이러한 가시화는 흔적을 지문으로 판정하는 기술이 아니라, 이미 기록된 표면을 보다 자세히 관찰하기 위한 방법입니다.

웹뷰어에서 표면을 확대하고 가시화를 전환하며, 지문에서 나타날 수 있는 미세한 반복선과 이 기와에 남은 선형 흔적을 직접 비교해보실 수 있습니다.`, anchor: [.68, .60, .23], imagePosition: "80% 60%" },
  { id: "seal", name: "인장", subtitle: "두 개의 인장이 남긴 것", description: `기와 외면에는 다른 제작흔과 구별되는 두 개의 도장으로 찍은 듯한 원형 압흔이 남아 있습니다. 내부에는 글자로 보이는 획이 확인되며, 육안으로도 어느 정도 형태를 살펴볼 수 있습니다. 이처럼 문자나 기호가 새겨진 도장을 기와가 아직 마르기 전에 눌러 찍은 것을 일반적으로 인장와(印章瓦) 또는 인각와(印刻瓦)라 부릅니다. 백제의 인장와는 특히 사비기 유적에서 다수 확인되며, 한 글자만 찍은 경우도 있고 둘 이상의 인장을 조합해 사용한 사례도 있습니다. ‘巳’와 ‘刀’ 역시 백제 수키와에서 함께 확인되는 조합으로 알려져 있어, 이 기와의 두 압흔을 해석할 때 비교할 수 있는 중요한 사례가 됩니다.

표면이 휘거나 꺾이는 정도를 명암이나 색의 차이로 강조해, 얕게 눌린 획과 주변 표면을 구분하기 쉽게 보여주는 가시화 방법인 곡률맵을 사용하여 압흔 안쪽의 미세한 굴곡을 조금 더 분명하게 확인했습니다. 웹뷰어에서 실제 표면과 곡률맵을 비교해보세요. 육안으로 보이는 두 압흔과 곡률맵에서 강조되는 획을 살펴보며 ‘巳’와 ‘刀’로 추정한 형태를 직접 확인하실 수 있습니다.`, anchor: [.54, .18, .23], imagePosition: "66% 7%" },
];

const traceAnchors: Record<string, [number, number, number]> = {
  cloth: [.50, .50, .70],
  stitch: [.70, .50, .70],
};
const traceNumbers: Record<string, number> = { cloth: 1, stitch: 2, knife: 3, seal: 4, outer: 5, finger: 6, fingerprint: 7 };
const traceImages: Record<string, { src: string; label: string; position: string }> = {
  cloth: { src: "/trace-images/cloth.webp", label: "AO MAP · 포목흔", position: "50% 48%" },
  stitch: { src: "/trace-images/stitch.webp", label: "AO DETAIL · 합철흔", position: "50% 50%" },
  knife: { src: "/trace-images/knife.webp", label: "SURFACE DETAIL · 와도질", position: "50% 60%" },
  seal: { src: "/trace-images/seal.webp", label: "CURVATURE MAP · 인장", position: "50% 42%" },
  outer: { src: "/trace-images/outer.webp", label: "RS MAP · 외면부 흔적", position: "50% 50%" },
  finger: { src: "/trace-images/finger.webp", label: "DEPTH MAP · 지두흔", position: "58% 50%" },
  fingerprint: { src: "/trace-images/fingerprint.webp", label: "MACRO DETAIL · 지문", position: "50% 48%" },
};
tileTraces.forEach(trace=>{ if(traceAnchors[trace.id]) trace.anchor=traceAnchors[trace.id]; });
tileTraces.sort((a,b)=>traceNumbers[a.id]-traceNumbers[b.id]);
const traceTexturePoints: Record<string, [number, number]> = {
  cloth: [.50, .55],
  stitch: [.16, .50],
  knife: [.10, .55],
  seal: [.66, .07],
  outer: [.24, .55],
  finger: [.65, .55],
  fingerprint: [.80, .60],
};


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
    let points: number[][] = [], faces: number[][] = [], landmarkFaces: number[][] = [], frame = 0, progress = 0, lastDraw = 0, center = [0,0,0], gatheringStart = 0, gatheringStarted = false;
    let alive = true, comparisonEnabled = false, yaw = 0, pitch = 0, yawVelocity = 0, pitchVelocity = 0, dragging = false, lastX = 0, lastY = 0;
    let gl: WebGLRenderingContext | null = null, glProgram: WebGLProgram | null = null, glIndexCount = 0;
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
        const target=(traceAnchors[trace.id]??trace.anchor).map((ratio,axis)=>mins[axis]+(maxs[axis]-mins[axis])*ratio);
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
    const loadPolygonModel=async()=>{
      const target=textureCanvas.current;if(!target)return;
      const binary=await fetch("/tile-model/tile-webgl-v2.bin").then(response=>response.arrayBuffer());
      if(!alive)return;
      gl=target.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;
      if(!gl.getExtension("OES_standard_derivatives"))throw new Error("Polygon edge rendering is not supported");
      const vertexShader=compileShader(gl,gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec3 aBarycentric;uniform vec3 uCenter;uniform vec3 uModelMin;uniform vec3 uModelRange;uniform vec2 uViewport;uniform float uScale;uniform float uYaw;uniform float uPitch;varying vec3 vBarycentric;varying vec3 vViewPosition;void main(){vec3 p=(uModelMin+aPosition*uModelRange)-uCenter;float cy=cos(uYaw),sy=sin(uYaw);float xr=p.x*cy+p.z*sy;float zr=-p.x*sy+p.z*cy;float cp=cos(uPitch),sp=sin(uPitch);float yr=p.y*cp-zr*sp;float depth=p.y*sp+zr*cp;vViewPosition=vec3(xr,yr,depth);vBarycentric=aBarycentric;gl_Position=vec4(2.0*xr*uScale/uViewport.x,2.0*(yr-depth*.12)*uScale/uViewport.y,-depth/420.0,1.0);}`);
      const fragmentShader=compileShader(gl,gl.FRAGMENT_SHADER,`#extension GL_OES_standard_derivatives : enable\nprecision mediump float;varying vec3 vBarycentric;varying vec3 vViewPosition;void main(){vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));if(!gl_FrontFacing)normal=-normal;vec3 lightDirection=normalize(vec3(-.35,.62,.7));float light=.3+.7*abs(dot(normal,lightDirection));light=floor(light*7.0)/7.0;float edge=min(min(vBarycentric.x,vBarycentric.y),vBarycentric.z);float line=smoothstep(0.0,fwidth(edge)*1.15,edge);vec3 faceColor=vec3(.58,.6,.61)*light;vec3 color=mix(vec3(.075,.08,.085),faceColor,line);gl_FragColor=vec4(color,1.0);}`);
      glProgram=gl.createProgram()!;gl.attachShader(glProgram,vertexShader);gl.attachShader(glProgram,fragmentShader);gl.linkProgram(glProgram);gl.useProgram(glProgram);
      const view=new DataView(binary),vertexCount=view.getUint32(0,true),indexCount=view.getUint32(4,true),positionOffset=32,uvOffset=positionOffset+vertexCount*6,indexOffset=(uvOffset+vertexCount*4+3)&~3;
      glModelMin=[view.getFloat32(8,true),view.getFloat32(12,true),view.getFloat32(16,true)];glModelRange=[view.getFloat32(20,true),view.getFloat32(24,true),view.getFloat32(28,true)];
      const packedPositions=new Uint16Array(binary,positionOffset,vertexCount*3),sourceIndices=new Uint32Array(binary,indexOffset,indexCount),expandedPositions=new Uint16Array(indexCount*3),barycentrics=new Uint8Array(indexCount*3);
      for(let index=0;index<indexCount;index++){const source=sourceIndices[index];expandedPositions[index*3]=packedPositions[source*3];expandedPositions[index*3+1]=packedPositions[source*3+1];expandedPositions[index*3+2]=packedPositions[source*3+2];barycentrics[index*3+(index%3)]=255}
      const positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,expandedPositions,gl.STATIC_DRAW);const positionLocation=gl.getAttribLocation(glProgram,"aPosition");gl.enableVertexAttribArray(positionLocation);gl.vertexAttribPointer(positionLocation,3,gl.UNSIGNED_SHORT,true,0,0);
      const barycentricBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,barycentricBuffer);gl.bufferData(gl.ARRAY_BUFFER,barycentrics,gl.STATIC_DRAW);const barycentricLocation=gl.getAttribLocation(glProgram,"aBarycentric");gl.enableVertexAttribArray(barycentricLocation);gl.vertexAttribPointer(barycentricLocation,3,gl.UNSIGNED_BYTE,true,0,0);glIndexCount=indexCount;
      glUniforms={center:gl.getUniformLocation(glProgram,"uCenter"),modelMin:gl.getUniformLocation(glProgram,"uModelMin"),modelRange:gl.getUniformLocation(glProgram,"uModelRange"),viewport:gl.getUniformLocation(glProgram,"uViewport"),scale:gl.getUniformLocation(glProgram,"uScale"),yaw:gl.getUniformLocation(glProgram,"uYaw"),pitch:gl.getUniformLocation(glProgram,"uPitch")};gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
    };
    loadPolygonModel().catch(error=>console.error("Tile polygon initialization failed",error));
    const startGathering = () => {
      if (gatheringStarted) return;
      gatheringStarted = true;
      gatheringStart = performance.now();
    };
    const onWheel = (event: globalThis.WheelEvent) => {
      if (event.deltaY <= 0 || !section.current) return;
      const r = section.current.getBoundingClientRect();
      if (r.top <= innerHeight * 1.02 && r.bottom > 0) startGathering();
    };
    const onScroll = () => {
      if (!section.current || gatheringStarted) return;
      const r = section.current.getBoundingClientRect();
      if (r.top < innerHeight * .82 && r.bottom > 0) startGathering();
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
      if(gatheringStarted && progress<1){progress=Math.min(1,(time-gatheringStart)/1500);if(progress>=.78&&!comparisonEnabled){comparisonEnabled=true;setMeshReady(true)}}
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
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(glProgram);gl.uniform3f(glUniforms.center,center[0]||0,center[1]||0,center[2]||0);gl.uniform3f(glUniforms.modelMin,glModelMin[0],glModelMin[1],glModelMin[2]);gl.uniform3f(glUniforms.modelRange,glModelRange[0],glModelRange[1],glModelRange[2]);gl.uniform2f(glUniforms.viewport,w,h);gl.uniform1f(glUniforms.scale,scale);gl.uniform1f(glUniforms.yaw,rot);gl.uniform1f(glUniforms.pitch,pitch);gl.drawArrays(gl.TRIANGLES,0,glIndexCount);
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
    addEventListener("wheel",onWheel,{passive:true}); addEventListener("scroll",onScroll,{passive:true}); addEventListener("resize",onScroll);
    target?.addEventListener("pointerdown",onPointerDown); target?.addEventListener("pointermove",onPointerMove);
    target?.addEventListener("pointerup",onPointerUp); target?.addEventListener("pointercancel",onPointerUp);
    onScroll(); draw();
    return()=>{alive=false;cancelAnimationFrame(frame);removeEventListener("wheel",onWheel);removeEventListener("scroll",onScroll);removeEventListener("resize",onScroll);target?.removeEventListener("pointerdown",onPointerDown);target?.removeEventListener("pointermove",onPointerMove);target?.removeEventListener("pointerup",onPointerUp);target?.removeEventListener("pointercancel",onPointerUp)};
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
    <section className="particle-story" ref={section}><div className="particle-sticky"><canvas ref={textureCanvas} className={`texture-canvas ${meshReady?"ready":""}`} style={{clipPath:`inset(0 0 0 ${split}%)`}} aria-hidden="true"/><canvas ref={canvas} className="particle-canvas" aria-label="포인트 클라우드와 폴리곤을 비교하며 회전할 수 있는 3D 기와"/><div className={`mesh-split ${meshReady?"ready":""}`} style={{left:`${split}%`}}><i/><span>POINT</span><b>POLYGON</b></div><button className={`mesh-handle ${meshReady?"ready":""}`} style={{left:`${split}%`}} type="button" role="slider" aria-label="포인트 클라우드와 폴리곤 비교 막대" aria-valuemin={8} aria-valuemax={92} aria-valuenow={Math.round(split)} onPointerDown={startComparisonHandle} onPointerUp={()=>{splitDragging.current=false}} onPointerCancel={()=>{splitDragging.current=false}} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowDown"){event.preventDefault();setComparisonSplit(split-2)}else if(event.key==="ArrowRight"||event.key==="ArrowUp"){event.preventDefault();setComparisonSplit(split+2)}else if(event.key==="Home"){event.preventDefault();setComparisonSplit(8)}else if(event.key==="End"){event.preventDefault();setComparisonSplit(92)}}}>↔</button><div className="particle-copy"><span>01 · 형상의 기록</span><h2>점에서 폴리곤으로<br/>형상을 비교합니다</h2><p>{meshReady?"막대를 좌우로 움직이고 기와를 회전해 점과 삼각 면의 차이를 비교하세요":"점들이 모두 모이면 포인트 클라우드와 폴리곤을 나누어 비교할 수 있습니다"}</p></div><div className="scroll-meter"><i/></div></div></section>
    <TraceViewer />
    <section className="film-section" id="film"><div className="film-heading"><span>02 · 영상 기록</span><h2>흙에서 지붕까지</h2><p>제작 과정 영상이 준비되면 이 공간에 연결됩니다.</p></div><div className="film-frame"><div className="film-placeholder"><button aria-label="영상 재생 자리">▶</button><b>FILM PLACEHOLDER</b><span>16 : 9 · VIDEO</span></div></div></section>
  </>;
}

function TraceViewer() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const surfaceLabelRef = useRef<HTMLDivElement>(null);
  const [activeTrace, setActiveTrace] = useState<TileTrace | null>(null);
  const [zoom, setZoom] = useState(1);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [, setTracePoints] = useState<Record<string,[number,number]>>(traceTexturePoints);
  const zoomRef = useRef(1);
  const editingRef = useRef(false);
  const tracePointsRef = useRef<Record<string,[number,number]>>(traceTexturePoints);
  const applyTracePointsRef = useRef<((points:Record<string,[number,number]>)=>void)|null>(null);

  useEffect(()=>{ zoomRef.current=zoom; },[zoom]);
  useEffect(()=>{ editingRef.current=editing; },[editing]);
  useEffect(()=>{
    fetch("/api/trace-points",{cache:"no-store"})
      .then(response=>response.ok?response.json():Promise.reject(new Error(`Supabase ${response.status}`)))
      .then((rows:{id:string;u:number;v:number}[])=>{const next={...tracePointsRef.current,...Object.fromEntries(rows.map(row=>[row.id,[row.u,row.v] as [number,number]]))};tracePointsRef.current=next;setTracePoints(next);applyTracePointsRef.current?.(next)})
      .catch(error=>console.warn("포인트 위치를 불러오지 못했습니다.",error));
  },[]);
  useEffect(()=>{
    if(!activeTrace) return;
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setActiveTrace(null)};
    addEventListener("keydown",close); return()=>removeEventListener("keydown",close);
  },[activeTrace]);

  useEffect(()=>{
    const target=canvas.current;if(!target)return;
    let alive=true,frame=0,yaw=-.18,pitch=.08,verticalOffset=0,yawVelocity=0,dragging=false,userInteracted=false,lastX=0,lastY=0,markerDraggingIndex=-1,pinchDistance=0;
    const touchPointers=new Map<number,{x:number;y:number}>();
    let landmarkTriangles:number[][][]=[],center=[0,0,0];
    let packedPositions:Uint16Array|null=null,packedUvs:Uint16Array|null=null,packedIndices:Uint32Array|null=null,triangleCount=0;
    let gl:WebGLRenderingContext|null=null,program:WebGLProgram|null=null,indexCount=0,image:HTMLImageElement|null=null;
    let uniforms:{center:WebGLUniformLocation|null;modelMin:WebGLUniformLocation|null;modelRange:WebGLUniformLocation|null;viewport:WebGLUniformLocation|null;scale:WebGLUniformLocation|null;yaw:WebGLUniformLocation|null;pitch:WebGLUniformLocation|null;offsetY:WebGLUniformLocation|null}|null=null;
    let modelTexture:WebGLTexture|null=null;
    let modelMin=[0,0,0],modelRange=[1,1,1];
    const compile=(context:WebGLRenderingContext,type:number,source:string)=>{const shader=context.createShader(type)!;context.shaderSource(shader,source);context.compileShader(shader);if(!context.getShaderParameter(shader,context.COMPILE_STATUS))throw new Error(context.getShaderInfoLog(shader)||"shader error");return shader};
    const load=async()=>{
      const [binary,blob]=await Promise.all([fetch("/tile-model/tile-webgl-v2.bin").then(r=>r.arrayBuffer()),fetch("/tile-model/tile-texture-4k-v2.webp").then(r=>r.blob())]);
      if(!alive)return;
      const url=URL.createObjectURL(blob);image=new Image();image.src=url;await image.decode();URL.revokeObjectURL(url);
      gl=target.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;
      const vertex=compile(gl,gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec2 aUv;uniform vec3 uCenter;uniform vec3 uModelMin;uniform vec3 uModelRange;uniform vec2 uViewport;uniform float uScale;uniform float uYaw;uniform float uPitch;uniform float uOffsetY;varying vec2 vUv;void main(){vec3 p0=(uModelMin+aPosition*uModelRange)-uCenter;vec3 p=vec3(-p0.y,p0.x,p0.z);float cy=cos(uYaw),sy=sin(uYaw);float xr=p.x*cy+p.z*sy;float zr=-p.x*sy+p.z*cy;float cp=cos(uPitch),sp=sin(uPitch);float yr=p.y*cp-zr*sp;float depth=p.y*sp+zr*cp;gl_Position=vec4(2.0*xr*uScale/uViewport.x,2.0*(-yr+depth*.1)*uScale/uViewport.y-2.0*uOffsetY/uViewport.y,-depth/420.0,1.0);vUv=aUv;}`);
      const fragment=compile(gl,gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D uTexture;varying vec2 vUv;void main(){vec3 color=texture2D(uTexture,vUv).rgb;color=(color-.5)*1.1+.55;gl_FragColor=vec4(color,1.0);}`);
      program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.useProgram(program);
      const view=new DataView(binary),vertexCount=view.getUint32(0,true),count=view.getUint32(4,true),positionOffset=32,uvOffset=positionOffset+vertexCount*6,indexOffset=(uvOffset+vertexCount*4+3)&~3;indexCount=count;
      modelMin=[view.getFloat32(8,true),view.getFloat32(12,true),view.getFloat32(16,true)];modelRange=[view.getFloat32(20,true),view.getFloat32(24,true),view.getFloat32(28,true)];if(!gl.getExtension("OES_element_index_uint"))return;
      center=modelMin.map((value,axis)=>value+modelRange[axis]/2);
      packedPositions=new Uint16Array(binary,positionOffset,vertexCount*3);packedUvs=new Uint16Array(binary,uvOffset,vertexCount*2);packedIndices=new Uint32Array(binary,indexOffset,count);triangleCount=count;
      const buildLandmarks=(points:Record<string,[number,number]>)=>tileTraces.map(trace=>{const desiredUv=points[trace.id]??traceTexturePoints[trace.id];let bestTriangle=0,bestDistance=Infinity;for(let triangle=0;triangle<count;triangle+=3){const indices=[packedIndices![triangle],packedIndices![triangle+1],packedIndices![triangle+2]],centroidUv=[0,1].map(axis=>indices.reduce((sum,index)=>sum+packedUvs![index*2+axis]/65535,0)/3),distance=(centroidUv[0]-desiredUv[0])**2+(centroidUv[1]-desiredUv[1])**2;if(distance<bestDistance){bestDistance=distance;bestTriangle=triangle}}return [packedIndices![bestTriangle],packedIndices![bestTriangle+1],packedIndices![bestTriangle+2]].map(index=>[0,1,2].map(axis=>modelMin[axis]+packedPositions![index*3+axis]/65535*modelRange[axis]))});
      applyTracePointsRef.current=(points)=>{landmarkTriangles=buildLandmarks(points)};
      landmarkTriangles=buildLandmarks(tracePointsRef.current);
      const positions=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Uint16Array(binary,positionOffset,vertexCount*3),gl.STATIC_DRAW);const positionLocation=gl.getAttribLocation(program,"aPosition");gl.enableVertexAttribArray(positionLocation);gl.vertexAttribPointer(positionLocation,3,gl.UNSIGNED_SHORT,true,0,0);
      const uvs=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,uvs);gl.bufferData(gl.ARRAY_BUFFER,new Uint16Array(binary,uvOffset,vertexCount*2),gl.STATIC_DRAW);const uvLocation=gl.getAttribLocation(program,"aUv");gl.enableVertexAttribArray(uvLocation);gl.vertexAttribPointer(uvLocation,2,gl.UNSIGNED_SHORT,true,0,0);
      const indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(binary,indexOffset,count),gl.STATIC_DRAW);
      modelTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,modelTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);
      uniforms={center:gl.getUniformLocation(program,"uCenter"),modelMin:gl.getUniformLocation(program,"uModelMin"),modelRange:gl.getUniformLocation(program,"uModelRange"),viewport:gl.getUniformLocation(program,"uViewport"),scale:gl.getUniformLocation(program,"uScale"),yaw:gl.getUniformLocation(program,"uYaw"),pitch:gl.getUniformLocation(program,"uPitch"),offsetY:gl.getUniformLocation(program,"uOffsetY")};gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
    };
    load().catch(error=>console.error("Trace viewer initialization failed",error));
    const clampZoom=(value:number)=>Math.max(.72,Math.min(1.65,value));
    const applyZoom=(value:number)=>{const next=clampZoom(value);zoomRef.current=next;setZoom(next)};
    const down=(event:globalThis.PointerEvent)=>{dragging=true;userInteracted=true;lastX=event.clientX;lastY=event.clientY;yawVelocity=0;if(event.pointerType==="touch"){touchPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(touchPointers.size===2){const points=[...touchPointers.values()];pinchDistance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)}}target.setPointerCapture(event.pointerId)};
    const move=(event:globalThis.PointerEvent)=>{if(!dragging)return;if(event.pointerType==="touch"&&touchPointers.has(event.pointerId)){touchPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(touchPointers.size===2){event.preventDefault();const points=[...touchPointers.values()],distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);if(pinchDistance>0)applyZoom(zoomRef.current*distance/pinchDistance);pinchDistance=distance;return}}const dx=event.clientX-lastX,dy=event.clientY-lastY,limit=target.clientHeight*.22;yaw+=dx*.012;verticalOffset=Math.max(-limit,Math.min(limit,verticalOffset+dy));yawVelocity=dx*.0015;lastX=event.clientX;lastY=event.clientY};
    const up=(event:globalThis.PointerEvent)=>{touchPointers.delete(event.pointerId);pinchDistance=0;dragging=touchPointers.size>0;yawVelocity=0};
    const wheel=(event:globalThis.WheelEvent)=>{event.preventDefault();userInteracted=true;yawVelocity=0;applyZoom(zoomRef.current*Math.exp(-event.deltaY*.0015))};
    const projectPoint=(point:number[],scale:number,w:number,h:number)=>{const x0=point[0]-center[0],y0=point[1]-center[1],z0=point[2]-center[2],rotX=-y0,rotY=x0,rotZ=z0,xr=rotX*Math.cos(yaw)+rotZ*Math.sin(yaw),zr=-rotX*Math.sin(yaw)+rotZ*Math.cos(yaw),yr=rotY*Math.cos(pitch)-zr*Math.sin(pitch),depth=rotY*Math.sin(pitch)+zr*Math.cos(pitch);return{x:w/2+xr*scale,y:h/2-(-yr+depth*.1)*scale+verticalOffset,depth}};
    const savePoint=async(index:number,u:number,v:number)=>{const id=tileTraces[index].id;const response=await fetch("/api/trace-points",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,u,v})});if(!response.ok)throw new Error(`Supabase ${response.status}: ${await response.text()}`)};
    const markerDownHandlers=markerRefs.current.map((marker,index)=>{const handler=(event:globalThis.PointerEvent)=>{if(!editingRef.current)return;event.preventDefault();event.stopPropagation();markerDraggingIndex=index;userInteracted=true;yawVelocity=0;marker?.setPointerCapture(event.pointerId);marker?.classList.add("moving")};marker?.addEventListener("pointerdown",handler);return handler});
    const moveMarker=(event:globalThis.PointerEvent)=>{if(markerDraggingIndex<0)return;event.preventDefault();const bounds=target.getBoundingClientRect(),marker=markerRefs.current[markerDraggingIndex],x=Math.min(bounds.width-32,Math.max(32,event.clientX-bounds.left)),y=Math.min(bounds.height-32,Math.max(32,event.clientY-bounds.top));if(marker)marker.style.transform=`translate3d(${x}px,${y}px,0)`};
    const upMarker=(event:globalThis.PointerEvent)=>{if(markerDraggingIndex<0||!packedPositions||!packedUvs||!packedIndices)return;const index=markerDraggingIndex;markerDraggingIndex=-1;markerRefs.current[index]?.classList.remove("moving");const bounds=target.getBoundingClientRect(),pointerX=event.clientX-bounds.left,pointerY=event.clientY-bounds.top,w=target.clientWidth,h=target.clientHeight,scale=Math.min(w/360,h/500)*1.45*zoomRef.current;let minimumDistance=Infinity;const triangleProjection=(triangle:number)=>{const indices=[packedIndices![triangle],packedIndices![triangle+1],packedIndices![triangle+2]],points=indices.map(vertex=>[0,1,2].map(axis=>modelMin[axis]+packedPositions![vertex*3+axis]/65535*modelRange[axis])),projected=points.map(point=>projectPoint(point,scale,w,h));return{indices,points,x:projected.reduce((sum,point)=>sum+point.x,0)/3,y:projected.reduce((sum,point)=>sum+point.y,0)/3,depth:projected.reduce((sum,point)=>sum+point.depth,0)/3}};for(let triangle=0;triangle<triangleCount;triangle+=3){const point=triangleProjection(triangle),distance=(point.x-pointerX)**2+(point.y-pointerY)**2;if(distance<minimumDistance)minimumDistance=distance}let bestTriangle=0,bestDepth=-Infinity;for(let triangle=0;triangle<triangleCount;triangle+=3){const point=triangleProjection(triangle),distance=(point.x-pointerX)**2+(point.y-pointerY)**2;if(distance<=minimumDistance+196&&point.depth>bestDepth){bestDepth=point.depth;bestTriangle=triangle}}const selected=triangleProjection(bestTriangle),vertices=selected.indices,u=vertices.reduce((sum,vertex)=>sum+packedUvs![vertex*2]/65535,0)/3,v=vertices.reduce((sum,vertex)=>sum+packedUvs![vertex*2+1]/65535,0)/3,id=tileTraces[index].id;landmarkTriangles[index]=selected.points;const next={...tracePointsRef.current,[id]:[u,v] as [number,number]};tracePointsRef.current=next;setTracePoints(next);setSaveStatus("saving");savePoint(index,u,v).then(()=>setSaveStatus("saved")).catch(error=>{setSaveStatus("error");console.warn("포인트 위치를 저장하지 못했습니다.",error)})};
    const draw=()=>{if(!alive){return}const w=target.clientWidth,h=target.clientHeight,dpr=Math.min(devicePixelRatio,innerWidth<760?1.25:1.5);if(target.width!==w*dpr||target.height!==h*dpr){target.width=w*dpr;target.height=h*dpr;gl?.viewport(0,0,target.width,target.height)}if(!dragging){if(!userInteracted)yaw+=.0013;yaw+=yawVelocity;yawVelocity*=.95}const scale=Math.min(w/360,h/500)*1.45*zoomRef.current;if(gl&&program&&uniforms){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,modelTexture);gl.uniform3f(uniforms.center,center[0],center[1],center[2]);gl.uniform3f(uniforms.modelMin,modelMin[0],modelMin[1],modelMin[2]);gl.uniform3f(uniforms.modelRange,modelRange[0],modelRange[1],modelRange[2]);gl.uniform2f(uniforms.viewport,w,h);gl.uniform1f(uniforms.scale,scale);gl.uniform1f(uniforms.yaw,yaw);gl.uniform1f(uniforms.pitch,pitch);gl.uniform1f(uniforms.offsetY,verticalOffset);gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_INT,0)}
      const faceAmount=Math.cos(yaw),isSide=Math.abs(faceAmount)<.18,viewingInner=faceAmount>=0;
      if(surfaceLabelRef.current){Object.assign(surfaceLabelRef.current.style,{position:"absolute",zIndex:"7",left:innerWidth<760?"12px":"18px",top:innerWidth<760?"70px":"18px",display:"flex",flexDirection:"column",gap:"5px",maxWidth:innerWidth<760?"230px":"320px",padding:innerWidth<760?"9px 10px":"11px 13px",borderLeft:"2px solid #eee",background:"rgba(5,5,5,.8)",pointerEvents:"none"});surfaceLabelRef.current.dataset.surface=isSide?"side":viewingInner?"inner":"outer";surfaceLabelRef.current.innerHTML=isSide?"<span>측면</span><b>기와를 조금 더 돌려보세요</b>":viewingInner?"<span>INNER · 내면</span><b>포목흔 · 합철흔 · 와도질</b>":"<span>OUTER · 외면</span><b>외면부 · 지두흔 · 지문 · 인장</b>"}
      for(let i=0;i<landmarkTriangles.length;i++){const marker=markerRefs.current[i],triangle=landmarkTriangles[i];if(!marker||!triangle||i===markerDraggingIndex)continue;const projected=triangle.map(point=>projectPoint(point,scale,w,h)),surfaceX=projected.reduce((sum,point)=>sum+point.x,0)/3,surfaceY=projected.reduce((sum,point)=>sum+point.y,0)/3,isInnerTrace=["cloth","stitch","knife"].includes(tileTraces[i].id),visible=!isSide&&isInnerTrace===viewingInner;marker.style.transform=`translate3d(${surfaceX}px,${surfaceY}px,0)`;marker.style.opacity=visible?"1":"0";marker.style.pointerEvents=visible?"auto":"none"}
      frame=requestAnimationFrame(draw)};
    target.addEventListener("pointerdown",down);target.addEventListener("pointermove",move);target.addEventListener("pointerup",up);target.addEventListener("pointercancel",up);target.addEventListener("wheel",wheel,{passive:false});addEventListener("pointermove",moveMarker);addEventListener("pointerup",upMarker);draw();return()=>{alive=false;applyTracePointsRef.current=null;cancelAnimationFrame(frame);if(image)image.src="";target.removeEventListener("pointerdown",down);target.removeEventListener("pointermove",move);target.removeEventListener("pointerup",up);target.removeEventListener("pointercancel",up);target.removeEventListener("wheel",wheel);removeEventListener("pointermove",moveMarker);removeEventListener("pointerup",upMarker);markerRefs.current.forEach((marker,index)=>marker?.removeEventListener("pointerdown",markerDownHandlers[index]))};
  },[]);

  return <section className="trace-viewer-section" id="traces"><div className="trace-viewer-heading"><span>02 · 제작 흔적 탐색</span><h2>표면에 남은<br/>일곱 개의 기록</h2><p>기와를 손가락으로 돌리고, 표시된 포인트를 눌러 장인의 손과 도구가 남긴 흔적을 살펴보세요. 내면과 외면의 포인트는 해당 면을 보고 있을 때만 나타납니다.</p><button className={`trace-edit-toggle ${editing?"active":""}`} onClick={()=>{setEditing(value=>!value);setSaveStatus("idle")}}>{editing?"편집 완료":"포인트 위치 편집"}</button></div><div className={`trace-stage ${editing?"editing":""}`}><canvas ref={canvas} aria-label="좌우로 회전하고 스크롤 또는 두 손가락으로 확대할 수 있는 세로형 3D 기와 흔적 탐색기"/>{tileTraces.map((trace,index)=><button key={trace.id} ref={element=>{markerRefs.current[index]=element}} className="trace-marker trace-viewer-marker ready" onPointerDown={event=>event.stopPropagation()} onClick={()=>{if(!editing)setActiveTrace(trace)}} aria-label={editing?`${trace.name} 포인트 이동`:`${trace.name} 설명 열기`}><i/><span>{String(index+1).padStart(2,"0")}</span><b>{trace.name}</b></button>)}<div className="trace-surface-label" ref={surfaceLabelRef} data-surface="inner"><span>INNER · 내면</span><b>포목흔 · 합철흔 · 와도질</b></div><div className="trace-zoom-indicator" aria-live="polite">{Math.round(zoom*100)}%</div><p className={`trace-gesture save-${saveStatus}`}>{editing?(saveStatus==="saving"?"저장 중…":saveStatus==="saved"?"✓ 저장 완료":saveStatus==="error"?"저장 실패 · 잠시 후 다시 시도하세요":"포인트를 원하는 흔적 위로 드래그하면 자동 저장됩니다"):"좌우 드래그로 회전 · 스크롤로 확대·축소"}</p></div>
    {activeTrace&&<div className="trace-modal" role="dialog" aria-modal="true" aria-labelledby="trace-title" onClick={()=>setActiveTrace(null)}><article onClick={event=>event.stopPropagation()}><button className="trace-close" onClick={()=>setActiveTrace(null)} aria-label="상세 창 닫기">×</button><div className="trace-photo"><img src={traceImages[activeTrace.id].src} alt={`${activeTrace.name} 분석 사진`} style={{objectPosition:traceImages[activeTrace.id].position}}/><span>{traceImages[activeTrace.id].label}</span></div><div className="trace-content"><span>PRODUCTION TRACE · {String(tileTraces.indexOf(activeTrace)+1).padStart(2,"0")}</span><h2 id="trace-title">{activeTrace.name}</h2><h3>{activeTrace.subtitle}</h3><p>{activeTrace.description}</p><small>기와를 회전해 포인트의 실제 위치와 표면 흔적을 함께 관찰해 보세요.</small></div></article></div>}
  </section>;
}

const steps: Step[] = [
  { title: "흙 고르기", verb: "천년을 가는 단단함은 흙을 가려내는 첫 손길에서", desc: "기와 만들기는 알맞은 흙을 준비하는 것에서 시작합니다. 채취한 흙에 섞인 돌과 뿌리 같은 이물질을 골라내고, 점토의 상태가 고르게 되도록 다듬습니다. 이렇게 준비한 점토는 이후 일정한 두께와 형태를 만들고, 건조와 소성 과정에서 기와가 안정적으로 형태를 유지할 수 있는 바탕이 됩니다", hint: "가는 점토·고운 점토·굵은 모래, 세 가지 재료를 고르세요.", tool: "흙", mode: "drop" },
  { title: "소지 작업", verb: "비바람을 흘려보낼 곡선으로", desc: "잘 고른 점토를 충분히 다지고 일정한 크기로 나눈 뒤, 겹쳐 쌓아 하나의 점토 덩어리로 만듭니다. 이를 다시 일정한 두께로 잘라 기와의 몸체가 될 점토판을 마련합니다. 아직은 평평한 흙판이지만, 이 점토판이 다음 단계에서 와통의 곡면을 따라 둥근 수키와의 형태를 갖추게 됩니다", hint: "왼쪽 점토 3개를 틀에 쌓고, 쨀줄로 3장의 흙판을 가로로 잘라내세요.", tool: "쨀줄", mode: "rub" },
  { title: "통보 씌우기", verb: "기와를 만들기 위한 조연들", desc: "점토판을 붙이기 전에 나무로 만든 와통에 통보(筒布)를 고르게 둘러줍니다. 통보는 점토가 와통에 직접 달라붙는 것을 막아 나중에 쉽게 분리할 수 있도록 돕습니다. 점토가 통보 위에서 눌리면 천의 직물조직과 이음매가 그대로 전사되어 완성된 기와 안쪽에 포목흔과 합철흔으로 남게 됩니다.", hint: "접힌 천을 원통와통 중앙으로 옮기세요.", tool: "통보", mode: "drop" },
  { title: "와통에 흙 붙이기", verb: "평평한 흙에서, 곡선의 기와로", desc: "통보를 씌운 와통 둘레에 준비한 점토판을 감아 붙입니다. 점토판의 양 끝이 맞닿는 부분을 연결하고, 손이나 도구로 누르고 두드리며 와통의 곡면에 밀착시킵니다. 이 과정에서 평평했던 점토판은 와통의 형태를 따라 둥근 곡면을 얻고, 기와의 기본적인 두께와 형태도 함께 만들어집니다.", hint: "흙판을 원통와통 중앙으로 옮기세요.", tool: "흙판", mode: "drop" },
  { title: "외면 다듬기", verb: "손질은 또다른 흔적으로", desc: "와통 위에서 기본 형태를 갖춘 점토의 외면을 다시 다듬습니다. 물을 묻혀 문지르거나 손, 솔과 같은 여러 도구를 이용하면 성형 과정에서 생긴 거친 요철을 줄이고 표면을 정리할 수 있습니다. 이러한 마무리 과정은 기와의 표면을 고르게 만드는 동시에, 사용한 손과 도구의 움직임을 새로운 제작흔으로 남기기도 합니다.", hint: "붓을 잡고 거친 흙 표면 전체를 문질러보세요.", tool: "붓", mode: "rub" },
  { title: "와통 분리", verb: "형태를 잡아주던 시간은 불변의 흔적으로", desc: "점토가 형태를 유지할 만큼 굳으면 성형을 위해 사용했던 와통과 통보를 조심스럽게 빼냅니다. 와통과 천은 기와에서 사라지지만, 와통이 만든 곡면과 통보의 조직은 점토에 그대로 남습니다. 앞에서 살펴본 포목흔과 합철흔도 바로 이 단계에서 도구를 걷어낸 뒤 기와의 안쪽에 모습을 드러냅니다.", hint: "와통 손잡이를 잡고 위쪽으로 여러 번 끌어올리세요.", tool: "와통", mode: "rub" },
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

function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(.28);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;

    const begin = () => audio.play().catch(() => undefined);
    begin();
    const unlock = () => begin();
    addEventListener("pointerdown", unlock, { once: true });
    addEventListener("keydown", unlock, { once: true });
    return () => {
      removeEventListener("pointerdown", unlock);
      removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  const changeVolume = (next: number) => {
    setVolume(next);
    setMuted(next === 0);
    audioRef.current?.play().catch(() => undefined);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  };

  return <div className="bgm-control" data-playing={playing}>
    <audio ref={audioRef} src="/the-mountain.mp3" autoPlay loop preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <span><i /> BGM</span>
    <button type="button" onClick={togglePlayback} aria-label={playing ? "배경음악 일시정지" : "배경음악 재생"}>
      {playing ? "Ⅱ" : "▶"}
    </button>
    <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={event => changeVolume(Number(event.target.value))} aria-label="배경음악 볼륨" />
  </div>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [craftDone, setCraftDone] = useState<number[]>([]);
  const [videoDone, setVideoDone] = useState<number[]>([]);
  const [remoteVideos, setRemoteVideos] = useState<Record<number, string>>({});
  const progress = Math.round(done.length / 9 * 100);
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
  }, [active, craftDone, videoDone]);

  const finish = () => setCraftDone(current => current.includes(active) ? current : [...current, active]);
  const finishVideo = () => setVideoDone(current => current.includes(active) ? current : [...current, active]);
  const reset = () => { setActive(0); setDone([]); setCraftDone([]); setVideoDone([]); };

  return <main>
    <BgmPlayer />
    <header className="topbar dark-nav"><a className="brand" href="#top"><span className="brand-mark">瓦</span><span>와공방</span></a><nav><a href="#film">영상</a><a href="#experience">제작 체험</a></nav><a className="mini-cta" href="#experience">체험 시작</a></header>
    <ParticleStory />

    <section className="experience" id="experience"><div className="section-heading"><div><p className="eyebrow"><span/> 04 · 손으로 배우는 아홉 단계</p><h2>기와 제작 체험</h2></div><p>도구를 잡고 작업 영역으로 움직여보세요.<br/>마우스와 터치 모두 사용할 수 있습니다.</p></div>
      <div className="progress-wrap"><div className="progress-meta"><span>나의 제작 여정</span><strong>{progress}% 완성</strong></div><div className="progress"><i style={{width:`${progress}%`}}/></div></div>
      <div className="step-strip">{steps.map((s,i)=><button key={s.title} aria-label={s.title} className={`${active===i?"active":""} ${done.includes(i)?"done":""}`} onClick={()=>setActive(i)}><span>{done.includes(i)?"✓":String(i+1).padStart(2,"0")}</span><b>{s.title}</b></button>)}</div>
      <article className="workbench interactive"><div className="step-number"><span>STEP</span>{String(active+1).padStart(2,"0")}</div><div className="step-content"><span className="tag">{steps[active].tool} 체험</span><h3>{steps[active].verb}</h3><p>{steps[active].desc}</p>
        <div className="experience-duo">
          <div className="hands-on-panel"><div className="panel-label"><span>INTERACTIVE</span><b>직접 체험</b></div><CraftGame key={active} step={active} onFinish={finish}/></div>
          <div className="step-video-panel"><div className="panel-label"><span>DOCUMENTARY</span><b>{videoDone.includes(active) ? "✓ 영상 시청 완료" : "끝까지 시청해야 완료"}</b></div><div className={`step-video-frame ${videoDone.includes(active) ? "video-complete" : ""}`}>
            {activeVideo ? <video key={`${active}-${activeVideo}`} controls autoPlay muted playsInline preload="auto" src={activeVideo} onEnded={finishVideo}/>
            : <div className="step-video-empty"><i>▶</i><strong>{steps[active].title}</strong><p>{stepVideos[active].label}</p><small>영상 파일 자리 · 16:9</small><code>public/videos/{stepVideos[active].filename}</code></div>}
          </div></div>
        </div>
        <aside><b>장인의 한마디</b><p>{steps[active].hint}</p></aside><div className="actions">{active>0&&<button className="back" onClick={()=>setActive(active-1)}>← 이전 단계</button>}{done.includes(active)&&active<8&&<button className="complete" onClick={()=>setActive(active+1)}>다음 단계 →</button>}</div></div></article>
    </section>

    <footer><div className="brand"><span className="brand-mark">瓦</span><span>와공방</span></div><p>흙에서 지붕까지, 우리 건축의 시간을 잇습니다.<small className="font-credit">제목 서체 · 국가유산진흥원 ‘경복궁 수문장 제목체 L’</small></p><button onClick={reset}>체험 처음부터 ↺</button></footer>
  </main>;
}
