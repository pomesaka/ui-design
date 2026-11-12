import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { useAnnounce } from "../../components/ui/announcer";
import { Banner } from "../../components/ui/banner";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { focusTargetAfterRemoval, List, ListItem } from "../../components/ui/list";
import { Notice } from "../../components/ui/notice";
import { Spinner } from "../../components/ui/spinner";
import { Field, FieldError, FieldLabel, Input } from "../../components/ui/field";
import { Radio, RadioGroup } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from "../../components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { WarningIcon } from "../../components/lib/icons";
import {
  ActionError,
  currentUserId,
  formatDate,
  inactiveDays,
  invitationValidDays,
  isExpired,
  isInactive,
  isRole,
  makeInvitations,
  makeMembers,
  relativeDay,
  roleDescription,
  roleLabel,
  roleOrder,
  roles,
  simulate,
  type Invitation,
  type Member,
  type Role,
  type Scenario,
} from "./data";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; refreshFailed: boolean };
type Sort = "role" | "name" | "inactive";
type RoleFilter = Role | "all";

const sortItems = [
  { value: "role", label: "権限の順" },
  { value: "name", label: "名前の順" },
  { value: "inactive", label: "最終利用が古い順" },
];
const filterItems = [{ value: "all", label: "すべての権限" }, ...roles.map((role) => ({ value: role, label: roleLabel[role] }))];
const roleItems = roles.map((role) => ({ value: role, label: roleLabel[role] }));

function isSort(value: unknown): value is Sort {
  return value === "role" || value === "name" || value === "inactive";
}

function isRoleFilter(value: unknown): value is RoleFilter {
  return value === "all" || isRole(value);
}

/** A failed row action, kept next to the row until retried or dismissed. */
type RowError = { message: string; retry: () => void };

type Confirm =
  | { kind: "remove"; member: Member }
  | { kind: "demote-self"; member: Member; role: Role };

