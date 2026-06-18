import { useState, useEffect } from 'react';
import { LayoutGrid, ClipboardCheck, Sliders, Sparkles, BookOpen, Lock, LogOut, Shield, User, Users, Info, Trash2, Edit } from 'lucide-react';
import type { SubjectKey, SubjectEri, StudentProfile, SchoolType } from './types';
import { DEFAULT_ERI_DATA } from './types';
import { DailyChecklist } from './components/DailyChecklist';
import { EriInput } from './components/EriInput';
import { EriDashboard } from './components/EriDashboard';
import { supabase, isSupabaseConfigured } from './supabaseClient';

type TabType = 'dashboard' | 'input' | 'checklist' | 'admin_students';
type RoleType = 'portal' | 'admin' | 'mentor' | 'student';

const ADMIN_PASSWORD = 'sgs123';
const MENTOR_PASSWORD = 'sgsmentor';

const DEFAULT_STUDENT: StudentProfile = {
  id: 'default_kim',
  name: '김진우',
  school: '국악중학교',
  schoolType: '일반고',
  grade: '3학년',
  studentPhone: '010-1234-5678',
  parentPhone: '010-8765-4321',
  email: 'jinwoo@sgs.com',
  examName: '중3 1학기 기말고사 대비',
  dDay: 'D-18',
  examDate: '2026-07-06',
  password: '1234'
};

/**
 * 시험 날짜(YYYY-MM-DD) 기준 D-Day를 오늘 날짜 대비로 자동 계산하는 함수
 */
const calculateDDay = (examDateStr?: string): string => {
  if (!examDateStr) return 'D-Day 설정 필요';
  
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const examDate = new Date(examDateStr);
  if (isNaN(examDate.getTime())) return 'D-Day 설정 필요';
  const examMidnight = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

  const diffTime = examMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `D-${diffDays}`;
  } else if (diffDays === 0) {
    return 'D-Day';
  } else {
    return `D+${Math.abs(diffDays)}`;
  }
};


/**
 * 학교 유형 난이도에 따른 ERI 세부 영역별 목표치(target) 동적 보정 헬퍼 함수
 */
