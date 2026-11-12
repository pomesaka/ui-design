# ui-design

複数のプロジェクトで使えるデザインの部品と知識を育てるためのリポジトリ。
対象はデザイントークン、質感・モーションを含むコンポーネント、エージェント用スキルと、それらを触って確かめるカタログ。
部品はReact・Tailwind CSS v4・Base UIで作り、採用先へ複製して使う。

## Claude Codeで使う

スキルはClaude Codeのpluginとして入れられる。repositoryを参照できる権限があれば、次の二行で入る。

```
/plugin marketplace add pomesaka/ui-design
/plugin install ui-design@pomesaka-ui-design
```

スキルは`/ui-design:ui-design-setup`(導入)・`/ui-design:ui-design-review`(レビュー)として使える。pluginにはこのrepository全体が入り、スキルは同梱の文書を参照する。部品とテーマのソースもこのrepositoryから複製する。更新は`/plugin marketplace update pomesaka-ui-design`で取り込む。

## Documentation Map

- [デザインの判断基準](DESIGN.md)
- [画面の組み立て方](docs/composition.md)
- [共通トークンの契約](tokens/README.md)
- [テーマの利用・調整](themes/README.md)
- [部品の使い方と一覧](components/README.md)
- [部品と状態のカタログ](catalog/README.md)
- [画面の例](examples/README.md)
- [エージェント用スキル](skills/README.md)
- [配置と責務の境界](ARCHITECTURE.md)
- [追加・検証・文書の方針](docs/development.md)
- [参考文献](docs/references.md)(必要時のみ)
