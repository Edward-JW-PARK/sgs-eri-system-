import React, { useState, useEffect } from 'react';
import { Copy, Printer, CheckCircle, Sparkles, HelpCircle, AlertCircle, TrendingUp } from 'lucide-react';
import type { SubjectKey, SubjectEri, EriArea, EriStatus, DailyChecklistData } from '../types';

interface EriDashboardProps {
  eriData: Record<SubjectKey, SubjectEri>;
  studentName: string;
  examName: string;
  dDay: string;
  onUpdateHeader?: (studentName: string, examName: string, dDay: string) => void;
  userRole?: 'mentor' | 'student';
  studentId: string;
}

export const EriDashboard: React.FC<EriDashboardProps> = ({
  eriData,
  studentName,
  examName,
  dDay,
  onUpdateHeader,
  userRole = 'mentor',
  studentId
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('math');
  const [copiedSubject, setCopiedSubject] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<DailyChecklistData[]>([]);

  // 1. 컴포넌트 마운트 및 studentId 변경 시 일일체크지 히스토리 데이터 로드
  useEffect(() => {
    if (studentId) {
      const savedHistory = localStorage.getItem(`sgs_checklist_history_${studentId}`);
      if (savedHistory) {
        try {
          setHistoryData(JSON.parse(savedHistory));
        } catch (e) {
          setHistoryData([]);
        }
      } else {
        // 하위 호환성 마이그레이션: 기존 단일 최신 체크지 기록이 있는 경우 배열로 복구
        const legacy = localStorage.getItem(`sgs_latest_checklist_${studentId}`);
        if (legacy) {
          try {
            setHistoryData([JSON.parse(legacy)]);
          } catch (e) {
            setHistoryData([]);
          }
        } else {
          setHistoryData([]);
        }
      }
    }
  }, [studentId]);

  // 최근 7일 학습 데이터 파싱
  const recentLogs = historyData.slice(0, 7);

  // 평균 순공시간 계산
  const avgMinutes = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((sum, log) => sum + (log.studyMinutes || 0), 0) / recentLogs.length)
    : 0;

  // 평균 푼 문제수 계산
  const avgSolved = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((sum, log) => sum + (log.solvedProblems || 0), 0) / recentLogs.length)
    : 0;

  // 단일 로그의 PAI 합산 점수 도출
  const getPaiTotalScore = (paiCheck: DailyChecklistData['paiCheck']): number => {
    if (!paiCheck) return 0;
    return (paiCheck.goal || 0) + (paiCheck.focus || 0) + (paiCheck.finish || 0) +
           (paiCheck.grit || 0) + (paiCheck.concept || 0) + (paiCheck.review || 0);
  };

  // 평균 PAI 학습 태도 점수 계산
  const avgPai = recentLogs.length > 0
    ? parseFloat((recentLogs.reduce((sum, log) => sum + getPaiTotalScore(log.paiCheck), 0) / recentLogs.length).toFixed(1))
    : 0;

  // 보정 계수 모델 연산
  const getPaiBonus = (avgPaiVal: number): number => {
    if (avgPaiVal === 0) return 0;
    if (avgPaiVal >= 24) return 5;   // 최성실 구간
    if (avgPaiVal < 18) return -5;  // 태도 보완 구간
    return 0;
  };

  const getVolumeBonus = (avgSolvedVal: number): number => {
    if (avgSolvedVal === 0) return 0;
    if (avgSolvedVal >= 50) return 3;   // 다량 문제 연습
    if (avgSolvedVal < 15) return -3;  // 절대 문제량 부족
    return 0;
  };

  const paiBonus = getPaiBonus(avgPai);
  const volumeBonus = getVolumeBonus(avgSolved);
  const totalBonus = paiBonus + volumeBonus;

  // 영역별 점수 계산
  const calculateAreaScore = (area: EriArea): number => {
    if (area.target <= 0) return 0;
    return Math.min(area.weight, parseFloat(((area.weight * area.current) / area.target).toFixed(1)));
  };

  // 영역별 달성도(%) 계산
  const calculateAreaPercentage = (area: EriArea): number => {
    if (area.target <= 0) return 0;
    return Math.min(100, Math.round((area.current / area.target) * 100));
  };

  // 순수 원본 ERI 완성도 점수 계산 (보정 미적용)
  const calculateRawTotalScore = (subjectData: SubjectEri): number => {
    return Math.min(100, Math.round(
      subjectData.areas.reduce((sum, area) => sum + calculateAreaScore(area), 0)
    ));
  };

  // 종합 보정 ERI 완성도 점수 계산
  const calculateTotalScore = (subjectData: SubjectEri): number => {
    const rawScore = calculateRawTotalScore(subjectData);
    if (recentLogs.length === 0) return rawScore; // 누적 히스토리가 없으면 보정 미작동
    return Math.max(0, Math.min(100, rawScore + totalBonus));
  };

  // ERI 상태 판정
  const getEriStatus = (score: number): EriStatus => {
    if (score >= 90) return '최상위권형';
    if (score >= 80) return '양호';
    if (score >= 65) return '보통';
    if (score >= 50) return '보완';
    return '위험';
  };

  const getStatusColorClass = (status: EriStatus): string => {
    switch (status) {
      case '최상위권형': return 'perfect';
      case '양호': return 'good';
      case '보통': return 'normal';
      case '보완': return 'warn';
      case '위험': return 'danger';
    }
  };

  // 핵심 취약 영역 추출
  const getWeakestArea = (subjectData: SubjectEri): string => {
    const weakAreas = [...subjectData.areas]
      .map(area => ({ area, pct: calculateAreaPercentage(area) }))
      .filter(item => item.pct < 70)
      .sort((a, b) => a.pct - b.pct);
      
    if (weakAreas.length > 0) {
      return weakAreas[0].area.name;
    }
    return '없음 (균형 잡힘)';
  };

  // 동적 자동 진단문 생성
  const generateDiagnosticText = (subKey: SubjectKey): string => {
    const subData = eriData[subKey];
    const score = calculateTotalScore(subData);
    const status = getEriStatus(score);
    
    const areasWithPct = subData.areas.map(area => ({
      ...area,
      pct: calculateAreaPercentage(area),
      score: calculateAreaScore(area)
    }));

    const strongAreas = areasWithPct.filter(a => a.pct >= 75).map(a => a.name);
    const weakAreas = areasWithPct.filter(a => a.pct < 60).sort((a, b) => a.pct - b.pct);

    let baseText = '';

    if (score >= 90) {
      baseText = `현재 ${subData.subjectName} ERI는 ${score}점으로 [최상위권형] 준비 상태입니다. 모든 대비 영역에서 고른 완성도를 보이고 있으며, 계획한 개념 회독과 실전 테스트가 완벽히 소화되었습니다. 시험 전까지 실수 유발 포인트를 차분히 점검하고 시간 단축 연습만 이어가면 고득점이 매우 유력합니다.`;
    } else {
      baseText = `현재 ${subData.subjectName} ERI는 ${score}점(${status})입니다. `;
      
      if (strongAreas.length > 0) {
        baseText += `단원 파악이나 ${strongAreas.slice(0, 2).join(', ')} 영역은 긍정적으로 진행되었으나, `;
      } else {
        baseText += `전반적인 시험 준비 진행 속도가 느린 편이며, `;
      }

      if (weakAreas.length > 0) {
        const weakNames = weakAreas.slice(0, 2).map(a => `${a.name}(달성률 ${a.pct}%)`).join(', ');
        baseText += `최상위권의 준비 기준과 비교해 볼 때 상대적으로 ${weakNames} 영역이 많이 누락되어 보완이 시급합니다. `;
        
        if (subKey === 'math') {
          const schoolMaterial = areasWithPct.find(a => a.key === 'school_material');
          const wrongAnswers = areasWithPct.find(a => a.key === 'wrong_answers');
          if (schoolMaterial && schoolMaterial.pct < 50) {
            baseText += `특히 학교 유인물과 교과서의 완벽한 반복이 이루어지지 않아 실제 내신 변형 문제에 취약할 수 있습니다. `;
          }
          if (wrongAnswers && wrongAnswers.pct < 50) {
            baseText += `오답을 확실히 걸러내고 자기 힘으로 재풀이하는 훈련이 부족하여 아는 문제를 또 틀리는 실수가 반복될 염려가 있습니다. `;
          }
        }
      } else {
        baseText += `기본적인 준비 루틴은 수행되고 있으나 상위권 변별력을 가를 심화 보강과 실전 모의 테스트 훈련이 추가로 이루어져야 안정적인 1등급 도달이 가능합니다. `;
      }
    }

    // 학습 태도 및 학습량에 의한 보정 분석 추가
    if (recentLogs.length > 0 && totalBonus !== 0) {
      baseText += ` [태도/학습량 종합 진단] 최근 일평균 PAI 태도 점수 ${avgPai}점, 일평균 풀이량 ${avgSolved}문제로 측정되어 최종 ERI 지수에 ${totalBonus > 0 ? `+${totalBonus}점의 우수 보정` : `${totalBonus}점의 보완 감점`}이 반영되었습니다.`;
    }

    return baseText;
  };

  // 다음 주 처방 Action Items 자동 생성
  const generatePrescriptions = (subKey: SubjectKey): string[] => {
    const subData = eriData[subKey];
    const prescriptions: string[] = [];
    
    const areasWithPct = subData.areas.map(area => ({
      ...area,
      pct: calculateAreaPercentage(area)
    }));

    const weakAreas = areasWithPct.filter(a => a.pct < 70).sort((a, b) => a.pct - b.pct);

    // 학습 태도 및 학습량이 저조할 경우 우선 처방 강제 추가
    if (avgPai > 0 && avgPai < 18) {
      prescriptions.push('PAI 점수 개선을 위한 매일 One Thing 목표 수립 및 멘토 확인 서명 습관화');
    }
    if (avgSolved > 0 && avgSolved < 15) {
      prescriptions.push(`과목별 일일 문제 풀이량 최소 20문항 강제 할당 및 당일 채점 완료`);
    }

    if (weakAreas.length === 0) {
      prescriptions.push('오답노트에 기록된 고난도 문항 전체 3회독 및 무한 인출 연습');
      prescriptions.push('기출 모의고사 OMR 마킹 및 45분 시간 제한 실전 테스트 2회 추가');
      return prescriptions.slice(0, 3);
    }

    weakAreas.forEach(item => {
      const remainingTarget = Math.max(0.5, item.target - item.current);
      
      if (subKey === 'math') {
        switch (item.key) {
          case 'concept':
            prescriptions.push(`단원별 핵심 공식과 개념 정리 1회독 추가 및 설명 테스트`);
            break;
          case 'basic':
            prescriptions.push(`기본 문제집 틀린 문제 위주로 ${remainingTarget}회독 신속 완수`);
            break;
          case 'applied':
            prescriptions.push(`쎈/유형서 오답 및 대표 유형 ${remainingTarget}회독 집중 재풀이`);
            break;
          case 'hardcore':
            prescriptions.push(`학교 시험지 킬러 변별 문항(서술형 대비) ${remainingTarget}회독 분석 및 정립`);
            break;
          case 'school_material':
            prescriptions.push(`학교 수학 프린트물 및 교과서 고난도 문제 ${remainingTarget}회독 반복 수행`);
            break;
          case 'wrong_answers':
            prescriptions.push(`개인 오답 유사 문항 재풀이(최소 ${Math.round(remainingTarget * 2)}회 반복)`);
            break;
          case 'test_set':
            prescriptions.push(`실전 봉투 모의고사 OMR 작성 및 시간 제한 테스트 ${Math.ceil(remainingTarget)}회분 실시`);
            break;
        }
      } else {
        if (item.unit === '회독') {
          prescriptions.push(`${item.name} 교재 및 교과서 필기 ${remainingTarget}회독 보완`);
        } else if (item.unit === '문항') {
          prescriptions.push(`${item.name} 핵심 문제 ${Math.ceil(remainingTarget)}문항 추가 풀이 및 채점`);
        } else if (item.unit === '회') {
          prescriptions.push(`${item.name} 자가 인출 및 암기 테스트 ${Math.ceil(remainingTarget)}회 보강`);
        } else {
          prescriptions.push(`${item.name} 달성률 강화를 위한 스케줄 우선 배정`);
        }
      }
    });

    if (prescriptions.length < 2) {
      prescriptions.push('주중 매일 플래너 이행도 체크 및 멘토 확인 필수 피드백 수렴');
    }

    return prescriptions.slice(0, 4); // 최대 4개 처방 유지
  };

  const handleCopyText = (subKey: SubjectKey) => {
    const subData = eriData[subKey];
    const rawScore = calculateRawTotalScore(subData);
    const score = calculateTotalScore(subData);
    const status = getEriStatus(score);
    const diagText = generateDiagnosticText(subKey);
    const prescs = generatePrescriptions(subKey);

    const bonusInfo = recentLogs.length > 0 && totalBonus !== 0
      ? `\n* 최근 일주일 학습 성실도(PAI/문제풀이량) 보정이 적용되었습니다. (진척 지수: ${rawScore}점 ${totalBonus > 0 ? `+${totalBonus}` : totalBonus}점 성실도 보정)`
      : '';

    const checklistSummary = recentLogs.length > 0
      ? [
          '■ 최근 7일 학습 성실도 요약:',
          `- PAI 학습태도 평점: ${avgPai}점 / 30.0점`,
          `- 일평균 순공시간: ${avgMinutes}분`,
          `- 일평균 문제풀이량: ${avgSolved}문제`,
          ''
        ].join('\n')
      : '';

    const formattedText = [
      '[SGS ERI 시험준비 완성도 리포트]',
      '',
      '안녕하세요, 학부모님! SGS 아카데미입니다.',
      `이번 주 ${studentName} 학생의 내신대비 준비도 점검 결과(${examName} 기준)를 보내드립니다.`,
      '',
      `■ 과목: ${subData.subjectName}`,
      `■ ERI 종합 지수: ${score}점 / 100점 (준비 상태: ${status})${bonusInfo}`,
      '* ERI는 최상위권 학생들의 내신대비 루틴(회독 및 실전)을 100점으로 설정한 지표입니다.',
      '',
      checklistSummary,
      '■ 멘토 종합 진단:',
      diagText,
      '',
      '■ 다음 주 개별 학습 처방:',
      prescs.map((p, idx) => `${idx + 1}. ${p}`).join('\n'),
      '',
      `남은 기간(${dDay}) 동안 부족한 영역(회독 수 및 오답 보완)을 완벽히 통제하여 실전에서 최고의 실력을 발휘할 수 있도록 밀착 관리하겠습니다. 감사합니다.`,
      '',
      '- SGS 아카데미 멘토 드림 -'
    ].join('\n');

    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setCopiedSubject(subKey);
        setTimeout(() => setCopiedSubject(null), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };

  const currentSubjectData = eriData[selectedSubject];

  const currentDiagnostic = generateDiagnosticText(selectedSubject);
  const currentPrescriptions = generatePrescriptions(selectedSubject);

  // 차트 그리기를 위해 최근 7개 데이터를 날짜 오름차순(옛날 것 -> 최신 것)으로 정렬
  const chartLogs = [...recentLogs].reverse();

  return (
    <div className="sgs-container print-container">
      
      {/* 1. 상단 정보 헤더 (웹 화면 & 출력 공용) */}
      <div className="sgs-card mb-6" style={{ padding: '1.25rem' }}>
        <div className="sgs-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', width: '100%' }}>
          <div className="sgs-form-group">
            <label className="sgs-label">학생명</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => onUpdateHeader?.(e.target.value, examName, dDay)}
              className="sgs-input"
              style={{ textAlign: 'center', fontWeight: 'bold' }}
              placeholder="학생명"
              disabled={userRole === 'student'}
            />
          </div>
          <div className="sgs-form-group">
            <label className="sgs-label">목표 시험</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => onUpdateHeader?.(studentName, e.target.value, dDay)}
              className="sgs-input"
              style={{ textAlign: 'center', fontWeight: 'bold' }}
              placeholder="시험명"
              disabled={userRole === 'student'}
            />
          </div>
          <div className="sgs-form-group">
            <label className="sgs-label">D-Day</label>
            <input
              type="text"
              value={dDay}
              onChange={(e) => onUpdateHeader?.(studentName, examName, e.target.value)}
              className="sgs-input"
              style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--status-danger)' }}
              placeholder="D-14"
              disabled={userRole === 'student'}
            />
          </div>
          {userRole === 'mentor' && (
            <div className="sgs-form-group no-print" style={{ justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                className="sgs-btn sgs-btn-primary"
                style={{ width: '100%', height: '38px' }}
              >
                <Printer size={14} />
                리포트 인쇄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 과목별 ERI 요약판 (1단계: 과목별 점수판) */}
      <div className="sgs-card mb-6">
        <h3 className="sgs-card-title">
          <span className="indicator"></span>
          1단계: 과목별 ERI 종합 점수판
        </h3>
        
        <div className="sgs-table-container">
          <table className="sgs-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>과목명</th>
                <th>ERI 완성도 지수</th>
                <th>준비 상태</th>
                <th style={{ textAlign: 'left' }}>핵심 취약 영역 (우선순위 보완)</th>
                {userRole === 'mentor' && <th className="no-print" style={{ textAlign: 'right' }}>학부모 전송</th>}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(eriData) as SubjectKey[]).map((subKey) => {
                const subData = eriData[subKey];
                const score = calculateTotalScore(subData);

                const status = getEriStatus(score);
                const weakArea = getWeakestArea(subData);
                const isSelected = selectedSubject === subKey;

                return (
                  <tr 
                    key={subKey} 
                    onClick={() => setSelectedSubject(subKey)}
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}
                  >
                    <td className="text-left" style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {subData.subjectName}
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--accent-indigo)' }}>
                        {score}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>/ 100</span>
                      {recentLogs.length > 0 && totalBonus !== 0 && (
                        <span style={{ 
                          marginLeft: '6px', 
                          fontSize: '0.65rem', 
                          color: totalBonus > 0 ? 'var(--status-perfect)' : 'var(--status-danger)', 
                          fontWeight: 'bold',
                          display: 'inline-block' 
                        }}>
                          ({totalBonus > 0 ? `+${totalBonus}` : totalBonus}점 보정)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`sgs-status-tag ${getStatusColorClass(status)}`} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                        {status}
                      </span>
                    </td>
                    <td className="text-left" style={{ fontWeight: '600' }}>
                      {weakArea === '없음 (균형 잡힘)' ? (
                        <span style={{ color: 'var(--status-perfect)' }}>✓ 균형적 완성형</span>
                      ) : (
                        <span style={{ color: 'var(--status-warn)' }}>{weakArea}</span>
                      )}
                    </td>
                    {userRole === 'mentor' && (
                      <td className="no-print" style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyText(subKey)}
                          className={`sgs-btn ${copiedSubject === subKey ? 'sgs-btn-accent' : 'sgs-btn-secondary'}`}
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.65rem' }}
                        >
                          {copiedSubject === subKey ? <CheckCircle size={12} /> : <Copy size={12} />}
                          {copiedSubject === subKey ? '복사완료' : '학부모 카톡복사'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 과목별 상세 분석 (선택 과목 기준 렌더링) */}
      <div className="sgs-grid-12">
        
        {/* 2단계: 과목별 영역 그래프 */}
        <div className="sgs-col-6 sgs-card" style={{ minHeight: '260px' }}>
          <h3 className="sgs-card-title">
            <span className="indicator"></span>
            2단계: [{currentSubjectData.subjectName}] 영역별 준비 달성도
          </h3>

          <div className="sgs-progress-group">
            {currentSubjectData.areas.map((area) => {
              const pct = calculateAreaPercentage(area);
              const barClass = pct >= 90 ? 'high' : pct >= 60 ? 'mid' : 'low';
              
              return (
                <div key={area.key} className="sgs-progress-item">
                  <div className="sgs-progress-item-labels">
                    <span className="sgs-progress-item-name">{area.name}</span>
                    <span className="sgs-progress-item-value">
                      <b>{area.current}</b>/{area.target}{area.unit} 
                      <span style={{ color: 'var(--accent-indigo)', marginLeft: '6px' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="sgs-progress-track">
                    <div 
                      className={`sgs-progress-bar ${barClass}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3단계 & 4단계: 진단문 및 다음 주 처방 */}
        <div className="sgs-col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 3단계: 자동 진단문 */}
          <div className="sgs-card">
            <h3 className="sgs-card-title">
              <span className="indicator"></span>
              3단계: ERI 종합 진단 분석
            </h3>
            <div className="sgs-diagnostic-box">
              <Sparkles size={14} className="text-indigo-400 no-print" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
              {currentDiagnostic}
            </div>
          </div>

          {/* 4단계: 다음 주 처방 */}
          <div className="sgs-card">
            <h3 className="sgs-card-title">
              <span className="indicator"></span>
              4단계: 멘토 학습 클리닉 처방전 (Action Plan)
            </h3>
            <ul className="sgs-prescription-list">
              {currentPrescriptions.map((presc, idx) => (
                <li key={idx} className="sgs-prescription-item">
                  <span className="sgs-prescription-num">{idx + 1}</span>
                  <span>{presc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* 5단계: [신규] 자기주도 학습 태도 및 학습량 분석 (최근 7일) */}
      <div className="sgs-card mb-6" style={{ marginTop: '1.5rem' }}>
        <h3 className="sgs-card-title">
          <span className="indicator"></span>
          5단계: 자기주도 학습 성실도 및 학습량 분석 (최근 7일)
        </h3>
        
        {recentLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>최근 작성된 일일체크지 기록이 없습니다.</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>[일일 체크지] 탭에서 오늘의 학습 일지를 작성하고 저장하면 데이터 분석이 시작됩니다.</p>
          </div>
        ) : (
          <div className="sgs-grid-12" style={{ gap: '1.5rem', alignItems: 'center' }}>
            
            {/* 통계 요약 카드 */}
            <div className="sgs-col-5" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <TrendingUp size={16} className="text-purple-400" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'white' }}>최근 {recentLogs.length}일간의 평균 성과</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {/* PAI 평균 */}
                <div className="bg-slate-950-80" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>평균 PAI 태도 점수</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>(30점 만점)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{avgPai}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> 점</span>
                    {paiBonus !== 0 && (
                      <span style={{ display: 'block', fontSize: '0.65rem', color: paiBonus > 0 ? 'var(--status-perfect)' : 'var(--status-danger)', fontWeight: 'bold' }}>
                        {paiBonus > 0 ? `+${paiBonus}점 ERI 가산` : `${paiBonus}점 ERI 감산`}
                      </span>
                    )}
                  </div>
                </div>

                {/* 문제 풀이량 평균 */}
                <div className="bg-slate-950-80" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>일평균 문제풀이량</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>(과목 불문 총합)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--status-good)' }}>{avgSolved}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> 문제</span>
                    {volumeBonus !== 0 && (
                      <span style={{ display: 'block', fontSize: '0.65rem', color: volumeBonus > 0 ? 'var(--status-perfect)' : 'var(--status-danger)', fontWeight: 'bold' }}>
                        {volumeBonus > 0 ? `+${volumeBonus}점 ERI 가산` : `${volumeBonus}점 ERI 감산`}
                      </span>
                    )}
                  </div>
                </div>

                {/* 순공 시간 평균 */}
                <div className="bg-slate-950-80" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>일평균 순공시간</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--status-perfect)' }}>{avgMinutes}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> 분</span>
                  </div>
                </div>

              </div>
            </div>

            {/* SVG 변화 추이 그래프 */}
            <div className="sgs-col-7" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>최근 {recentLogs.length}일 PAI 학습 태도 추이</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>기준: 성실선(24점) / 보통선(18점)</span>
              </div>
              
              <div className="bg-slate-950-80" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <svg viewBox="0 0 500 150" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="chart-line-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-indigo)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  <line x1="40" y1="41" x2="480" y2="41" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="2,2" /> {/* 성실 기준선 (24점) */}
                  <line x1="40" y1="61" x2="480" y2="61" stroke="rgba(234, 179, 8, 0.15)" strokeDasharray="2,2" />  {/* 보통 기준선 (18점) */}
                  <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  
                  {/* Y Axis Labels */}
                  <text x="30" y="23" fill="var(--text-muted)" fontSize="9" textAnchor="end">30</text>
                  <text x="30" y="44" fill="var(--status-perfect)" fontSize="9" textAnchor="end" fontWeight="bold">24</text>
                  <text x="30" y="64" fill="var(--status-warn)" fontSize="9" textAnchor="end">18</text>
                  <text x="30" y="123" fill="var(--text-muted)" fontSize="9" textAnchor="end">0</text>
                  
                  {/* 기준 가이드 텍스트 */}
                  <text x="475" y="37" fill="var(--status-perfect)" fontSize="8" textAnchor="end" opacity="0.5">우수 기준</text>
                  <text x="475" y="57" fill="var(--status-warn)" fontSize="8" textAnchor="end" opacity="0.5">보완 기준</text>
                  
                  {/* Chart Line Path */}
                  {chartLogs.length > 1 && (() => {
                    const points = chartLogs.map((log, i) => {
                      const x = 55 + (i * (410 / Math.max(1, chartLogs.length - 1)));
                      const score = getPaiTotalScore(log.paiCheck);
                      const y = 120 - (score * 3.3); // 30점 만점 시 Y=21
                      return { x, y, score, date: log.date.substring(5, 10) };
                    });
                    
                    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                    
                    return (
                      <>
                        {/* Area Gradient under line */}
                        <path
                          d={`${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`}
                          fill="url(#chart-line-gradient)"
                          opacity="0.15"
                        />
                        {/* Real Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="var(--accent-indigo)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data Nodes & Values */}
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill="var(--bg-secondary)"
                              stroke="var(--accent-indigo)"
                              strokeWidth="2"
                            />
                            <text
                              x={p.x}
                              y={p.y - 8}
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {p.score}점
                            </text>
                            <text
                              x={p.x}
                              y="138"
                              fill="var(--text-secondary)"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              {p.date}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}

                  {/* 데이터 노드가 1개일 때 처리 */}
                  {chartLogs.length === 1 && (() => {
                    const score = getPaiTotalScore(chartLogs[0].paiCheck);
                    const y = 120 - (score * 3.3);
                    const date = chartLogs[0].date.substring(5, 10);
                    return (
                      <g>
                        <circle
                          cx="250"
                          cy={y}
                          r="5"
                          fill="var(--accent-indigo)"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x="250"
                          y={y - 10}
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {score}점
                        </text>
                        <text
                          x="250"
                          y="138"
                          fill="var(--text-secondary)"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {date} (기록 1개)
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 멘토 팁 설명 가이드 (화면에서만 제공) */}
      {userRole === 'mentor' && (
        <div className="no-print sgs-mentor-tip-banner">
          <HelpCircle className="text-indigo-400" size={20} style={{ flexShrink: 0 }} />
          <div>
            <h4>💡 대장님을 위한 ERI 리포트 발송 가이드</h4>
            <p>
              학생들의 평상시 "일일 체크지" 작성 정보와 멘토들의 피드백을 기반으로 ERI 값을 업데이트해 두시면, 주말이나 보강 기간에 학부모님께 과학적인 숫자로 준비율을 브리핑해 드릴 수 있습니다.
              우측의 <b>[학부모 카톡복사]</b> 버튼을 누르면 정갈하게 요약된 문구와 최근 7일 학습 성실도 평균치(PAI 점수, 순공 시간, 문제 풀이 수)가 함께 복사되어 전송 준비를 마칩니다!
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
