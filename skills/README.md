# スキル

ui-designの文書と部品を使う作業の手順。名前は作業を表す短い語(`review`等)とし、各スキルは`<名前>/SKILL.md`を入口にする。pluginとして入れると`ui-design:<名前>`で呼ぶ。判断基準は書き写さず文書を参照し、補助のスクリプトはスキルの中に置く。

| スキル | 使う場面 |
| --- | --- |
| [setup](setup/SKILL.md) | 新規・既存のプロジェクトにtoken・テーマ・部品を入れ、画面を合わせ、前後の物差しで効果を測る |
| [review](review/SKILL.md) | 画面・部品・UIの変更を、描画と操作で文書に照らしてレビューする |

採用先ではClaude Codeのplugin(導入方法は[README](../README.md#claude-codeで使う))として入れる。このrepository内では`.claude/skills/`からも参照できる。
