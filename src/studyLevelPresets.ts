import type { SubjectKey, StudyLevel, EriArea, SchoolType } from './types';

/**
 * 5대 과목별, 4대 학습 레벨별 (기초 빌드업 / 실전 도약 / 상위 완성 / 최상위 만점)
 * ERI 목표 회독수 및 가중치(총합 100점) 프리셋 정의
 */
type AreaPreset = Omit<EriArea, 'current'>;

export const LEVEL_AREA_PRESETS: Record<SubjectKey, Record<StudyLevel, AreaPreset[]>> = {
  // ==========================================
  // 1. 수학 (math)
  // ==========================================
  math: {
    basic: [
      { key: 'concept', name: '개념 회독', target: 3, weight: 30, unit: '회독', description: '개념 3회독 정독 및 기본 공식 유도 설명' },
      { key: 'basic', name: '기본문제 회독', target: 2, weight: 25, unit: '회독', description: '연산 및 교과서 기본 예제 2회독 완성' },
      { key: 'applied', name: '응용문제 회독', target: 1, weight: 15, unit: '회독', description: '대표 유형서 필수 예제 1회독 확인' },
      { key: 'hardcore', name: '심화문제 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 심화 문제는 과감히 면제 (감점 없음)', isExempt: true },
      { key: 'school_material', name: '학교자료 회독', target: 2, weight: 15, unit: '회독', description: '교과서 및 학교 기본 프린트 2회 반복' },
      { key: 'wrong_answers', name: '오답 재풀이', target: 2, weight: 15, unit: '회독', description: '틀린 기본 문제 해설 없이 2회 반복 해결' },
      { key: 'test_set', name: '실전테스트', target: 0, weight: 0, unit: '회분', description: '🌱 기초 트랙: 단원평가 위주 학습 (모의고사 면제)', isExempt: true },
    ],
    intermediate: [
      { key: 'concept', name: '개념 회독', target: 1, weight: 15, unit: '회독', description: '핵심 개념 요약 및 공식 백지 인출' },
      { key: 'basic', name: '기본문제 회독', target: 1, weight: 10, unit: '회독', description: '기본 유형 빠른 점검 1회독' },
      { key: 'applied', name: '응용문제 회독', target: 3, weight: 25, unit: '회독', description: '유형서(쎈 B단계 등) 3회독 완벽 정복 (핵심 승부처)' },
      { key: 'hardcore', name: '심화문제 회독', target: 1, weight: 10, unit: '회독', description: '준킬러/C단계 도전 1회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 15, unit: '회독', description: '학교 부교재 및 프린트 3회독 반복' },
      { key: 'wrong_answers', name: '오답 재풀이', target: 3, weight: 15, unit: '회독', description: '오답 노트 정리 및 3회 반복 재풀이' },
      { key: 'test_set', name: '실전테스트', target: 5, weight: 10, unit: '회분', description: '단원 및 실전형 시간제한 기출 5회분 풀이' },
    ],
    advanced: [
      { key: 'concept', name: '개념 회독', target: 1, weight: 10, unit: '회독', description: '개념 인과관계 및 증명 백지 정리' },
      { key: 'basic', name: '기본문제 회독', target: 1, weight: 10, unit: '회독', description: '기본기 점검' },
      { key: 'applied', name: '응용문제 회독', target: 2, weight: 15, unit: '회독', description: '응용서 2회독' },
      { key: 'hardcore', name: '심화문제 회독', target: 2, weight: 20, unit: '회독', description: '심화/고난도 2회독 (1~2등급 진입 분수령)' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 15, unit: '회독', description: '학교 프린트/기출 변형 3회독' },
      { key: 'wrong_answers', name: '오답 재풀이', target: 3, weight: 15, unit: '회독', description: '킬러 오답 원인 분석 및 완벽 정복' },
      { key: 'test_set', name: '실전테스트', target: 8, weight: 15, unit: '회분', description: '실전 모의고사 타임어택 8회분 풀이' },
    ],
    top: [
      { key: 'concept', name: '개념 회독', target: 1, weight: 5, unit: '회독', description: '개념 구조화 및 스킵' },
      { key: 'basic', name: '기본문제 회독', target: 1, weight: 5, unit: '회독', description: '빠른 워밍업' },
      { key: 'applied', name: '응용문제 회독', target: 1, weight: 10, unit: '회독', description: '응용 1회독' },
      { key: 'hardcore', name: '심화문제 회독', target: 3, weight: 30, unit: '회독', description: '블랙라벨/일등급/킬러 3회독 완벽 해결' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 15, unit: '회독', description: '학교 전 범위 및 선생님 예상문제 3회독' },
      { key: 'wrong_answers', name: '오답 재풀이', target: 4, weight: 15, unit: '회독', description: '틀린 문제 0개가 될 때까지 4회 반복' },
      { key: 'test_set', name: '실전테스트', target: 12, weight: 20, unit: '회분', description: '실전 고난도 모의고사 12회분 완벽 훈련' },
    ]
  },

  // ==========================================
  // 2. 영어 (english)
  // ==========================================
  english: {
    basic: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '교과서 단원 및 어휘 범위 장악' },
      { key: 'vocab', name: '단어·숙어 테스트', target: 3, weight: 25, unit: '회', description: '범위 단어/숙어 누적 3회 이상 암기 테스트 통과' },
      { key: 'text_understanding', name: '본문 이해', target: 3, weight: 30, unit: '회독', description: '교과서 본문 3회독 정독 및 직독직해 완벽 숙지' },
      { key: 'text_memorizing', name: '본문 암기', target: 1, weight: 15, unit: '회', description: '핵심 대표 문장 빈칸 채우기 1회 완료' },
      { key: 'grammar_concept', name: '문법 개념', target: 2, weight: 20, unit: '회독', description: '단원 핵심 문법 개념 2회독 및 예문 익히기' },
      { key: 'grammar_problems', name: '문법 문제 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 기본 문법 개념 집중 (심화 문제 면제)', isExempt: true },
      { key: 'school_material', name: '학교자료 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 교과서 본문 위주 완성 (면제)', isExempt: true },
      { key: 'writing_desc', name: '영작·서술형 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 기본 어휘/해석 집중 (면제)', isExempt: true },
      { key: 'wrong_recovery', name: '오답 회수', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 본문 다독 위주 (면제)', isExempt: true },
      { key: 'test_set', name: '실전 테스트', target: 0, weight: 0, unit: '회분', description: '🌱 기초 트랙: 실전 테스트 면제', isExempt: true },
    ],
    intermediate: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '교과서 및 부교재 범위 파악' },
      { key: 'vocab', name: '단어·숙어 테스트', target: 3, weight: 15, unit: '회', description: '어휘 3회 테스트 통과' },
      { key: 'text_understanding', name: '본문 이해', target: 2, weight: 15, unit: '회독', description: '본문 내용 및 흐름 파악 2회독' },
      { key: 'text_memorizing', name: '본문 암기', target: 2, weight: 15, unit: '회', description: '주요 핵심 문장 빈칸/영작 2회' },
      { key: 'grammar_concept', name: '문법 개념', target: 2, weight: 10, unit: '회독', description: '단원 문법 백지 정리 2회독' },
      { key: 'grammar_problems', name: '문법 문제 회독', target: 2, weight: 10, unit: '회독', description: '문법 기출 문제 풀이 및 오답' },
      { key: 'school_material', name: '학교자료 회독', target: 2, weight: 10, unit: '회독', description: '학교 프린트 필기 2회독' },
      { key: 'writing_desc', name: '영작·서술형 회독', target: 1, weight: 5, unit: '회독', description: '서술형 예상 문장 암기 1회독' },
      { key: 'wrong_recovery', name: '오답 회수', target: 2, weight: 5, unit: '회', description: '틀린 문제 2회 점검' },
      { key: 'test_set', name: '실전 테스트', target: 3, weight: 5, unit: '회분', description: '실전형 문제 풀이 3회분' },
    ],
    advanced: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '시험 전 범위 완벽 파악' },
      { key: 'vocab', name: '단어·숙어 테스트', target: 3, weight: 10, unit: '회', description: '동의어/반의어 포함 3회 통과' },
      { key: 'text_understanding', name: '본문 이해', target: 2, weight: 10, unit: '회독', description: '본문 및 모의고사 지문 분석 2회독' },
      { key: 'text_memorizing', name: '본문 암기', target: 2, weight: 15, unit: '회', description: '핵심 문장 완벽 암기 2회' },
      { key: 'grammar_concept', name: '문법 개념', target: 2, weight: 10, unit: '회독', description: '고난도 어법 정리 2회독' },
      { key: 'grammar_problems', name: '문법 문제 회독', target: 3, weight: 10, unit: '회독', description: '어법 문제집 3회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 15, unit: '회독', description: '학교 프린트/외부지문 3회독' },
      { key: 'writing_desc', name: '영작·서술형 회독', target: 2, weight: 10, unit: '회독', description: '서술형 2회독 완벽 연습' },
      { key: 'wrong_recovery', name: '오답 회수', target: 2, weight: 5, unit: '회', description: '오답 분석 완료' },
      { key: 'test_set', name: '실전 테스트', target: 5, weight: 5, unit: '회분', description: '실전 테스트 5회분 풀이' },
    ],
    top: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 5, unit: '%', description: '전 범위 장악' },
      { key: 'vocab', name: '단어·숙어 테스트', target: 4, weight: 10, unit: '회', description: '심화/변형 어휘 4회 테스트' },
      { key: 'text_understanding', name: '본문 이해', target: 2, weight: 5, unit: '회독', description: '문맥/함축 의미 심층 분석 2회독' },
      { key: 'text_memorizing', name: '본문 암기', target: 3, weight: 15, unit: '회', description: '지문 전체 구조 및 핵심 문장 3회' },
      { key: 'grammar_concept', name: '문법 개념', target: 2, weight: 10, unit: '회독', description: '수능/내신 킬러 어법 정리 2회독' },
      { key: 'grammar_problems', name: '문법 문제 회독', target: 3, weight: 15, unit: '회독', description: '변형 어법 문제 3회독' },
      { key: 'school_material', name: '학교자료 회독', target: 4, weight: 15, unit: '회독', description: '외부지문 및 프린트 4회독 완벽 장악' },
      { key: 'writing_desc', name: '영작·서술형 회독', target: 3, weight: 15, unit: '회독', description: '킬러 서술형 3회독 (조건부 영작 완벽)' },
      { key: 'wrong_recovery', name: '오답 회수', target: 3, weight: 5, unit: '회', description: '오답 3회 재점검' },
      { key: 'test_set', name: '실전 테스트', target: 8, weight: 5, unit: '회분', description: '고난도 실전 모의고사 8회분' },
    ]
  },

  // ==========================================
  // 3. 국어 (korean)
  // ==========================================
  korean: {
    basic: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '작품 및 단원 범위 확인' },
      { key: 'textbook', name: '교과서 회독', target: 3, weight: 30, unit: '회독', description: '교과서 본문 및 학습활동 3회독 정독' },
      { key: 'notes', name: '학교필기 정리', target: 2, weight: 25, unit: '회독', description: '선생님 판서 및 자습서 설명 2회독' },
      { key: 'analysis', name: '작품·지문 분석', target: 1, weight: 15, unit: '회독', description: '핵심 인물, 갈등, 주제 1회독 정리' },
      { key: 'grammar', name: '문법·어휘 정리', target: 2, weight: 20, unit: '회독', description: '단원 핵심 문법 규칙 및 어휘 정리' },
      { key: 'problems', name: '문제풀이 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 교과서 본문 정독 집중 (면제)', isExempt: true },
      { key: 'wrong_answers', name: '오답 정리', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 교과서 위주 (면제)', isExempt: true },
      { key: 'writing_desc', name: '서술형 대비 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 기본 문항 집중 (면제)', isExempt: true },
      { key: 'test_set', name: '실전 점검', target: 0, weight: 0, unit: '회분', description: '🌱 기초 트랙: 실전 테스트 면제', isExempt: true },
    ],
    intermediate: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '교과서 및 부교재 범위 확인' },
      { key: 'textbook', name: '교과서 회독', target: 2, weight: 10, unit: '회독', description: '교과서 본문 2회독' },
      { key: 'notes', name: '학교필기 정리', target: 2, weight: 15, unit: '회독', description: '학교 필기 및 유인물 2회독 단권화' },
      { key: 'analysis', name: '작품·지문 분석', target: 2, weight: 15, unit: '회독', description: '지문 갈래/특징 2회독 분석' },
      { key: 'grammar', name: '문법·어휘 정리', target: 2, weight: 10, unit: '회독', description: '문법 도표 정리 및 문제 적용' },
      { key: 'problems', name: '문제풀이 회독', target: 2, weight: 15, unit: '회독', description: '평가문제집 2회독 풀이' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '틀린 문제 오답 분석' },
      { key: 'writing_desc', name: '서술형 대비 회독', target: 1, weight: 10, unit: '회독', description: '예상 서술형 1회독 연습' },
      { key: 'test_set', name: '실전 점검', target: 3, weight: 5, unit: '회분', description: '단원 기출 3회분' },
    ],
    advanced: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '전 범위 확인' },
      { key: 'textbook', name: '교과서 회독', target: 2, weight: 10, unit: '회독', description: '교과서 정독 2회독' },
      { key: 'notes', name: '학교필기 정리', target: 2, weight: 10, unit: '회독', description: '필기 및 심화 프린트 단권화' },
      { key: 'analysis', name: '작품·지문 분석', target: 2, weight: 20, unit: '회독', description: '연계 작품 및 지문 심층 2회독' },
      { key: 'grammar', name: '문법·어휘 정리', target: 2, weight: 10, unit: '회독', description: '문법 고난도 2회독' },
      { key: 'problems', name: '문제풀이 회독', target: 3, weight: 15, unit: '회독', description: '기출 및 응용 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '오답 선지 분석' },
      { key: 'writing_desc', name: '서술형 대비 회독', target: 2, weight: 10, unit: '회독', description: '키워드 포함 서술형 2회독' },
      { key: 'test_set', name: '실전 점검', target: 5, weight: 5, unit: '회분', description: '실전 모의고사 5회분' },
    ],
    top: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 5, unit: '%', description: '전 범위 장악' },
      { key: 'textbook', name: '교과서 회독', target: 2, weight: 5, unit: '회독', description: '핵심 정리 2회독' },
      { key: 'notes', name: '학교필기 정리', target: 2, weight: 10, unit: '회독', description: '선생님 의도 분석 단권화' },
      { key: 'analysis', name: '작품·지문 분석', target: 3, weight: 20, unit: '회독', description: '외부 낯선 지문 및 보기 분석 3회독' },
      { key: 'grammar', name: '문법·어휘 정리', target: 3, weight: 15, unit: '회독', description: '킬러 문법 예외 규정 3회독' },
      { key: 'problems', name: '문제풀이 회독', target: 3, weight: 15, unit: '회독', description: '고난도 변형 문제 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 3, weight: 15, unit: '회독', description: '선지 매력적 오답 완벽 분석' },
      { key: 'writing_desc', name: '서술형 대비 회독', target: 3, weight: 10, unit: '회독', description: '감점 0점 서술형 3회독' },
      { key: 'test_set', name: '실전 점검', target: 8, weight: 5, unit: '회분', description: '고난도 실전 8회분' },
    ]
  },

  // ==========================================
  // 4. 과학 (science)
  // ==========================================
  science: {
    basic: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '단원 및 기본 개념 범위 확인' },
      { key: 'concept', name: '개념 회독', target: 3, weight: 30, unit: '회독', description: '과학 기본 개념 3회독 정독 및 용어 이해' },
      { key: 'formulas', name: '공식·단위 암기', target: 2, weight: 20, unit: '회독', description: '핵심 공식 및 단위 2회독 암기' },
      { key: 'experiments', name: '탐구·실험 정리', target: 1, weight: 15, unit: '회독', description: '교과서 핵심 실험 과정/결과 1회독' },
      { key: 'basic_problems', name: '기본문제 회독', target: 2, weight: 25, unit: '회독', description: '기본 문제 2회독 풀이 및 오답 확인' },
      { key: 'applied_problems', name: '응용/자료문제 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 개념/기본문제 집중 (면제)', isExempt: true },
      { key: 'school_material', name: '학교자료 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 교과서 위주 (면제)', isExempt: true },
      { key: 'wrong_answers', name: '오답 정리', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 기본 문제 위주 (면제)', isExempt: true },
      { key: 'blank_test', name: '백지테스트', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 백지 테스트 면제', isExempt: true },
    ],
    intermediate: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '범위 확인' },
      { key: 'concept', name: '개념 회독', target: 2, weight: 15, unit: '회독', description: '개념 2회독 정독' },
      { key: 'formulas', name: '공식·단위 암기', target: 2, weight: 10, unit: '회독', description: '공식 및 그래프 해석 2회독' },
      { key: 'experiments', name: '탐구·실험 정리', target: 2, weight: 15, unit: '회독', description: '실험 변인 및 결과 2회독' },
      { key: 'basic_problems', name: '기본문제 회독', target: 2, weight: 15, unit: '회독', description: '기본 문제 2회독' },
      { key: 'applied_problems', name: '응용/자료문제 회독', target: 2, weight: 15, unit: '회독', description: '자료 해석 응용 2회독' },
      { key: 'school_material', name: '학교자료 회독', target: 2, weight: 10, unit: '회독', description: '프린트 2회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '오답 재확인' },
      { key: 'blank_test', name: '백지테스트', target: 0, weight: 0, unit: '회', description: '선택 학습', isExempt: true },
    ],
    advanced: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '전 범위 확인' },
      { key: 'concept', name: '개념 회독', target: 2, weight: 10, unit: '회독', description: '개념 원리 2회독' },
      { key: 'formulas', name: '공식·단위 암기', target: 2, weight: 10, unit: '회독', description: '공식 변형 및 계산 훈련' },
      { key: 'experiments', name: '탐구·실험 정리', target: 2, weight: 15, unit: '회독', description: '탐구 실험 심층 2회독' },
      { key: 'basic_problems', name: '기본문제 회독', target: 1, weight: 10, unit: '회독', description: '기본 점검' },
      { key: 'applied_problems', name: '응용/자료문제 회독', target: 2, weight: 20, unit: '회독', description: '고난도 자료/그래프 2회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 10, unit: '회독', description: '학교 유인물 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '오답 원인 분석' },
      { key: 'blank_test', name: '백지테스트', target: 1, weight: 5, unit: '회', description: '백지 개념 정리 1회' },
    ],
    top: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 5, unit: '%', description: '전 범위 장악' },
      { key: 'concept', name: '개념 회독', target: 1, weight: 5, unit: '회독', description: '원리 직관적 이해' },
      { key: 'formulas', name: '공식·단위 암기', target: 2, weight: 5, unit: '회독', description: '공식 유도 및 증명' },
      { key: 'experiments', name: '탐구·실험 정리', target: 3, weight: 15, unit: '회독', description: '실험 변형 문제 3회독' },
      { key: 'basic_problems', name: '기본문제 회독', target: 1, weight: 5, unit: '회독', description: '기본 점검' },
      { key: 'applied_problems', name: '응용/자료문제 회독', target: 3, weight: 25, unit: '회독', description: '킬러 계산 및 복합 자료 3회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 15, unit: '회독', description: '학교 필기 및 심화 프린트 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 3, weight: 15, unit: '회독', description: '틀린 문제 0개 오답 극복' },
      { key: 'blank_test', name: '백지테스트', target: 2, weight: 10, unit: '회', description: '백지 인출 2회 완성' },
    ]
  },

  // ==========================================
  // 5. 사회·역사 (social)
  // ==========================================
  social: {
    basic: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '단원 및 사건 범위 확인' },
      { key: 'concept', name: '개념 회독', target: 3, weight: 35, unit: '회독', description: '교과서 줄거리 3회독 정독 및 주요 사건 파악' },
      { key: 'structure', name: '흐름/구조화', target: 1, weight: 15, unit: '회독', description: '주요 연표 및 핵심 개념 1회 정리' },
      { key: 'data_analysis', name: '자료해석 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 교과서 본문 집중 (면제)', isExempt: true },
      { key: 'memorizing', name: '암기 테스트', target: 2, weight: 25, unit: '회', description: '필수 키워드 2회 자가 암기 확인' },
      { key: 'problems', name: '문제풀이 회독', target: 1, weight: 15, unit: '회독', description: '교과서/기본 문제 1회 풀이' },
      { key: 'school_material', name: '학교자료 회독', target: 0, weight: 0, unit: '회독', description: '🌱 기초 트랙: 기본기 위주 (면제)', isExempt: true },
      { key: 'wrong_answers', name: '오답 정리', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 본문 다독 위주 (면제)', isExempt: true },
      { key: 'writing_desc', name: '서술형 대비', target: 0, weight: 0, unit: '회', description: '🌱 기초 트랙: 서술형 면제', isExempt: true },
    ],
    intermediate: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '범위 확인' },
      { key: 'concept', name: '개념 회독', target: 2, weight: 15, unit: '회독', description: '교과서 2회독' },
      { key: 'structure', name: '흐름/구조화', target: 2, weight: 15, unit: '회독', description: '시대 흐름 및 인과관계 정리 2회독' },
      { key: 'data_analysis', name: '자료해석 회독', target: 2, weight: 10, unit: '회독', description: '지도, 도표, 사료 2회독' },
      { key: 'memorizing', name: '암기 테스트', target: 2, weight: 15, unit: '회', description: '핵심 어휘 암기 테스트 2회' },
      { key: 'problems', name: '문제풀이 회독', target: 2, weight: 15, unit: '회독', description: '문제집 2회 풀이' },
      { key: 'school_material', name: '학교자료 회독', target: 2, weight: 10, unit: '회독', description: '학교 프린트 2회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '오답 정리' },
      { key: 'writing_desc', name: '서술형 대비', target: 0, weight: 0, unit: '회', description: '선택 학습', isExempt: true },
    ],
    advanced: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 10, unit: '%', description: '전 범위 확인' },
      { key: 'concept', name: '개념 회독', target: 2, weight: 10, unit: '회독', description: '정독 2회독' },
      { key: 'structure', name: '흐름/구조화', target: 2, weight: 15, unit: '회독', description: '마인드맵 및 비교표 2회독' },
      { key: 'data_analysis', name: '자료해석 회독', target: 2, weight: 15, unit: '회독', description: '사료 심층 분석 2회독' },
      { key: 'memorizing', name: '암기 테스트', target: 2, weight: 15, unit: '회', description: '인출 테스트 2회' },
      { key: 'problems', name: '문제풀이 회독', target: 3, weight: 15, unit: '회독', description: '기출 및 응용 3회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 10, unit: '회독', description: '학교 프린트 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, weight: 10, unit: '회', description: '선지 분석' },
      { key: 'writing_desc', name: '서술형 대비', target: 3, weight: 0, unit: '회', description: '서술형 키워드 연습', isExempt: true },
    ],
    top: [
      { key: 'scope', name: '시험범위 파악', target: 100, weight: 5, unit: '%', description: '전 범위 장악' },
      { key: 'concept', name: '개념 회독', target: 2, weight: 10, unit: '회독', description: '완벽 이해 2회독' },
      { key: 'structure', name: '흐름/구조화', target: 3, weight: 15, unit: '회독', description: '복합 시대/인물 연결망 3회독' },
      { key: 'data_analysis', name: '자료해석 회독', target: 3, weight: 20, unit: '회독', description: '고난도 킬러 사료/통계자료 3회독' },
      { key: 'memorizing', name: '암기 테스트', target: 2, weight: 10, unit: '회', description: '백지 인출 2회' },
      { key: 'problems', name: '문제풀이 회독', target: 3, weight: 15, unit: '회독', description: '고난도 변형 3회독' },
      { key: 'school_material', name: '학교자료 회독', target: 3, weight: 10, unit: '회독', description: '학교 교재 및 유인물 3회독' },
      { key: 'wrong_answers', name: '오답 정리', target: 3, weight: 10, unit: '회', description: '매력적 오답 함정 분석' },
      { key: 'writing_desc', name: '서술형 대비', target: 5, weight: 5, unit: '회', description: '완벽 서술형 5회 연습' },
    ]
  }
};

