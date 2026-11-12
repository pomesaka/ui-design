// Synthetic team data and a fake API for the members example. Latency and
// failures are simulated so pending and error states can be seen; they are
// not part of any component contract.

export type Role = "admin" | "editor" | "viewer";
export const roles: readonly Role[] = ["admin", "editor", "viewer"];

export function isRole(value: unknown): value is Role {
  return roles.some((role) => role === value);
}

export const roleLabel: Record<Role, string> = { admin: "管理者", editor: "編集者", viewer: "閲覧者" };

// Assumed meaning of each role; only the member management rights are given.
export const roleDescription: Record<Role, string> = {
  admin: "メンバーの招待・権限の変更・削除と、チームの設定ができる",
  editor: "チームの内容を作成・編集できる",
  viewer: "チームの内容とメンバー一覧を見られる",
};

export const roleOrder: Record<Role, number> = { admin: 0, editor: 1, viewer: 2 };

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** ISO date of the last sign-in; null when the person never signed in after joining. */
  lastActiveAt: string | null;
};

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
};

export const today = new Date("2026-11-12T10:00:00+09:00");
export const currentUserId = "m-1";
/** Assumed: an invitation link works for this many days after it is sent. */
export const invitationValidDays = 7;
/** Assumed threshold for "may have left the team". */
export const inactiveDays = 90;

function daysAgo(days: number) {
  return new Date(today.getTime() - days * 86_400_000).toISOString();
}

const fixedMembers: Member[] = [
  { id: "m-1", name: "山田 太郎", email: "taro.yamada@example.com", role: "admin", lastActiveAt: daysAgo(0) },
  { id: "m-2", name: "鈴木 美咲", email: "misaki.suzuki@example.com", role: "admin", lastActiveAt: daysAgo(2) },
  { id: "m-3", name: "佐藤 健", email: "ken.sato@example.com", role: "editor", lastActiveAt: daysAgo(1) },
  { id: "m-4", name: "髙橋 ルイス・アレハンドロ・フェルナンデス", email: "luis.alejandro.fernandez.takahashi@long-subsidiary-name.example.co.jp", role: "editor", lastActiveAt: daysAgo(5) },
  { id: "m-5", name: "田中 陽子", email: "yoko.tanaka@example.com", role: "editor", lastActiveAt: daysAgo(140) },
  { id: "m-6", name: "伊藤 翔", email: "sho.ito@example.com", role: "viewer", lastActiveAt: daysAgo(12) },
  { id: "m-7", name: "渡辺 さくら", email: "sakura.watanabe@example.com", role: "viewer", lastActiveAt: daysAgo(210) },
  { id: "m-8", name: "中村 大輔", email: "daisuke.nakamura@example.com", role: "editor", lastActiveAt: null },
];

const familyNames = ["小林", "加藤", "吉田", "山口", "松本", "井上", "木村", "林", "清水", "山崎", "森", "池田", "橋本", "阿部", "石川"];
const givenNames = ["彩", "誠", "葵", "蓮", "結衣", "拓海", "美月", "悠真", "七海", "陸"];
const romaFamily = ["kobayashi", "kato", "yoshida", "yamaguchi", "matsumoto", "inoue", "kimura", "hayashi", "shimizu", "yamazaki", "mori", "ikeda", "hashimoto", "abe", "ishikawa"];
const romaGiven = ["aya", "makoto", "aoi", "ren", "yui", "takumi", "mizuki", "yuma", "nanami", "riku"];

/** Deterministic filler so screenshots stay stable at any count. */
export function makeMembers(count: number): Member[] {
  const members = fixedMembers.slice(0, Math.max(1, count));
  for (let i = members.length; i < count; i++) {
    const f = i % familyNames.length;
    const g = (i * 7) % givenNames.length;
    members.push({
      id: `m-${i + 1}`,
      name: `${familyNames[f]} ${givenNames[g]}`,
      email: `${romaGiven[g]}.${romaFamily[f]}${i}@example.com`,
      role: i % 4 === 0 ? "viewer" : "editor",
      lastActiveAt: daysAgo(i % 11 === 0 ? 100 + i : (i * 3) % 60),
    });
  }
  return members;
}

export function makeInvitations(count: number): Invitation[] {
  const all: Invitation[] = [
    { id: "i-1", email: "new.hire@example.com", role: "editor", sentAt: daysAgo(1) },
    { id: "i-2", email: "contractor.design@partner.example.net", role: "viewer", sentAt: daysAgo(3) },
    { id: "i-3", email: "kenji.okada@example.com", role: "editor", sentAt: daysAgo(16) },
  ];
  return all.slice(0, count);
}

export type Scenario = {
  viewer: Role;
  memberCount: number;
  invitationCount: number;
  load: "ok" | "loading" | "error" | "refresh-error";
  failActions: boolean;
};

/** Read the example's scenario from the URL so each state can be opened directly. */
export function readScenario(search: string): Scenario {
  const params = new URLSearchParams(search);
  const as = params.get("as");
  const count = Number(params.get("count") ?? "24");
  const invites = Number(params.get("invites") ?? "3");
  const state = params.get("state");
  return {
    viewer: isRole(as) ? as : "admin",
    memberCount: Number.isInteger(count) && count >= 1 && count <= 200 ? count : 24,
    invitationCount: Number.isInteger(invites) && invites >= 0 ? invites : 3,
    load: state === "loading" || state === "error" || state === "refresh-error" ? state : "ok",
    failActions: params.get("fail") === "1",
  };
}

export class ActionError extends Error {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fake mutation: resolves after a delay, or fails when the scenario asks for it. */
export async function simulate(scenario: Scenario, message: string): Promise<void> {
  await wait(700);
  if (scenario.failActions) throw new ActionError(message);
}

export function daysSince(iso: string) {
  return Math.floor((today.getTime() - new Date(iso).getTime()) / 86_400_000);
}

export function relativeDay(iso: string) {
  const days = daysSince(iso);
  if (days <= 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 30) return `${days}日前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年以上前`;
}

export function isInactive(member: Member) {
  return member.lastActiveAt === null || daysSince(member.lastActiveAt) >= inactiveDays;
}

export function isExpired(invitation: Invitation) {
  return daysSince(invitation.sentAt) >= invitationValidDays;
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
