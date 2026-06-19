import { useState } from 'react';
import { useI18n } from '../i18n';
import { getRoster } from '../api/family';
import { extractFromPhoto, extractFromEmail } from '../api/intake';
import { matchExtractedToAthletes } from '../lib/match';
import { ageGroupFor } from '../lib/ageGroup';
import { ageFromBirth } from '../lib/portfolio';
import { formatMsToTime } from '../lib/time';
import { ReviewRace, type ExtractedRace } from '../components/ReviewRace';
import type { ExtractedRow, RosterAthlete } from '../types';

type Method = 'photo' | 'email';

interface MatchedItem {
  athlete: RosterAthlete;
  ageGroup: string;
  race: ExtractedRace;
}

function toRace(row: ExtractedRow): ExtractedRace {
  return {
    stroke: row.stroke, distance: row.distance, course: row.course,
    timeMs: row.timeMs, place: row.place, fieldConfidence: row.fieldConfidence,
  };
}

/** 결과지 입력 — ① 사진 ② 이메일. 추출 후 등록된 아이만 자동 매칭하여 검증·확정. */
export function IntakeScreen({ onConfirmed }: { onConfirmed?: (n: number) => void }) {
  const { t } = useI18n();
  const [method, setMethod] = useState<Method>('photo');
  const [emailBody, setEmailBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [matched, setMatched] = useState<MatchedItem[] | null>(null);
  const [unmatched, setUnmatched] = useState<ExtractedRow[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);

  const process = async (rows: ExtractedRow[]) => {
    const roster = await getRoster();
    const res = matchExtractedToAthletes(rows, roster);
    setMatched(
      res.matched.map(({ row, athlete }) => ({
        athlete,
        ageGroup: row.ageGroup ?? ageGroupFor(ageFromBirth(athlete.birthDate)),
        race: toRace(row),
      })),
    );
    setUnmatched(res.unmatched);
    setConfirmedCount(0);
  };

  const runPhoto = async (file?: File | null) => {
    setBusy(true);
    try { await process(await extractFromPhoto(file)); } finally { setBusy(false); }
  };
  const runEmail = async () => {
    setBusy(true);
    try { await process(await extractFromEmail(emailBody)); } finally { setBusy(false); }
  };

  const updateRace = (i: number, race: ExtractedRace) => {
    setMatched((prev) => prev && prev.map((m, idx) => (idx === i ? { ...m, race } : m)));
  };

  const confirmAll = () => {
    const n = matched?.length ?? 0;
    setConfirmedCount(n);
    onConfirmed?.(n);
    setMatched(null);
    setUnmatched([]);
  };

  return (
    <div className="intake">
      <h1>{t('intake.title')}</h1>
      <p className="muted">{t('intake.subtitle')}</p>

      <div className="segmented method-tabs">
        <button className={method === 'photo' ? 'seg active' : 'seg'} onClick={() => setMethod('photo')}>
          {t('intake.method.photo')}
        </button>
        <button className={method === 'email' ? 'seg active' : 'seg'} onClick={() => setMethod('email')}>
          {t('intake.method.email')}
        </button>
      </div>

      {method === 'photo' ? (
        <section className="intake-input">
          <h3>{t('intake.photo.title')}</h3>
          <p className="muted">{t('intake.photo.hint')}</p>
          <label className="file-drop">
            <input type="file" accept="image/*" capture="environment"
              onChange={(e) => runPhoto(e.target.files?.[0])} />
            <span>{t('intake.photo.choose')}</span>
          </label>
          <button className="link" onClick={() => runPhoto(null)}>{t('intake.photo.sample')}</button>
        </section>
      ) : (
        <section className="intake-input">
          <h3>{t('intake.email.title')}</h3>
          <p className="muted">{t('intake.email.hint')}</p>
          <textarea rows={5} value={emailBody} placeholder={t('intake.email.paste')}
            onChange={(e) => setEmailBody(e.target.value)} />
          <label className="file-drop small">
            <input type="file" onChange={() => { /* 첨부는 분석 시 함께 전송(후속) */ }} />
            <span>{t('intake.email.attach')}</span>
          </label>
          <button className="primary" onClick={runEmail}>{t('intake.parse')}</button>
          <button className="link" onClick={() => { setEmailBody(''); runEmail(); }}>{t('intake.email.sample')}</button>
        </section>
      )}

      {busy && <p className="muted">{t('intake.processing')}</p>}

      {confirmedCount > 0 && (
        <p className="confirmed" role="status">✅ {confirmedCount}{t('intake.confirmed')}</p>
      )}

      {matched && (
        <section className="intake-results">
          {matched.length === 0 ? (
            <p className="warn">{t('intake.noMatch')}</p>
          ) : (
            <>
              <h3>{t('intake.matchedTitle')} ({matched.length})</h3>
              {matched.map((m, i) => (
                <div className="matched-card" key={`${m.athlete.id}-${i}`}>
                  <div className="matched-head">
                    <span className="matched-name">✅ {m.athlete.firstName} {m.athlete.lastName}</span>
                    <span className="age-chip">{t('intake.detectedAge')}: {m.ageGroup}</span>
                  </div>
                  <ReviewRace race={m.race} onChange={(r) => updateRace(i, r)} onConfirm={() => {}} />
                </div>
              ))}
              <button className="primary big" onClick={confirmAll}>{t('intake.confirmAll')}</button>
            </>
          )}

          {unmatched.length > 0 && (
            <div className="unmatched">
              <h4>{t('intake.unmatchedTitle')} ({unmatched.length})</h4>
              <p className="muted">{t('intake.unmatchedHint')}</p>
              <ul className="unmatched-list">
                {unmatched.map((r, i) => (
                  <li key={i} className="muted">
                    {r.swimmerName} — {r.distance} {t(`stroke.${r.stroke}`)} {r.course} · {formatMsToTime(r.timeMs)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default IntakeScreen;
