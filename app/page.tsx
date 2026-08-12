"use client";

import { useEffect, useState } from "react";

const steps = [
  { title: "흙 고르기", short: "채토 · 흙고름", tag: "준비", desc: "여러 흙을 살펴보고 모래와 불순물이 적으며 잘 뭉쳐지는 점토를 고릅니다.", tip: "손으로 눌렀을 때 갈라지지 않고 매끈하게 이어지는 흙이 좋아요." },
  { title: "흙판 만들기", short: "소지 제작", tag: "준비", desc: "고른 흙을 충분히 치대 공기를 빼고, 두께가 일정한 넓은 판으로 만듭니다.", tip: "두께가 고르지 않으면 건조와 소성 중에 뒤틀리거나 깨질 수 있어요." },
  { title: "통보 씌우기", short: "섬유 붙이기", tag: "성형", desc: "원통와통의 바깥면에 무명이나 마포 같은 천, 즉 통보(筒褓)를 팽팽하게 씌웁니다.", tip: "통보는 점토가 와통에 붙는 것을 막고 내면에 고운 직물 흔적을 남겨요." },
  { title: "흙판 붙이기", short: "와통 성형", tag: "성형", desc: "통보를 씌운 원통와통 둘레에 흙판을 감고 이음새를 눌러 단단히 붙입니다.", tip: "겹친 부분이 너무 두껍거나 얇아지지 않도록 주변 두께와 맞춰요." },
  { title: "외면 다듬기", short: "붓질 · 반건조", tag: "정면", desc: "붓과 손, 물을 이용해 외면의 요철과 접합부를 정리한 뒤 형태가 유지될 만큼 반건조합니다.", tip: "너무 젖으면 무너지고, 너무 마르면 와통에서 떼기 어려워요." },
  { title: "2분할 홈 내기", short: "와도질", tag: "분할", desc: "수키와 제작 방식에 맞춰 와도(瓦刀)로 원통 성형체의 양쪽에 일정 깊이의 홈을 냅니다.", tip: "한 번에 자르기보다 홈을 낸 뒤 그 선을 따라 나누면 안정적이에요." },
  { title: "와통에서 분리", short: "이형", tag: "분할", desc: "통보의 도움으로 반건조된 성형체를 원통와통에서 조심스럽게 빼냅니다.", tip: "이때 내면에 통보의 경사·위사와 봉합 흔적이 남는지 관찰해 보세요." },
  { title: "내면 깎기", short: "칼 손질", tag: "마무리", desc: "칼로 안쪽의 두꺼운 부분과 절단면을 얇게 깎아 곡률과 측면을 고르게 맞춥니다.", tip: "평행한 절삭선은 제작 도구와 손의 방향을 알려주는 중요한 흔적이에요." },
  { title: "가마에서 굽기", short: "소성", tag: "완성", desc: "충분히 건조한 기와를 가마에 넣고 높은 온도로 구워 단단한 기와로 완성합니다.", tip: "남은 수분은 균열의 원인이 됩니다. 완전 건조 뒤 소성해야 해요." },
];

