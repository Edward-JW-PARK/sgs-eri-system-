import { createHash, timingSafeEqual } from 'crypto';

const buckets = new Map<string, { count: number; resetAt: number }>();

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

function getClientIp(req: any): string {
  const forwarded = req?.headers?.['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (raw || '').split(',')[0].trim() || req?.headers?.['x-real-ip'] || 'unknown';
}

function isRateLimited(ip: string, limitPerMin = 10): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > 3000) {
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
    }
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limitPerMin;
}

/**
 * 원장(admin) · 멘토(mentor) 로그인을 서버 환경변수로 검증합니다.
 * 프론트엔드 평문 비밀번호 하드코딩 제거용 엔드포인트입니다.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip, 10)) {
    return res.status(429).json({
      ok: false,
      code: 'RATE_LIMITED',
      error: '로그인 시도가 너무 많습니다. 1분 후 다시 시도해 주세요.',
    });
  }

  const role = req.body?.role === 'admin' ? 'admin' : req.body?.role === 'mentor' ? 'mentor' : null;
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!role || !password) {
    return res.status(400).json({ ok: false, error: '역할과 비밀번호를 입력해 주세요.' });
  }

  const expected =
    role === 'admin'
      ? (process.env.ERI_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim()
      : (process.env.ERI_MENTOR_PASSWORD || process.env.MENTOR_PASSWORD || '').trim();

  if (!expected) {
    return res.status(503).json({
      ok: false,
      code: 'MISSING_CONFIG',
      error: '서버에 관리자/멘토 비밀번호 환경변수(ERI_ADMIN_PASSWORD, ERI_MENTOR_PASSWORD)가 설정되지 않았습니다.',
    });
  }

  if (!safeEqual(password, expected)) {
    return res.status(401).json({ ok: false, code: 'INVALID_CREDENTIALS', error: '비밀번호가 올바르지 않습니다.' });
  }

  return res.status(200).json({ ok: true, role });
}
