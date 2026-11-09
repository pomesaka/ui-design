# ui-design agent instructions

作業前に[README](README.md)から目的と文書の入口を確認し、[配置と責務](ARCHITECTURE.md)・[開発方針](docs/development.md)を読む。
UIの設計・実装・レビューでは、最初に[DESIGN](DESIGN.md)を読み、情報階層・操作の発見性・状態と復帰・アクセシビリティを設計段階から確認する。専門家も同じ文書を直接読む。

- このrepository内の文書を正本とし、個人のdotfilesや外部skillの導入を前提にしない。
- VCSはJujutsu、探索はfd・rgを使う。commit・push・PR操作はユーザーの指示を受けて行う。
- 変更前に実際のコードとworking copyを確認し、他担当や無関係な変更を取り消さない。
- TypeScriptの`as`による型キャストは禁止。入力検証とnarrowingで扱う。
- 検証した範囲と未確認の範囲を区別する。文書や見本があることだけで実装済み・検証済みとしない。