export function MembersPage({ scenario }: { scenario: Scenario }) {
  const announce = useAnnounce();
  const canManage = scenario.viewer === "admin";
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadedAt, setLoadedAt] = useState("10:42");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<Sort>("role");

  const [pending, setPending] = useState<ReadonlyMap<string, string>>(new Map());
  const [rowErrors, setRowErrors] = useState<Record<string, RowError>>({});
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const membersHeading = useRef<HTMLHeadingElement>(null);
  const invitationsHeading = useRef<HTMLHeadingElement>(null);
  // Where focus goes after a confirmed removal; null keeps the dialog default (its trigger).
  const focusAfterRemove = useRef<HTMLElement | null>(null);
  const removeTrigger = useRef<HTMLElement | null>(null);
  // Keep the last content while the dialog animates out after `confirm` clears.
  const lastConfirm = useRef<Confirm | null>(null);
  if (confirm) lastConfirm.current = confirm;
  const shownConfirm = confirm ?? lastConfirm.current;

  // Initial fetch. `state=loading` never resolves so the loading view can be inspected.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (scenario.load === "loading") return;
    setLoad({ status: "loading" });
    const timer = setTimeout(() => {
      if (scenario.load === "error" && attempt === 0) {
        setLoad({ status: "error" });
        return;
      }
      setMembers(makeMembers(scenario.memberCount));
      setInvitations(canManage ? makeInvitations(scenario.invitationCount) : []);
      setLoad({ status: "ready", refreshFailed: scenario.load === "refresh-error" && attempt === 0 });
      if (attempt > 0) setLoadedAt("10:45");
    }, 500);
    return () => clearTimeout(timer);
  }, [scenario, attempt, canManage]);

  const admins = members.filter((member) => member.role === "admin");
  const inactive = members.filter((member) => isInactive(member) && member.id !== currentUserId);

  const visible = useMemo(() => {
    const words = query.trim().toLowerCase();
    const filtered = members.filter(
      (member) =>
        (roleFilter === "all" || member.role === roleFilter) &&
        (words === "" || member.name.toLowerCase().includes(words) || member.email.toLowerCase().includes(words)),
    );
    const byName = (a: Member, b: Member) => a.name.localeCompare(b.name, "ja");
    const lastActive = (member: Member) => (member.lastActiveAt === null ? 0 : new Date(member.lastActiveAt).getTime());
    return filtered.sort((a, b) => {
      if (sort === "role") return roleOrder[a.role] - roleOrder[b.role] || byName(a, b);
      if (sort === "inactive") return lastActive(a) - lastActive(b) || byName(a, b);
      return byName(a, b);
    });
  }, [members, query, roleFilter, sort]);

  /** Which action is running on a row, so only that button shows progress. */
  function setRowPending(id: string, action: string | null) {
    setPending((current) => {
      const next = new Map(current);
      if (action) next.set(id, action);
      else next.delete(id);
      return next;
    });
  }

  function setRowError(id: string, error: RowError | null) {
    setRowErrors((current) => {
      const { [id]: _removed, ...rest } = current;
      return error ? { ...rest, [id]: error } : rest;
    });
  }

  async function changeRole(member: Member, role: Role) {
    setRowError(member.id, null);
    setRowPending(member.id, "role");
    try {
      await simulate(scenario, "権限を変更できませんでした");
      setMembers((current) => current.map((m) => (m.id === member.id ? { ...m, role } : m)));
      announce(`${member.name}さんの権限を${roleLabel[role]}に変更しました`);
    } catch (error) {
      const message = error instanceof ActionError ? error.message : "予期しないエラーが起きました";
      setRowError(member.id, { message: `${message}。権限は${roleLabel[member.role]}のままです。`, retry: () => changeRole(member, role) });
      announce(`${member.name}さんの${message}`, { priority: "assertive" });
    } finally {
      setRowPending(member.id, null);
    }
  }

  function requestRoleChange(member: Member, role: Role) {
    if (role === member.role) return;
    if (member.id === currentUserId && member.role === "admin") {
      setConfirm({ kind: "demote-self", member, role });
      return;
    }
    void changeRole(member, role);
  }

  async function runConfirm() {
    if (!confirm) return;
    if (confirm.kind === "demote-self") {
      const { member, role } = confirm;
      setConfirm(null);
      void changeRole(member, role);
      return;
    }
    const { member } = confirm;
    setConfirmPending(true);
    setConfirmError(null);
    try {
      await simulate(scenario, "削除できませんでした");
      focusAfterRemove.current = focusTargetAfterRemoval(removeTrigger.current, membersHeading.current);
      setMembers((current) => current.filter((m) => m.id !== member.id));
      setConfirm(null);
      announce(`${member.name}さんをチームから削除しました`);
    } catch {
      setConfirmError("通信が途切れたため、削除できませんでした。メンバーはチームに残っています。");
      announce("削除できませんでした", { priority: "assertive" });
    } finally {
      setConfirmPending(false);
    }
  }

  async function resend(invitation: Invitation) {
    setRowError(invitation.id, null);
    setRowPending(invitation.id, "resend");
    try {
      await simulate(scenario, "招待を再送できませんでした");
      const sentAt = new Date("2026-11-12T10:00:00+09:00").toISOString();
      setInvitations((current) => current.map((i) => (i.id === invitation.id ? { ...i, sentAt } : i)));
      announce(`${invitation.email}に招待を再送しました`);
    } catch (error) {
      const message = error instanceof ActionError ? error.message : "予期しないエラーが起きました";
      setRowError(invitation.id, { message, retry: () => resend(invitation) });
      announce(message, { priority: "assertive" });
    } finally {
      setRowPending(invitation.id, null);
    }
  }

  async function revoke(invitation: Invitation, trigger: HTMLElement | null = null) {
    setRowError(invitation.id, null);
    setRowPending(invitation.id, "revoke");
    try {
      await simulate(scenario, "招待を取り消せませんでした");
      // The pressed button leaves with its row; continue from the next row's same action.
      const target = focusTargetAfterRemoval(trigger, invitationsHeading.current ?? membersHeading.current);
      setInvitations((current) => current.filter((i) => i.id !== invitation.id));
      requestAnimationFrame(() => (target?.isConnected ? target : invitationsHeading.current ?? membersHeading.current)?.focus());
      announce(`${invitation.email}への招待を取り消しました`);
    } catch (error) {
      const message = error instanceof ActionError ? error.message : "予期しないエラーが起きました";
      setRowError(invitation.id, { message: `${message}。招待のリンクはまだ使えます。`, retry: () => revoke(invitation) });
      announce(message, { priority: "assertive" });
    } finally {
      setRowPending(invitation.id, null);
    }
  }

  async function invite(email: string, role: Role) {
    await simulate(scenario, "招待を送れませんでした");
    const id = `i-${Date.now()}`;
    setInvitations((current) => [{ id, email, role, sentAt: new Date("2026-11-12T10:00:00+09:00").toISOString() }, ...current]);
    announce(`${email}に${roleLabel[role]}として招待を送りました`);
  }

  function clearFilters() {
    setQuery("");
    setRoleFilter("all");
  }

  const ready = load.status === "ready";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-heading">メンバー</h1>
            {ready && (
              <p className="font-control text-caption text-reading-secondary">
                {members.length}人{canManage && invitations.length > 0 && `・招待中 ${invitations.length}件`}
              </p>
            )}
          </div>
          {canManage && ready && <Button onClick={() => setInviteOpen(true)}>メンバーを招待</Button>}
        </div>
        {ready && <AdminSummary admins={admins} canManage={canManage} />}
      </header>

      {load.status === "loading" && (
        <div role="status" aria-busy="true" className="flex items-center gap-3 py-12 font-body text-body text-reading-secondary">
          <Spinner />
          メンバーを読み込んでいます
        </div>
      )}

      {load.status === "error" && (
        <Banner
          tone="error"
          title="メンバーを読み込めませんでした"
          action={<Button variant="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>再読み込み</Button>}
        >
          通信が途切れた可能性があります。接続を確かめてから、もう一度読み込んでください。
        </Banner>
      )}

      {ready && load.refreshFailed && (
        <Banner
          tone="warning"
          title="最新の状態を取得できませんでした"
          action={<Button variant="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>再読み込み</Button>}
        >
          表示は{loadedAt}時点の内容です。他の管理者が行った変更が反映されていない場合があります。
        </Banner>
      )}

      {ready && canManage && invitations.length > 0 && (
        <InvitationSection headingRef={invitationsHeading} invitations={invitations} pending={pending} rowErrors={rowErrors} onResend={resend} onRevoke={revoke} onDismissError={(id) => setRowError(id, null)} />
      )}

      {ready && (
        <section aria-labelledby="members-heading" className="flex flex-col gap-4">
          <h2 id="members-heading" ref={membersHeading} tabIndex={-1} className="font-heading text-reading outline-none">
            参加しているメンバー
          </h2>

          {canManage && inactive.length > 0 && sort !== "inactive" && (
            <Notice
              tone="warning"
              title={`${inactiveDays}日以上利用のないメンバーが${inactive.length}人います`}
              action={<Button variant="outline" size="sm" onClick={() => { clearFilters(); setSort("inactive"); }}>利用が古い順に並べる</Button>}
            >
              退職や異動でチームを離れた人がいれば、チームから削除してください。
            </Notice>
          )}

          {members.length > 1 && (
            <div className="flex flex-wrap items-end gap-3">
              <Field className="flex-[1_1_16rem]">
                <FieldLabel>名前・メールで探す</FieldLabel>
                <Input type="search" value={query} onValueChange={setQuery} autoComplete="off" />
              </Field>
              <Field className="flex-[1_1_10rem] sm:flex-none">
                <Select items={filterItems} value={roleFilter} onValueChange={(value) => isRoleFilter(value) && setRoleFilter(value)}>
                  <SelectLabel>権限</SelectLabel>
                  <SelectTrigger className="sm:w-40" />
                  <SelectContent>
                    {filterItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field className="flex-[1_1_10rem] sm:flex-none">
                <Select items={sortItems} value={sort} onValueChange={(value) => isSort(value) && setSort(value)}>
                  <SelectLabel>並び順</SelectLabel>
                  <SelectTrigger className="sm:w-48" />
                  <SelectContent>
                    {sortItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {members.length > 1 && (query !== "" || roleFilter !== "all") && (
            <p className="font-control text-caption text-reading-secondary" aria-live="polite">
              {members.length}人中 {visible.length}人を表示
            </p>
          )}

          {members.length === 1 && (
            <p className="font-body text-body text-muted-foreground">
              {canManage ? "まだメンバーはあなただけです。「メンバーを招待」から一緒に使う人を招待できます。" : "まだメンバーはあなただけです。"}
            </p>
          )}

          {visible.length === 0 && members.length > 1 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border py-6">
              <p className="font-body text-body text-muted-foreground">条件に合うメンバーはいません。</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>条件をクリア</Button>
            </div>
          )}

          {visible.length > 0 && (
            <List aria-labelledby="members-heading">
              {visible.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  canManage={canManage}
                  isOnlyAdmin={member.role === "admin" && admins.length === 1}
                  pending={pending.has(member.id)}
                  error={rowErrors[member.id]}
                  onRoleChange={(role) => requestRoleChange(member, role)}
                  onRemove={(trigger) => { removeTrigger.current = trigger; setConfirmError(null); setConfirm({ kind: "remove", member }); }}
                  onDismissError={() => setRowError(member.id, null)}
                />
              ))}
            </List>
          )}
        </section>
      )}

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        members={members}
        invitations={invitations}
        onInvite={invite}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open && !confirmPending) setConfirm(null); }}>
        <AlertDialogContent
          finalFocus={() => {
            const target = focusAfterRemove.current;
            focusAfterRemove.current = null;
            return target ?? true;
          }}
        >
          {shownConfirm?.kind === "remove" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{shownConfirm.member.name}さんをチームから削除しますか</AlertDialogTitle>
                <AlertDialogDescription>
                  チームの内容を見たり編集したりできなくなります。作成した内容はチームに残ります。もう一度参加するには、新しく招待してください。
                </AlertDialogDescription>
              </AlertDialogHeader>
              {confirmError && <Banner tone="error" title="削除できませんでした">{confirmError}</Banner>}
              <AlertDialogFooter>
                <AlertDialogClose disabled={confirmPending}>キャンセル</AlertDialogClose>
                <Button variant="destructive" pending={confirmPending} onClick={runConfirm}>チームから削除</Button>
              </AlertDialogFooter>
            </>
          )}
          {shownConfirm?.kind === "demote-self" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>自分の権限を{roleLabel[shownConfirm.role]}に変えますか</AlertDialogTitle>
                <AlertDialogDescription>
                  変えると、あなたはメンバーの招待・権限の変更・削除ができなくなります。元に戻すには、他の管理者に依頼してください。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose>キャンセル</AlertDialogClose>
                <Button onClick={runConfirm}>{roleLabel[shownConfirm.role]}に変える</Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/** Answers "who can I ask?" for everyone, before the list. */
function AdminSummary({ admins, canManage }: { admins: Member[]; canManage: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-body text-body">
        <span className="text-reading-secondary">管理者 </span>
        {admins.map((admin, index) => (
          <span key={admin.id}>
            {index > 0 && "、"}
            {admin.name}
            {admin.id === currentUserId && <span className="text-reading-secondary">(あなた)</span>}
          </span>
        ))}
      </p>
      {!canManage && (
        <p className="font-control text-caption text-reading-secondary">メンバーの招待や権限の変更は、管理者に依頼してください。</p>
      )}
    </div>
  );
}

type MemberRowProps = {
  member: Member;
  canManage: boolean;
  isOnlyAdmin: boolean;
  pending: boolean;
  error: RowError | undefined;
  onRoleChange: (role: Role) => void;
  onRemove: (trigger: HTMLElement) => void;
  onDismissError: () => void;
};

function MemberRow({ member, canManage, isOnlyAdmin, pending, error, onRoleChange, onRemove, onDismissError }: MemberRowProps) {
  const isSelf = member.id === currentUserId;
  const inactive = isInactive(member) && !isSelf;
  return (
    <ListItem
      title={<>{member.name}{isSelf && <span className="text-reading-secondary">(あなた)</span>}</>}
      description={member.email}
      meta={
        <>
          {inactive && <WarningIcon className="shrink-0 text-warning" />}
          {member.lastActiveAt === null ? "参加後の利用なし" : `最終利用 ${relativeDay(member.lastActiveAt)}`}
        </>
      }
      actions={
        canManage ? (
          <>
            <Select items={roleItems} value={member.role} readOnly={pending} onValueChange={(value) => isRole(value) && onRoleChange(value)}>
              <SelectTrigger size="sm" aria-label={`${member.name}さんの権限`} aria-busy={pending || undefined} className="w-36" />
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} disabled={isOnlyAdmin && role !== "admin"}>
                    {roleLabel[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Fixed slot so every role select lines up, with or without a remove button. */}
            <div className="flex min-w-20 items-center">
              {pending && (
                <span className="flex items-center gap-1 font-control text-caption text-reading-secondary">
                  <Spinner />変更中
                </span>
              )}
              {!pending && !isSelf && !isOnlyAdmin && (
                <Button variant="outline-destructive" size="sm" data-list-action="remove" onClick={(event) => onRemove(event.currentTarget)} aria-label={`${member.name}さんをチームから削除`}>
                  削除
                </Button>
              )}
              {!pending && isOnlyAdmin && <span className="font-control text-caption text-reading-secondary">唯一の管理者</span>}
            </div>
          </>
        ) : (
          <p className="font-body text-body">{roleLabel[member.role]}</p>
        )
      }
    >
      {error && (
        <Notice
          tone="error"
          title={error.message}
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={error.retry}>もう一度試す</Button>
              <Button variant="outline" size="sm" onClick={onDismissError}>閉じる</Button>
            </div>
          }
        />
      )}
    </ListItem>
  );
}

