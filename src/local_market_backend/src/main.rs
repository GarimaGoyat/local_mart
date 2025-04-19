use axum::{
    extract::{Extension, Path, Query},
    handler::Handler,
    http::{header, StatusCode},
    response::IntoResponse,
    routing::{delete, get, post, put},
    AddExtensionLayer, Json, Router,
};
use chrono::{DateTime, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use mysql::prelude::*;
use mysql::{OptsBuilder, Pool, PooledConn};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use std::sync::{Arc, Mutex};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

// Database models
#[derive(Debug, Serialize, Deserialize)]
struct Product {
    id: u32,
    name: String,
    price: String,
    shop: String,
    on_blinkit: bool,
    location: Option<String>,
    category: Option<String>,
    quantity: Option<u32>,
    image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Credentials {
    username: String,
    password: String,
    shop_name: Option<String>,
    email: Option<String>,
    role: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    username: String,
    role: String,
    exp: i64,
}

// Blockchain implementation
struct Blockchain {
    chain: Vec<Block>,
}

struct Block {
    index: u32,
    timestamp: DateTime<Utc>,
    data: Vec<Product>,
    previous_hash: String,
    hash: String,
}

impl Blockchain {
    fn new() -> Self {
        let mut chain = Blockchain { chain: Vec::new() };
        chain.create_genesis_block();
        chain
    }

    fn create_genesis_block(&mut self) {
        let genesis_block = Block {
            index: 0,
            timestamp: Utc::now(),
            data: Vec::new(),
            previous_hash: String::from("0"),
            hash: String::from("genesis_hash"),
        };
        self.chain.push(genesis_block);
    }

    fn add_block(&mut self, data: Vec<Product>) {
        let previous_block = self.chain.last().unwrap();
        let new_block = Block {
            index: previous_block.index + 1,
            timestamp: Utc::now(),
            data,
            previous_hash: previous_block.hash.clone(),
            hash: String::from("placeholder_hash"), // Implement proper hashing
        };
        self.chain.push(new_block);
    }

    fn get_blocks(&self) -> &Vec<Block> {
        &self.chain
    }

    fn get_products_by_shop(&self, shop: &str) -> Vec<&Product> {
        self.chain
            .iter()
            .flat_map(|block| block.data.iter())
            .filter(|product| product.shop == shop)
            .collect()
    }
}

// Application state
struct AppState {
    db_pool: Pool,
    blockchain: Arc<Mutex<Blockchain>>,
    jwt_secret: String,
}

#[tokio::main]
async fn main() {
    // Initialize environment variables
    dotenv::dotenv().ok();

    // Database setup
    let db_url = OptsBuilder::new()
        .user(env::var("DB_USER").unwrap_or_else(|_| "root".into()))
        .pass(env::var("DB_PASS").unwrap_or_else(|_| "Ggoyat@15".into()))
        .ip_or_hostname(env::var("DB_HOST").unwrap_or_else(|_| "127.0.0.1".into()))
        .tcp_port(env::var("DB_PORT").unwrap_or_else(|_| "3306".into()).parse().unwrap())
        .db_name(env::var("DB_NAME").unwrap_or_else(|_| "LocalMart".into()));

    let db_pool = Pool::new(db_url).expect("Failed to create database pool");
    initialize_database(&mut db_pool.get_conn().unwrap()).unwrap();

    // Initialize blockchain
    let blockchain = Arc::new(Mutex::new(Blockchain::new()));

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION]);

    // Create application state
    let state = AppState {
        db_pool,
        blockchain,
        jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "your_secret_key".into()),
    };

    // Configure routes
    let app = Router::new()
        .route("/login", post(login))
        .route("/signup", post(signup))
        .route("/api/products", get(get_all_products))
        .route("/api/shopkeeper/products", get(get_shopkeeper_products))
        .route("/api/shopkeeper/add-product", post(add_new_product))
        .route("/api/products/:id", get(get_product_by_id))
        .route("/api/products/:id", delete(delete_product))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(AddExtensionLayer::new(state));

    // Start server
    let addr = "0.0.0.0:8080".parse().unwrap();
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

// Database initialization
fn initialize_database(conn: &mut PooledConn) -> mysql::Result<()> {
    conn.query_drop(
        r"CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        )",
    )?;

    conn.query_drop(
        r"CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role_id INT NOT NULL,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )",
    )?;

    // Add other table creations similarly...

    Ok(())
}

// Handler implementations
async fn login(
    Extension(state): Extension<AppState>,
    Json(creds): Json<Credentials>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    // Database query and JWT generation
    // Similar logic to Go implementation
    Ok(Json(json!({ "message": "Login successful" })))
}

async fn signup(
    Extension(state): Extension<AppState>,
    Json(creds): Json<Credentials>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    // Database transaction and user creation
    Ok(Json(json!({ "message": "User created successfully" })))
}

async fn get_all_products(
    Extension(state): Extension<AppState>,
) -> Result<Json<Vec<Product>>, (StatusCode, Json<Value>)> {
    let mut conn = state.db_pool.get_conn().unwrap();
    let products: Vec<Product> = conn.query_map(
        "SELECT id, name, price, shop, on_blinkit, location, category, quantity, image FROM products",
        |(id, name, price, shop, on_blinkit, location, category, quantity, image)| Product {
            id,
            name,
            price,
            shop,
            on_blinkit,
            location,
            category,
            quantity,
            image,
        },
    ).unwrap();
    
    Ok(Json(products))
}

// Other handlers follow similar patterns...