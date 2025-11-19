# ミニブログ管理ダッシュボード

React + GraphQL（フロントエンド）と Rust + Actix-web + async-graphql（バックエンド）で構築されたミニブログ管理ダッシュボードです。

## 📁 プロジェクト構成

```
instansys/fullstack-issue-sub/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── lib/           # ユーティリティ（GraphQL クライアント）
│   │   ├── hooks/         # カスタムフック（React Query）
│   │   └── graphql/       # GraphQL コード生成ファイル
│   ├── graphql/           # GraphQL クエリ・ミューテーション定義
│   └── codegen.ts         # GraphQL Codegen 設定
│
└── backend/           # Rust + Actix-web + async-graphql
    └── src/
        ├── main.rs        # エントリーポイント
        ├── schema.rs      # GraphQL スキーマ定義
        ├── store.rs       # メモリ内データストア
        ├── model/         # データモデル
        │   ├── post.rs
        │   └── user.rs
        └── resolver/      # GraphQL リゾルバ
            ├── post.rs
            └── user.rs
```

## 🏗️ 設計概要

### バックエンド設計

#### アーキテクチャ
- **Actix-web**: 非同期 Web サーバーフレームワーク
- **async-graphql**: GraphQL サーバー実装
- **メモリ内ストア**: `Arc<RwLock<HashMap>>` を使用したスレッドセーフなデータストア

#### ディレクトリ構成の役割

1. **`src/main.rs`**
   - Actix-web サーバーの起動
   - GraphQL エンドポイント (`/graphql`) と Playground (`/playground`) の設定
   - CORS 設定

2. **`src/schema.rs`**
   - GraphQL スキーマの定義（Query, Mutation, Types）
   - スキーマの構築とコンテキストへのストアの注入

3. **`src/store.rs`**
   - メモリ内データストア（`HashMap<String, Post>`, `HashMap<String, User>`）
   - 初期データの生成
   - `Arc<RwLock<>>` によるスレッドセーフなアクセス

4. **`src/model/`**
   - `post.rs`: Post データモデル
   - `user.rs`: User データモデル
   - `SimpleObject` による GraphQL 型の自動生成

5. **`src/resolver/`**
   - `post.rs`: Post 関連のリゾルバ（`get_post`, `get_all_posts`, `create_post`）
   - `user.rs`: User 関連のリゾルバ（`get_user`）
   - ビジネスロジックの実装

### フロントエンド設計

#### アーキテクチャ
- **React + TypeScript**: UI フレームワーク
- **Vite**: ビルドツール
- **React Router**: ルーティング
- **React Query**: データフェッチングとキャッシュ管理
- **GraphQL Codegen**: 型安全な GraphQL クライアント

#### ディレクトリ構成の役割

1. **`src/pages/`**
   - `PostListPage.tsx`: 投稿一覧ページ
   - `PostDetailPage.tsx`: 投稿詳細ページ
   - `NewPostPage.tsx`: 新規投稿ページ
   - `NotFoundPage.tsx`: 404 ページ

2. **`src/components/`**
   - `PostCard.tsx`: 投稿カードコンポーネント
   - `Loading.tsx`: ローディング表示
   - `Error.tsx`: エラー表示

3. **`src/hooks/`**
   - `usePosts.ts`: React Query を使用したデータフェッチングフック
   - `usePosts()`: 投稿一覧取得
   - `usePost(id)`: 投稿詳細取得
   - `useCreatePost()`: 新規投稿作成（楽観的更新対応）

4. **`src/lib/`**
   - `graphql.ts`: GraphQL リクエスト送信ユーティリティ

5. **`graphql/`**
   - `queries.graphql`: GraphQL クエリ定義
   - `mutations.graphql`: GraphQL ミューテーション定義

## 🔄 GraphQL データフロー

### 1. クエリフロー（例: 投稿一覧取得）

