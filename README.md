# ミニブログ管理ダッシュボード概要

## 起動方法

### 前提条件

- Rust：バージョン 1.70 以上
- Node.js：バージョン 18 以上
- npm または yarnが使用可能であること

---

### ・フロントエンドの起動方法

#### 1. /frontendのディレクトリへ移動

#### 2. インストールと起動

##### npm を使用する場合

```bash
npm install
npm run dev
```

##### yarn を使用する場合

```bash
yarn install
yarn dev
```

#### 3. ブラウザでアクセス

```
http://localhost:3000
```


### ・バックエンドの起動方法

#### 1. /backendのディレクトリへ移動

#### 2. ビルド

```bash
cargo build
```

#### 3. 実行

```bash
cargo run
```

---

## 使用技術

### フロントエンド

- React  
- TypeScript  
- React Router  
- React Query  
- React Hook Form  
- Zod  
- GraphQL Code Generator  

### バックエンド

- Rust  
- Actix-web  
- async-graphql  

---

## 完成度（実装済み機能）

### フロントエンド

#### 記事一覧ページ
- タイトル、著者名、アバター画像、投稿日を表示  
- 投稿日で降順ソート  

#### 記事詳細ページ
- 本文、著者名、アバター画像、タグ、投稿日を表示  
- NotFound ページ対応  
- ローディング中／エラー時の表示  

#### 新規記事作成
- React Hook Form + Zod による必須バリデーション  
- タグのカンマ区切り入力を配列へ変換  
- React Query による楽観的更新  
- ドロップダウンで著者選択  
- 投稿成功後、一覧ページへ自動遷移  

#### その他
- graphql-codegen による型生成  


### バックエンド

#### GraphQL スキーマ実装（Query）

- `posts`：記事一覧取得  
- `post(id)`：記事詳細取得  
- `user(id)`：ユーザー情報取得  

#### GraphQL スキーマ実装（Mutation）

- `createPost(input)`：新規記事作成  

#### データストア

- メモリ内データストアで管理  
- アプリ起動時に初期データ生成  

#### リゾルバ

- `get_all_posts`：記事一覧取得  
- `get_post`：記事詳細取得  
- `create_post`：記事作成  
- `Post.author`：サブリゾルバ 