const getAdjustedTarget = (
  subjectKey: string,
  areaKey: string,
  baseTarget: number,
  schoolType?: SchoolType
): number => {
  const type = schoolType || '일반고';
  if (type === '일반고') return baseTarget;

  // 수학 보정
  if (subjectKey === 'math') {
    if (type === '특목고' || type === '자사고') {
      if (['concept', 'basic', 'applied', 'school_material', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'hardcore') return baseTarget + 2; // 3회독 -> 5회독
      if (areaKey === 'test_set') return baseTarget + 4; // 10회분 -> 14회분
    } else if (type === '학군지 일반고') {
      if (['concept', 'basic', 'applied', 'school_material', 'wrong_answers', 'hardcore'].includes(areaKey)) {
        return baseTarget + 1; // 3회독 -> 4회독
      }
      if (areaKey === 'test_set') return baseTarget + 3; // 10회분 -> 13회분
    } else if (type === '갓반고') {
      if (['applied', 'hardcore', 'school_material', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 2; // 10회분 -> 12회분
    }
  }

  // 영어 보정
  if (subjectKey === 'english') {
    if (type === '특목고' || type === '자사고') {
      if (areaKey === 'vocab') return baseTarget + 2; // 3회 -> 5회
      if (['text_understanding', 'text_memorizing', 'grammar_concept', 'grammar_problems', 'school_material', 'writing_desc'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 3; // 5회분 -> 8회분
    } else if (type === '학군지 일반고') {
      if (areaKey === 'vocab') return baseTarget + 1; // 3회 -> 4회
      if (['text_understanding', 'grammar_concept', 'school_material', 'writing_desc'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 2; // 5회분 -> 7회분
    } else if (type === '갓반고') {
      if (['vocab', 'text_understanding', 'grammar_concept', 'school_material', 'writing_desc'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 1; // 5회분 -> 6회분
    }
  }

  // 국어 보정
  if (subjectKey === 'korean') {
    if (type === '특목고' || type === '자사고') {
      if (['textbook', 'notes', 'analysis', 'grammar', 'problems', 'wrong_answers', 'writing_desc'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 2; // 5회분 -> 7회분
    } else if (type === '학군지 일반고') {
      if (['notes', 'analysis', 'problems', 'writing_desc'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 1; // 5회분 -> 6회분
    } else if (type === '갓반고') {
      if (['notes', 'analysis', 'problems'].includes(areaKey)) {
        return baseTarget + 1;
      }
      if (areaKey === 'test_set') return baseTarget + 1; // 5회분 -> 6회분
    }
  }

  // 과학 보정
  if (subjectKey === 'science') {
    if (type === '특목고' || type === '자사고') {
      if (['concept', 'formulas', 'experiments', 'basic_problems', 'applied_problems', 'school_material', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
    } else if (type === '학군지 일반고') {
      if (['formulas', 'experiments', 'applied_problems', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
    } else if (type === '갓반고') {
      if (['formulas', 'experiments', 'applied_problems'].includes(areaKey)) {
        return baseTarget + 1;
      }
    }
  }

  // 사회 보정
  if (subjectKey === 'social') {
    if (type === '특목고' || type === '자사고') {
      if (['concept', 'structure', 'data_analysis', 'memorizing', 'problems', 'school_material', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
    } else if (type === '학군지 일반고') {
      if (['structure', 'data_analysis', 'memorizing', 'wrong_answers'].includes(areaKey)) {
        return baseTarget + 1;
      }
    } else if (type === '갓반고') {
      if (['structure', 'data_analysis', 'memorizing'].includes(areaKey)) {
        return baseTarget + 1;
      }
    }
  }

  return baseTarget;
};

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<RoleType>('portal');
  const [loggedInStudentId, setLoggedInStudentId] = useState<string>('');
  
  // 로그인 폼 상태
  const [adminInputPw, setAdminInputPw] = useState('');
  const [mentorInputPw, setMentorInputPw] = useState('');
  const [studentInputId, setStudentInputId] = useState('');
  const [studentInputPw, setStudentInputPw] = useState('');

  // 회원가입 모달 상태
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupSchool, setSignupSchool] = useState('');
  const [signupSchoolType, setSignupSchoolType] = useState<SchoolType>('일반고');
  const [signupGrade, setSignupGrade] = useState('3학년');
  const [signupStudentPhone, setSignupStudentPhone] = useState('');
  const [signupParentPhone, setSignupParentPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupExamDate, setSignupExamDate] = useState('');

  // 학생 편집 모달 상태 (어드민용)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // 로딩 상태 및 연동 상태 알림용
  const [isLoading, setIsLoading] = useState(false);
  const [studentList, setStudentList] = useState<StudentProfile[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [eriData, setEriData] = useState<Record<SubjectKey, SubjectEri>>(DEFAULT_ERI_DATA);

  // 1. 학생 목록 불러오기 (Supabase 또는 로컬 폴백)
  const loadLocalStudentList = () => {
    const savedList = localStorage.getItem('sgs_student_profiles');
    let profiles: StudentProfile[] = [];
    if (savedList) {
      try {
        profiles = JSON.parse(savedList);
      } catch (e) {
        profiles = [];
      }
    }
    if (profiles.length === 0) {
      profiles = [DEFAULT_STUDENT];
      localStorage.setItem('sgs_student_profiles', JSON.stringify(profiles));
    } else {
      // 오늘 날짜 기준으로 로컬 프로필의 D-Day 최신화
      profiles = profiles.map(p => ({
        ...p,
        dDay: p.examDate ? calculateDDay(p.examDate) : p.dDay
      }));
      localStorage.setItem('sgs_student_profiles', JSON.stringify(profiles));
    }
    setStudentList(profiles);
    return profiles;
  };

  const fetchStudentList = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sgs_students')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          const mapped: StudentProfile[] = data.map(item => {
            const examDate = item.exam_date || '';
            const calculatedDDay = examDate ? calculateDDay(examDate) : (item.d_day || 'D-14');
            return {
              id: item.id,
              name: item.name,
              school: item.school || '',
              schoolType: (item.school_type as SchoolType) || '일반고',
              grade: item.grade || '',
              studentPhone: item.student_phone || '',
              parentPhone: item.parent_phone || '',
              email: item.email || '',
              password: item.password || '',
              examName: item.exam_name || '내신 대비',
              dDay: calculatedDDay,
              examDate: examDate
            };
          });
          setStudentList(mapped);
          
          // 로컬스토리지에도 동기화 (오프라인 캐싱용)
          localStorage.setItem('sgs_student_profiles', JSON.stringify(mapped));
        } else {
          console.error('Supabase 학생 목록 로드 실패, 로컬 사용:', error);
          loadLocalStudentList();
        }
      } catch (e) {
        console.error('Supabase 통신 에러, 로컬 사용:', e);
        loadLocalStudentList();
      }
    } else {
      loadLocalStudentList();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudentList();
  }, []);

  // 2. 초기 기동 시 기본 선택 학생 세팅
  useEffect(() => {
    if (studentList.length > 0 && !currentStudentId) {
      const savedCurrentId = localStorage.getItem('sgs_current_student_id');
      if (savedCurrentId && studentList.some(p => p.id === savedCurrentId)) {
        setCurrentStudentId(savedCurrentId);
      } else {
        setCurrentStudentId(studentList[0].id);
        localStorage.setItem('sgs_current_student_id', studentList[0].id);
      }
    }
  }, [studentList]);

  // 기존 로드된 데이터의 단위와 이름을 최신 DEFAULT_ERI_DATA 및 학교 유형 난이도 기준으로 보정하는 함수
  const migrateEriData = (loadedData: Record<SubjectKey, SubjectEri>, schoolType?: SchoolType): Record<SubjectKey, SubjectEri> => {
    const updated = JSON.parse(JSON.stringify(loadedData)) as Record<SubjectKey, SubjectEri>;
    (Object.keys(DEFAULT_ERI_DATA) as SubjectKey[]).forEach(subKey => {
      if (!updated[subKey]) {
        // 디폴트 데이터를 복사하고 타겟을 학교 유형에 맞춰 보정
        const baseSub = JSON.parse(JSON.stringify(DEFAULT_ERI_DATA[subKey])) as SubjectEri;
        baseSub.areas = baseSub.areas.map(area => ({
          ...area,
          target: getAdjustedTarget(subKey, area.key, area.target, schoolType)
        }));
        updated[subKey] = baseSub;
        return;
      }
      
      const defaultSub = DEFAULT_ERI_DATA[subKey];
      updated[subKey].areas = defaultSub.areas.map(defaultArea => {
        const existingArea = updated[subKey].areas.find(a => a.key === defaultArea.key);
        const adjustedTarget = getAdjustedTarget(subKey, defaultArea.key, defaultArea.target, schoolType);
        if (existingArea) {
          const needsFix = existingArea.unit === '문항' || existingArea.unit === '문장' || existingArea.name !== defaultArea.name || existingArea.target !== adjustedTarget;
          return {
            ...existingArea,
            name: defaultArea.name,
            unit: defaultArea.unit,
            target: adjustedTarget,
            description: defaultArea.description,
            current: needsFix ? Math.min(adjustedTarget, existingArea.current) : existingArea.current
          };
        }
        return {
          ...defaultArea,
          target: adjustedTarget
        };
      });
    });
    return updated;
  };

  // 3. 선택 학생 변경 시 ERI 데이터 로드
  const loadLocalEriData = (studentId: string, schoolType?: SchoolType) => {
    const savedEri = localStorage.getItem(`sgs_eri_data_${studentId}`);
    if (savedEri) {
      try {
        const parsed = JSON.parse(savedEri);
        const migrated = migrateEriData(parsed, schoolType);
        setEriData(migrated);
      } catch (e) {
        const adjustedDefault = migrateEriData(DEFAULT_ERI_DATA, schoolType);
        setEriData(adjustedDefault);
      }
    } else {
      const adjustedDefault = migrateEriData(DEFAULT_ERI_DATA, schoolType);
      setEriData(adjustedDefault);
    }
  };

  useEffect(() => {
    if (!currentStudentId) return;

    const fetchEriData = async () => {
      const studentProfile = studentList.find(s => s.id === currentStudentId);
      const schoolType = studentProfile?.schoolType;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('sgs_eri_data')
            .select('eri_json')
            .eq('student_id', currentStudentId);
          
          if (!error && data && data.length > 0) {
            const migrated = migrateEriData(data[0].eri_json, schoolType);
            setEriData(migrated);
          } else {
            // DB에 없으면 로컬 데이터 조회 후 기본 세팅
            loadLocalEriData(currentStudentId, schoolType);
          }
        } catch (e) {
          loadLocalEriData(currentStudentId, schoolType);
        }
      } else {
        loadLocalEriData(currentStudentId, schoolType);
      }
    };

    fetchEriData();
  }, [currentStudentId, studentList]);

  // 4. ERI 데이터 저장 함수
  const saveEriData = async (updated: Record<SubjectKey, SubjectEri>) => {
    if (!currentStudentId) return;
    setEriData(updated);
    
    // 로컬 스토리지 상시 저장
    localStorage.setItem(`sgs_eri_data_${currentStudentId}`, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('sgs_eri_data')
          .upsert({
            student_id: currentStudentId,
            subject_key: 'all', // 한 레코드에 전체 과목 JSONB로 저장
            eri_json: updated,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id,subject_key' });
      } catch (e) {
        console.error('Supabase ERI 저장 실패:', e);
      }
    }
  };

  // 5. 대비 시험명, D-Day 정보 업데이트 (어드민 / 멘토 권한)
  const handleUpdateHeader = async (name: string, exam: string, ddayVal: string, examDateVal?: string) => {
    if (!currentStudentId) return;
    
    const updatedList = studentList.map(student => {
      if (student.id === currentStudentId) {
        return { ...student, name, examName: exam, dDay: ddayVal, examDate: examDateVal };
      }
      return student;
    });

    setStudentList(updatedList);
    localStorage.setItem('sgs_student_profiles', JSON.stringify(updatedList));

    if (isSupabaseConfigured && supabase) {
      try {
        // 1차 시도: exam_date를 포함하여 업데이트
        const { error } = await supabase
          .from('sgs_students')
          .update({
            name,
            exam_name: exam,
            d_day: ddayVal,
            exam_date: examDateVal || null
          })
          .eq('id', currentStudentId);

        if (error) {
          // 컬럼이 없어 실패한 것으로 간주하고 2차 시도
          console.warn('Supabase update header failed with exam_date, retrying without it...', error);
          const { error: fallbackError } = await supabase
            .from('sgs_students')
            .update({
              name,
              exam_name: exam,
              d_day: ddayVal
            })
            .eq('id', currentStudentId);
          if (fallbackError) throw fallbackError;
        }
      } catch (e) {
        console.error('Supabase 헤더 정보 업데이트 실패:', e);
      }
    }
  };

  // 6. 회원가입 가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupId.trim() || !signupName.trim() || !signupPassword.trim()) {
      alert('아이디, 한글이름, 비밀번호는 필수 입력 사항입니다!');
      return;
    }

    // 아이디 형식 체크 (영문/숫자만 허용)
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(signupId)) {
      alert('아이디는 영문 및 숫자 조합만 가능합니다!');
      return;
    }

    setIsLoading(true);
    
    // 1. 중복 검사
    let isDuplicate = false;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('sgs_students')
        .select('id')
        .eq('id', signupId.trim());
      if (!error && data && data.length > 0) {
        isDuplicate = true;
      }
    } else {
      isDuplicate = studentList.some(s => s.id === signupId.trim());
    }

    if (isDuplicate) {
      alert('이미 사용 중인 아이디입니다! 다른 아이디를 입력해 주세요.');
      setIsLoading(false);
      return;
    }

    const newStudent: StudentProfile = {
      id: signupId.trim(),
      name: signupName.trim(),
      school: signupSchool.trim(),
      schoolType: signupSchoolType,
      grade: signupGrade,
      studentPhone: signupStudentPhone.trim(),
      parentPhone: signupParentPhone.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      examName: '기말고사 대비',
      dDay: signupExamDate ? calculateDDay(signupExamDate) : 'D-14',
      examDate: signupExamDate
    };

    // 학교 유형별로 보정된 기본 ERI 데이터 생성
    const adjustedDefaultEri = migrateEriData(DEFAULT_ERI_DATA, newStudent.schoolType);

    // 2. 가입 실행
    if (isSupabaseConfigured && supabase) {
      try {
        // 1차 시도: exam_date 컬럼을 포함하여 삽입
        const { error } = await supabase
          .from('sgs_students')
          .insert([{
            id: newStudent.id,
            name: newStudent.name,
            school: newStudent.school,
            school_type: newStudent.schoolType,
            grade: newStudent.grade,
            student_phone: newStudent.studentPhone,
            parent_phone: newStudent.parentPhone,
            email: newStudent.email,
            password: newStudent.password,
            exam_name: newStudent.examName,
            d_day: newStudent.dDay,
            exam_date: newStudent.examDate || null
          }]);

        if (error) {
          // 컬럼 부재 등 에러 발생 시, exam_date 필드를 제외하고 2차 시도 (Fallback)
          console.warn('Supabase insert failed with exam_date, retrying without it...', error);
          const { error: fallbackError } = await supabase
            .from('sgs_students')
            .insert([{
              id: newStudent.id,
              name: newStudent.name,
              school: newStudent.school,
              school_type: newStudent.schoolType,
              grade: newStudent.grade,
              student_phone: newStudent.studentPhone,
              parent_phone: newStudent.parentPhone,
              email: newStudent.email,
              password: newStudent.password,
              exam_name: newStudent.examName,
              d_day: newStudent.dDay
            }]);
          if (fallbackError) throw fallbackError;
        }
        
        // 보정된 ERI 기본값 생성
        await supabase
          .from('sgs_eri_data')
          .insert([{
            student_id: newStudent.id,
            subject_key: 'all',
            eri_json: adjustedDefaultEri
          }]);

      } catch (err: any) {
        alert('Supabase 가입 중 에러가 발생했습니다: ' + err.message);
        setIsLoading(false);
        return;
      }
    }

    // 로컬스토리지 동기화 및 메모리 갱신
    const updated = [...studentList, newStudent];
    setStudentList(updated);
    localStorage.setItem('sgs_student_profiles', JSON.stringify(updated));
    localStorage.setItem(`sgs_eri_data_${newStudent.id}`, JSON.stringify(adjustedDefaultEri));

    alert(`[${newStudent.name}] 학생 회원가입이 완료되었습니다!\n이제 로그인할 수 있습니다.`);
    
    // 가입 폼 초기화
    setSignupId('');
    setSignupName('');
    setSignupSchool('');
    setSignupSchoolType('일반고');
    setSignupGrade('3학년');
    setSignupStudentPhone('');
    setSignupParentPhone('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupExamDate('');
    setShowSignupModal(false);
    setIsLoading(false);
  };

  // 7. 학생 정보 편집/수정 실행 (어드민 전용)
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsLoading(true);

    const updated = studentList.map(s => s.id === editingStudent.id ? editingStudent : s);
    setStudentList(updated);
    localStorage.setItem('sgs_student_profiles', JSON.stringify(updated));

    // 학교 유형 변경 시 기존 ERI 목표 데이터도 새 난이도 기준으로 보정하여 강제 업데이트
    let currentEri = DEFAULT_ERI_DATA;
    const localSaved = localStorage.getItem(`sgs_eri_data_${editingStudent.id}`);
    if (localSaved) {
      try {
        currentEri = JSON.parse(localSaved);
      } catch (e) {
        currentEri = DEFAULT_ERI_DATA;
      }
    }
    const updatedEri = migrateEriData(currentEri, editingStudent.schoolType);
    localStorage.setItem(`sgs_eri_data_${editingStudent.id}`, JSON.stringify(updatedEri));

    if (isSupabaseConfigured && supabase) {
      try {
        // 1차 시도: exam_date 컬럼을 포함하여 업데이트
        const { error } = await supabase
          .from('sgs_students')
          .update({
            name: editingStudent.name,
            school: editingStudent.school,
            school_type: editingStudent.schoolType,
            grade: editingStudent.grade,
            student_phone: editingStudent.studentPhone,
            parent_phone: editingStudent.parentPhone,
            email: editingStudent.email,
            password: editingStudent.password,
            exam_name: editingStudent.examName,
            d_day: editingStudent.dDay,
            exam_date: editingStudent.examDate || null
          })
          .eq('id', editingStudent.id);

        if (error) {
          // 컬럼이 없어 실패한 것으로 간주하고 2차 시도
          console.warn('Supabase update failed with exam_date, retrying without it...', error);
          const { error: fallbackError } = await supabase
            .from('sgs_students')
            .update({
              name: editingStudent.name,
              school: editingStudent.school,
              school_type: editingStudent.schoolType,
              grade: editingStudent.grade,
              student_phone: editingStudent.studentPhone,
              parent_phone: editingStudent.parentPhone,
              email: editingStudent.email,
              password: editingStudent.password,
              exam_name: editingStudent.examName,
              d_day: editingStudent.dDay
            })
            .eq('id', editingStudent.id);
          if (fallbackError) throw fallbackError;
        }

        // 변경된 타겟 반영하여 ERI 데이터도 재저장
        await supabase
          .from('sgs_eri_data')
          .upsert({
            student_id: editingStudent.id,
            subject_key: 'all',
            eri_json: updatedEri,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id,subject_key' });

      } catch (err) {
        console.error('Supabase 수정 실패:', err);
      }
    }

    setShowEditModal(false);
    setEditingStudent(null);
    setIsLoading(false);
    alert('학생 프로필 정보가 정상 수정되었습니다!');
  };

  // 8. 학생 계정 완전 삭제 (어드민 전용)
  const handleDeleteStudent = async (id: string, name: string) => {
    if (userRole !== 'admin') {
      alert('어드민만 학생 계정을 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm(`[${name}] 학생의 모든 데이터(ERI 지표, 일일체크지 히스토리 포함)를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      setIsLoading(true);
      
      const updated = studentList.filter(s => s.id !== id);
      setStudentList(updated);
      localStorage.setItem('sgs_student_profiles', JSON.stringify(updated));

      // 관련 로컬스토리지 삭제
      localStorage.removeItem(`sgs_eri_data_${id}`);
      localStorage.removeItem(`sgs_latest_checklist_${id}`);
      localStorage.removeItem(`sgs_checklist_history_${id}`);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('sgs_students')
            .delete()
            .eq('id', id);
        } catch (e) {
          console.error('Supabase 삭제 실패:', e);
        }
      }

      // 포커스 이동
      if (currentStudentId === id) {
        const nextId = updated[0]?.id || '';
        setCurrentStudentId(nextId);
        localStorage.setItem('sgs_current_student_id', nextId);
      }

      setIsLoading(false);
      alert('학생 데이터가 완전히 삭제되었습니다.');
    }
  };

  // 9. 로그인 처리 분기
  const handleAdminLogin = () => {
    if (adminInputPw === ADMIN_PASSWORD) {
      setUserRole('admin');
      setAdminInputPw('');
      setCurrentTab('dashboard');
    } else {
      alert('어드민 비밀번호가 다릅니다!');
    }
  };

  const handleMentorLogin = () => {
    if (mentorInputPw === MENTOR_PASSWORD) {
      setUserRole('mentor');
      setMentorInputPw('');
      setCurrentTab('dashboard');
    } else {
      alert('멘토 비밀번호가 다릅니다!');
    }
  };

  const handleStudentLogin = () => {
    if (!studentInputId.trim() || !studentInputPw.trim()) {
      alert('아이디와 비밀번호를 모두 기입해 주세요!');
      return;
    }

    const student = studentList.find(s => s.id === studentInputId.trim());
    if (student && student.password === studentInputPw.trim()) {
      setUserRole('student');
      setLoggedInStudentId(student.id);
      setCurrentStudentId(student.id);
      setStudentInputId('');
      setStudentInputPw('');
      setCurrentTab('dashboard');
    } else {
      alert('아이디 혹은 비밀번호가 일치하지 않습니다!');
    }
  };

  const handleLogout = () => {
    setUserRole('portal');
    setLoggedInStudentId('');
  };

  const activeStudentId = userRole === 'student' ? loggedInStudentId : currentStudentId;
  const currentStudent = studentList.find(s => s.id === activeStudentId) || DEFAULT_STUDENT;

  // 로딩 오버레이 렌더링용
  const renderLoading = () => {
    if (!isLoading) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(5, 7, 16, 0.85)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', zIndex: 9999
      }}>
        <div className="sgs-logo-icon" style={{ animation: 'spin 2s linear infinite', width: '3rem', height: '3rem', marginBottom: '1rem' }}>
          <Sparkles className="text-white" size={24} />
        </div>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>서버와 동기화 중입니다...</span>
      </div>
    );
  };

  // ===================== [1. 로그인 포털 화면] =====================
  if (userRole === 'portal') {
    return (
      <div className="sgs-app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1.5rem' }}>
        {renderLoading()}
        
        {/* Supabase 연결 유무 리본 알림 */}
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '6px',
          padding: '0.375rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)',
          fontSize: '0.65rem', fontWeight: 'bold', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)'
        }}>
          <Info size={12} className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'} />
          <span>DB 연동 상태: </span>
          <span style={{ color: isSupabaseConfigured ? 'var(--status-perfect)' : 'var(--status-warn)' }}>
            {isSupabaseConfigured ? 'CLOUD (SUPABASE)' : 'LOCAL STORAGE'}
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="sgs-logo-icon" style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto 1rem auto' }}>
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SGS ERI SYSTEM
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Exam Readiness Index & Management
          </p>
        </div>

        <div className="sgs-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', width: '100%', maxWidth: '64rem', gap: '1.5rem' }}>
          
          {/* 어드민 로그인 카드 */}
          <div className="sgs-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield className="text-red-400" size={18} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>어드민 (원장)</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, minHeight: '32px' }}>
              학생 계정 생성/삭제 및 인적사항을 포함한 학원 데이터 전반을 총괄합니다.
            </p>
            <div className="sgs-form-group" style={{ marginTop: 'auto' }}>
              <label className="sgs-label">관리자 비밀번호</label>
              <input 
                type="password"
                value={adminInputPw}
                onChange={(e) => setAdminInputPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="비밀번호 입력"
                className="sgs-input"
              />
            </div>
            <button 
              onClick={handleAdminLogin}
              className="sgs-btn sgs-btn-danger" 
              style={{ padding: '0.75rem', fontSize: '0.8125rem' }}
            >
              어드민 입장
            </button>
          </div>

          {/* 멘토 로그인 카드 */}
          <div className="sgs-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock className="text-indigo-400" size={18} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>멘토 (선생님)</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, minHeight: '32px' }}>
              대비 시험 일정 지정, ERI 목표 기준 조정 및 일일체크지 피드백 작성을 담당합니다.
            </p>
            <div className="sgs-form-group" style={{ marginTop: 'auto' }}>
              <label className="sgs-label">멘토 비밀번호</label>
              <input 
                type="password"
                value={mentorInputPw}
                onChange={(e) => setMentorInputPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMentorLogin()}
                placeholder="비밀번호 입력"
                className="sgs-input"
              />
            </div>
            <button 
              onClick={handleMentorLogin}
              className="sgs-btn sgs-btn-primary" 
              style={{ padding: '0.75rem', fontSize: '0.8125rem' }}
            >
              멘토 입장
            </button>
          </div>

          {/* 학생 로그인 및 가입 카드 */}
          <div className="sgs-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.25rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-purple-400" size={18} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>학생 포털</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, minHeight: '32px' }}>
              오늘의 일일 체크지를 기록하고 자가 ERI 지표를 갱신합니다.
            </p>
            
            <div className="sgs-form-group">
              <label className="sgs-label">영문 아이디 (ID)</label>
              <input 
                type="text"
                value={studentInputId}
                onChange={(e) => setStudentInputId(e.target.value)}
                placeholder="가입한 영문 아이디"
                className="sgs-input"
              />
            </div>

            <div className="sgs-form-group">
              <label className="sgs-label">비밀번호 (PW)</label>
              <input 
                type="password"
                value={studentInputPw}
                onChange={(e) => setStudentInputPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                placeholder="비밀번호"
                className="sgs-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button 
                onClick={handleStudentLogin}
                className="sgs-btn sgs-btn-accent" 
                style={{ flex: 2, padding: '0.75rem', fontSize: '0.8125rem' }}
              >
                로그인
              </button>
              <button 
                onClick={() => setShowSignupModal(true)}
                className="sgs-btn sgs-btn-secondary" 
                style={{ flex: 1.2, padding: '0.75rem', fontSize: '0.8125rem', border: '1px solid var(--accent-purple)' }}
              >
                회원가입
              </button>
            </div>
          </div>

        </div>

        {/* ===================== [회원가입 모달 창] ===================== */}
        {showSignupModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(5, 7, 16, 0.9)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <form onSubmit={handleSignup} className="sgs-card" style={{ width: '100%', maxWidth: '35rem', padding: '2rem', gap: '1.25rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-purple)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles className="text-purple-400" size={18} /> 학생 회원가입
              </h2>
              
              <div className="sgs-form-grid sgs-form-grid-2" style={{ gap: '1rem' }}>
                <div className="sgs-form-group">
                  <label className="sgs-label">영문 아이디 *</label>
                  <input 
                    type="text" 
                    required 
                    value={signupId} 
                    onChange={(e) => setSignupId(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                    placeholder="영문 및 숫자 조합"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">로그인 비밀번호 *</label>
                  <input 
                    type="password" 
                    required 
                    value={signupPassword} 
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="비밀번호 설정"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">학생 한글 이름 *</label>
                  <input 
                    type="text" 
                    required 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">이메일 주소</label>
                  <input 
                    type="email" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="username@gmail.com"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">재학 학교</label>
                  <input 
                    type="text" 
                    value={signupSchool} 
                    onChange={(e) => setSignupSchool(e.target.value)}
                    placeholder="예: 개원중"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">학교 유형 난이도</label>
                  <select 
                    value={signupSchoolType} 
                    onChange={(e) => setSignupSchoolType(e.target.value as SchoolType)}
                    className="sgs-input"
                    style={{ fontWeight: 'bold' }}
                  >
                    <option value="일반고">일반고 (기본)</option>
                    <option value="갓반고">갓반고 (학업 우수 일반고)</option>
                    <option value="학군지 일반고">학군지 일반고 (강남/목동 등)</option>
                    <option value="자사고">자사고 (자율형 사립고)</option>
                    <option value="특목고">특목고 (외고/과학고 등)</option>
                  </select>
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">학년 선택</label>
                  <select 
                    value={signupGrade} 
                    onChange={(e) => setSignupGrade(e.target.value)}
                    className="sgs-input"
                    style={{ fontWeight: 'bold' }}
                  >
                    <option value="초6">초등학교 6학년</option>
                    <option value="중1">중학교 1학년</option>
                    <option value="중2">중학교 2학년</option>
                    <option value="중3">중학교 3학년</option>
                    <option value="고1">고등학교 1학년</option>
                    <option value="고2">고등학교 2학년</option>
                    <option value="고3">고등학교 3학년</option>
                  </select>
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">학생 연락처</label>
                  <input 
                    type="text" 
                    value={signupStudentPhone} 
                    onChange={(e) => setSignupStudentPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">부모님 연락처</label>
                  <input 
                    type="text" 
                    value={signupParentPhone} 
                    onChange={(e) => setSignupParentPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="sgs-input"
                  />
                </div>
                <div className="sgs-form-group">
                  <label className="sgs-label">시험 날짜</label>
                  <input 
                    type="date" 
                    value={signupExamDate} 
                    onChange={(e) => setSignupExamDate(e.target.value)}
                    className="sgs-input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="submit" className="sgs-btn sgs-btn-accent" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8125rem' }}>가입완료</button>
                <button type="button" onClick={() => setShowSignupModal(false)} className="sgs-btn sgs-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>취소</button>
              </div>
            </form>
          </div>
        )}

      </div>
    );
  }

  // ===================== [2. 멘토 또는 학생 메인 화면] =====================
  return (
    <div className="sgs-app-container">
      {renderLoading()}
      
      {/* 1. 상단 글로벌 헤더 */}
      <header className="sgs-header no-print">
        <div className="sgs-header-content">
          
          <div className="sgs-logo-area">
            <div className="sgs-logo-icon">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="sgs-logo-text-title">SGS ERI</span>
                <span className={`sgs-score-badge ${userRole === 'admin' ? 'danger' : userRole === 'mentor' ? 'good' : 'perfect'}`}>
                  {userRole === 'admin' ? 'ADMIN MODE' : userRole === 'mentor' ? 'MENTOR MODE' : 'STUDENT MODE'}
                </span>
              </div>
              <p className="sgs-logo-subtitle">Exam Readiness Index & Management</p>
            </div>
          </div>

          <nav className="sgs-nav" style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`sgs-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutGrid size={14} />
              ERI 대시보드
            </button>
            
            <button
              onClick={() => setCurrentTab('input')}
              className={`sgs-nav-btn ${currentTab === 'input' ? 'active' : ''}`}
            >
              <Sliders size={14} />
              ERI 진행도 기입
            </button>

            <button
              onClick={() => setCurrentTab('checklist')}
              className={`sgs-nav-btn ${currentTab === 'checklist' ? 'active' : ''}`}
            >
              <ClipboardCheck size={14} />
              일일 체크지
            </button>

            {/* 어드민과 멘토는 학생 주소록 탭 추가 조회 */}
            {(userRole === 'admin' || userRole === 'mentor') && (
              <button
                onClick={() => setCurrentTab('admin_students')}
                className={`sgs-nav-btn ${currentTab === 'admin_students' ? 'active' : ''}`}
              >
                <Users size={14} />
                학생 관리 대시보드
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="sgs-nav-btn"
              style={{ color: 'var(--status-danger)', borderLeft: '1px solid var(--border-color)', marginLeft: '0.25rem', paddingLeft: '0.75rem', borderRadius: '0' }}
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="sgs-main">
        
        {/* 상단 퀵 정보 서브 배너 */}
        {currentTab !== 'checklist' && currentTab !== 'admin_students' && activeStudentId && (
          <div className="sgs-container no-print">
            <div className="sgs-quick-banner" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="sgs-banner-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
                <Sparkles size={14} className="text-purple-400" />
                <span>선택된 학생:</span>
                
                {userRole === 'admin' || userRole === 'mentor' ? (
                  <select 
                    value={currentStudentId} 
                    onChange={(e) => setCurrentStudentId(e.target.value)}
                    className="sgs-input"
                    style={{ width: '140px', padding: '0.25rem 0.5rem', fontWeight: 'bold', fontSize: '0.8125rem' }}
                  >
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                ) : (
                  <span className="sgs-student-badge">{currentStudent.name} 학생 ({currentStudent.school} {currentStudent.grade})</span>
                )}

                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span>대비 시험:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{currentStudent.examName}</span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span>잔여 일정:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--status-danger)' }}>{currentStudent.dDay}</span>
              </div>
            </div>
          </div>
        )}

        {/* 탭 내용 렌더링 분기 */}
        <div>
          {/* A. ERI 대시보드 */}
          {currentTab === 'dashboard' && activeStudentId && (
            <EriDashboard 
              eriData={eriData}
              studentName={currentStudent.name}
              examName={currentStudent.examName}
              dDay={currentStudent.dDay}
              examDate={currentStudent.examDate}
              onUpdateHeader={(userRole === 'admin' || userRole === 'mentor') ? handleUpdateHeader : undefined}
              userRole={userRole === 'admin' ? 'mentor' : userRole} // EriDashboard 에서는 어드민도 멘토의 권한을 가집니다.
              studentId={activeStudentId}
            />
          )}

          {/* B. ERI 진행도 기입 */}
          {currentTab === 'input' && activeStudentId && (
            <EriInput 
              eriData={eriData}
              onSave={saveEriData}
              userRole={userRole === 'admin' ? 'mentor' : userRole === 'mentor' ? 'mentor' : 'student'}
            />
          )}

          {/* C. 일일 체크지 */}
          {currentTab === 'checklist' && activeStudentId && (
            <DailyChecklist 
              key={activeStudentId}
              studentId={activeStudentId}
              studentName={currentStudent.name}
              userRole={userRole === 'admin' ? 'mentor' : userRole === 'mentor' ? 'mentor' : 'student'}
            />
          )}

          {/* D. 학생 관리 대시보드 (어드민 / 멘토) */}
          {currentTab === 'admin_students' && (userRole === 'admin' || userRole === 'mentor') && (
            <div className="sgs-container">
              <div className="sgs-quick-banner" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={18} className="text-indigo-400" />
                    학원 학생 주소록 및 프로필 종합 관리
                  </h2>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {userRole === 'admin' 
                      ? '* 어드민 계정입니다. 학생 상세 인적사항 편집 및 삭제 권한을 모두 가집니다.'
                      : '* 멘토 계정입니다. 학생 인적사항 열람만 가능하며, 수정/삭제는 어드민(원장님)에게 문의해 주세요.'}
                  </p>
                </div>
              </div>

              <div className="sgs-card">
                <div className="sgs-table-container">
                  <table className="sgs-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>이름 (아이디)</th>
                        <th>학교 / 학년</th>
                        <th>학생 연락처</th>
                        <th>학부모 연락처</th>
                        <th>이메일 주소</th>
                        <th>로그인 PW</th>
                        <th>시험 / 디데이</th>
                        <th style={{ textAlign: 'right' }}>관리 액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentList.map((student) => (
                        <tr key={student.id}>
                          <td className="text-left" style={{ fontWeight: 'bold' }}>
                            {student.name} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({student.id})</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem' }}>{student.school || '-'} / {student.grade || '-'}</span>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: student.schoolType === '특목고' ? 'rgba(239, 68, 68, 0.15)' :
                                            student.schoolType === '자사고' ? 'rgba(249, 115, 22, 0.15)' :
                                            student.schoolType === '학군지 일반고' ? 'rgba(168, 85, 247, 0.15)' :
                                            student.schoolType === '갓반고' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(75, 85, 99, 0.15)',
                                color: student.schoolType === '특목고' ? '#ef4444' :
                                       student.schoolType === '자사고' ? '#f97316' :
                                       student.schoolType === '학군지 일반고' ? '#a855f7' :
                                       student.schoolType === '갓반고' ? '#6366f1' : '#9ca3af',
                                border: student.schoolType === '특목고' ? '1px solid rgba(239, 68, 68, 0.3)' :
                                        student.schoolType === '자사고' ? '1px solid rgba(249, 115, 22, 0.3)' :
                                        student.schoolType === '학군지 일반고' ? '1px solid rgba(168, 85, 247, 0.3)' :
                                        student.schoolType === '갓반고' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(75, 85, 99, 0.3)'
                              }}>
                                {student.schoolType || '일반고'}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.75rem' }}>{student.studentPhone || '-'}</td>
                          <td style={{ fontSize: '0.75rem' }}>{student.parentPhone || '-'}</td>
                          <td style={{ fontSize: '0.75rem' }}>{student.email || '-'}</td>
                          <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            {userRole === 'admin' ? student.password : '****'}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.7rem', display: 'block', color: 'white' }}>{student.examName}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--status-danger)' }}>{student.dDay}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              {userRole === 'admin' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingStudent({ ...student });
                                      setShowEditModal(true);
                                    }}
                                    className="sgs-btn sgs-btn-secondary"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <Edit size={10} /> 편집
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(student.id, student.name)}
                                    className="sgs-btn sgs-btn-danger"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <Trash2 size={10} /> 삭제
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>수정권한 없음</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ===================== [학생 정보 편집 모달 (어드민용)] ===================== */}
              {showEditModal && editingStudent && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(5, 7, 16, 0.9)', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', zIndex: 2000, padding: '1rem'
                }}>
                  <form onSubmit={handleEditStudent} className="sgs-card" style={{ width: '100%', maxWidth: '35rem', padding: '2rem', gap: '1.25rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-indigo)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit size={16} className="text-indigo-400" /> [{editingStudent.name}] 학생 정보 상세 편집
                    </h2>
                    
                    <div className="sgs-form-grid sgs-form-grid-2" style={{ gap: '1rem' }}>
                      <div className="sgs-form-group">
                        <label className="sgs-label">아이디 (변경불가)</label>
                        <input type="text" disabled value={editingStudent.id} className="sgs-input" style={{ opacity: 0.5 }} />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">비밀번호 *</label>
                        <input 
                          type="text" required 
                          value={editingStudent.password || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">한글 이름 *</label>
                        <input 
                          type="text" required 
                          value={editingStudent.name} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">이메일 주소</label>
                        <input 
                          type="email" 
                          value={editingStudent.email || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">학교</label>
                        <input 
                          type="text" 
                          value={editingStudent.school || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, school: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">학교 유형 난이도</label>
                        <select 
                          value={editingStudent.schoolType || '일반고'} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, schoolType: e.target.value as SchoolType })}
                          className="sgs-input"
                          style={{ fontWeight: 'bold' }}
                        >
                          <option value="일반고">일반고 (기본)</option>
                          <option value="갓반고">갓반고 (학업 우수 일반고)</option>
                          <option value="학군지 일반고">학군지 일반고 (강남/목동 등)</option>
                          <option value="자사고">자사고 (자율형 사립고)</option>
                          <option value="특목고">특목고 (외고/과학고 등)</option>
                        </select>
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">학년</label>
                        <input 
                          type="text" 
                          value={editingStudent.grade || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">학생 연락처</label>
                        <input 
                          type="text" 
                          value={editingStudent.studentPhone || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, studentPhone: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">부모님 연락처</label>
                        <input 
                          type="text" 
                          value={editingStudent.parentPhone || ''} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">대비 시험</label>
                        <input 
                          type="text" 
                          value={editingStudent.examName} 
                          onChange={(e) => setEditingStudent({ ...editingStudent, examName: e.target.value })}
                          className="sgs-input" 
                        />
                      </div>
                      <div className="sgs-form-group">
                        <label className="sgs-label">시험 날짜 (자동 D-Day 계산)</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="date" 
                            value={editingStudent.examDate || ''} 
                            onChange={(e) => {
                              const dateVal = e.target.value;
                              const ddayVal = dateVal ? calculateDDay(dateVal) : 'D-14';
                              setEditingStudent({ 
                                ...editingStudent, 
                                examDate: dateVal, 
                                dDay: ddayVal 
                              });
                            }}
                            className="sgs-input" 
                            style={{ colorScheme: 'dark', flex: 1 }}
                          />
                          <span className="sgs-status-tag danger" style={{ padding: '0.5rem 0.75rem', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '70px', fontWeight: 'bold' }}>
                            {editingStudent.dDay}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                      <button type="submit" className="sgs-btn sgs-btn-accent" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8125rem' }}>저장</button>
                      <button type="button" onClick={() => { setShowEditModal(false); setEditingStudent(null); }} className="sgs-btn sgs-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>취소</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      {/* 3. 하단 푸터 */}
      <footer className="sgs-footer no-print">
        <div className="sgs-footer-content">
          <span>© 2026 SGS Academy. All Rights Reserved.</span>
          <span>어드민, 멘토, 학생 역할기반 3단계 분리형 스마트 진단 플랫폼</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
