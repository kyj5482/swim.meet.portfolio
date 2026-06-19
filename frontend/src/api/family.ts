/** 가족/명단 클라이언트 — family-service + athlete-service. mock 기본. */
import { USE_MOCK, apiFetch } from './config';
import type { Gender, RosterAthlete } from '../types';

/** mock 가족 명단(등록된 아이들) — 매칭/포트폴리오에 사용. */
const MOCK_ROSTER: RosterAthlete[] = [
  { id: 'ath-jiwoo', firstName: '지우', lastName: 'Kim', birthDate: '2012-03-10', gender: 'F' },
  { id: 'ath-minjun', firstName: '민준', lastName: 'Kim', birthDate: '2015-08-20', gender: 'M' },
];

let roster = [...MOCK_ROSTER];

export async function getRoster(): Promise<RosterAthlete[]> {
  if (USE_MOCK) return [...roster];
  const res = await apiFetch('/api/athletes');
  if (!res.ok) return [...roster];
  return (await res.json()) as RosterAthlete[];
}

export interface AddAthleteInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
}

export async function addAthlete(input: AddAthleteInput): Promise<RosterAthlete> {
  if (USE_MOCK) {
    const a: RosterAthlete = { id: `ath-${Date.now()}`, ...input };
    roster = [...roster, a];
    return a;
  }
  const res = await apiFetch('/api/athletes', {
    method: 'POST',
    body: JSON.stringify({ ...input, clubs: [], countryCodes: [] }),
  });
  return (await res.json()) as RosterAthlete;
}

export interface FamilyMemberRow {
  name: string;
  role: 'guardian' | 'swimmer';
}

/** 가족 구성원(보호자 + 선수) — mock은 현재 사용자(보호자) + 명단(선수). */
export async function getFamilyMembers(guardianName: string): Promise<FamilyMemberRow[]> {
  const swimmers = (await getRoster()).map<FamilyMemberRow>((a) => ({
    name: `${a.firstName} ${a.lastName}`,
    role: 'swimmer',
  }));
  return [{ name: guardianName, role: 'guardian' }, ...swimmers];
}

export async function generateInvite(): Promise<string> {
  if (USE_MOCK) {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  const res = await apiFetch('/api/families/invites', {
    method: 'POST',
    body: JSON.stringify({ role: 'guardian' }),
  });
  const data = await res.json();
  return data.code as string;
}
