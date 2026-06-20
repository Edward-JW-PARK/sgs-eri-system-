import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Save } from 'lucide-react';
import type { DailyChecklistData } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface DailyChecklistProps {
  studentId: string;
  studentName: string;
  userRole: 'mentor' | 'student';
  onSave?: (data: DailyChecklistData) => void;
  initialData?: DailyChecklistData;
}

const DEFAULT_CHECKLIST: DailyChecklistData = {
  studentName: '',
  date: new Date().toISOString().substring(0, 10),
  mentorName: '',
  subject: '수학',
  customSubject: '',
  startTime: '15:00',
  endTime: '18:00',
  studyMinutes: 180,
  focusRate: 80,
  oneThingGoal: '',
  studyStep: ['개념', '문제풀이'],
  textbook: '',
  studyAmount: '',
  solvedProblems: 0,
  isCompleted: '완료',
  homework: '',
  coreConceptName: '',
  coreConceptDesc: '',
  wrongProblemName: '',
  wrongReason: '계산',
  wrongReasonCustom: '',
  wrongReSolve: '미완료',
  paiCheck: {
    goal: 3,
    focus: 3,
    finish: 3,
    grit: 3,
    concept: 3,
    review: 3
  },
  reflection: '',
  mentorStatus: '보통',
  mentorComment: '',
  mentorSignature: ''
};

