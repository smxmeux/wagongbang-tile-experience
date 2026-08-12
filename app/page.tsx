"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Step = { title: string; verb: string; desc: string; hint: string; tool: string; mode: "drop" | "rub" };

function ParticleStory() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const splitRef = useRef(.5);
  const [split, setSplit] = useState(50);

  useEffect(() => {
    let points: number[][] = [], faces: number[][] = [], frame = 0, progress = 0, center = [0,0,0];
    let alive = true, yaw = 0, pitch = 0, yawVelocity = 0, pitchVelocity = 0, dragging = false, lastX = 0, lastY = 0;
    const seeds = (i: number) => {
      const a = Math.sin(i * 91.733) * 43758.5453;
      const b = Math.sin(i * 47.113 + 2) * 24634.6345;
      return [a - Math.floor(a), b - Math.floor(b)];
    };
    fetch("/Blender.obj").then(r => r.text()).then(text => {
      const lines = text.split("\n");
      points = lines.filter(l => l.startsWith("v ")).map(l => l.trim().split(/\s+/).slice(1,4).map(Number));
      faces = lines.filter(l => l.startsWith("f ")).map(l => l.trim().split(/\s+/).slice(1).map(v => Number(v.split("/")[0]) - 1));
      center = [0,1,2].map(axis => { const values=points.map(p=>p[axis]); return (Math.min(...values)+Math.max(...values))/2; });
    });
    const onScroll = () => {
      if (!section.current) return;
      const r = section.current.getBoundingClientRect();
      progress = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
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
    const draw = () => {
      if (!alive || !canvas.current) return;
      const c = canvas.current, ctx = c.getContext("2d")!;
      const dpr = Math.min(devicePixelRatio, 2), w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w*dpr || c.height !== h*dpr) { c.width=w*dpr; c.height=h*dpr; }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
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
      const dividerX = w * splitRef.current;
      ctx.save(); ctx.beginPath(); ctx.rect(dividerX,0,w-dividerX,h); ctx.clip();
      ctx.beginPath();
      for (const face of faces) {
        if (face.length < 3) continue;
        const a=projected[face[0]], b=projected[face[1]], d=projected[face[2]];
        if (!a || !b || !d) continue;
        ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(d.x,d.y); ctx.closePath();
      }
      ctx.fillStyle=`rgba(178,184,181,${Math.max(.08,eased*.58)})`; ctx.fill();
      ctx.strokeStyle=`rgba(242,244,240,${Math.max(.04,eased*.18)})`; ctx.lineWidth=.45; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0,0,dividerX,h); ctx.clip();
      ctx.fillStyle = `rgba(245,245,240,${.18 + eased*.72})`;
      const size=eased>.75?1.15:.8;
      for (const point of projected) if(point) ctx.fillRect(point.x,point.y,size,size);
      ctx.restore();
      frame=requestAnimationFrame(draw);
    };
    const target = canvas.current;
    addEventListener("scroll",onScroll,{passive:true}); addEventListener("resize",onScroll);
    target?.addEventListener("pointerdown",onPointerDown); target?.addEventListener("pointermove",onPointerMove);
    target?.addEventListener("pointerup",onPointerUp); target?.addEventListener("pointercancel",onPointerUp);
    onScroll(); draw();
    return()=>{alive=false;cancelAnimationFrame(frame);removeEventListener("scroll",onScroll);removeEventListener("resize",onScroll);target?.removeEventListener("pointerdown",onPointerDown);target?.removeEventListener("pointermove",onPointerMove);target?.removeEventListener("pointerup",onPointerUp);target?.removeEventListener("pointercancel",onPointerUp)};
  },[]);

  return <>
    <section className="black-intro" id="top"><div className="intro-index">瓦 · DIGITAL ARCHIVE</div><h1>흙의 기억을<br/>깨우다</h1><p>아래로 천천히 스크롤하세요</p><i/></section>
    <section className="particle-story" ref={section}><div className="particle-sticky"><canvas ref={canvas} aria-label="왼쪽 점군과 오른쪽 폴리곤으로 비교하며 모든 방향으로 회전하는 3D 오브젝트"/><input className="mesh-range" type="range" min="8" max="92" step=".1" value={split} aria-label="점군과 폴리곤 비교 막대" onChange={e=>{const value=Number(e.currentTarget.value);splitRef.current=value/100;setSplit(value)}}/><div className="mesh-split" style={{left:`${split}%`}}><i/><span>POINT</span><b>POLYGON</b></div><div className="particle-copy"><span>01 · 형상의 기록</span><h2>점에서 면으로<br/>형상을 비교합니다</h2><p>막대를 좌우로 밀어 점군과 폴리곤을 비교 · 빈 화면을 드래그해 회전</p></div><div className="scroll-meter"><i/></div></div></section>
    <section className="film-section" id="film"><div className="film-heading"><span>02 · 영상 기록</span><h2>흙에서 지붕까지</h2><p>제작 과정 영상이 준비되면 이 공간에 연결됩니다.</p></div><div className="film-frame"><div className="film-placeholder"><button aria-label="영상 재생 자리">▶</button><b>FILM PLACEHOLDER</b><span>16 : 9 · VIDEO</span></div></div></section>
  </>;
}

