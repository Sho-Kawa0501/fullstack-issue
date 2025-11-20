use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::model::post::Post;
use crate::model::user::User;

#[derive(Clone)]
pub struct Store {
    pub posts: Arc<RwLock<HashMap<String, Post>>>,
    pub users: Arc<RwLock<HashMap<String, User>>>,
}

impl Store {
    pub fn new() -> Self {
        Self {
            posts: Arc::new(RwLock::new(HashMap::new())),
            users: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    // 初期データ定義
    pub async fn init_data(&self) {
        let mut users = self.users.write().await;
        let mut posts = self.posts.write().await;

        // サンプルユーザー情報定義
        let user1 = User::new(
            "1".to_string(),
            "テストユーザー1".to_string(),
            Some("https://i.pravatar.cc/150?img=1".to_string()),
        );
        let user2 = User::new(
            "2".to_string(),
            "テストユーザー2".to_string(),
            Some("https://i.pravatar.cc/150?img=2".to_string()),
        );

        users.insert(user1.id.clone(), user1.clone());
        users.insert(user2.id.clone(), user2.clone());

        // サンプル投稿情報定義
        let post1 = Post::new(
            "1".to_string(),
            "GraphQL学習".to_string(),
            user1.id.clone(),
            "GraphQLはクエリ言語です。".to_string(),
            vec!["GraphQL".to_string(), "入門".to_string()],
        );
        let post2 = Post::new(
            "2".to_string(),
            "RustでWebアプリ作成".to_string(),
            user2.id.clone(),
            "Actix-webを使ったWebアプリケーション開発を行っています。".to_string(),
            vec!["Rust".to_string(), "Actix-web".to_string()],
        );

        posts.insert(post1.id.clone(), post1);
        posts.insert(post2.id.clone(), post2);
    }
}

impl Default for Store {
    fn default() -> Self {
        Self::new()
    }
}