const clays = [
  { name: "가는 점토", note: "입자가 곱고 점성이 좋아요", color: "#9c5f3d", good: true },
  { name: "모래 섞인 흙", note: "입자가 거칠고 잘 갈라져요", color: "#c7935c", good: false },
  { name: "유기질 흙", note: "불순물이 많아 소성에 불리해요", color: "#66503c", good: false },
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [clay, setClay] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const progress = Math.round((done.length / steps.length) * 100);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((v) => Math.min(8, v + 1));
      if (e.key === "ArrowLeft") setActive((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const complete = () => {
    if (active === 0 && clay !== 0) {
      setNotice("기와에는 입자가 곱고 점성이 좋은 ‘가는 점토’가 알맞아요.");
      return;
    }
    setDone((d) => d.includes(active) ? d : [...d, active]);
    setNotice(active === 8 ? "축하합니다! 원통와통 기와 한 장을 완성했어요." : "잘했어요! 다음 단계로 이동합니다.");
    if (active < 8) window.setTimeout(() => { setActive(active + 1); setNotice(""); }, 650);
  };

  const reset = () => { setActive(0); setDone([]); setClay(null); setNotice(""); };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="와공방 처음으로"><span className="brand-mark">瓦</span><span>와공방</span></a>
        <nav aria-label="주요 메뉴"><a href="#experience">제작 체험</a><a href="#learn">도구 이야기</a></nav>
        <a className="mini-cta" href="#experience">체험 시작</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> 손끝에서 깨어나는 옛 기술</p>
          <h1>흙이<br/><em>기와</em>가 되는 시간</h1>
          <p className="intro">원통와통에 흙판을 붙이고, 다듬고, 나누고, 굽는 아홉 번의 손길. 전통 기와 제작을 직접 따라가 보세요.</p>
          <a className="primary" href="#experience">나만의 기와 만들기 <span>↓</span></a>
          <div className="hero-facts"><div><b>9</b><span>제작 단계</span></div><div><b>瓦桶</b><span>원통와통 방식</span></div><div><b>1</b><span>완성할 기와</span></div></div>
        </div>
        <div className="hero-art" aria-label="원통와통에 점토를 붙이는 모습">
          <div className="sun"/><div className="stamp">圓筒<br/>瓦桶</div>
          <div className="cylinder"><div className="cloth"/><div className="clay-wrap"/><div className="rim"/></div>
          <div className="hand hand-one"/><div className="hand hand-two"/>
          <p className="art-label">점토판을 와통의 곡면에<br/>고르게 밀착시킵니다</p>
        </div>
      </section>

      <section className="experience" id="experience">
        <div className="section-heading"><div><p className="eyebrow"><span /> 아홉 번의 손길</p><h2>기와 제작 체험</h2></div><p>단계를 선택해 전통 제와장의 손길을 따라가세요.<br/>키보드의 ← → 키로도 이동할 수 있습니다.</p></div>
        <div className="progress-wrap"><div className="progress-meta"><span>나의 제작 여정</span><strong>{progress}% 완성</strong></div><div className="progress"><i style={{width: `${progress}%`}}/></div></div>

        <div className="step-strip" role="tablist" aria-label="기와 제작 단계">
          {steps.map((s, i) => <button key={s.title} role="tab" aria-selected={active === i} className={`${active === i ? "active" : ""} ${done.includes(i) ? "done" : ""}`} onClick={() => {setActive(i); setNotice("");}}><span>{done.includes(i) ? "✓" : String(i+1).padStart(2,"0")}</span><b>{s.short}</b></button>)}
        </div>

        <article className="workbench">
          <div className="step-number"><span>STEP</span>{String(active+1).padStart(2,"0")}</div>
          <div className="step-content"><span className="tag">{steps[active].tag}</span><h3>{steps[active].title}</h3><p>{steps[active].desc}</p>
            {active === 0 && <div className="clay-options" aria-label="사용할 흙 고르기">{clays.map((c, i) => <button key={c.name} onClick={() => {setClay(i); setNotice(i === 0 ? "좋은 선택이에요! 이 흙은 기와 성형에 알맞습니다." : "이 흙은 갈라지거나 불순물이 남을 수 있어요.");}} className={clay === i ? "selected" : ""}><i style={{background:c.color}}/><span><b>{c.name}</b><small>{c.note}</small></span>{clay === i && <strong>{c.good ? "알맞음" : "다시 생각"}</strong>}</button>)}</div>}
            {active !== 0 && <div className={`process-visual visual-${active}`}><div className="tool-shape"/><div className="tile-shape"/><span>{steps[active].short}</span></div>}
            <aside><b>장인의 한마디</b><p>{steps[active].tip}</p></aside>
            <div className="actions"><button className="complete" onClick={complete}>{done.includes(active) ? "완료한 단계 ✓" : "이 단계 체험 완료"}</button>{active > 0 && <button className="back" onClick={() => setActive(active-1)}>이전 단계</button>}</div>
            <p className="notice" aria-live="polite">{notice}</p>
          </div>
        </article>
      </section>

      <section className="learn" id="learn"><div><p className="eyebrow light"><span/> 오늘의 도구</p><h2>와통과 통보,<br/>곡률을 만드는 한 쌍</h2></div><div className="learn-card"><b>瓦桶 <small>와통</small></b><p>기와에 일정한 곡률을 주는 원통형 성형틀입니다. 같은 크기와 형태의 기와를 반복해 만들 수 있게 해줍니다.</p></div><div className="learn-card"><b>筒褓 <small>통보</small></b><p>와통과 점토 사이에 두르는 천입니다. 점토가 달라붙는 것을 막고, 기와 내면에 직물결을 남깁니다.</p></div></section>

      <footer><div className="brand"><span className="brand-mark">瓦</span><span>와공방</span></div><p>흙에서 지붕까지, 우리 건축의 시간을 잇습니다.</p><button onClick={reset}>체험 처음부터 ↺</button></footer>
    </main>
  );
}
