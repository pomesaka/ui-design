const buttonStates = [
  ["default", "通常"], ["hover", "ホバー"], ["pressed", "押下"],
  ["focus", "フォーカス"], ["disabled", "無効"], ["pending", "処理中"],
];
const variants = [["primary", "主操作"], ["secondary", "補助操作"], ["destructive", "破壊操作"]];
const icons = {
  check: '<path d="m4 8 3 3 5-6"/>',
  warning: '<path d="M8 2 15 14H1Z"/><path d="M8 6v4m0 2v.1"/>',
  info: '<circle cx="8" cy="8" r="6"/><path d="M8 7v4m0-7v.1"/>',
  error: '<circle cx="8" cy="8" r="6"/><path d="m6 6 4 4m0-4-4 4"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true">${icons[name]}</svg>`;
const specimen = (label, body) => `<div class="specimen"><span class="state-label">${label}</span>${body}</div>`;

function buttonMatrix() {
  return `<div class="button-matrix specimens">
    <span class="matrix-header"></span>${buttonStates.map(([, label]) => `<span class="column-label matrix-header">${label}</span>`).join("")}
    ${variants.map(([variant, label]) => `<div class="button-row"><span class="row-label">${label}</span><div class="button-row-cells">${buttonStates.map(([state, stateLabel]) => `
      <div><span class="state-label mobile-state-label">${stateLabel}</span><button type="button" inert class="ui-button" data-variant="${variant}" data-preview-state="${state}"
      ${state === "disabled" ? "disabled" : ""} ${state === "pending" ? 'aria-busy="true" aria-disabled="true"' : ""}>
      ${state === "pending" ? '<span class="ui-progress" aria-hidden="true"></span>' : ""}${variant === "destructive" ? "削除" : "保存"}</button></div>`).join("")}</div></div>`).join("")}
    </div>`;
}

function selection() {
  return `<div class="specimen-grid selection-grid specimens">
    ${specimen("未選択", '<button inert class="ui-choice" type="button" aria-pressed="false">お気に入り</button>')}
    ${specimen("ホバー", '<button inert class="ui-choice" type="button" aria-pressed="false" data-preview-state="hover">お気に入り</button>')}
    ${specimen("押下", '<button inert class="ui-choice" type="button" aria-pressed="false" data-preview-state="hover pressed">お気に入り</button>')}
    ${specimen("フォーカス", '<button inert class="ui-choice" type="button" aria-pressed="false" data-preview-state="focus">お気に入り</button>')}
    ${specimen("選択中", `<button inert class="ui-choice" type="button" aria-pressed="true">${icon("check")}お気に入り</button>`)}
    ${specimen("選択 + focus", `<button inert class="ui-choice" type="button" aria-pressed="true" data-preview-state="focus">${icon("check")}お気に入り</button>`)}
    ${specimen("無効", '<button inert class="ui-choice" type="button" aria-pressed="false" disabled>お気に入り</button>')}
    ${specimen("現在の項目", '<a inert class="ui-choice" href="#states" aria-current="page">概要</a>')}
    </div>`;
}

function fields(theme) {
  const states = [
    ["通常", "default", ""], ["ホバー", "hover", ""], ["フォーカス", "focus", ""],
    ["入力不正", "default", "invalid"], ["不正 + focus", "focus", "invalid"],
    ["無効", "default", "disabled"], ["読み取り専用", "default", "readonly"], ["未入力", "default", "empty"],
  ];
  return `<div class="specimen-grid field-grid specimens">${states.map(([label, state, kind], index) => {
    const id = `${theme}-field-${index}`;
    const invalid = kind === "invalid";
    return `<div class="specimen"><label class="state-label" for="${id}">${label}</label>
      <input inert id="${id}" class="ui-field" data-preview-state="${state}" value="${kind === "empty" ? "" : invalid ? "" : "サンプル"}" placeholder="名前を入力"
      ${invalid ? `aria-invalid="true" aria-describedby="${id}-error"` : ""} ${kind === "disabled" ? "disabled" : ""} ${kind === "readonly" ? "readonly" : ""}>
      ${invalid ? `<p class="field-error" id="${id}-error">名前を入力してください</p>` : ""}</div>`;
  }).join("")}</div>`;
}

function feedback() {
  return `<div class="specimen-grid feedback-grid specimens">${[
    ["success", "成功", "保存しました", "check"], ["warning", "注意", "容量が残り少ない", "warning"],
    ["info", "情報", "更新があります", "info"], ["error", "失敗", "保存できません", "error"],
  ].map(([tone, label, text, glyph]) => specimen(label, `<div class="ui-notice" data-tone="${tone}">${icon(glyph)}<span>${text}</span></div>`)).join("")}</div>`;
}

function content() {
  return `<div class="specimen-grid content-grid specimens">
    ${specimen("初回読み込み", '<div class="content-sample" aria-busy="true">読み込み中<span class="skeleton"></span><span class="skeleton"></span></div>')}
    ${specimen("空", '<div class="content-sample">まだ項目がありません<small>追加するとここに表示されます</small></div>')}
    ${specimen("利用不可", '<div class="content-sample">閲覧できません<small>この項目への権限が必要です</small></div>')}
    ${specimen("取得失敗", '<div class="content-sample">読み込めませんでした<br><button class="text-action" type="button" inert>再試行</button></div>')}
    <div class="specimen refresh-sample"><span class="state-label">更新失敗 · 既存の内容を保持</span><div class="content-sample">保存済みの項目<small>最終更新 10:24</small><div class="refresh-message"><span>更新できませんでした</span><button class="text-action" type="button" inert>再試行</button></div></div></div>
    </div>`;
}

function panel(theme) {
  const el = document.createElement("article");
  el.className = "theme-panel";
  el.dataset.theme = theme;
  el.setAttribute("aria-labelledby", `${theme}-title`);
  // Only validated repository theme IDs are interpolated; specimens contain no user content.
  el.innerHTML = `<header class="theme-heading"><h2 id="${theme}-title">${theme}</h2><span class="theme-swatch" aria-hidden="true"></span></header>
    <section class="section"><h3>ボタン</h3>${buttonMatrix()}</section>
    <section class="section"><h3>選択</h3>${selection()}</section>
    <section class="section"><h3>入力</h3>${fields(theme)}</section>
    <section class="section"><h3>結果</h3>${feedback()}</section>
    <section class="section"><h3>コンテンツ</h3>${content()}</section>
    <section class="section"><h3>操作して確認</h3><div class="live-row">
      <button type="button" class="ui-button live-save">保存</button>
      <button type="button" class="ui-choice live-choice" aria-pressed="false">お気に入り</button>
      <input class="ui-field" aria-label="${theme}の名前" placeholder="名前を入力">
    </div><p class="live-result" aria-live="polite">未保存</p></section>`;
  const save = el.querySelector(".live-save");
  const result = el.querySelector(".live-result");
  const choice = el.querySelector(".live-choice");
  let saves = 0;
  save.addEventListener("click", async () => {
    // aria-disabled keeps busy distinguishable from disabled; suppress duplicate actions here.
    if (save.getAttribute("aria-busy") === "true") return;
    save.setAttribute("aria-busy", "true");
    save.setAttribute("aria-disabled", "true");
    save.innerHTML = '<span class="ui-progress" aria-hidden="true"></span>処理中';
    result.textContent = "保存中…";
    // A synthetic operation belongs only to the catalog, never the component recipe.
    await new Promise((resolve) => setTimeout(resolve, 900));
    saves += 1;
    save.removeAttribute("aria-busy");
    save.removeAttribute("aria-disabled");
    save.textContent = "保存";
    result.textContent = `保存しました · ${saves}回`;
  });
  choice.addEventListener("click", () => {
    const selected = choice.getAttribute("aria-pressed") !== "true";
    choice.setAttribute("aria-pressed", String(selected));
    choice.innerHTML = `${selected ? icon("check") : ""}お気に入り`;
  });
  return el;
}

async function start() {
  const response = await fetch("/catalog/themes.json");
  if (!response.ok) throw new Error("テーマ一覧を読み込めませんでした");
  const themes = await response.json();
  if (!Array.isArray(themes) || themes.length === 0 || !themes.every((theme) => typeof theme === "string" && /^[a-z0-9-]+$/.test(theme)) || new Set(themes).size !== themes.length) {
    throw new Error("テーマ一覧の形式が不正です");
  }
  await Promise.all(themes.map((theme) => new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/themes/${theme}.css`;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`${theme}を読み込めませんでした`));
    document.head.append(link);
  })));
  const container = document.querySelector("#themes");
  const switcher = document.querySelector(".view-switch");
  container.append(...themes.map(panel));
  const views = [["all", "並べて比較"], ...themes.map((theme) => [theme, theme])];
  const requested = new URL(location.href).searchParams.get("theme") ?? "all";
  if (!views.some(([id]) => id === requested)) throw new Error("指定されたテーマはありません");
  function select(view) {
    container.toggleAttribute("data-single", view !== "all");
    for (const item of container.children) item.hidden = view !== "all" && item.dataset.theme !== view;
    for (const button of switcher.children) button.setAttribute("aria-pressed", String(button.dataset.view === view));
    const url = new URL(location.href);
    url.searchParams.set("theme", view);
    history.replaceState(null, "", url);
  }
  for (const [view, label] of views) {
    const button = document.createElement("button");
    button.className = "ui-choice";
    button.type = "button";
    button.dataset.view = view;
    button.textContent = label;
    button.addEventListener("click", () => select(view));
    switcher.append(button);
  }
  select(requested);
}

start().catch((error) => {
  document.querySelector("#themes").replaceChildren();
  const message = document.querySelector("#catalog-error");
  message.textContent = error instanceof Error ? error.message : "カタログを表示できませんでした";
  message.hidden = false;
});
