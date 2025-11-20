use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

// User構造体定義
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct User {
    pub id: String,
    pub name: String,
    pub avatar_url: Option<String>,
}

impl User {
    pub fn new(id: String, name: String, avatar_url: Option<String>) -> Self {
        Self {
            id,
            name,
            avatar_url,
        }
    }
}