const steps: Step[] = [
  { title: "흙고름", verb: "흙을 채취해 돌과 이물질을 제거하고 여러 흙을 고르게 혼합한다.", desc: "여러 흙과 모래가 섞여 있어요. 기와 제작에 사용할 가는 점토, 고운 점토, 굵은 모래를 찾아 바구니로 옮겨보세요.", hint: "가는 점토·고운 점토·굵은 모래, 세 가지 재료를 고르세요.", tool: "흙", mode: "drop" },
  { title: "소지 작업", verb: "숙성된 흙을 일정한 두께의 점토판으로 만든다.", desc: "점토 3개를 직사각형 틀 안에 층층이 쌓은 뒤, 쨀줄을 가로로 당겨 일정한 두께의 흙판을 만듭니다.", hint: "왼쪽 점토 3개를 틀에 쌓고, 쨀줄로 3장의 흙판을 잘라내세요.", tool: "쨀줄", mode: "rub" },
  { title: "와통에 섬유 붙이기", verb: "와통에 포목을 감아 점토판을 붙일 준비를 한다.", desc: "원통와통에 통보를 팽팽하게 씌워 점토가 나무에 달라붙지 않도록 합니다.", hint: "접힌 천을 원통와통 중앙으로 옮기세요.", tool: "통보", mode: "drop" },
  { title: "와통에 흙 붙이기", verb: "점토판을 와통에 감아 붙인다.", desc: "통보 위에 흙판을 감고 빈틈없이 눌러 일정한 곡률을 만듭니다.", hint: "흙판을 원통와통 중앙으로 옮기세요.", tool: "흙판", mode: "drop" },
  { title: "외면 다듬기", verb: "붓으로 표면을 정리한다.", desc: "물을 묻힌 붓으로 거친 외면과 접합부를 부드럽게 정리합니다.", hint: "붓을 잡고 거친 흙 표면 전체를 문질러보세요.", tool: "붓", mode: "rub" },
  { title: "2분할", verb: "와도로 홈을 내, 두 장으로 나눈다.", desc: "수키와가 두 장으로 갈라지도록 와도로 양쪽에 일정한 깊이의 홈을 냅니다.", hint: "와도를 잡고 점선을 따라 위에서 아래로 그으세요.", tool: "와도", mode: "rub" },
  { title: "와통 분리", verb: "와통을 제거한다", desc: "반건조된 점토 껍질은 그대로 두고, 안쪽의 원통와통과 통보를 위로 조심스럽게 빼냅니다.", hint: "와통 손잡이를 잡고 위쪽으로 여러 번 끌어올리세요.", tool: "와통", mode: "rub" },
  { title: "손질 칼로 깎기", verb: "내면의 불필요한 점토와 요철을 손질 칼로 정리한다.", desc: "내면의 두꺼운 곳과 절단면을 얇게 깎아 곡률과 측면을 정돈합니다.", hint: "칼을 잡고 기와 안쪽을 골고루 훑으세요.", tool: "손질칼", mode: "rub" },
  { title: "굽기", verb: "충분히 건조한 기와를 가마에서 환원소성하여 완성한다.", desc: "완전히 건조된 기와를 가마에서 구워 단단한 전통 기와로 완성합니다.", hint: "부채를 잡고 불씨 위를 빠르게 부쳐보세요.", tool: "부채", mode: "rub" },
];

