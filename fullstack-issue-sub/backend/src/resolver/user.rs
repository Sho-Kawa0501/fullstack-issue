use async_graphql::Context;
use crate::model::user::User;
use crate::store::Store;

// ユーザー情報取得
pub async fn get_user(ctx: &Context<'_>, id: String) -> Option<User> {
    let store = ctx.data::<Store>().unwrap();
    let users = store.users.read().await;
    users.get(&id).cloned()
}
