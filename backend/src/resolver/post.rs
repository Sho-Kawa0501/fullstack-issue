use async_graphql::Context;
use crate::model::post::Post;
use crate::store::Store;

// 投稿一覧取得
pub async fn get_all_posts(ctx: &Context<'_>) -> Vec<Post> {
    let store = ctx.data::<Store>().unwrap();
    let posts = store.posts.read().await;
    posts.values().cloned().collect()
}

// 投稿詳細取得
pub async fn get_post(ctx: &Context<'_>, id: String) -> Option<Post> {
    let store = ctx.data::<Store>().unwrap();
    let posts = store.posts.read().await;
    posts.get(&id).cloned()
}

// 新規投稿
pub async fn create_post(
    ctx: &Context<'_>,
    title: String,
    body: String,
    tags: Vec<String>,
    author_id: String,
) -> Post {
    let store = ctx.data::<Store>().unwrap();
    let mut posts = store.posts.write().await;
    let id = uuid::Uuid::new_v4().to_string();
    let post = Post::new(id.clone(), title, author_id, body, tags);
    posts.insert(id.clone(), post.clone());
    post
}
