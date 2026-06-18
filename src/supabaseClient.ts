import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 양끝의 보이지 않는 개행 문자(\r 등) 및 공백을 완벽하게 제거
const cleanUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

// 기본 템플릿 값인지 혹은 완전히 비어있는지 체크하여 실제 연결 여부 판정
export const isSupabaseConfigured = 
  Boolean(cleanUrl) && 
  Boolean(supabaseAnonKey) && 
  cleanUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key' &&
  cleanUrl !== '' &&
  supabaseAnonKey !== '';

// 브라우저 클라이언트 환경에서는 DNS 및 CORS 우회를 위해 Reverse Proxy 경로를 사용합니다.
const supabaseUrl = (isSupabaseConfigured && typeof window !== 'undefined')
  ? `${window.location.origin}/supabase-api`
  : cleanUrl;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
