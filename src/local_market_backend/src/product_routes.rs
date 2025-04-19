use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;

#[derive(Serialize)]
struct Product {
    id: i32,
    name: String,
    price: f64,
    shop: String,
}

#[derive(Deserialize)]
struct NewProduct {
    name: String,
    price: f64,
    shop: String,
}

async fn get_all_products(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let products = sqlx::query_as!(
        Product,
        "SELECT id, name, price, shop FROM products"
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match products {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch products"),
    }
}

async fn add_product(db_pool: web::Data<MySqlPool>, product: web::Json<NewProduct>) -> impl Responder {
    let result = sqlx::query!(
        "INSERT INTO products (name, price, shop) VALUES (?, ?, ?)",
        product.name,
        product.price,
        product.shop
    )
    .execute(db_pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(serde_json::json!({"message": "Product added successfully"})),
        Err(_) => HttpResponse::InternalServerError().body("Failed to add product"),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db_pool = MySqlPoolOptions::new()
        .connect("mysql://user:password@localhost:3306/your_database")
        .await
        .expect("Failed to create pool");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db_pool.clone()))
            .route("/products", web::get().to(get_all_products))
            .route("/products", web::post().to(add_product))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
