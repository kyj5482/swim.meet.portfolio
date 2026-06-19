/**
 * 가족(family) 공유 계약 — 단일 진실 공급원.
 *
 * 설계 의도(핵심 요구): 부모(보호자)와 수영 학생 본인이 모두 업로드하고,
 * 이를 "하나의 가족"에서 관리하며, 학생이 평생 포트폴리오를 쌓아간다.
 * 기존 parentId 소유 모델(P6)을 깨지 않고, 그 위에 가족이라는 묶음을 더한다.
 *  - guardian: 부모/코치 등 보호자 계정
 *  - swimmer: 수영 학생 본인 계정(나이가 되면 직접 업로드)
 * 한 athlete(선수 프로필)는 정확히 한 가족에 속한다.
 */

export type FamilyRole = 'guardian' | 'swimmer';

export interface FamilyMember {
  userId: string;
  role: FamilyRole;
  /** swimmer 멤버가 자신의 선수 프로필과 연결될 때 사용(선택). */
  athleteId?: string;
  joinedAt: string; // ISO
}

export interface Family {
  id: string;
  name: string;
  createdBy: string; // userId
  members: FamilyMember[];
  athleteIds: string[]; // 이 가족이 관리하는 선수 프로필들
  createdAt: string; // ISO
}

/** 가족 합류 초대 — 보호자가 발급, 다른 멤버가 코드로 수락. */
export interface FamilyInvite {
  code: string;
  familyId: string;
  role: FamilyRole;
  expiresAt: string; // ISO
}
