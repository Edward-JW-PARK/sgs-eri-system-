import React, { useEffect, useRef } from 'react';
import { BookOpen, LayoutGrid, ClipboardCheck, Shield, User, Lock, Sparkles, TrendingUp, CheckCircle, Star, ArrowRight, Zap, Target, BarChart2, Calendar } from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  // 스크롤 시 요소 애니메이션 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sgs-landing-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.sgs-landing-fade');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <LayoutGrid size={28} />,
      title: 'ERI 대시보드',
      desc: '국어·영어·수학·과학·사회 5개 과목별 시험 준비 완성도를 실시간 시각화. 학교 유형별(특목고/자사고/갓반고) 맞춤 난이도 목표치가 자동 세팅됩니다.',
      color: 'var(--accent-indigo)',
      bg: 'rgba(99, 102, 241, 0.08)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
    {
      icon: <ClipboardCheck size={28} />,
      title: '일일 체크지 시스템',
      desc: '매일 순공시간·문제풀이량·PAI 태도를 기록하여 학습 성실도를 누적 추적. 최근 7일 그래프로 학습 태도 추이를 한눈에 파악하고 ERI 보정 지수에 자동 반영.',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    {
      icon: <TrendingUp size={28} />,
      title: '멘토 학습 처방전',
      desc: '과목별 취약 영역을 AI가 자동 분석하여 다음 주 학습 클리닉 Action Plan을 생성. 학부모 카톡 전송용 맞춤 리포트를 원클릭으로 복사할 수 있습니다.',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.2)',
    },
  ];

  const roles = [
    {
      icon: <Shield size={22} />,
      role: '원장 (어드민)',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      items: [
        '학생 계정 생성 및 완전 삭제',
        '신규 가입 승인 제어 (승인제)',
        '학생 인적사항 전체 열람·편집',
        '로그인 비밀번호 관리',
      ],
    },
    {
      icon: <Lock size={22} />,
      role: '멘토 (선생님)',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.08)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      items: [
        '시험 일정 설정 및 D-Day 지정',
        'ERI 진행도 기입 및 목표 조정',
        '학부모 카톡 전송 리포트 복사',
        '일일 체크지 피드백 작성',
      ],
    },
    {
      icon: <User size={22} />,
      role: '학생',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.08)',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      items: [
        '개인 ERI 대시보드 실시간 조회',
        '일일 학습 체크지 직접 기록',
        '시험 날짜 및 D-Day 자가 설정',
        '학습 성실도 그래프 확인',
      ],
    },
  ];

  const techPoints = [
    { icon: <Calendar size={18} />, title: 'D-Day 자동 계산', desc: '시험 날짜를 달력으로 선택하면 오늘 기준 D-Day가 실시간 자동 산출됩니다.' },
    { icon: <CheckCircle size={18} />, title: '회원가입 승인제', desc: '신규 가입 학생은 원장님의 승인 후에만 로그인이 허용됩니다. 무단 접근 원천 차단.' },
    { icon: <Zap size={18} />, title: '오프라인 캐시', desc: '인터넷이 불안정해도 마지막 데이터를 로컬에 저장해 끊김 없이 화면이 유지됩니다.' },
    { icon: <Target size={18} />, title: '학교 유형별 목표', desc: '일반고/갓반고/학군지/자사고/특목고에 따라 영역별 목표 회독수가 자동 차등 조정됩니다.' },
    { icon: <BarChart2 size={18} />, title: '5과목 종합 분석', desc: '국어·영어·수학·과학·사회 각 영역별 세부 달성도와 취약 포인트를 정밀 진단합니다.' },
    { icon: <Shield size={18} />, title: '역할 기반 3단계', desc: '원장·멘토·학생 역할에 따라 화면과 권한이 엄격히 분리됩니다. 데이터 안전 보장.' },
  ];

  const testimonials = [
    {
      name: '김**학부모',
      school: '목동 중3 학부모',
      text: '담임 선생님이 매주 카톡으로 ERI 리포트를 보내주시는데, 어느 과목이 부족한지 숫자로 딱 나오니까 아이와 대화할 때 너무 편해요. 막연히 "공부 열심히 해" 가 아니라 "수학 오답 부분이 50%밖에 안 됐네, 이번 주에 집중하자" 이런 대화가 가능해졌어요.',
      stars: 5,
    },
    {
      name: '박**학생',
      school: '강남 고1 재학',
      text: '일일 체크지에 매일 공부 내용 올리다 보면 내가 얼마나 했는지 그래프로 보여서 자극이 돼요. 특히 D-Day 카운트가 줄어드는 거 보면서 긴장감이 생겨서 집중이 더 잘 되는 것 같아요.',
      stars: 5,
    },
    {
      name: '이**원장',
      school: 'SGS 아카데미 원장',
      text: '기존에는 Excel로 관리하다 보니 학생별 진도 파악이 너무 힘들었어요. ERI 시스템 도입 후 학생 30명의 상태를 한 화면에서 관리하게 됐고, 멘토 선생님들도 학부모 피드백을 클릭 한 번으로 보낼 수 있어서 업무 효율이 많이 올라갔습니다.',
      stars: 5,
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>

      {/* ===== 상단 네비게이션 ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8, 11, 22, 0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, #c7d2fe, #f5f3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)'; }}
        >
          로그인 <ArrowRight size={14} />
        </button>
      </nav>

      {/* ===== HERO 섹션 ===== */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '8rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 배경 오브 */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
          {/* 배지 */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px', padding: '0.375rem 1rem',
            fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc',
            marginBottom: '2rem', letterSpacing: '0.05em',
          }}>
            <Sparkles size={13} />
            SGS 아카데미 전용 스마트 내신 진단 플랫폼
          </div>

          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 1.5rem 0',
            color: 'white',
          }}>
            시험 준비의{' '}
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              모든 것
            </span>
            을<br />숫자로 증명하세요
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)',
            lineHeight: 1.8, margin: '0 0 3rem 0', maxWidth: '600px', marginInline: 'auto',
          }}>
            ERI(Exam Readiness Index) 시스템으로 학생의 내신 대비 상태를<br />
            과목별·영역별로 정밀하게 측정하고 맞춤 처방을 제공합니다.
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
                transition: 'all 0.25s', boxShadow: '0 8px 25px rgba(99,102,241,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(99,102,241,0.35)'; }}
            >
              지금 시작하기 <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', borderRadius: '12px',
                padding: '1rem 2.5rem', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              기능 살펴보기
            </a>
          </div>

          {/* 히어로 통계 */}
          <div style={{
            display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap',
            marginTop: '4rem', paddingTop: '3rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            {[
              { num: '5개', label: '과목 전과정 커버' },
              { num: '3단계', label: '역할기반 권한 분리' },
              { num: '100%', label: '클라우드 실시간 동기화' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.num}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 핵심 기능 3가지 ===== */}
      <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '4rem', opacity: 0, transition: 'all 0.7s ease' }}>
          <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            CORE FEATURES
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', margin: 0 }}>
            내신 대비의 처음부터 끝까지
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.7 }}>
            계획 수립 → 일일 실천 → 멘토 분석 → 학부모 공유까지<br />한 플랫폼에서 끊김 없이 이어집니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="sgs-landing-fade"
              style={{
                background: f.bg, border: `1px solid ${f.border}`,
                borderRadius: '20px', padding: '2.5rem 2rem',
                transition: 'all 0.7s ease', opacity: 0,
                transitionDelay: `${i * 0.15}s`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px ${f.border}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ color: f.color, marginBottom: '1.25rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: '0 0 0.75rem 0' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 기술 특장점 6가지 ===== */}
      <section style={{
        padding: '6rem 1.5rem',
        background: 'rgba(10, 14, 26, 0.6)',
        borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '4rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              TECHNOLOGY
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', margin: 0 }}>
              세심하게 설계된 기술 특장점
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {techPoints.map((t, i) => (
              <div
                key={i}
                className="sgs-landing-fade"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  background: 'rgba(22,30,53,0.6)', border: '1px solid var(--border-color)',
                  borderRadius: '14px', padding: '1.5rem',
                  transition: 'all 0.7s ease', opacity: 0,
                  transitionDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(22,30,53,0.6)'; }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a5b4fc',
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'white', marginBottom: '4px' }}>{t.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3역할 소개 ===== */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '4rem', opacity: 0, transition: 'all 0.7s ease' }}>
          <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#f9a8d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ROLE SYSTEM
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', margin: 0 }}>
            역할별 완벽한 권한 분리
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.7 }}>
            원장님·선생님·학생 각각에게 필요한 기능만 보여줍니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {roles.map((r, i) => (
            <div
              key={i}
              className="sgs-landing-fade"
              style={{
                background: r.bg, border: r.border, borderRadius: '20px', padding: '2rem',
                transition: 'all 0.7s ease', opacity: 0,
                transitionDelay: `${i * 0.15}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: `${r.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: r.color, border: `1px solid ${r.color}44`,
                }}>
                  {r.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white', margin: 0 }}>{r.role}</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {r.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: r.color, flexShrink: 0, marginTop: '1px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 후기 / 성과 사례 ===== */}
      <section style={{
        padding: '6rem 1.5rem',
        background: 'rgba(10, 14, 26, 0.6)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="sgs-landing-fade" style={{ textAlign: 'center', marginBottom: '4rem', opacity: 0, transition: 'all 0.7s ease' }}>
            <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              TESTIMONIALS
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', margin: 0 }}>
              현장의 생생한 목소리
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="sgs-landing-fade"
                style={{
                  background: 'rgba(22,30,53,0.7)', border: '1px solid var(--border-color)',
                  borderRadius: '20px', padding: '2rem',
                  transition: 'all 0.7s ease', opacity: 0,
                  transitionDelay: `${i * 0.15}s`,
                }}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={15} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {t.name[0]}
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

      {/* ===== 최종 CTA 섹션 ===== */}
      <section style={{ padding: '8rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="sgs-landing-fade" style={{ position: 'relative', zIndex: 1, opacity: 0, transition: 'all 0.7s ease' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', margin: '0 0 1.25rem 0' }}>
            지금 바로{' '}
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              시작
            </span>
            하세요
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.7 }}>
            학원 원장님, 멘토 선생님, 그리고 학생 모두를 위한<br />
            SGS ERI 내신 진단 시스템에 참여하세요.
          </p>
          <button
            onClick={onEnterPortal}
            style={{
              background: 'var(--accent-gradient)', color: 'white',
              border: 'none', borderRadius: '14px',
              padding: '1.125rem 3rem', fontWeight: 800, fontSize: '1.125rem',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.25s', boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.4)'; }}
          >
            <Sparkles size={20} />
            로그인 및 가입하기
          </button>
        </div>
      </section>

      {/* ===== 푸터 ===== */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.8125rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <BookOpen size={14} style={{ color: 'var(--accent-indigo)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>SGS ERI SYSTEM</span>
        </div>
        <p style={{ margin: 0 }}>© 2026 SGS Academy. All Rights Reserved. | 어드민·멘토·학생 역할기반 3단계 분리형 스마트 내신 진단 플랫폼</p>
      </footer>

      {/* 인터섹션 옵저버 트리거용 CSS */}
      <style>{`
        .sgs-landing-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .sgs-landing-fade {
          transform: translateY(24px);
        }
      `}</style>
    </div>
  );
};
