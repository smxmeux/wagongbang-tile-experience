"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Step = { title: string; verb: string; desc: string; hint: string; tool: string; mode: "drop" | "rub" };

const steps: Step[] = [
  { title: "흙 고르기", verb: "좋은 흙을 바구니에 담아요", desc: "여러 흙이 섞여 있어요. 입자가 곱고 점성이 좋은 붉은 점토 3개를 찾아 바구니로 옮겨보세요.", hint: "붉고 매끈한 흙만 골라 바구니 안에 놓으세요.", tool: "흙", mode: "drop" },
  { title: "흙판 만들기", verb: "밀대로 점토를 밀어요", desc: "뭉친 점토를 앞뒤로 고르게 밀어 넓고 일정한 두께의 흙판을 만듭니다.", hint: "밀대를 잡고 점토 위를 여러 번 왕복하세요.", tool: "밀대", mode: "rub" },
  { title: "통보 씌우기", verb: "천을 와통에 감아요", desc: "원통와통에 통보를 팽팽하게 씌워 점토가 나무에 달라붙지 않도록 합니다.", hint: "접힌 천을 원통와통 중앙으로 옮기세요.", tool: "통보", mode: "drop" },
  { title: "흙판 붙이기", verb: "흙판을 와통에 붙여요", desc: "통보 위에 흙판을 감고 빈틈없이 눌러 일정한 곡률을 만듭니다.", hint: "흙판을 원통와통 중앙으로 옮기세요.", tool: "흙판", mode: "drop" },
  { title: "외면 다듬기", verb: "붓으로 표면을 펴요", desc: "물을 묻힌 붓으로 거친 외면과 접합부를 부드럽게 정리합니다.", hint: "붓을 잡고 거친 흙 표면 전체를 문질러보세요.", tool: "붓", mode: "rub" },
  { title: "2분할 홈 내기", verb: "와도로 곧은 홈을 내요", desc: "수키와가 두 장으로 갈라지도록 와도로 양쪽에 일정한 깊이의 홈을 냅니다.", hint: "와도를 잡고 점선을 따라 위에서 아래로 그으세요.", tool: "와도", mode: "rub" },
  { title: "와통에서 분리", verb: "와통을 위로 빼내요", desc: "반건조된 점토 껍질은 그대로 두고, 안쪽의 원통와통과 통보를 위로 조심스럽게 빼냅니다.", hint: "와통 손잡이를 잡고 위쪽으로 여러 번 끌어올리세요.", tool: "와통", mode: "rub" },
  { title: "내면 깎기", verb: "칼로 두께를 고르게 해요", desc: "내면의 두꺼운 곳과 절단면을 얇게 깎아 곡률과 측면을 정돈합니다.", hint: "칼을 잡고 기와 안쪽을 골고루 훑으세요.", tool: "손질칼", mode: "rub" },
  { title: "가마에서 굽기", verb: "불씨를 살려 기와를 구워요", desc: "완전히 건조된 기와를 가마에서 구워 단단한 전통 기와로 완성합니다.", hint: "부채를 잡고 불씨 위를 빠르게 부쳐보세요.", tool: "부채", mode: "rub" },
];

