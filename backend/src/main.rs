use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse};
use schema::{create_schema, AppSchema};
use store::Store;

mod model;
mod resolver;
mod schema;
mod store;

// GraphQLのリクエストを受け取り、スキーマに処理を委譲
async fn graphql_handler(schema: web::Data<AppSchema>, req: GraphQLRequest) -> GraphQLResponse {
    // リクエストを読み取り、フィールドを特定してschemaにある対象のQuery定義の関数を呼ぶ
    schema.execute(req.into_inner()).await.into()
}

// GraphQLのGUI (Playground/GraphiQL) を返すエンドポイント
async fn graphql_playground() -> actix_web::Result<actix_web::HttpResponse> {
    Ok(actix_web::HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(playground_source(GraphQLPlaygroundConfig::new("/graphql"))))
}

// メイン関数（サーバ起動）
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // storeに初期データを作成
    let store = Store::new();
    store.init_data().await;
    let schema = create_schema(store);

    println!("🚀 GraphQL Playground: http://localhost:8000/playground");
    println!("📡 GraphQL Endpoint: http://localhost:8000/graphql");

    HttpServer::new(move || {
        let schema = schema.clone();
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials();

        App::new()
            .app_data(web::Data::new(schema.clone()))
            .wrap(cors)
            // GraphQLのリクエストを受け取るルート
            .route("/graphql", web::post().to(graphql_handler))
            // GraphQL GUI用のルート
            .route("/playground", web::get().to(graphql_playground))
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}