```
フロントエンド                   バックエンド
    │                              │
    │  1. usePosts() 呼び出し      │
    ├─────────────────────────────>│
    │                              │
    │  2. GetPostsDocument 送信    │
    │  (POST /graphql)              │
    ├─────────────────────────────>│
    │                              │
    │                              │  3. Query::posts リゾルバ実行
    │                              ├───> get_all_posts()
    │                              │      │
    │                              │      │  4. Store からデータ取得
    │                              │      ├───> store.posts.read()
    │                              │      │
    │                              │      │  5. Post リスト返却
    │                              │      │<─── Vec<Post>
    │                              │      │
    │                              │  6. PostType に変換
    │                              │<─── Vec<PostType>
    │                              │
    │  7. JSON レスポンス受信      │
    │<─────────────────────────────┤
    │                              │
    │  8. React Query キャッシュ   │
    │     に保存                   │
    │                              │
```

### 2. ミューテーションフロー（例: 新規投稿作成）

```
フロントエンド                   バックエンド
    │                              │
    │  1. useCreatePost() 呼び出し │
    ├─────────────────────────────>│
    │                              │
    │  2. 楽観的更新               │
    │     (一時的に UI 更新)       │
    │                              │
    │  3. CreatePostDocument 送信  │
    │  (POST /graphql)              │
    ├─────────────────────────────>│
    │                              │
    │                              │  4. Mutation::create_post 実行
    │                              ├───> create_post()
    │                              │      │
    │                              │      │  5. Store にデータ追加
    │                              │      ├───> store.posts.write()
    │                              │      │
    │                              │      │  6. Post 生成・返却
    │                              │      │<─── Post
    │                              │      │
    │                              │  7. PostType に変換
    │                              │<─── PostType
    │                              │
    │  8. JSON レスポンス受信      │
    │<─────────────────────────────┤
    │                              │
    │  9. 成功時: キャッシュ更新   │
    │     エラー時: ロールバック   │
    │                              │
```

### 3. サブリゾルバフロー（例: Post.author）

```
GraphQL クエリ実行中
    │
    │  1. PostType の author フィールド解決
    ├───> PostType::author() サブリゾルバ
    │      │
    │      │  2. Store から Post 取得
    │      ├───> store.posts.read()
    │      │
    │      │  3. Post.author_id を使用して User 取得
    │      ├───> store.users.read()
    │      │
    │      │  4. UserType に変換して返却
    │      │<─── UserType
    │      │
    │  5. GraphQL レスポンスに含める
    │
```

## 🚀 セットアップ手順

### 前提条件

