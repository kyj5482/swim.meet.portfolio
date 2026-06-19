import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { useAuth } from '../auth/AuthContext';
import {
  getRoster, addAthlete, getFamilyMembers, generateInvite,
  type FamilyMemberRow,
} from '../api/family';
import type { Gender, RosterAthlete } from '../types';

/** 가족 관리 — 구성원/선수 목록, 아이 추가, 가족 초대 코드. */
export function FamilyScreen() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMemberRow[]>([]);
  const [athletes, setAthletes] = useState<RosterAthlete[]>([]);
  const [invite, setInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 아이 추가 폼
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('F');

  const refresh = async () => {
    setAthletes(await getRoster());
    setMembers(await getFamilyMembers(user?.displayName ?? 'me'));
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthDate) return;
    await addAthlete({ firstName, lastName, birthDate, gender });
    setFirstName(''); setLastName(''); setBirthDate(''); setGender('F');
    await refresh();
  };

  const onInvite = async () => {
    setInvite(await generateInvite());
    setCopied(false);
  };
  const onCopy = async () => {
    if (invite) { await navigator.clipboard?.writeText(invite).catch(() => {}); setCopied(true); }
  };

  return (
    <div className="family-screen">
      <h1>{t('family.title')}</h1>

      <section className="set-group">
        <h3>{t('family.members')}</h3>
        <ul className="member-list">
          {members.map((m, i) => (
            <li key={i}>
              <span className="m-name">{m.name}</span>
              <span className={`role role-${m.role}`}>{t(`family.role.${m.role}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="set-group">
        <h3>{t('family.athletes')}</h3>
        <ul className="member-list">
          {athletes.map((a) => (
            <li key={a.id}>
              <span className="m-name">{a.firstName} {a.lastName}</span>
              <span className="muted">{a.birthDate} · {t(`family.gender.${a.gender === 'M' ? 'M' : 'F'}` as 'family.gender.F')}</span>
            </li>
          ))}
        </ul>

        <form className="add-athlete" onSubmit={onAdd}>
          <h4>{t('family.addAthlete')}</h4>
          <div className="row2">
            <label>{t('family.lastName')}<input value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
            <label>{t('family.firstName')}<input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
          </div>
          <div className="row2">
            <label>{t('family.birthDate')}<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
            <label>{t('family.gender')}
              <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                <option value="F">{t('family.gender.F')}</option>
                <option value="M">{t('family.gender.M')}</option>
              </select>
            </label>
          </div>
          <button type="submit" className="primary">{t('family.add')}</button>
        </form>
      </section>

      <section className="set-group">
        <h3>{t('family.invite')}</h3>
        <p className="muted">{t('family.inviteHint')}</p>
        {invite ? (
          <div className="invite-box">
            <code className="invite-code">{invite}</code>
            <button className="seg" onClick={onCopy}>{copied ? t('family.copied') : t('family.copy')}</button>
          </div>
        ) : (
          <button className="primary" onClick={onInvite}>{t('family.generateInvite')}</button>
        )}
      </section>
    </div>
  );
}

export default FamilyScreen;