export const DailyChecklist: React.FC<DailyChecklistProps> = ({ studentId, studentName, userRole, onSave, initialData }) => {
  const [data, setData] = useState<DailyChecklistData>(initialData || { ...DEFAULT_CHECKLIST, studentName });
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // 학생 ID 및 이름이 바뀔 때 클라우드(Supabase) 및 로컬 저장소에서 데이터 로드
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }

    const fetchLatestChecklist = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: dbData, error } = await supabase
            .from('sgs_checklists')
            .select('checklist_json')
            .eq('student_id', studentId)
            .order('date', { ascending: false })
            .limit(1);

          if (!error && dbData && dbData.length > 0) {
            setData(dbData[0].checklist_json);
            return;
          }
        } catch (e) {
          console.error('Supabase 체크지 로드 에러:', e);
        }
      }
      
      // 오프라인 폴백: 로컬스토리지 복구
      const savedChecklist = localStorage.getItem(`sgs_latest_checklist_${studentId}`);
      if (savedChecklist) {
        try {
          setData(JSON.parse(savedChecklist));
        } catch (e) {
          setData({ ...DEFAULT_CHECKLIST, studentName });
        }
      } else {
        setData({ ...DEFAULT_CHECKLIST, studentName });
      }
    };

    fetchLatestChecklist();
  }, [studentId, studentName, initialData]);

  // 시간차 계산
  useEffect(() => {
    if (data.startTime && data.endTime) {
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      
      let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMins < 0) diffMins += 24 * 60; // 다음날로 넘어갈 경우 처리
      
      setData(prev => ({ ...prev, studyMinutes: diffMins }));
    }
  }, [data.startTime, data.endTime]);

  const handleChange = (field: keyof DailyChecklistData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaiChange = (key: keyof DailyChecklistData['paiCheck'], value: number) => {
    setData(prev => ({
      ...prev,
      paiCheck: {
        ...prev.paiCheck,
        [key]: value
      }
    }));
  };

  const handleStudyStepToggle = (step: string) => {
    const currentSteps = [...data.studyStep];
    const index = currentSteps.indexOf(step);
    if (index > -1) {
      currentSteps.splice(index, 1);
    } else {
      currentSteps.push(step);
    }
    handleChange('studyStep', currentSteps);
  };

  const calculatePaiTotal = () => {
    const { goal, focus, finish, grit, concept, review } = data.paiCheck;
    return goal + focus + finish + grit + concept + review;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('체크지를 초기화하시겠습니까? 작성 중인 데이터가 지워집니다.')) {
      setData({ ...DEFAULT_CHECKLIST, studentName });
    }
  };

  const handleLocalSave = async () => {
    // 1. 최근 체크지 단일 로컬 저장 (오프라인용)
    localStorage.setItem(`sgs_latest_checklist_${studentId}`, JSON.stringify(data));
    
    // 2. 히스토리 데이터 로컬 누적 저장
    const historyKey = `sgs_checklist_history_${studentId}`;
    const savedHistory = localStorage.getItem(historyKey);
    let historyList: DailyChecklistData[] = [];
    
    if (savedHistory) {
      try {
        historyList = JSON.parse(savedHistory);
      } catch (e) {
        historyList = [];
      }
    }
    
    // 동일 날짜가 있다면 덮어쓰고, 없으면 새로 추가
    const existingIndex = historyList.findIndex(item => item.date === data.date);
    if (existingIndex > -1) {
      historyList[existingIndex] = data;
    } else {
      historyList.push(data);
    }
    
    // 날짜별 최근 순 정렬
    historyList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(historyKey, JSON.stringify(historyList));

    // 3. Supabase DB 저장
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('sgs_checklists')
          .upsert({
            student_id: studentId,
            date: data.date,
            checklist_json: data
          }, { onConflict: 'student_id,date' });
        
        if (error) throw error;
      } catch (e) {
        console.error('Supabase 체크지 동기화 실패:', e);
      }
    }

    if (onSave) {
      onSave(data);
    }
    alert('체크지가 안전하게 저장되었습니다!');
  };

  const paiTotal = calculatePaiTotal();

  return (
    <div className="sgs-container print-container">
      
      {/* no-print Control Header Banner */}
      <div className="no-print sgs-quick-banner" style={{ padding: '1rem 1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SGS 일일 학습 체크지 작성
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            * 원장님! 작성 후 [인쇄 모드]로 확인하고 인쇄(Ctrl+P)를 누르면 A4 용지 한 장에 딱 맞게 출력됩니다.
          </p>
        </div>
        
        <div className="sgs-btn-container">
          <button
            onClick={() => setIsPrintPreview(!isPrintPreview)}
            className={`sgs-btn ${isPrintPreview ? 'sgs-btn-primary' : 'sgs-btn-secondary'}`}
          >
            <Printer size={14} />
            {isPrintPreview ? '편집 모드' : '인쇄용 미리보기'}
          </button>
          <button
            onClick={handlePrint}
            className="sgs-btn sgs-btn-primary"
          >
            <Printer size={14} />
            인쇄 (Ctrl+P)
          </button>
          <button
            onClick={handleLocalSave}
            className="sgs-btn sgs-btn-accent"
          >
            <Save size={14} />
            저장하기
          </button>
          <button
            onClick={handleReset}
            className="sgs-btn sgs-btn-danger"
          >
            <RefreshCw size={12} />
            초기화
          </button>
        </div>
      </div>

      {/* --- REAL PRINT OUTPAGE (A4 STYLED CONTAINER) --- */}
      <div 
        className={`sgs-card ${isPrintPreview ? 'print-preview-mode' : ''}`}
        style={isPrintPreview ? { color: '#000000', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '0', padding: '2rem' } : undefined}
      >
        
        {/* 타이틀 헤더 */}
        <div className="text-center" style={{ paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--border-color)' }}>
          <h1 className="font-extrabold" style={{ fontSize: '1.75rem', margin: 0, color: isPrintPreview ? 'black' : 'white' }}>
            SGS 일일 학습 체크지
          </h1>
          <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            SGS Academy Daily Learning Checklist
          </p>
        </div>

        {/* 학생 / 날짜 / 멘토 인적사항 정보 */}
        <div className="sgs-form-grid sgs-form-grid-3 mb-6" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="sgs-form-group">
            <label className="sgs-label">학생명</label>
            <input
              type="text"
              value={data.studentName}
              placeholder="________"
              onChange={(e) => handleChange('studentName', e.target.value)}
              className="sgs-input"
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            />
          </div>
          <div className="sgs-form-group">
            <label className="sgs-label">날짜</label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="sgs-input"
              style={{ textAlign: 'center' }}
            />
          </div>
          <div className="sgs-form-group">
            <label className="sgs-label">멘토</label>
            <input
              type="text"
              value={data.mentorName}
              placeholder="________"
              onChange={(e) => handleChange('mentorName', e.target.value)}
              className="sgs-input"
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>

        {/* 1. 학습 기본 정보 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            1. 학습 기본 정보
          </h3>
          
          <div className="sgs-grid-12 sgs-card" style={{ padding: '1rem', backgroundColor: isPrintPreview ? 'transparent' : 'var(--bg-secondary)', border: isPrintPreview ? '1px solid black' : '1px solid var(--border-color)' }}>
            
            {/* 과목 */}
            <div className="sgs-col-6">
              <span className="sgs-label" style={{ display: 'block', marginBottom: '0.5rem' }}>과목선택</span>
              <div className="sgs-radio-group">
                {['수학', '영어', '국어', '과학', '사회'].map((sub) => (
                  <label key={sub} className="sgs-option-label">
                    <input
                      type="radio"
                      name="subject"
                      checked={data.subject === sub}
                      onChange={() => handleChange('subject', sub)}
                    />
                    <span>{sub}</span>
                  </label>
                ))}
                <label className="sgs-option-label">
                  <input
                    type="radio"
                    name="subject"
                    checked={!['수학', '영어', '국어', '과학', '사회'].includes(data.subject)}
                    onChange={() => handleChange('subject', '기타')}
                  />
                  <span>기타</span>
                  {!['수학', '영어', '국어', '과학', '사회'].includes(data.subject) || data.subject === '기타' ? (
                    <input
                      type="text"
                      placeholder="과목명"
                      value={data.customSubject || ''}
                      onChange={(e) => handleChange('customSubject', e.target.value)}
                      className="sgs-input"
                      style={{ width: '80px', padding: '2px 6px', fontSize: '0.75rem' }}
                    />
                  ) : null}
                </label>
              </div>
            </div>

            {/* 학습 시간 */}
            <div className="sgs-col-6">
              <div className="sgs-form-grid sgs-form-grid-2">
                <div className="sgs-form-group">
                  <span className="sgs-label">학습시간</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={data.startTime}
                      placeholder="15:00"
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="sgs-input"
                      style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                    />
                    <span>~</span>
                    <input
                      type="text"
                      value={data.endTime}
                      placeholder="18:00"
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="sgs-input"
                      style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      (총 <b>{data.studyMinutes}</b>분)
                    </span>
                  </div>
                </div>

                {/* 순공 집중도 */}
                <div className="sgs-form-group">
                  <span className="sgs-label">순공 집중도</span>
                  <div className="sgs-radio-group" style={{ gap: '0.375rem' }}>
                    {[50, 60, 70, 80, 90, 100].map((rate) => (
                      <label key={rate} className="sgs-option-label" style={{ fontSize: '0.7rem' }}>
                        <input
                          type="radio"
                          name="focusRate"
                          checked={data.focusRate === rate}
                          onChange={() => handleChange('focusRate', rate)}
                          style={{ width: '12px', height: '12px' }}
                        />
                        <span>{rate}%</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 오늘의 One Thing 목표 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            2. 오늘의 One Thing 목표
          </h3>
          <input
            type="text"
            value={data.oneThingGoal}
            placeholder="오늘 달성하고자 하는 단 하나의 핵심 목표를 적어주세요."
            onChange={(e) => handleChange('oneThingGoal', e.target.value)}
            className="sgs-input"
            style={{ padding: '0.75rem', borderBottom: '1px dashed var(--text-muted)' }}
          />
        </div>

        {/* 3. 오늘 학습 기록 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            3. 오늘 학습 기록
          </h3>
          
          <div className="sgs-grid-12 sgs-card" style={{ padding: '1rem', backgroundColor: isPrintPreview ? 'transparent' : 'var(--bg-secondary)', border: isPrintPreview ? '1px solid black' : '1px solid var(--border-color)' }}>
            
            {/* 학습 단계 */}
            <div className="sgs-col-12" style={{ marginBottom: '0.5rem' }}>
              <span className="sgs-label" style={{ display: 'block', marginBottom: '0.375rem' }}>학습 단계</span>
              <div className="sgs-checkbox-group">
                {['개념', '문제풀이', '오답', '심화', '복습', '테스트'].map((step) => (
                  <label key={step} className="sgs-option-label">
                    <input
                      type="checkbox"
                      checked={data.studyStep.includes(step)}
                      onChange={() => handleStudyStepToggle(step)}
                    />
                    <span>{step}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 교재/단원 및 학습량 */}
            <div className="sgs-col-5 sgs-form-group">
              <label className="sgs-label">교재/단원</label>
              <input
                type="text"
                placeholder="교재명, 대단원/소단원을 적어주세요."
                value={data.textbook}
                onChange={(e) => handleChange('textbook', e.target.value)}
                className="sgs-input"
              />
            </div>
            
            <div className="sgs-col-4 sgs-form-group">
              <label className="sgs-label">학습량 (페이지/범위)</label>
              <input
                type="text"
                placeholder="예: p.12 ~ p.35"
                value={data.studyAmount}
                onChange={(e) => handleChange('studyAmount', e.target.value)}
                className="sgs-input"
              />
            </div>

            <div className="sgs-col-3 sgs-form-group">
              <label className="sgs-label">푼 문제 수</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="0"
                  value={data.solvedProblems || ''}
                  onChange={(e) => handleChange('solvedProblems', Number(e.target.value))}
                  className="sgs-input"
                  style={{ textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.8125rem' }}>문제</span>
              </div>
            </div>

            {/* 완료 여부 */}
            <div className="sgs-col-5 sgs-form-group" style={{ marginTop: '0.5rem' }}>
              <span className="sgs-label">목표 완료도</span>
              <div className="sgs-radio-group">
                {['완료', '일부', '미완료'].map((status) => (
                  <label key={status} className="sgs-option-label">
                    <input
                      type="radio"
                      name="isCompleted"
                      checked={data.isCompleted === status}
                      onChange={() => handleChange('isCompleted', status)}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 오늘 과제 */}
            <div className="sgs-col-7 sgs-form-group" style={{ marginTop: '0.5rem' }}>
              <label className="sgs-label">오늘의 과제</label>
              <input
                type="text"
                placeholder="다음 시간에 올 때까지 해결해와야 하는 숙제"
                value={data.homework}
                onChange={(e) => handleChange('homework', e.target.value)}
                className="sgs-input"
              />
            </div>
          </div>
        </div>

        {/* 4. 핵심 개념 & 오답 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            4. 오늘의 핵심 개념 & 오답
          </h3>
          
          <div className="sgs-card" style={{ padding: '1rem', backgroundColor: isPrintPreview ? 'transparent' : 'var(--bg-secondary)', border: isPrintPreview ? '1px solid black' : '1px solid var(--border-color)' }}>
            
            {/* 핵심 개념 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '80px', color: isPrintPreview ? 'black' : 'var(--text-secondary)' }}>[핵심 개념]</span>
              <input
                type="text"
                placeholder="개념명 (예: 근의 공식)"
                value={data.coreConceptName}
                onChange={(e) => handleChange('coreConceptName', e.target.value)}
                className="sgs-input"
                style={{ flex: '1 1 150px', padding: '4px 8px', fontSize: '0.75rem' }}
              />
              <input
                type="text"
                placeholder="내 말로 쉽게 설명하기"
                value={data.coreConceptDesc}
                onChange={(e) => handleChange('coreConceptDesc', e.target.value)}
                className="sgs-input"
                style={{ flex: '2 1 250px', padding: '4px 8px', fontSize: '0.75rem' }}
              />
            </div>

            {/* 대표 오답 / 실수 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '80px', color: isPrintPreview ? 'black' : 'var(--text-secondary)' }}>[대표 오답]</span>
              <input
                type="text"
                placeholder="문제 식별 (예: 쎈 235번)"
                value={data.wrongProblemName}
                onChange={(e) => handleChange('wrongProblemName', e.target.value)}
                className="sgs-input"
                style={{ flex: '1 1 120px', padding: '4px 8px', fontSize: '0.75rem' }}
              />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', flex: '2 1 280px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>이유:</span>
                <div className="sgs-radio-group" style={{ gap: '6px' }}>
                  {['계산', '조건누락', '개념부족', '풀이생략', '시간부족'].map((reason) => (
                    <label key={reason} className="sgs-option-label" style={{ fontSize: '0.7rem' }}>
                      <input
                        type="radio"
                        name="wrongReason"
                        checked={data.wrongReason === reason}
                        onChange={() => handleChange('wrongReason', reason)}
                        style={{ width: '12px', height: '12px' }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                  <label className="sgs-option-label" style={{ fontSize: '0.7rem' }}>
                    <input
                      type="radio"
                      name="wrongReason"
                      checked={!['계산', '조건누락', '개념부족', '풀이생략', '시간부족'].includes(data.wrongReason)}
                      onChange={() => handleChange('wrongReason', '기타')}
                      style={{ width: '12px', height: '12px' }}
                    />
                    <span>기타</span>
                    {!['계산', '조건누락', '개념부족', '풀이생략', '시간부족'].includes(data.wrongReason) || data.wrongReason === '기타' ? (
                      <input
                        type="text"
                        placeholder="사유"
                        value={data.wrongReasonCustom || ''}
                        onChange={(e) => handleChange('wrongReasonCustom', e.target.value)}
                        className="sgs-input"
                        style={{ width: '60px', padding: '2px 4px', fontSize: '0.7rem' }}
                      />
                    ) : null}
                  </label>
                </div>
              </div>

              {/* 다시 풀기 상태 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>다시풀기:</span>
                <div className="sgs-radio-group" style={{ gap: '6px' }}>
                  {['완료', '미완료'].map((st) => (
                    <label key={st} className="sgs-option-label" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                      <input
                        type="radio"
                        name="wrongReSolve"
                        checked={data.wrongReSolve === st}
                        onChange={() => handleChange('wrongReSolve', st)}
                        style={{ width: '12px', height: '12px' }}
                      />
                      <span style={{ color: st === '완료' ? 'var(--status-perfect)' : 'var(--status-danger)' }}>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 5. PAI 학습 태도 체크 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            5. PAI 학습 태도 체크 (1점 낮음 / 3점 보통 / 5점 좋음)
          </h3>
          
          <div className="sgs-table-container">
            <table className="sgs-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', width: '45%' }}>평가 항목</th>
                  <th style={{ width: '8%' }}>1점</th>
                  <th style={{ width: '8%' }}>2점</th>
                  <th style={{ width: '8%' }}>3점</th>
                  <th style={{ width: '8%' }}>4점</th>
                  <th style={{ width: '8%' }}>5점</th>
                  <th style={{ width: '12%', backgroundColor: 'rgba(255,255,255,0.02)' }}>점수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'goal', label: '목표를 세우고 공부를 시작했다 (목표계획)' },
                  { key: 'focus', label: '주위 유혹을 이겨내고 집중했다 (집중)' },
                  { key: 'finish', label: '오늘 계획한 공부 양을 모두 완수했다 (완수)' },
                  { key: 'grit', label: '모르는 문제도 쉽게 포기하지 않고 끈기있게 고민했다 (끈기)' },
                  { key: 'concept', label: '배운 핵심 개념을 나만의 언어로 정리했다 (개념정리)' },
                  { key: 'review', label: '틀린 오답의 정확한 원인을 진단하고 점검했다 (오답점검)' },
                ].map((row) => (
                  <tr key={row.key}>
                    <td className="text-left" style={{ fontWeight: '500' }}>{row.label}</td>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <td key={score}>
                        <input
                          type="radio"
                          name={`pai-${row.key}`}
                          checked={data.paiCheck[row.key as keyof DailyChecklistData['paiCheck']] === score}
                          onChange={() => handlePaiChange(row.key as keyof DailyChecklistData['paiCheck'], score)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    ))}
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-indigo)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {data.paiCheck[row.key as keyof DailyChecklistData['paiCheck']]}점
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: isPrintPreview ? '#f2f2f2' : 'rgba(99, 102, 241, 0.05)' }}>
                  <td className="text-left" style={{ fontSize: '0.8125rem' }}>PAI 학습 태도 총점</td>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: '1rem', color: 'var(--text-secondary)' }}>각 점수 합산:</td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{paiTotal}</span> / 30점
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. 오늘의 한 줄 성찰 */}
        <div className="mb-6">
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            6. 오늘의 한 줄 성찰
          </h3>
          <textarea
            value={data.reflection}
            placeholder="오늘 하루 공부하며 느낀 성장이나 아쉬웠던 태도를 적고 내일의 행동 강령을 한 줄로 적어주세요."
            onChange={(e) => handleChange('reflection', e.target.value)}
            rows={2}
            className="sgs-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* 7. 멘토 확인 */}
        <div>
          <h3 className="font-bold" style={{ fontSize: '0.875rem', color: isPrintPreview ? 'black' : 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <span className="indicator" style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-indigo)', display: 'inline-block', borderRadius: '2px' }}></span>
            7. 멘토 확인 & 종합 피드백
          </h3>
          
          <div className="sgs-grid-12 sgs-card" style={{ padding: '1rem', backgroundColor: isPrintPreview ? 'transparent' : 'var(--bg-secondary)', border: isPrintPreview ? '1px solid black' : '1px solid var(--border-color)' }}>
            
            {/* 상태 */}
            <div className="sgs-col-4 sgs-form-group">
              <span className="sgs-label">학습상태 판정</span>
              <div className="sgs-radio-group">
                {['좋음', '보통', '보완필요', '집중관리'].map((status) => (
                  <label key={status} className="sgs-option-label" style={{ fontWeight: 'bold' }}>
                    <input
                      type="radio"
                      name="mentorStatus"
                      checked={data.mentorStatus === status}
                      onChange={() => handleChange('mentorStatus', status)}
                      disabled={userRole === 'student'}
                    />
                    <span style={{ 
                      color: status === '좋음' ? 'var(--status-perfect)' :
                             status === '보통' ? 'var(--status-good)' :
                             status === '보완필요' ? 'var(--status-warn)' :
                             'var(--status-danger)'
                    }}>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 코멘트 */}
            <div className="sgs-col-5 sgs-form-group">
              <label className="sgs-label">멘토 코멘트</label>
              <input
                type="text"
                placeholder="오늘 학습 상태에 대해 남겨줄 코멘트"
                value={data.mentorComment}
                onChange={(e) => handleChange('mentorComment', e.target.value)}
                className="sgs-input"
                disabled={userRole === 'student'}
              />
            </div>

            {/* 서명 */}
            <div className="sgs-col-3 sgs-form-group">
              <label className="sgs-label">멘토 서명</label>
              <input
                type="text"
                placeholder="서명/이름"
                value={data.mentorSignature}
                onChange={(e) => handleChange('mentorSignature', e.target.value)}
                className="sgs-input"
                style={{ textAlign: 'center' }}
                disabled={userRole === 'student'}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
