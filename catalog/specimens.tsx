import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel, Input, Textarea } from "../components/ui/field";
import { Notice } from "../components/ui/notice";
import { Radio, RadioGroup } from "../components/ui/radio-group";
import { Select, SelectTrigger } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsList, TabsTab } from "../components/ui/tabs";
import { Toggle } from "../components/ui/toggle";
import { Section } from "./app";

/**
 * Pinned specimens: one cell per state, no interaction. The control itself is
 * inert so screenshots stay stable; the state name remains readable.
 */
function Spec({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "flex min-w-0 flex-col gap-1.5 sm:col-span-2" : "flex min-w-0 flex-col gap-1.5"}>
      <span className="font-control text-caption text-reading-secondary">{label}</span>
      <div inert className="pointer-events-none flex min-w-0 flex-col [&_*]:transition-none [&_*]:animate-none">
        {children}
      </div>
    </div>
  );
}

const grid = "grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4";

const buttonVariants: [ButtonVariant, string][] = [
  ["primary", "主操作"],
  ["secondary", "補助操作"],
  ["outline", "枠線"],
  ["ghost", "控えめ"],
  ["destructive", "破壊操作"],
];

const buttonStates: [string, string][] = [
  ["default", "通常"],
  ["hover", "ホバー"],
  ["pressed", "押下"],
  ["focus", "フォーカス"],
  ["disabled", "無効"],
  ["pending", "処理中"],
];

export function Specimens() {
  return (
    <>
      <Section title="ボタン">
        {buttonVariants.map(([variant, name]) => (
          <div key={variant} className="flex flex-col gap-2">
            <span className="font-control text-caption text-foreground">{name}</span>
            <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-6">
              {buttonStates.map(([state, label]) => (
                <Spec key={state} label={label}>
                  <Button
                    variant={variant}
                    data-preview-state={state}
                    disabled={state === "disabled"}
                    pending={state === "pending"}
                  >
                    {variant === "destructive" ? "削除" : "保存"}
                  </Button>
                </Spec>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="トグル">
        <div className={grid}>
          <Spec label="オフ"><Toggle>お気に入り</Toggle></Spec>
          <Spec label="ホバー"><Toggle data-preview-state="hover">お気に入り</Toggle></Spec>
          <Spec label="フォーカス"><Toggle data-preview-state="focus">お気に入り</Toggle></Spec>
          <Spec label="オン"><Toggle defaultPressed>お気に入り</Toggle></Spec>
          <Spec label="オン + フォーカス"><Toggle defaultPressed data-preview-state="focus">お気に入り</Toggle></Spec>
          <Spec label="無効"><Toggle disabled>お気に入り</Toggle></Spec>
        </div>
      </Section>

      <Section title="入力">
        <div className={grid}>
          <Spec label="通常"><FieldSample /></Spec>
          <Spec label="ホバー"><FieldSample state="hover" /></Spec>
          <Spec label="フォーカス"><FieldSample state="focus" /></Spec>
          <Spec label="未入力"><FieldSample value="" /></Spec>
          <Spec label="入力不正"><FieldSample value="" invalid /></Spec>
          <Spec label="不正 + フォーカス"><FieldSample value="" invalid state="focus" /></Spec>
          <Spec label="無効"><FieldSample disabled /></Spec>
          <Spec label="読み取り専用"><FieldSample readOnly /></Spec>
          <Spec label="説明つき" wide>
            <Field>
              <FieldLabel>表示名</FieldLabel>
              <Input defaultValue="山田 花子" />
              <FieldDescription>プロフィールと通知に表示されます</FieldDescription>
            </Field>
          </Spec>
          <Spec label="複数行" wide>
            <Field>
              <FieldLabel>メモ</FieldLabel>
              <Textarea defaultValue={"長い内容は高さが広がり、上限を超えるとスクロールします。"} />
            </Field>
          </Spec>
          <Spec label="選択(未選択)">
            <Select items={fruits}>
              <SelectTrigger placeholder="選択してください" />
            </Select>
          </Spec>
          <Spec label="選択 + フォーカス">
            <Select items={fruits} defaultValue="apple">
              <SelectTrigger data-preview-state="focus" />
            </Select>
          </Spec>
        </div>
      </Section>

      <Section title="チェック・スイッチ・ラジオ">
        <div className={grid}>
          <Spec label="未選択"><Checkbox>通知を受け取る</Checkbox></Spec>
          <Spec label="選択"><Checkbox defaultChecked>通知を受け取る</Checkbox></Spec>
          <Spec label="一部選択"><Checkbox indeterminate>すべて選択</Checkbox></Spec>
          <Spec label="フォーカス"><Checkbox data-preview-state="focus" className="w-fit">通知を受け取る</Checkbox></Spec>
          <Spec label="無効"><Checkbox disabled defaultChecked>通知を受け取る</Checkbox></Spec>
          <Spec label="スイッチ オフ"><Switch>自動保存</Switch></Spec>
          <Spec label="スイッチ オン"><Switch defaultChecked>自動保存</Switch></Spec>
          <Spec label="スイッチ 無効"><Switch disabled>自動保存</Switch></Spec>
          <Spec label="ラジオ" wide>
            <RadioGroup defaultValue="week" aria-label="集計期間">
              <Radio value="day">日</Radio>
              <Radio value="week">週</Radio>
              <Radio value="month" disabled>月(無効)</Radio>
            </RadioGroup>
          </Spec>
        </div>
      </Section>

      <Section title="タブ">
        <Spec label="選択中・ホバー・フォーカス">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTab value="overview">概要</TabsTab>
              <TabsTab value="activity" data-preview-state="hover">履歴</TabsTab>
              <TabsTab value="settings" data-preview-state="focus">設定</TabsTab>
              <TabsTab value="archive" disabled>保管(無効)</TabsTab>
            </TabsList>
          </Tabs>
        </Spec>
      </Section>

      <Section title="お知らせ">
        <div className="grid gap-3 lg:grid-cols-2">
          <Spec label="情報"><Notice tone="info" title="更新があります">新しい項目が3件追加されました。</Notice></Spec>
          <Spec label="成功"><Notice tone="success" title="保存しました" /></Spec>
          <Spec label="注意"><Notice tone="warning" title="容量が残り少なくなっています">不要なファイルを削除すると空きを増やせます。</Notice></Spec>
          <Spec label="失敗と復帰">
            <Notice tone="error" title="保存できませんでした" action={<Button variant="outline" size="sm">再試行</Button>}>
              通信が切れました。入力内容は残っています。
            </Notice>
          </Spec>
        </div>
      </Section>
    </>
  );
}

const fruits = [
  { value: "apple", label: "りんご" },
  { value: "orange", label: "みかん" },
  { value: "grape", label: "ぶどう" },
];

function FieldSample({
  state,
  value = "サンプル",
  invalid = false,
  disabled = false,
  readOnly = false,
}: {
  state?: string;
  value?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <Field invalid={invalid} disabled={disabled}>
      <FieldLabel>名前</FieldLabel>
      <Input defaultValue={value} placeholder="例:山田 花子" readOnly={readOnly} data-preview-state={state} />
      {invalid && <FieldError match>名前を入力してください</FieldError>}
    </Field>
  );
}