- **Rust**: 1.70 以上（[rustup.rs](https://rustup.rs/) からインストール）
- **Node.js**: 18 以上（[nodejs.org](https://nodejs.org/) からインストール）
- **npm** または **yarn**

### バックエンドのセットアップ

1. **プロジェクトディレクトリに移動**
   ```bash
   cd instansys/fullstack-issue-sub/backend
   ```

2. **依存関係のインストール**
   ```bash
   cargo build
   ```
   初回実行時は依存パッケージのダウンロードとコンパイルに時間がかかります。

3. **サーバーの起動**
   ```bash
   cargo run
   ```

   サーバーが起動すると、以下のメッセージが表示されます：
   ```
   🚀 GraphQL Playground: http://localhost:8000/playground
   📡 GraphQL Endpoint: http://localhost:8000/graphql
   ```

### フロントエンドのセットアップ

1. **プロジェクトディレクトリに移動**
   ```bash
   cd instansys/fullstack-issue-sub/frontend
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```
   または
   ```bash
   yarn install
   ```

3. **GraphQL Codegen のセットアップ**

   **重要**: バックエンドサーバーが起動している必要があります。

   ```bash
   npm run codegen
   ```
   または
   ```bash
   yarn codegen
   ```

   これにより、`src/graphql/generated.ts` に型定義が生成されます。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   または
   ```bash
   yarn dev
   ```

   ブラウザで `http://localhost:3000` にアクセスします。

## 📝 既存ディレクトリへのプロジェクト生成コマンド

既存の `frontend/` と `backend/` ディレクトリにプロジェクトを生成する場合のコマンド：

### バックエンド

```bash
cd instansys/fullstack-issue-sub/backend
cargo init --name backend
# その後、Cargo.toml に依存関係を追加
```

### フロントエンド

```bash
cd instansys/fullstack-issue-sub/frontend
npm create vite@latest . -- --template react-ts
# または
yarn create vite . --template react-ts
```

**注意**: このプロジェクトでは既に必要なファイルが生成されているため、上記のコマンドを実行する必要はありません。

## 🧪 GraphQL Playground の利用方法

1. バックエンドサーバーを起動
2. ブラウザで `http://localhost:8000/playground` にアクセス
3. 左側のエディタに GraphQL クエリを入力

### クエリ例

```graphql
query {
  posts {
    id
    title
    author {
      name
      avatarUrl
    }
    publishedAt
  }
}
```

### ミューテーション例

```graphql
mutation {
  createPost(input: {
    title: "新しい投稿"
    body: "これはテスト投稿です"
    tags: ["テスト", "GraphQL"]
    authorId: "1"
  }) {
    id
    title
    publishedAt
  }
}
```

## 🛠️ 開発コマンド

### バックエンド

- `cargo run`: サーバーを起動
- `cargo build`: プロジェクトをビルド
- `cargo check`: コンパイルチェック（実行ファイルは生成しない）

### フロントエンド

- `npm run dev`: 開発サーバーを起動
- `npm run build`: プロダクションビルド
- `npm run preview`: ビルド結果をプレビュー
- `npm run codegen`: GraphQL 型定義を生成

## 📦 主要な技術スタック

### バックエンド
- **Rust**: システムプログラミング言語
- **Actix-web**: 高性能な非同期 Web フレームワーク
- **async-graphql**: 非同期 GraphQL サーバーライブラリ
- **tokio**: 非同期ランタイム
- **chrono**: 日時処理
- **uuid**: UUID 生成

### フロントエンド
- **React 18**: UI ライブラリ
- **TypeScript**: 型安全な JavaScript
- **Vite**: 高速なビルドツール
- **React Router**: ルーティング
- **React Query**: データフェッチングとキャッシュ管理
- **React Hook Form**: フォーム管理
- **Zod**: スキーマバリデーション
- **GraphQL Codegen**: 型安全な GraphQL クライアント生成

## 🎯 実装済み機能

- ✅ 投稿一覧表示（タイトル / 著者名 / 投稿日）
- ✅ 投稿日で降順ソート
- ✅ 投稿詳細表示（本文 / 著者 / アバター / タグ / 投稿日）
- ✅ 新規投稿作成
- ✅ react-hook-form + zod によるフォームバリデーション
- ✅ graphql-codegen による型生成
- ✅ react-query によるキャッシュ管理
- ✅ react-query による楽観的更新
- ✅ タグのカンマ区切り入力 → 配列変換
- ✅ ローディング表示
- ✅ エラー表示
- ✅ 404 Not Found ページ

## 🔍 トラブルシューティング

### バックエンドが起動しない

- Rust がインストールされているか確認: `rustc --version`
- ポート 8000 が使用されていないか確認

### フロントエンドで GraphQL エラーが発生する

- バックエンドサーバーが起動しているか確認
- `npm run codegen` を実行して型定義を再生成

### 型エラーが発生する

- `src/graphql/generated.ts` が存在するか確認
- バックエンドサーバーを起動してから `npm run codegen` を実行

## 📚 参考資料

- [Actix-web ドキュメント](https://actix.rs/)
- [async-graphql ドキュメント](https://async-graphql.github.io/async-graphql/)
- [React Query ドキュメント](https://tanstack.com/query/latest)
- [GraphQL Codegen ドキュメント](https://the-guild.dev/graphql/codegen)

