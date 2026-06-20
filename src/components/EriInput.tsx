import React, { useState } from 'react';
import { AlertCircle, Save, Award, Flame, RefreshCw } from 'lucide-react';
import type { SubjectKey, SubjectEri, EriArea, EriStatus } from '../types';
import { DEFAULT_ERI_DATA } from '../types';

interface EriInputProps {
  eriData: Record<SubjectKey, SubjectEri>;
  onSave: (updatedData: Record<SubjectKey, SubjectEri>) => void;
  userRole?: 'mentor' | 'student';
}

const MATH_PRESETS = {
  general: { concept: 2, basic: 2, applied: 2, hardcore: 1, school_material: 2, wrong_answers: 2, test_set: 5 },
  high: { concept: 2, basic: 2, applied: 3, hardcore: 2, school_material: 3, wrong_answers: 2, test_set: 8 },
  gangnam: { concept: 2, basic: 2, applied: 3, hardcore: 3, school_material: 3, wrong_answers: 3, test_set: 10 },
  medical: { concept: 3, basic: 3, applied: 4, hardcore: 5, school_material: 3, wrong_answers: 4, test_set: 15 }
};

export const EriInput: React.FC<EriInputProps> = ({ eriData, onSave, userRole = 'mentor' }) => {
  const [localData, setLocalData] = useState<Record<SubjectKey, SubjectEri>>(
    JSON.parse(JSON.stringify(eriData))
  );
  const [activeTab, setActiveTab] = useState<SubjectKey>('math');

  const calculateAreaScore = (area: EriArea): number => {
    if (area.target <= 0) return 0;
    const rawScore = (area.weight * area.current) / area.target;
    return Math.min(area.weight, parseFloat(rawScore.toFixed(1)));
  };

  const calculateAreaPercentage = (area: EriArea): number => {
    if (area.target <= 0) return 0;
    return Math.min(100, Math.round((area.current / area.target) * 100));
  };

  const calculateTotalScore = (subjectData: SubjectEri): number => {
    return Math.min(100, Math.round(
      subjectData.areas.reduce((sum, area) => sum + calculateAreaScore(area), 0)
    ));
  };

  const getEriStatus = (score: number): EriStatus => {
    if (score >= 90) return '최상위권형';
    if (score >= 80) return '양호';
    if (score >= 65) return '보통';
    if (score >= 50) return '보완';
    return '위험';
  };

  const getStatusColor = (status: EriStatus): string => {
    switch (status) {
      case '최상위권형': return 'perfect';
      case '양호': return 'good';
      case '보통': return 'normal';
      case '보완': return 'warn';
      case '위험': return 'danger';
    }
  };

  const handleValueChange = (subject: SubjectKey, areaIndex: number, val: number) => {
    const updated = { ...localData };
    const parsedVal = Math.max(0, parseFloat(val.toFixed(1)));
    updated[subject].areas[areaIndex].current = parsedVal;
    setLocalData(updated);
  };

  const handleTargetChange = (subject: SubjectKey, areaIndex: number, val: number) => {
    const updated = { ...localData };
    const parsedVal = Math.max(0.1, parseFloat(val.toFixed(1)));
    updated[subject].areas[areaIndex].target = parsedVal;
    setLocalData(updated);
  };

  const applyPreset = (presetType: 'general' | 'high' | 'gangnam' | 'medical') => {
    if (activeTab !== 'math') return;
    
    const updated = { ...localData };
    const preset = MATH_PRESETS[presetType];
    
    updated.math.areas = updated.math.areas.map(area => {
      const areaKey = area.key as keyof typeof preset;
      if (preset[areaKey] !== undefined) {
        return {
          ...area,
          target: preset[areaKey]
        };
      }
      return area;
    });
    
    setLocalData(updated);
    alert(`수학 과목에 [${
      presetType === 'general' ? '일반 학교' : 
      presetType === 'high' ? '상위권 학교' : 
      presetType === 'gangnam' ? '강남권/고난도 학교' : '의대/메디컬 초극강'
    }] 최상위권 기준이 적용되었습니다!`);
  };

  const handleReset = () => {
    if (window.confirm(`${localData[activeTab].subjectName} 과목의 입력값을 초기화하시겠습니까?`)) {
      const updated = { ...localData };
      updated[activeTab] = JSON.parse(JSON.stringify(DEFAULT_ERI_DATA[activeTab]));
      setLocalData(updated);
    }
  };

  const handleSaveAll = () => {
    onSave(localData);
    alert('모든 과목의 ERI 진행 데이터가 저장되었습니다!');
  };

  const currentSubjectData = localData[activeTab];
  const totalScore = calculateTotalScore(currentSubjectData);
  const eriStatus = getEriStatus(totalScore);

  return (
    <div className="sgs-container">
      
      {/* 탭 헤더 */}
      <div className="sgs-quick-banner" style={{ padding: '1rem 1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            과목별 ERI 상세 입력 및 기준 조정
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {userRole === 'mentor' 
              ? '* 원장님, 각 영역별 슬라이더를 움직이거나 직접 입력하여 학생의 현재 시험대비 진행도를 기록해 주세요.'
              : '* 각 영역별 슬라이더를 움직이거나 직접 입력하여 현재 시험대비 진행도를 스스로 기록하고 저장해 주세요.'}
          </p>
        </div>
        
        <button
          onClick={handleSaveAll}
          className="sgs-btn sgs-btn-primary"
        >
          <Save size={14} />
          ERI 진행 데이터 저장하기
        </button>
      </div>

      {/* 과목 내비게이션 탭 */}
      <div className="sgs-eri-header-btn">
        {(Object.keys(localData) as SubjectKey[]).map((subKey) => {
          const subData = localData[subKey];
          const subScore = calculateTotalScore(subData);
          const isActive = activeTab === subKey;

          return (
            <button
              key={subKey}
              onClick={() => setActiveTab(subKey)}
              className={`sgs-eri-tab ${isActive ? 'active' : ''}`}
            >
              <span>{subData.subjectName}</span>
              <span className={`sgs-score-badge ${subScore >= 80 ? 'perfect' : subScore >= 50 ? 'good' : 'warn'}`}>
                {subScore}점
              </span>
            </button>
          );
        })}
      </div>

      {/* 대시보드 뷰 및 카드 구성 */}
      <div className="sgs-grid-12">
        
        {/* 입력 및 계산기 폼 영역 */}
        <div className="sgs-col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* 수학일 경우 프리셋 제공 */}
          {activeTab === 'math' && userRole === 'mentor' && (
            <div className="sgs-preset-banner">
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} className="text-purple-400" />
                수학 최상위권 기준 설정 프리셋:
              </span>
              <div className="sgs-preset-btns">
                {(['general', 'high', 'gangnam', 'medical'] as const).map((type) => {
                  const isMedical = type === 'medical';
                  return (
                    <button
                      key={type}
                      onClick={() => applyPreset(type)}
                      className={`sgs-preset-btn ${isMedical ? 'medical-btn' : ''}`}
                      style={isMedical ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        border: '1px solid #f87171',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
                        padding: '0.3rem 0.8rem'
                      } : undefined}
                    >
                      {type === 'general' ? '일반학교' : 
                       type === 'high' ? '상위권학교' : 
                       type === 'gangnam' ? '강남/고난도' : '🔥 의대/메디컬'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="sgs-card">
            {currentSubjectData.areas.map((area, idx) => {
              const score = calculateAreaScore(area);
              const percentage = calculateAreaPercentage(area);
              
              return (
                <div key={area.key} className="sgs-input-item-row">
                  <div className="sgs-input-item-header">
                    <div>
                      <span className="sgs-input-item-info">{area.name}</span>
                      <span className="sgs-input-item-desc">({area.description})</span>
                    </div>
                    
                    <div className="sgs-input-item-controls">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        배점: <span style={{ fontWeight: '600', color: 'white' }}>{area.weight}점</span>
                      </span>
                      
                      {/* 입력 타겟 커스텀 조정 */}
                      <div className="sgs-input-target-box">
                        <span>기준:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={area.target}
                          onChange={(e) => handleTargetChange(activeTab, idx, Number(e.target.value))}
                          disabled={userRole === 'student'}
                        />
                        <span>{area.unit}</span>
                      </div>

                      {/* 실시간 획득 점수 */}
                      <span className="sgs-item-score-value">{score}점</span>
                    </div>
                  </div>

                  <div className="sgs-slider-group">
                    {/* 현재 달성 슬라이더 */}
                    <input
                      type="range"
                      min="0"
                      max={Math.max(area.target * 1.5, 5)}
                      step={area.unit === '문항' ? '5' : '0.5'}
                      value={area.current}
                      onChange={(e) => handleValueChange(activeTab, idx, Number(e.target.value))}
                      className="sgs-range-slider"
                    />

                    {/* 수동 인풋 */}
                    <div className="sgs-slider-num-input">
                      <input
                        type="number"
                        step={area.unit === '문항' ? '1' : '0.1'}
                        value={area.current}
                        onChange={(e) => handleValueChange(activeTab, idx, Number(e.target.value))}
                      />
                      <span>{area.unit}</span>
                    </div>
                  </div>

                  {/* 미니 게이지 바 */}
                  <div className="sgs-item-meta-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>달성도:</span>
                      <span style={{ fontWeight: 'bold', color: percentage >= 100 ? 'var(--status-perfect)' : percentage >= 50 ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>{percentage}%</span>
                      <div className="sgs-progress-track" style={{ width: '60px', height: '4px', display: 'inline-block', marginLeft: '4px' }}>
                        <div 
                          className="sgs-progress-bar mid"
                          style={{ width: `${percentage}%`, height: '100%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <span>최상위 기준: <b>{area.target}</b>{area.unit}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {userRole === 'mentor' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={handleReset}
                className="sgs-btn sgs-btn-danger"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.7rem' }}
              >
                <RefreshCw size={12} />
                {currentSubjectData.subjectName} 데이터 초기화
              </button>
            </div>
          )}
        </div>

        {/* ERI 실시간 결과 대시보드 */}
        <div className="sgs-col-4">
          <div className="sgs-card" style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              실시간 {currentSubjectData.subjectName} ERI 결과
            </h3>

            {/* ERI 점수 원형 서클 */}
            <div className="sgs-circle-chart-container">
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={
                    totalScore >= 90 ? 'var(--status-perfect)' :
                    totalScore >= 80 ? 'var(--status-good)' :
                    totalScore >= 65 ? 'var(--status-normal)' :
                    totalScore >= 50 ? 'var(--status-warn)' : 'var(--status-danger)'
                  }
                  strokeWidth="10"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * totalScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
              <div className="sgs-circle-chart-text">
                <span className="sgs-circle-chart-score">{totalScore}</span>
                <span className="sgs-circle-chart-label">ERI INDEX</span>
              </div>
            </div>

            {/* ERI 상태 태그 */}
            <div className={`sgs-status-tag ${getStatusColor(eriStatus)}`} style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', display: 'block', opacity: 0.65, fontWeight: 'medium', marginBottom: '2px' }}>현재 준비 상태</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Award size={16} />
                {eriStatus}
              </span>
            </div>

            {/* ERI 점수대별 가이드 */}
            <div className="bg-slate-950-80" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '8px' }}>
                <AlertCircle size={14} className="text-indigo-400" />
                지표 판정 가이드
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--status-perfect)', fontWeight: 'bold' }}>90~100 (최상위권형)</span>
                  <span>상위 1% 루틴 완성</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--status-good)', fontWeight: 'bold' }}>80~89 (양호)</span>
                  <span>상위권 도달, 마감</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--status-normal)', fontWeight: 'bold' }}>65~79 (보통)</span>
                  <span>기본형, 오답/실전 보충</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--status-warn)', fontWeight: 'bold' }}>50~64 (보완)</span>
                  <span>개념/회독 구멍 존재</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--status-danger)', fontWeight: 'bold' }}>0~49 (위험)</span>
                  <span>시험 범위 장악 시급</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};