const clayPieces = [
  { x: 10, y: 35, good: true, c: "#a84e32", name: "가는 점토", detail: "점성이 좋고 입자가 고와요" },
  { x: 23, y: 31, good: false, c: "#c59a65", name: "모래 섞인 흙", detail: "거칠고 쉽게 갈라져요" },
  { x: 36, y: 37, good: true, c: "#964129", name: "붉은 점토", detail: "성형하기 좋은 점토예요" },
  { x: 12, y: 63, good: false, c: "#5f5843", name: "유기질 흙", detail: "불순물이 많이 섞였어요" },
  { x: 25, y: 66, good: true, c: "#b05739", name: "고운 점토", detail: "매끈하고 잘 뭉쳐져요" },
  { x: 38, y: 62, good: false, c: "#b78d5d", name: "자갈 섞인 흙", detail: "큰 알갱이가 보여요" },
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
  const brushPercent = Math.round((covered.length / 49) * 100);
  const finished = step === 0 ? caught.length === 3 : step === 4 ? brushPercent >= 86 : rub >= 100;

  useEffect(() => { finishFired.current = false; setDrag(null); setPos({ x: 14, y: 70 }); setRub(0); setCaught([]); setWrong(null); setMarks([]); setCovered([]); }, [step]);
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
    if (steps[step].mode === "rub" && p.x > 24 && p.x < 82 && p.y > 18 && p.y < 82) {
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
        if (step !== 6 || p.y < pos.y) setRub(v => Math.min(100, v + 1.05));
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
    } else if (steps[step].mode === "drop") {
      if (pos.x > 39 && pos.x < 70 && pos.y > 22 && pos.y < 83) setRub(100);
      else setPos({ x: 14, y: 70 });
    }
    setDrag(null);
  };

  const toolName = ["", "밀대", "통보", "흙판", "붓", "와도", "와통 손잡이", "손질칼", "부채"][step];

  return <div className={`craft-game game-${step} ${finished ? "game-finished" : ""}`} ref={box} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
    <div className="game-head"><span>{finished ? "✓ 체험 성공" : "마우스·손가락으로 직접 움직여보세요"}</span><b>{step === 0 ? `${caught.length}/3` : `${step === 4 ? brushPercent : Math.round(rub)}%`}</b></div>
    {step === 0 ? <>
      <div className="clay-group-label">여러 흙이 섞여 있어요</div>
      {clayPieces.map((p, i) => !caught.includes(i) && <button key={i} aria-label={`${p.name}: ${p.detail}`} data-name={p.name} data-detail={p.detail} className={`clay-piece ${wrong === i ? "wrong" : ""}`} style={{ left: `${drag === i ? pos.x : p.x}%`, top: `${drag === i ? pos.y : p.y}%`, background: p.c }} onPointerDown={e => start(e, i)} />)}
      <div className={`basket ${drag !== null ? "ready" : ""}`}><i/><span>좋은 흙 바구니</span><small>{caught.length ? "●".repeat(caught.length) : "여기에 놓기"}</small></div>
    </> : <>
      <div className={`work-target scene-${step}`}>
        {step === 1 ? <div className="rolling-board"><div className="slab" style={{ transform: `scaleY(${.34 + rub / 145})`, borderRadius: `${45-rub/3}%` }}/><i className="mold-guide">와통 높이</i></div>
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
      <button className={`drag-tool tool-${step}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onPointerDown={e => start(e)} aria-label={`${toolName} 드래그`}><i/>{toolName}</button>
    </>}
    <div className="game-instruction">{finished ? "완료! 다음 단계로 이동합니다." : steps[step].hint}</div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const progress = Math.round(done.length / 9 * 100);
  const unlocked = Math.min(8, done.length);

  const finish = () => {
    setDone(d => d.includes(active) ? d : [...d, active]);
    if (active < 8) window.setTimeout(() => setActive(active + 1), 850);
    else setCelebrate(true);
  };
  const reset = () => { setActive(0); setDone([]); setCelebrate(false); };

  return <main>
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">瓦</span><span>와공방</span></a><nav><a href="#experience">제작 체험</a><a href="#learn">도구 이야기</a></nav><a className="mini-cta" href="#experience">체험 시작</a></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span/> 손끝에서 깨어나는 옛 기술</p><h1>흙이<br/><em>기와</em>가 되는 시간</h1><p className="intro">클릭만 하는 체험이 아닙니다. 흙을 옮기고, 붓을 쓸고, 칼을 움직이며 아홉 번의 손길을 직접 완성해보세요.</p><a className="primary" href="#experience">손으로 체험 시작하기 <span>↓</span></a><div className="hero-facts"><div><b>9</b><span>드래그 미션</span></div><div><b>瓦桶</b><span>원통와통 방식</span></div><div><b>1</b><span>완성할 기와</span></div></div></div><div className="hero-art"><div className="sun"/><div className="stamp">圓筒<br/>瓦桶</div><div className="cylinder"><div className="cloth"/><div className="clay-wrap"/><div className="rim"/></div><div className="hand hand-one"/><div className="hand hand-two"/><p className="art-label">도구를 직접 움직여<br/>기와를 완성합니다</p></div></section>

    <section className="experience" id="experience"><div className="section-heading"><div><p className="eyebrow"><span/> 손으로 배우는 아홉 단계</p><h2>기와 제작 체험</h2></div><p>도구를 잡고 작업 영역으로 움직여보세요.<br/>마우스와 터치 모두 사용할 수 있습니다.</p></div>
      <div className="progress-wrap"><div className="progress-meta"><span>나의 제작 여정</span><strong>{progress}% 완성</strong></div><div className="progress"><i style={{width:`${progress}%`}}/></div></div>
      <div className="step-strip">{steps.map((s,i)=><button key={s.title} disabled={i > unlocked} aria-label={i > unlocked ? `${s.title}, 이전 단계를 먼저 완료하세요` : s.title} className={`${active===i?"active":""} ${done.includes(i)?"done":""} ${i>unlocked?"locked":""}`} onClick={()=>{ if(i<=unlocked) setActive(i); }}><span>{done.includes(i)?"✓":i>unlocked?"🔒":String(i+1).padStart(2,"0")}</span><b>{s.title}</b></button>)}</div>
      <article className="workbench interactive"><div className="step-number"><span>STEP</span>{String(active+1).padStart(2,"0")}</div><div className="step-content"><span className="tag">{steps[active].tool} 체험</span><h3>{steps[active].verb}</h3><p>{steps[active].desc}</p><CraftGame key={active} step={active} onFinish={finish}/><aside><b>장인의 한마디</b><p>{steps[active].hint}</p></aside><div className="actions">{active>0&&<button className="back" onClick={()=>setActive(active-1)}>← 이전 단계</button>}{done.includes(active)&&active<8&&<button className="complete" onClick={()=>setActive(active+1)}>다음 단계 →</button>}</div></div></article>
    </section>

    <section className="learn" id="learn"><div><p className="eyebrow light"><span/> 오늘의 도구</p><h2>와통과 통보,<br/>곡률을 만드는 한 쌍</h2></div><div className="learn-card"><b>瓦桶 <small>와통</small></b><p>기와에 일정한 곡률을 주는 원통형 성형틀입니다. 같은 크기의 기와를 반복해 만들 수 있게 합니다.</p></div><div className="learn-card"><b>筒褓 <small>통보</small></b><p>와통과 점토 사이에 두르는 천입니다. 점토가 붙는 것을 막고 내면에 직물결을 남깁니다.</p></div></section>
    <footer><div className="brand"><span className="brand-mark">瓦</span><span>와공방</span></div><p>흙에서 지붕까지, 우리 건축의 시간을 잇습니다.</p><button onClick={reset}>체험 처음부터 ↺</button></footer>
    {celebrate&&<div className="celebrate" role="dialog" aria-modal="true"><div><span>瓦</span><p>아홉 번의 손길을 모두 마쳤습니다</p><h2>나만의 기와 완성!</h2><button onClick={reset}>다시 만들어보기</button><button className="close" onClick={()=>setCelebrate(false)}>닫기</button></div></div>}
  </main>;
}