type InvitationSectionProps = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  invitations: Invitation[];
  pending: ReadonlyMap<string, string>;
  rowErrors: Record<string, RowError>;
  onResend: (invitation: Invitation) => void;
  onRevoke: (invitation: Invitation, trigger: HTMLElement) => void;
  onDismissError: (id: string) => void;
};

function InvitationSection({ headingRef, invitations, pending, rowErrors, onResend, onRevoke, onDismissError }: InvitationSectionProps) {
  return (
    <section aria-labelledby="invitations-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="invitations-heading" ref={headingRef} tabIndex={-1} className="font-heading text-reading outline-none">承認待ちの招待</h2>
        <p className="font-control text-caption text-reading-secondary">招待のリンクは送ってから{invitationValidDays}日間有効です。</p>
      </div>
      <List aria-labelledby="invitations-heading">
        {invitations.map((invitation) => {
          const expired = isExpired(invitation);
          const busy = pending.get(invitation.id);
          const error = rowErrors[invitation.id];
          return (
            <ListItem
              key={invitation.id}
              title={invitation.email}
              description={`${roleLabel[invitation.role]}として招待`}
              meta={
                <>
                  {expired && <WarningIcon className="shrink-0 text-warning" />}
                  {expired ? `期限切れ(${formatDate(invitation.sentAt)}に送信)` : `${relativeDay(invitation.sentAt)}に送信`}
                </>
              }
              actions={
                <>
                  {/* Buttons stay in place while busy so keyboard focus is not lost. */}
                  <Button variant="outline" size="sm" pending={busy === "resend"} disabled={busy !== undefined} onClick={() => onResend(invitation)} aria-label={`${invitation.email}に招待を再送`}>
                    再送
                  </Button>
                  <Button variant="outline-destructive" size="sm" pending={busy === "revoke"} data-list-action="revoke" disabled={busy !== undefined} onClick={(event) => onRevoke(invitation, event.currentTarget)} aria-label={`${invitation.email}への招待を取り消す`}>
                    取り消す
                  </Button>
                </>
              }
            >
              {error && (
                <Notice
                  tone="error"
                  title={error.message}
                  action={
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={error.retry}>もう一度試す</Button>
                      <Button variant="outline" size="sm" onClick={() => onDismissError(invitation.id)}>閉じる</Button>
                    </div>
                  }
                />
              )}
            </ListItem>
          );
        })}
      </List>
    </section>
  );
}

type InviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  invitations: Invitation[];
  onInvite: (email: string, role: Role) => Promise<void>;
};

function InviteDialog({ open, onOpenChange, members, invitations, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const roleLabelId = useId();
  const emailInput = useRef<HTMLInputElement>(null);

  function reset() {
    setEmail("");
    setRole("editor");
    setDuplicate(null);
    setFailure(null);
  }

  // Base UI Form runs the native checks first and only calls this when they pass.
  async function submit() {
    const normalized = email.trim().toLowerCase();
    if (members.some((member) => member.email.toLowerCase() === normalized)) {
      setDuplicate("このメールアドレスの人は、すでにメンバーです。");
      emailInput.current?.focus();
      return;
    }
    if (invitations.some((invitation) => invitation.email.toLowerCase() === normalized)) {
      setDuplicate("このメールアドレスには招待を送っています。届いていない場合は、一覧から再送してください。");
      emailInput.current?.focus();
      return;
    }
    setSending(true);
    setFailure(null);
    try {
      await onInvite(normalized, role);
      onOpenChange(false);
      reset();
    } catch {
      setFailure("通信が途切れたため、招待を送れませんでした。入力した内容はそのままです。もう一度送ってください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!sending) { onOpenChange(next); if (!next) reset(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メンバーを招待</DialogTitle>
          <DialogDescription>招待した人には、参加用のリンクをメールで送ります。</DialogDescription>
        </DialogHeader>
        {failure && <Banner tone="error" title="招待を送れませんでした">{failure}</Banner>}
        <Form onFormSubmit={submit}>
          <Field name="email" error={duplicate}>
            <FieldLabel>メールアドレス</FieldLabel>
            <Input
              ref={emailInput}
              type="email"
              required
              autoComplete="off"
              value={email}
              onValueChange={(value) => { setEmail(value); setDuplicate(null); }}
            />
            <FieldError match="valueMissing">メールアドレスを入力してください。</FieldError>
            <FieldError match="typeMismatch">メールアドレスの形式で入力してください(例: name@example.com)。</FieldError>
          </Field>
          <div className="flex flex-col gap-2">
            <p id={roleLabelId} className="font-control text-action">権限</p>
            <RadioGroup aria-labelledby={roleLabelId} value={role} onValueChange={(value) => isRole(value) && setRole(value)}>
              {roles.map((option) => (
                <Radio key={option} value={option}>
                  <span className="flex flex-col py-1">
                    <span>{roleLabel[option]}</span>
                    <span className="font-control text-caption text-reading-secondary">{roleDescription[option]}</span>
                  </span>
                </Radio>
              ))}
            </RadioGroup>
            <p className="font-control text-caption text-reading-secondary">権限は招待した後でも変えられます。</p>
          </div>
          <DialogFooter>
            <DialogClose disabled={sending}>キャンセル</DialogClose>
            <Button type="submit" pending={sending}>招待を送る</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
