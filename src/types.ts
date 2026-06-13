export type SubjectKey = 'math' | 'english' | 'korean' | 'science' | 'social';

export type SchoolType = '특목고' | '자사고' | '학군지 일반고' | '갓반고' | '일반고';

export interface StudentProfile {
  id: string;          // 영문/숫자 아이디
  name: string;        // 학생 이름 (한글)
  school?: string;     // 학교
  schoolType?: SchoolType; // 학교 유형 (특목고, 자사고, 학군지 일반고, 갓반고, 일반고)
  grade?: string;      // 학년
  studentPhone?: string; // 학생 연락처
  parentPhone?: string;  // 부모님 연락처
  email?: string;      // 이메일
  password?: string;   // 비밀번호
  examName: string;    // 대비 시험
  dDay: string;        // 디데이
}

export interface EriArea {
  key: string;
  name: string;
  target: number; // 최상위권 기준값 (회독수, 문제수 등)
  current: number; // 학생 현재값
  weight: number; // 배점
  unit: string; // 단위 ('회독', '회분', '문항', '%', '회')
  description: string; // 설명 및 가이드라인
}

export interface SubjectEri {
  subjectKey: SubjectKey;
  subjectName: string;
  areas: EriArea[];
}

export type EriStatus = '최상위권형' | '양호' | '보통' | '보완' | '위험';

export interface DailyChecklistData {
  studentName: string;
  date: string;
  mentorName: string;
  subject: string;
  customSubject?: string;
  startTime: string;
  endTime: string;
  studyMinutes: number;
  focusRate: number; // 50 | 60 | 70 | 80 | 90 | 100
  oneThingGoal: string;
  studyStep: string[]; // 개념, 문제풀이, 오답, 심화, 복습, 테스트 등
  textbook: string;
  studyAmount: string;
  solvedProblems: number;
  isCompleted: '완료' | '일부' | '미완료';
  homework: string;
  coreConceptName: string;
  coreConceptDesc: string;
  wrongProblemName: string;
  wrongReason: '계산' | '조건누락' | '개념부족' | '풀이생략' | '시간부족' | '기타';
  wrongReasonCustom?: string;
  wrongReSolve: '완료' | '미완료';
  paiCheck: {
    goal: number; // 1~5
    focus: number; // 1~5
    finish: number; // 1~5
    grit: number; // 1~5
    concept: number; // 1~5
    review: number; // 1~5
  };
  reflection: string;
  mentorStatus: '좋음' | '보통' | '보완필요' | '집중관리';
  mentorComment: string;
  mentorSignature: string;
}

