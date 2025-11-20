use async_graphql::{
    ComplexObject, Context, EmptySubscription, InputObject, Object, Schema, SimpleObject,
};
use chrono::{DateTime, Utc};
use crate::model::post::Post;
use crate::model::user::User;
use crate::resolver::{create_post, get_all_posts, get_post, get_user};
use crate::store::Store;

// 新規投稿時のGraphQLへの入力データ用の型
// deriveにより、指定した型情報に対して自動でコード生成
#[derive(InputObject)]
pub struct CreatePostInput {
    pub title: String,
    pub body: String,
    pub tags: Option<Vec<String>>,
    pub author_id: String,
}

// GraphQLのレスポンスとして返すユーザーの型
#[derive(SimpleObject)]
pub struct UserType {
    pub id: String,
    pub name: String,
    #[graphql(name = "avatarUrl")]
    pub avatar_url: Option<String>,
}

// GraphQLのレスポンスとして返す投稿情報の型
#[derive(SimpleObject)]
#[graphql(complex)]
pub struct PostType {
    pub id: String,
    pub title: String,
    pub body: String,
    pub tags: Vec<String>,
    #[graphql(name = "publishedAt")]
    pub published_at: DateTime<Utc>,
    pub author_id: String,
}

// UserからUserTypeへの変換
impl From<User> for UserType {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            avatar_url: user.avatar_url,
        }
    }
}

// PostからPostTypeへの変換
impl From<Post> for PostType {
    fn from(post: Post) -> Self {
        Self {
            id: post.id,
            title: post.title,
            body: post.body,
            tags: post.tags,
            published_at: post.published_at,
            author_id: post.author_id,
        }
    }
}

// サブリゾルバ定義 PostTypeにautherのプロパティを付与
#[ComplexObject]
impl PostType {
    async fn author(&self, ctx: &Context<'_>) -> Option<UserType> {
        // storeのユーザー情報にアクセス
        let store = ctx.data::<Store>().unwrap();
        let users = store.users.read().await;
        let user = users.get(&self.author_id)?;
        // UserTypeへ変換
        Some(UserType::from(user.clone()))
    }
}

pub struct Query;

#[Object]
impl Query {
    // 投稿一覧取得（複数件の取得を想定）
    async fn posts(&self, ctx: &Context<'_>) -> Vec<PostType> {
        let posts = get_all_posts(ctx).await;
        posts.into_iter().map(PostType::from).collect()
    }

    // 投稿詳細取得（1件の取得を想定）
    async fn post(&self, ctx: &Context<'_>, id: String) -> Option<PostType> {
        get_post(ctx, id).await.map(PostType::from)
    }

    // ユーザー情報取得（1件の取得を想定）
    async fn user(&self, ctx: &Context<'_>, id: String) -> Option<UserType> {
        get_user(ctx, id).await.map(UserType::from)
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    // 新規投稿
    async fn create_post(&self, ctx: &Context<'_>, input: CreatePostInput) -> PostType {
        let tags = input.tags.unwrap_or_default();
        // Postモデル作成
        let post = create_post(ctx, input.title, input.body, tags, input.author_id).await;
        // PostからPostTypeに変換
        PostType::from(post)
    }
}

pub type AppSchema = Schema<Query, Mutation, EmptySubscription>;

// Storeをデータとして持たせる
pub fn create_schema(store: Store) -> AppSchema {
    Schema::build(Query, Mutation, EmptySubscription)
        .data(store)
        .finish()
}