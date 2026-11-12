import { useState } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useAnnounce } from "../components/ui/announcer";
import { Banner } from "../components/ui/banner";
import { Button } from "../components/ui/button";
import { Form, FormActions } from "../components/ui/form";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel, Input } from "../components/ui/field";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../components/ui/menu";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/ui/tabs";
import { Toggle } from "../components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { ChevronDownIcon } from "../components/lib/icons";
import { Section, usePortal } from "./app";

// Synthetic latency stands in for a real request; it belongs to the catalog only.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const roles = [
  { value: "viewer", label: "閲覧者" },
  { value: "editor", label: "編集者" },
  { value: "owner", label: "管理者" },
];

export function Playground({ theme }: { theme: string }) {
  const portal = usePortal();
  const announce = useAnnounce();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [failNextSave, setFailNextSave] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // The saved time next to the button is the visible result; success needs no
  // extra message, only an announcement. Failure stays in a banner until resolved.
  async function save() {
    if (saving) return;
    setSaving(true);
    await wait(900);
    setSaving(false);
    if (failNextSave) {
      setSaveFailed(true);
      announce("保存できませんでした。入力内容は残っています。", { priority: "assertive" });
      return;
    }
    setSaveFailed(false);
    setSavedAt(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
    announce("保存しました");
  }

  // Nothing on screen shows the deletion, so a dismissible banner reports it.
  async function remove() {
    setDeleting(true);
    await wait(900);
    setDeleting(false);
    setConfirmOpen(false);
    setDeleted(true);
    announce("プロジェクトを削除しました");
  }

  return (
    <Section title="操作して確認">
      {deleted && (
        <Banner tone="info" title="プロジェクトを削除しました" onDismiss={() => setDeleted(false)}>
          30日以内ならゴミ箱から元に戻せます。
        </Banner>
      )}
      <Form onFormSubmit={save} className="max-w-[32rem]" aria-label={`${theme}のフォーム`}>
        {saveFailed && (
          <Banner tone="error" title="保存できませんでした" action={<Button type="submit" variant="secondary" size="sm" pending={saving}>再試行</Button>}>
            通信が切れました。入力内容は残っています。
          </Banner>
        )}
        <Field name="name">
          <FieldLabel>名前</FieldLabel>
          <Input required placeholder="例:山田 花子" />
          <FieldError match="valueMissing">名前を入力してください</FieldError>
        </Field>
        <Field name="role">
          <Select items={roles} defaultValue="viewer">
            <SelectLabel>権限</SelectLabel>
            <SelectTrigger />
            <SelectContent container={portal}>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>管理者はメンバーを招待できます</FieldDescription>
        </Field>
        <div className="flex flex-col gap-1">
          <Checkbox name="notify" defaultChecked>更新をメールで受け取る</Checkbox>
          <Switch name="autosave">自動保存</Switch>
          <Switch checked={failNextSave} onCheckedChange={setFailNextSave}>保存の失敗を再現する(カタログ用)</Switch>
        </div>
        <FormActions>
          <Button type="submit" pending={saving}>{saving ? "保存中" : "保存"}</Button>
          <Toggle>お気に入り</Toggle>
          <span className="font-control text-caption text-reading-secondary">
            {saveFailed || !savedAt
              ? `未保存の変更があります${savedAt ? `(最終保存 ${savedAt})` : ""}`
              : `${savedAt}に保存済み`}
          </span>
        </FormActions>
      </Form>

      <div className="flex flex-wrap items-center gap-2">
        <Menu>
          <MenuTrigger render={<Button variant="secondary" />}>
            その他の操作 <ChevronDownIcon />
          </MenuTrigger>
          <MenuContent container={portal}>
            <MenuItem>複製</MenuItem>
            <MenuItem>名前を変更</MenuItem>
            <MenuItem disabled>書き出し(準備中)</MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>削除…</MenuItem>
          </MenuContent>
        </Menu>

        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>メンバーを招待</DialogTrigger>
          <DialogContent container={portal}>
            <DialogHeader>
              <DialogTitle>メンバーを招待</DialogTitle>
              <DialogDescription>招待メールを送ります。相手が承認すると参加します。</DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel>メールアドレス</FieldLabel>
              <Input type="email" autoComplete="email" placeholder="name@example.com" />
            </Field>
            <DialogFooter>
              <DialogClose>キャンセル</DialogClose>
              <DialogClose variant="primary">招待を送る</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="ヘルプ" />}>?</TooltipTrigger>
          <TooltipContent container={portal}>使い方を表示します</TooltipContent>
        </Tooltip>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !deleting && setConfirmOpen(open)}>
        <AlertDialogTrigger render={<Button variant="destructive" className="w-fit" />}>プロジェクトを削除</AlertDialogTrigger>
        <AlertDialogContent container={portal}>
          <AlertDialogHeader>
            <AlertDialogTitle>プロジェクトを削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>中のファイルもすべて削除され、元に戻せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={deleting}>キャンセル</AlertDialogClose>
            <Button variant="destructive" pending={deleting} onClick={remove}>削除する</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">概要</TabsTab>
          <TabsTab value="activity">履歴</TabsTab>
          <TabsTab value="settings">設定</TabsTab>
        </TabsList>
        <TabsPanel value="overview" className="font-body text-body">プロジェクトの概要です。</TabsPanel>
        <TabsPanel value="activity" className="font-body text-body">最近の変更が表示されます。</TabsPanel>
        <TabsPanel value="settings" className="font-body text-body">設定を変更できます。</TabsPanel>
      </Tabs>
    </Section>
  );
}