/**
 * 학교 유형 난이도 보정 (특목고/자사고/학군지인 경우 상위/최상위 레벨에 실전/심화 가산)
 */
export const applySchoolTypeModifier = (
  _subjectKey: SubjectKey,
  areaKey: string,
  baseTarget: number,
  level: StudyLevel,
  schoolType?: SchoolType
): number => {
  if (baseTarget === 0) return 0; // 면제 영역은 가산하지 않음!
  const type = schoolType || '일반고';
  if (type === '일반고') return baseTarget;

  // 상위/최상위 레벨에서 고난도 학교 가중
  if (level === 'advanced' || level === 'top') {
    if (type === '특목고' || type === '자사고') {
      if (['hardcore', 'applied', 'wrong_answers'].includes(areaKey)) return baseTarget + 1;
      if (areaKey === 'test_set') return baseTarget + 2;
    } else if (type === '학군지 일반고' || type === '갓반고') {
      if (['hardcore', 'wrong_answers'].includes(areaKey)) return baseTarget + 1;
      if (areaKey === 'test_set') return baseTarget + 1;
    }
  }

  return baseTarget;
};

/**
 * 특정 과목과 레벨, 학교 유형에 맞춰진 완성도용 ERI 세부 영역(areas) 배열 생성/보정
 */
export const buildAreasForLevel = (
  subjectKey: SubjectKey,
  level: StudyLevel,
  schoolType?: SchoolType,
  existingAreas?: EriArea[]
): EriArea[] => {
  const presetList = LEVEL_AREA_PRESETS[subjectKey]?.[level] || LEVEL_AREA_PRESETS[subjectKey].intermediate;

  return presetList.map(preset => {
    const adjustedTarget = applySchoolTypeModifier(subjectKey, preset.key, preset.target, level, schoolType);
    const existing = existingAreas?.find(a => a.key === preset.key);

    return {
      key: preset.key,
      name: preset.name,
      target: adjustedTarget,
      weight: preset.weight,
      unit: preset.unit,
      description: preset.description,
      isExempt: preset.isExempt || false,
      current: existing ? existing.current : 0
    };
  });
};
