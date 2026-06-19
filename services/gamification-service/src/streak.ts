/**
 * 스트릭(연속 활동일) 계산 (순수 로직, 테스트 핵심).
 *
 * 리텐션 핵심 장치: "오늘도 들어와서 끊기지 않게" 만든다.
 * 입력은 활동 발생 ISO 타임스탬프들. UTC 날짜로 정규화해 중복 제거 후 계산.
 * - longest: 어디서든 가장 긴 연속일 수
 * - current: 가장 최근 활동일에서 거꾸로 이어지는 연속일 수.
 *   단, 최근 활동일이 asOf(오늘) 또는 어제가 아니면 스트릭은 끊긴 것으로 보아 0.
 */

function toUtcDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayNumber(day: string): number {
  return Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
}

export interface StreakResult {
  currentStreakDays: number;
  longestStreakDays: number;
}

export function computeStreak(
  timestamps: string[],
  asOf: string = new Date().toISOString(),
): StreakResult {
  const days = [...new Set(timestamps.map(toUtcDay))].map(dayNumber).sort((a, b) => a - b);
  if (days.length === 0) return { currentStreakDays: 0, longestStreakDays: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] + 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  // current: 최근 활동일 기준 역방향 연속. 오늘/어제와 닿아 있어야 살아있음.
  const today = dayNumber(toUtcDay(asOf));
  const last = days[days.length - 1];
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i] === days[i + 1] - 1) current += 1;
      else break;
    }
  }

  return { currentStreakDays: current, longestStreakDays: longest };
}
