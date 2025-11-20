use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// Post構造体定義
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub author_id: String,
    pub body: String,
    pub tags: Vec<String>,
    pub published_at: DateTime<Utc>,
}

impl Post {
    pub fn new(
        id: String,
        title: String,
        author_id: String,
        body: String,
        tags: Vec<String>,
    ) -> Self {
        Self {
            id,
            title,
            author_id,
            body,
            tags,
            published_at: Utc::now(),
        }
    }
}