import React, { useState } from 'react';
import { AlertCircle, Save, Award, RefreshCw, Compass } from 'lucide-react';
import type { SubjectKey, SubjectEri, EriArea, EriStatus, StudyLevel, SchoolType } from '../types';
import { STUDY_LEVEL_CONFIGS } from '../types';
import { buildAreasForLevel } from '../studyLevelPresets';

interface EriInputProps {
  eriData: Record<SubjectKey, SubjectEri>;
  onSave: (updatedData: Record<SubjectKey, SubjectEri>) => void;
  userRole?: 'mentor' | 'student';
  studyLevel?: StudyLevel;
  schoolType?: SchoolType;
}

export const EriInput: React.FC<EriInputProps> = ({ 
  eriData, 
  onSave, 
  userRole = 'mentor',
  studyLevel = 'intermediate',
  schoolType = '일반고'
}) => {
  const [localData, setLocalData] = useState<Record<SubjectKey, SubjectEri>>(
    JSON.parse(JSON.stringify(eriData))
  );
  const [activeTab, setActiveTab] = useState<SubjectKey>('math');

  // 영역별 점수 계산 (면제 영역은 0점 처리)
  const calculateAreaScore = (area: EriArea): number => {
    if (area.target <= 0 || area.isExempt) return 0;
    const rawScore = (area.weight * area.current) / area.target;
    return Math.min(area.weight, parseFloat(rawScore.toFixed(1)));
  };

  // 영역별 달성도(%) 계산 (면제 영역은 100% 달성)
  const calculateAreaPercentage = (area: EriArea): number => {
    if (area.target <= 0 || area.isExempt) return 100;
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
    const parsedVal = Math.max(0, parseFloat(val.toFixed(1)));
    updated[subject].areas[areaIndex].target = parsedVal;
    setLocalData(updated);
  };

  // 학생 수준별 학습 레벨 프리셋 적용 (현재 과목 또는 전체 과목)
  const applyLevelPreset = (targetLevel: StudyLevel, applyToAll: boolean = false) => {
    const updated = { ...localData };
    const levelMeta = STUDY_LEVEL_CONFIGS[targetLevel];

    if (applyToAll) {
      (Object.keys(updated) as SubjectKey[]).forEach(subKey => {
        updated[subKey].studyLevel = targetLevel;
        updated[subKey].areas = buildAreasForLevel(
          subKey, 
          targetLevel, 
          schoolType, 
          updated[subKey].areas
        );
      });
      setLocalData(updated);
      alert(`모든 5개 과목에 [${levelMeta.name}] 맞춤 목표 및 가중치 기준이 일괄 적용되었습니다!`);
    } else {
      updated[activeTab].studyLevel = targetLevel;
      updated[activeTab].areas = buildAreasForLevel(
        activeTab, 
        targetLevel, 
        schoolType, 
        updated[activeTab].areas
      );
      setLocalData(updated);
      alert(`[${updated[activeTab].subjectName}] 과목에 [${levelMeta.name}] 맞춤 기준이 적용되었습니다!\n(${levelMeta.desc})`);
    }
  };

  const handleReset = () => {
    if (window.confirm(`${localData[activeTab].subjectName} 과목의 입력값을 초기화하시겠습니까?`)) {
      const updated = { ...localData };
      const currentLevel = updated[activeTab].studyLevel || studyLevel;
      updated[activeTab].areas = buildAreasForLevel(activeTab, currentLevel, schoolType);
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
          
          {/* 학생 학습 수준별 ERI 맞춤 프리셋 설정 (전 과목 지원) */}
          {userRole === 'mentor' && (
            <div className="sgs-preset-banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.9rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={15} className="text-indigo-400" />
                  [{currentSubjectData.subjectName}] 학생 수준별 맞춤 기준(Target/배점) 자동 세팅:
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  * 대장님의 교육철학: 학생 실력에 딱 맞는 100미터 달리기 목표 부여
                </span>
              </div>

              <div className="sgs-preset-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['basic', 'intermediate', 'advanced', 'top'] as const).map((lvl) => {
                  const meta = STUDY_LEVEL_CONFIGS[lvl];
                  const isCurrent = (currentSubjectData.studyLevel || studyLevel) === lvl;

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => applyLevelPreset(lvl, false)}
                      className={`sgs-preset-btn ${isCurrent ? 'active' : ''}`}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.75rem',
                        fontWeight: isCurrent ? '800' : '600',
                        color: isCurrent ? '#ffffff' : meta.accentColor,
                        backgroundColor: isCurrent ? meta.accentColor : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isCurrent ? meta.accentColor : `${meta.accentColor}55`}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`${meta.desc} (${meta.targetGoal})`}
                    >
                      {meta.badge} {meta.name}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const currentLvl = currentSubjectData.studyLevel || studyLevel;
                    if (window.confirm(`현재 선택된 [${STUDY_LEVEL_CONFIGS[currentLvl].name}] 기준을 국·영·수·과·사 5개 전 과목에 일괄 적용하시겠습니까?`)) {
                      applyLevelPreset(currentLvl, true);
                    }
                  }}
                  className="sgs-btn"
                  style={{
                    marginLeft: 'auto',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#818cf8',
                    borderRadius: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  ⚡ 전 과목 일괄 적용
                </button>
              </div>
            </div>
          )}

          <div className="sgs-card">
            {currentSubjectData.areas.map((area, idx) => {
              const isExempt = area.isExempt || area.target <= 0;
              const score = calculateAreaScore(area);
              const percentage = calculateAreaPercentage(area);
              
              return (
                <div key={area.key} className="sgs-input-item-row" style={{ opacity: isExempt ? 0.75 : 1 }}>
                  <div className="sgs-input-item-header">
                    <div>
                      <span className="sgs-input-item-info">
                        {area.name}
                        {isExempt && (
                          <span style={{ 
                            marginLeft: '6px', 
                            fontSize: '0.65rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#10b981', 
                            fontWeight: 'bold',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            🌱 기초 트랙 완주 면제
                          </span>
                        )}
                      </span>
                      <span className="sgs-input-item-desc">({area.description})</span>
                    </div>
                    
                    <div className="sgs-input-item-controls">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        배점: <span style={{ fontWeight: '600', color: isExempt ? 'var(--text-muted)' : 'white' }}>{area.weight}점</span>
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
                      <span className="sgs-item-score-value">
                        {isExempt ? (
                          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>면제</span>
                        ) : (
                          `${score}점`
                        )}
                      </span>
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
