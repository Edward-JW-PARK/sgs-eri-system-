import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen, Sparkles, TrendingUp, CheckCircle, Star, ArrowRight,
  Zap, Target, BarChart2, Calendar, ChevronLeft, ChevronRight, Clock, FileText
} from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const [activeScreen, setActiveScreen] = useState(0); // 0: 대시보드, 1: 일일체크지
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 스크롤 시 요소 페이드인 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sgs-landing-visible');
          }
        });
      },
      { threshold: 0.08 }
    );
    const elements = document.querySelectorAll('.sgs-landing-fade');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 화면 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const screens = [
    {
      id: 0,
      label: 'ERI 대시보드',
      icon: <BarChart2 size={15} />,
      image: '/eri_dashboard.png',
      title: '과목별 완성도를 한눈에',
      desc: '5개 과목의 시험 준비 진행률과 D-Day를 실시간으로 시각화합니다.',
      color: '#6366f1',
    },
    {
      id: 1,
      label: '일일 학습 체크지',
      icon: <FileText size={15} />,
      image: '/daily_checklist.png',
      title: '매일의 학습을 기록하고 추적',
      desc: '순공시간, 문제풀이량, 태도 점수를 기록하면 7일 그래프로 자동 시각화됩니다.',
      color: '#10b981',
    },
  ];

  const features = [
    {
      icon: <BarChart2 size={26} />,
      title: 'ERI 대시보드',
      desc: '국어·영어·수학·과학·사회 5과목별 시험 준비 완성도를 실시간 시각화. 학교 유형별(특목고/자사고/갓반고) 맞춤 목표치 자동 세팅.',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.08)',
      border: 'rgba(99, 102, 241, 0.25)',
    },
    {
      icon: <Clock size={26} />,
      title: '일일 학습 체크지',
      desc: '매일 순공시간·문제풀이량·PAI 태도를 기록하여 학습 성실도를 누적 추적. 최근 7일 그래프로 태도 추이를 한눈에 파악.',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    {
      icon: <TrendingUp size={26} />,
      title: '멘토 학습 처방전',
      desc: '취약 영역 자동 분석 후 다음 주 Action Plan 생성. 학부모 카톡 전송용 맞춤 리포트를 원클릭으로 복사.',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.25)',
    },
  ];

  const techPoints = [
    { icon: <Calendar size={17} />, title: 'D-Day 자동 계산', desc: '달력으로 시험 날짜 선택 시 오늘 기준 D-Day 실시간 자동 산출.' },
    { icon: <CheckCircle size={17} />, title: '회원가입 승인제', desc: '신규 학생은 원장님 승인 후에만 로그인 허용. 무단 접근 원천 차단.' },
    { icon: <Zap size={17} />, title: '오프라인 캐시', desc: '인터넷 불안정 시에도 마지막 데이터를 로컬 유지. 끊김 없는 화면.' },
    { icon: <Target size={17} />, title: '학교 유형별 목표', desc: '일반고/갓반고/학군지/자사고/특목고별 영역 목표 회독수 자동 차등 조정.' },
  ];

  const testimonials = [
    {
      name: '김**학부모',
      school: '목동 중3 학부모',
      text: '담임 선생님이 매주 ERI 리포트를 보내주시니 어느 과목이 부족한지 숫자로 딱 나와요. "수학 오답이 50%야, 이번 주 집중하자" 이런 대화가 가능해졌어요.',
      stars: 5,
      avatar: '김',
    },
    {
      name: '박**학생',
      school: '강남 고1 재학',
      text: '일일 체크지에 매일 기록하면 그래프로 보여서 자극이 돼요. D-Day 카운트가 줄어드는 걸 보면서 긴장감이 생겨서 집중도 더 잘 돼요.',
      stars: 5,
      avatar: '박',
    },
    {
      name: '이**원장',
      school: 'SGS 아카데미 원장',
      text: 'Excel 관리는 이제 옛날 얘기예요. 학생 30명 상태를 한 화면에서 파악하고, 멘토 선생님들도 학부모 피드백을 클릭 한 번으로 보낼 수 있어요.',
      stars: 5,
      avatar: '이',
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Inter', 'Noto Sans KR', sans-serif", overflowX: 'hidden' }}>

      {/* ===== 고정 네비바 ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8, 11, 22, 0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{
            fontWeight: 800, fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #c7d2fe, #f5f3ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SGS ERI SYSTEM
          </span>
        </div>
        <button
          onClick={onEnterPortal}
          style={{
            background: 'var(--accent-gradient)', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.8125rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)'; }}
        >
          로그인 <ArrowRight size={14} />
        </button>
      </nav>

      {/* ===== HERO 섹션 ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '8rem 1.5rem 5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 배경 광원 */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', right: '0%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          {/* 배지 */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px', padding: '0.375rem 1.125rem',
            fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc',
            marginBottom: '2rem', letterSpacing: '0.06em',
          }}>
            <Sparkles size={12} />
            SGS 아카데미 전용 스마트 내신 진단 플랫폼
          </div>

          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.75rem)', fontWeight: 900,
            lineHeight: 1.08, margin: '0 0 1.5rem 0', color: 'white',
            letterSpacing: '-0.02em',
          }}>
            시험 준비의{' '}
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              모든 것
            </span>
            을<br />숫자로 증명하세요
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.175rem)', color: 'var(--text-secondary)',
            lineHeight: 1.8, margin: '0 auto 2.75rem', maxWidth: '580px',
          }}>
            ERI(Exam Readiness Index)로 내신 대비 상태를<br />
            과목별·영역별로 정밀 측정하고 맞춤 처방을 받으세요.
          </p>

          {/* CTA 버튼 그룹 */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onEnterPortal}
              style={{
                background: 'var(--accent-gradient)', color: 'white',
                border: 'none', borderRadius: '12px',
                padding: '1rem 2.5rem', fontWeight: 800, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.25s', boxShadow: '0 8px 28px rgba(99,102,241,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 34px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.4)'; }}
            >
              지금 시작하기 <ArrowRight size={17} />
            </button>
            <a
              href="#preview"
              style={{
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                padding: '1rem 2.5rem', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              화면 미리보기
            </a>
          </div>

          {/* 히어로 하단 통계 */}
          <div style={{
            display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap',
            marginTop: '4rem', paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {[
              { num: '5개', label: '과목 전과정 커버' },
              { num: 'D-Day', label: '자동 카운트다운' },
              { num: '실시간', label: '클라우드 동기화' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.num}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.02em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 실제 화면 미리보기 섹션 ===== */}
      <section id="preview" style={{ padding: '6rem 1.5rem', position: 'relative' }}>
        {/* 배경 그라데이션 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '3.5rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              LIVE PREVIEW
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.875rem)', fontWeight: 900, color: 'white', margin: '0 0 0.875rem 0' }}>
              실제 앱 화면을 확인해보세요
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              복잡한 설명 필요 없이, 직접 눈으로 확인하세요.
            </p>
          </div>

          {/* 탭 선택기 */}
          <div className="sgs-landing-fade" style={{
            display: 'flex', justifyContent: 'center', gap: '0.625rem',
            marginBottom: '2.5rem', opacity: 0, transition: 'all 0.7s ease', transitionDelay: '0.1s',
          }}>
            {screens.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveScreen(s.id); setIsAutoPlaying(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '0.625rem 1.375rem', borderRadius: '10px', border: 'none',
                  fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
                  transition: 'all 0.25s',
                  background: activeScreen === s.id ? s.color : 'rgba(255,255,255,0.05)',
                  color: activeScreen === s.id ? 'white' : 'var(--text-secondary)',
                  boxShadow: activeScreen === s.id ? `0 4px 16px ${s.color}55` : 'none',
                  transform: activeScreen === s.id ? 'translateY(-1px)' : 'none',
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* 이미지 카드 */}
          <div className="sgs-landing-fade" style={{
            opacity: 0, transition: 'all 0.7s ease', transitionDelay: '0.2s',
          }}>
            <div style={{
              background: 'rgba(15,20,40,0.8)',
              border: `1px solid ${screens[activeScreen].color}33`,
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px ${screens[activeScreen].color}22`,
              transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
              position: 'relative',
            }}>
              {/* 창 상단 맥 스타일 */}
              <div style={{
                background: 'rgba(10,14,26,0.9)',
                borderBottom: `1px solid ${screens[activeScreen].color}22`,
                padding: '0.875rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                <div style={{
                  flex: 1, textAlign: 'center', fontSize: '0.7rem',
                  color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em',
                }}>
                  sgs-eri-system.vercel.app
                </div>
              </div>

              {/* 스크린 이미지 */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                  src={screens[activeScreen].image}
                  alt={screens[activeScreen].label}
                  style={{
                    width: '100%', height: 'auto',
                    display: 'block',
                    transition: 'opacity 0.4s ease',
                    minHeight: '300px', objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* 하단 그라데이션 오버레이 */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(transparent, rgba(8,11,22,0.7))',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* 하단 설명 바 */}
              <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: '4px' }}>{screens[activeScreen].title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{screens[activeScreen].desc}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { setActiveScreen((p) => (p - 1 + 2) % 2); setIsAutoPlaying(false); }}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => { setActiveScreen((p) => (p + 1) % 2); setIsAutoPlaying(false); }}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 인디케이터 도트 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.25rem' }}>
              {screens.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveScreen(i); setIsAutoPlaying(false); }}
                  style={{
                    width: activeScreen === i ? '24px' : '8px', height: '8px',
                    borderRadius: '100px', border: 'none', cursor: 'pointer',
                    background: activeScreen === i ? '#6366f1' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 핵심 기능 3가지 ===== */}
      <section id="features" style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '3.5rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              CORE FEATURES
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.875rem)', fontWeight: 900, color: 'white', margin: '0 0 0.875rem 0' }}>
              내신 대비의 처음부터 끝까지
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              계획 수립 → 일일 실천 → 멘토 분석 → 학부모 공유까지 한 플랫폼에서.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(295px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="sgs-landing-fade"
                style={{
                  background: f.bg, border: `1px solid ${f.border}`,
                  borderRadius: '20px', padding: '2.25rem 2rem',
                  transition: 'all 0.7s ease', opacity: 0,
                  transitionDelay: `${i * 0.12}s`, cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${f.border}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ color: f.color, marginBottom: '1.125rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.175rem', fontWeight: 800, color: 'white', margin: '0 0 0.625rem 0' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 기술 특장점 (콤팩트 4가지) ===== */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'rgba(10, 14, 26, 0.5)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '3rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              TECHNOLOGY
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', margin: 0 }}>
              세심하게 설계된 핵심 기술
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {techPoints.map((t, i) => (
              <div
                key={i}
                className="sgs-landing-fade"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  background: 'rgba(22,30,53,0.5)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '1.375rem',
                  transition: 'all 0.7s ease', opacity: 0,
                  transitionDelay: `${i * 0.09}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.35)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(22,30,53,0.5)'; }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(99,102,241,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a5b4fc',
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white', marginBottom: '4px' }}>{t.title}</div>
                  <div style={{ fontSize: '0.7875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 후기 섹션 ===== */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '3.5rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              TESTIMONIALS
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.875rem)', fontWeight: 900, color: 'white', margin: 0 }}>
              현장의 생생한 목소리
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(295px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="sgs-landing-fade"
                style={{
                  background: 'rgba(18,24,46,0.7)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '2rem',
                  transition: 'all 0.7s ease', opacity: 0,
                  transitionDelay: `${i * 0.12}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(251,191,36,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1.125rem' }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  ))}
                </div>
                <p style={{
                  fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8,
                  margin: '0 0 1.375rem 0', fontStyle: 'italic',
                }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 최종 CTA ===== */}
      <section style={{ padding: '7rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="sgs-landing-fade" style={{ position: 'relative', zIndex: 1, opacity: 0, transition: 'all 0.7s ease' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', margin: '0 0 1.125rem 0' }}>
            지금 바로{' '}
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              시작
            </span>
            하세요
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: '2.75rem', lineHeight: 1.75 }}>
            원장님, 멘토 선생님, 학생 모두를 위한<br />
            SGS ERI 내신 진단 시스템에 참여하세요.
          </p>
          <button
            onClick={onEnterPortal}
            style={{
              background: 'var(--accent-gradient)', color: 'white',
              border: 'none', borderRadius: '14px',
              padding: '1.125rem 3rem', fontWeight: 800, fontSize: '1.0625rem',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.25s', boxShadow: '0 10px 32px rgba(99,102,241,0.42)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 18px 42px rgba(99,102,241,0.58)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.42)'; }}
          >
            <Sparkles size={19} />
            로그인 · 가입하기
          </button>
        </div>
      </section>

      {/* ===== 푸터 ===== */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.875rem 1.5rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '7px', marginBottom: '0.4rem' }}>
          <BookOpen size={13} style={{ color: 'var(--accent-indigo)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>SGS ERI SYSTEM</span>
        </div>
        <p style={{ margin: 0 }}>© 2026 SGS Academy. All Rights Reserved. | 어드민·멘토·학생 역할기반 스마트 내신 진단 플랫폼</p>
      </footer>

      {/* 페이드인 CSS */}
      <style>{`
        .sgs-landing-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .sgs-landing-fade {
          transform: translateY(22px);
        }
      `}</style>
    </div>
  );
};