// 초기 기본 과목별 ERI 기준 데이터 (최상위권 100점 모델)
export const DEFAULT_ERI_DATA: Record<SubjectKey, SubjectEri> = {
  math: {
    subjectKey: 'math',
    subjectName: '수학',
    areas: [
      { key: 'concept', name: '개념 회독', target: 2, current: 0, weight: 15, unit: '회독', description: '개념 읽기 + 대표 예제 설명 가능 여부' },
      { key: 'basic', name: '기본문제 회독', target: 2, current: 0, weight: 12, unit: '회독', description: '기본 유형 전체 풀이 및 오답 확인 완료' },
      { key: 'applied', name: '응용문제 회독', target: 3, current: 0, weight: 18, unit: '회독', description: '응용/유형서 풀이 + 틀린 유형 재풀이 완료' },
      { key: 'hardcore', name: '심화문제 회독', target: 3, current: 0, weight: 15, unit: '회독', description: '킬러/서술형 고난도 도전 및 풀이전략 정리 완료' },
      { key: 'school_material', name: '학교자료 회독', target: 3, current: 0, weight: 15, unit: '회독', description: '교과서 및 학교 프린트/부교재 반복 확인' },
      { key: 'wrong_answers', name: '오답 재풀이', target: 3, current: 0, weight: 15, unit: '회독', description: '틀린 문제 원인 분류 및 해설 없이 3회 반복 해결' },
      { key: 'test_set', name: '실전테스트', target: 10, current: 0, weight: 10, unit: '회분', description: '단원/누적/실전형 시간제한 모의고사 풀이' },
    ],
  },
  english: {
    subjectKey: 'english',
    subjectName: '영어',
    areas: [
      { key: 'scope', name: '시험범위 파악', target: 100, current: 0, weight: 10, unit: '%', description: '교과서, 외부지문, 프린트 등 시험 범위 장악도' },
      { key: 'vocab', name: '단어·숙어 테스트', target: 3, current: 0, weight: 10, unit: '회', description: '범위 어휘 누적 3회 이상 자가/구두 테스트 통과' },
      { key: 'text_understanding', name: '본문 이해', target: 2, current: 0, weight: 15, unit: '회독', description: '본문 해석 가능 여부 및 전체 흐름/주제 설명 가능' },
      { key: 'text_memorizing', name: '본문 암기', target: 2, current: 0, weight: 10, unit: '회', description: '핵심 문장, 대화문, 주요 표현 빈칸/영작 암기' },
      { key: 'grammar_concept', name: '문법 개념', target: 2, current: 0, weight: 15, unit: '회독', description: '핵심 문법 개념 백지 정리 및 예문 직접 작성 완료' },
      { key: 'grammar_problems', name: '문법 문제 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '문법 응용 및 기출 문제집 오답/재풀이 완료' },
      { key: 'school_material', name: '학교자료 회독', target: 3, current: 0, weight: 10, unit: '회독', description: '학교 프린트, 수업 중 선생님 필기 3회 이상 회독' },
      { key: 'writing_desc', name: '영작·서술형 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '주요 서술형 예상 문장 암기 및 영작 테스트 완료' },
      { key: 'wrong_recovery', name: '오답 회수', target: 2, current: 0, weight: 5, unit: '회', description: '문법, 어휘, 영작 시 실수했던 부분 2회 이상 점검' },
      { key: 'test_set', name: '실전 테스트', target: 5, current: 0, weight: 5, unit: '회분', description: '본문/문법/서술형 혼합 실전형 테스트 풀이' },
    ],
  },
  korean: {
    subjectKey: 'korean',
    subjectName: '국어',
    areas: [
      { key: 'scope', name: '시험범위 파악', target: 100, current: 0, weight: 10, unit: '%', description: '작품, 지문, 문법, 학습활동 범위 확인 및 확인' },
      { key: 'textbook', name: '교과서 회독', target: 3, current: 0, weight: 10, unit: '회독', description: '본문 및 학습 활동 3회독 이상 정독' },
      { key: 'notes', name: '학교필기 정리', target: 2, current: 0, weight: 15, unit: '회독', description: '선생님 강조점, 판서, 프린트 내용을 교과서에 단권화 정리' },
      { key: 'analysis', name: '작품·지문 분석', target: 2, current: 0, weight: 20, unit: '회독', description: '주제, 갈래별 특징, 표현상 특징, 인물 갈등 구조 정리' },
      { key: 'grammar', name: '문법·어휘 정리', target: 2, current: 0, weight: 10, unit: '회독', description: '단원별 핵심 어휘 뜻과 문법 규칙 도표화 정리 완료' },
      { key: 'problems', name: '문제풀이 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '평가문제집 및 시중 문제풀이 오답 정리 완료' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, current: 0, weight: 10, unit: '회', description: '틀린 문제의 정답과 오답 선지가 왜 틀렸는지 분석 완료' },
      { key: 'writing_desc', name: '서술형 대비 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '서술형 예상 핵심 키워드 포함 답안 작성 반복 연습' },
      { key: 'test_set', name: '실전 점검', target: 5, current: 0, weight: 5, unit: '회분', description: '실전 모의고사 및 외부 기출문제 풀이' },
    ],
  },
  science: {
    subjectKey: 'science',
    subjectName: '과학',
    areas: [
      { key: 'scope', name: '시험범위 파악', target: 100, current: 0, weight: 10, unit: '%', description: '단원 범위, 실험 내용, 추가 프린트 범위 확인' },
      { key: 'concept', name: '개념 회독', target: 3, current: 0, weight: 15, unit: '회독', description: '개념 3회독 이상 정독 및 주요 용어 스스로 설명 가능' },
      { key: 'formulas', name: '공식·단위 암기', target: 2, current: 0, weight: 10, unit: '회독', description: '계산 공식, 물리/화학 단위 및 그래프 해석 방법 정리' },
      { key: 'experiments', name: '탐구·실험 정리', target: 2, current: 0, weight: 15, unit: '회독', description: '실험 목적, 과정, 변인 통제, 결과 해석 완벽 정리' },
      { key: 'basic_problems', name: '기본문제 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '개념 확인 기본 문제 전체 오답 확인 완료' },
      { key: 'applied_problems', name: '응용/자료문제 회독', target: 2, current: 0, weight: 15, unit: '회독', description: '자료 해석 및 계산형 고난도 유형 반복 풀이' },
      { key: 'school_material', name: '학교자료 회독', target: 3, current: 0, weight: 10, unit: '회독', description: '학교 유인물, 필기노트 내용 3회 이상 회독 완료' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, current: 0, weight: 10, unit: '회', description: '계산 실수, 개념 혼동 등 오답 유형 분석 및 오답 재점검' },
      { key: 'blank_test', name: '백지테스트', target: 2, current: 0, weight: 5, unit: '회', description: '주요 단원의 흐름과 핵심 개념을 백지에 안 보고 정리' },
    ],
  },
  social: {
    subjectKey: 'social',
    subjectName: '사회·역사',
    areas: [
      { key: 'scope', name: '시험범위 파악', target: 100, current: 0, weight: 10, unit: '%', description: '범위 단원, 지도/사료자료, 교과서 날개 내용 확인' },
      { key: 'concept', name: '개념 회독', target: 3, current: 0, weight: 15, unit: '회독', description: '교과서 및 기본서 3회독 이상 반복 정독' },
      { key: 'structure', name: '흐름/구조화', target: 3, current: 0, weight: 15, unit: '회독', description: '원인-과정-결과 흐름 정리, 마인드맵, 비교표 작성 완료' },
      { key: 'data_analysis', name: '자료해석 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '도표, 사료, 지도 관련 핵심 문제 2회 이상 반복 점검' },
      { key: 'memorizing', name: '암기 테스트', target: 2, current: 0, weight: 15, unit: '회', description: '백지테스트 또는 구두 인출 테스트 2회 이상 실시' },
      { key: 'problems', name: '문제풀이 회독', target: 2, current: 0, weight: 10, unit: '회독', description: '단원 대비 문제집 풀이 및 틀린 문제 재확인 완료' },
      { key: 'school_material', name: '학교자료 회독', target: 3, current: 0, weight: 10, unit: '회독', description: '학교 프린트, 교과서 필기 내용 3회 회독 완료' },
      { key: 'wrong_answers', name: '오답 정리', target: 2, current: 0, weight: 10, unit: '회', description: '틀린 선지 분석 및 헷갈린 개념 확실히 오답노트 정리' },
      { key: 'writing_desc', name: '서술형 대비', target: 5, current: 0, weight: 5, unit: '회', description: '역사적 원인 및 사회 현상 서술형 문항 키워드 정리 연습' },
    ],
  },
};