// 영상 파일을 public/videos 폴더에 넣은 뒤 해당 단계의 src를 "/videos/파일명.mp4"로 바꾸면 됩니다.
const stepVideos: { src: string | null; label: string; filename: string }[] = [
  { src: null, label: "흙을 살피고 고르는 실제 과정", filename: "step-01-clay.mp4" },
  { src: null, label: "점토 적층과 쨀줄 절단 과정", filename: "step-02-slab.mp4" },
  { src: null, label: "원통와통에 통보를 씌우는 과정", filename: "step-03-cloth.mp4" },
  { src: null, label: "통보 위에 흙판을 붙이는 과정", filename: "step-04-attach.mp4" },
  { src: null, label: "붓으로 외면을 다듬는 과정", filename: "step-05-brush.mp4" },
  { src: null, label: "와도로 2분할 홈을 내는 과정", filename: "step-06-cut.mp4" },
  { src: null, label: "성형체에서 와통을 빼는 과정", filename: "step-07-release.mp4" },
  { src: null, label: "기와 내면을 칼로 손질하는 과정", filename: "step-08-trim.mp4" },
  { src: null, label: "가마에서 기와를 굽는 과정", filename: "step-09-fire.mp4" },
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
        } else if (step !== 6 || p.y < pos.y) setRub(v => Math.min(100, v + (step === 6 ? 1.45 : 1.05)));
        if (step !== 6) setMarks(m => [...m.slice(-78), p]);
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

  const toolName = ["", "쨀줄", "통보", "흙판", "붓", "와도", "와통 손잡이", "손질칼", "부채"][step];

  return <div className={`craft-game game-${step} ${finished ? "game-finished" : ""}`} ref={box} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
    <div className="game-head"><span>{finished ? "✓ 체험 성공" : "마우스·손가락으로 직접 움직여보세요"}</span><b>{step === 0 ? `${caught.length}/3` : step === 1 && stacked < 3 ? `${stacked}/3 쌓기` : `${step === 4 ? brushPercent : Math.round(rub)}%`}</b></div>
    {step === 0 ? <>
      <div className="clay-group-label">여러 흙이 섞여 있어요</div>
      {clayPieces.map((p, i) => !caught.includes(i) && <button key={i} aria-label={`${p.name}: ${p.detail}`} data-name={p.name} data-detail={p.detail} className={`clay-piece ${wrong === i ? "wrong" : ""}`} style={{ left: `${drag === i ? pos.x : p.x}%`, top: `${drag === i ? pos.y : p.y}%`, background: p.c }} onPointerDown={e => start(e, i)} />)}
      <div className={`basket ${drag !== null ? "ready" : ""}`}><i/><span>좋은 흙 바구니</span><small>{caught.length ? "●".repeat(caught.length) : "여기에 놓기"}</small></div>
    </> : <>
      <div className={`work-target scene-${step}`}>
        {step === 1 ? <div className={`clay-frame ${visibleClayLayers===0?"frame-empty":""}`}><span>점토 적층 틀</span><div className="stacked-clay">{Array.from({length:visibleClayLayers},(_,i)=><i key={i}/>)}</div>{stacked>=3&&<div className="cut-sheets">{Array.from({length:cutCount},(_,i)=><i key={i}/>)}</div>} {stacked===0&&<small className="empty-label">비어 있음</small>}</div>
        : step === 6 ? <div className="release-scene"><div className="tile-shell"/><div className="mold-pull" style={{ transform: `translateY(${-rub * 1.35}px)` }}><i/></div></div>
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
        {step !== 7 && step !== 6 && marks.map((m, i) => <i key={i} className="work-mark" style={{ left: `${m.x}%`, top: `${m.y}%`, opacity: .15 + i / 90 }}/>) }
        {step === 5 && <div className="split-tile" style={{ "--split": `${rub / 18}px` } as CSSProperties}><i className="split-left"/><i className="split-right"/><b className="cut-line" style={{ height: `${rub}%` }}/></div>} 
      </div>
      {step === 1 && stacked < 3 ? <div className="vertical-clay-row">{Array.from({length:3-stacked},(_,i)=>{const id=10+stacked+i;return <button key={id} className="stack-lump" style={{left:`${drag===id?pos.x:16}%`,top:`${drag===id?pos.y:35+i*22}%`}} onPointerDown={e=>start(e,id)} aria-label="점토 덩어리 옮기기"/>})}</div> : <button className={`drag-tool tool-${step}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onPointerDown={e => start(e)} aria-label={`${toolName} 드래그`}><i/>{toolName}</button>}
    </>}
    <div className="game-instruction">{finished ? "완료! 다음 단계로 이동합니다." : step===1&&stacked<3 ? "왼쪽 점토 3개를 직사각형 틀 안에 차곡차곡 놓으세요." : step===1 ? "쨀줄을 좌우로 당겨 흙판 3장을 잘라내세요." : steps[step].hint}</div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [remoteVideos, setRemoteVideos] = useState<Record<number, string>>({});
  const progress = Math.round(done.length / 9 * 100);
  const unlocked = Math.min(8, done.length);
  const activeVideo = remoteVideos[active + 1] || stepVideos[active].src;

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

  const finish = () => {
    setDone(d => d.includes(active) ? d : [...d, active]);
    if (active < 8) window.setTimeout(() => setActive(active + 1), 850);
    else setCelebrate(true);
  };
  const reset = () => { setActive(0); setDone([]); setCelebrate(false); };

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
          <div className="step-video-panel"><div className="panel-label"><span>DOCUMENTARY</span><b>실제 제작 영상</b></div><div className="step-video-frame">
            {activeVideo ? <video key={activeVideo} controls playsInline preload="metadata" src={activeVideo}/>
            : <div className="step-video-empty"><i>▶</i><strong>{steps[active].title}</strong><p>{stepVideos[active].label}</p><small>영상 파일 자리 · 16:9</small><code>public/videos/{stepVideos[active].filename}</code></div>}
          </div></div>
        </div>
        <aside><b>장인의 한마디</b><p>{steps[active].hint}</p></aside><div className="actions">{active>0&&<button className="back" onClick={()=>setActive(active-1)}>← 이전 단계</button>}{done.includes(active)&&active<8&&<button className="complete" onClick={()=>setActive(active+1)}>다음 단계 →</button>}</div></div></article>
    </section>

    <footer><div className="brand"><span className="brand-mark">瓦</span><span>와공방</span></div><p>흙에서 지붕까지, 우리 건축의 시간을 잇습니다.</p><button onClick={reset}>체험 처음부터 ↺</button></footer>
    {celebrate&&<div className="celebrate" role="dialog" aria-modal="true"><div><span>瓦</span><p>아홉 번의 손길을 모두 마쳤습니다</p><h2>나만의 기와 완성!</h2><button onClick={reset}>다시 만들어보기</button><button className="close" onClick={()=>setCelebrate(false)}>닫기</button></div></div>}
  </main>;
}
