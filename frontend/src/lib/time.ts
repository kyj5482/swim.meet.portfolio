/**
 * 수영 기록 시간 유틸 (프론트엔드 로컬 복사본).
 *
 * NOTE: 이 파일은 `@swimvault/contracts`의 `libs/contracts/src/time.ts`를 미러링한 것이다.
 * 프론트엔드를 독립 패키지로 빌드하기 위해 복사해 두었으며, 계약이 바뀌면 동기화해야 한다.
 *
 * 저장은 항상 밀리초 정수(timeMs). 부동소수 비교 오류 방지.
 * 표시는 `mm:ss.SS`(60초 이상) 또는 `ss.SS`(60초 미만).
 * 0.01초가 의미 있는 도메인이므로 파싱/포맷은 반드시 단위 테스트로 보호한다. (설계 P2)
 */

const TIME_RE = /^\s*(?:(\d+):)?(?:(\d{1,2}):)?(\d{1,2})(?:[.,](\d{1,2}))?\s*$/;

/**
 * "1:02.34", "02.34", "28.91", "1:02:03.45" 등을 밀리초로 파싱.
 * 콜론은 시:분:초, 소수점/쉼표는 백분초(centiseconds). 형식 오류 시 null.
 */
export function parseTimeToMs(input: string): number | null {
  if (typeof input !== 'string') return null;
  const m = TIME_RE.exec(input);
  if (!m) return null;

  // 그룹: [, g1, g2, secs, frac] — 콜론 개수에 따라 hh/mm 위치가 달라진다.
  const parts = [m[1], m[2]].filter((p) => p !== undefined) as string[];
  let hours = 0;
  let minutes = 0;
  if (parts.length === 2) {
    hours = Number(parts[0]);
    minutes = Number(parts[1]);
  } else if (parts.length === 1) {
    minutes = Number(parts[0]);
  }
  const seconds = Number(m[3]);
  const fracStr = m[4] ?? '';
  const centis = fracStr === '' ? 0 : Number(fracStr.padEnd(2, '0'));

  if (minutes >= 60 || seconds >= 60) return null;

  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + centis * 10;
}

/**
 * 밀리초 → 표시 문자열. 60초 이상은 `m:ss.SS`, 미만은 `ss.SS`.
 * 백분초 단위로 반올림(수영 기록은 0.01초 정밀도).
 */
export function formatMsToTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError('ms must be >= 0');
  const totalCentis = Math.round(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const cc = String(centis).padStart(2, '0');

  if (totalMinutes === 0) {
    return `${seconds}.${cc}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours === 0) {
    return `${minutes}:${ss}.${cc}`;
  }
  const mm = String(minutes).padStart(2, '0');
  return `${hours}:${mm}:${ss}.${cc}`;
}
