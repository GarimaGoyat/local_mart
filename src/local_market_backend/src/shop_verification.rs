use actix_web::{web, App, HttpServer, HttpResponse, Responder, Error};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use chrono::Utc;
use crate::blockchain::{Blockchain, ShopVerificationRequest};

#[derive(Serialize, Deserialize)]
struct UpdateStatus {
    shop_id: String,
    status: String, // "Approved" or "Rejected"
}

#[derive(Deserialize)]
struct NewVerificationRequest {
    shop_id: String,
    shop_name: String,
    owner_name: String,
}

pub struct AppState {
    blockchain: Mutex<Blockchain>,
}

async fn submit_verification_request(
    req: web::Json<NewVerificationRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let mut blockchain = data.blockchain.lock().unwrap();

    let request = ShopVerificationRequest {
        shop_id: req.shop_id.clone(),
        shop_name: req.shop_name.clone(),
        owner_name: req.owner_name.clone(),
        status: String::from("Pending"),
        timestamp: Utc::now().to_rfc3339(),
    };

    blockchain.add_shop_verification_request(request);

    HttpResponse::Created().json("Verification request submitted successfully")
}

async fn get_verification_requests(data: web::Data<AppState>) -> impl Responder {
    let blockchain = data.blockchain.lock().unwrap();
    let blocks = blockchain.get_blocks();

    HttpResponse::Ok().json(blocks)
}

async fn update_verification_status(
    req: web::Json<UpdateStatus>,
    data: web::Data<AppState>,
) -> impl Responder {
    let mut blockchain = data.blockchain.lock().unwrap();
    let blocks = blockchain.get_blocks();

    for block in blocks {
        if let Some(data) = block.data.as_object_mut() {
            if let Some(shop_id) = data.get("shop_id") {
                if shop_id == &req.shop_id {
                    data.insert("status".to_string(), json!(req.status.clone()));
                    break;
                }
            }
        }
    }

    HttpResponse::Ok().json("Verification status updated successfully")
}

async fn get_shop_verification_requests(data: web::Data<AppState>) -> impl Responder {
    let blockchain = data.blockchain.lock().unwrap();
    let blocks = blockchain.get_blocks();

    HttpResponse::Ok().json(blocks)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let blockchain = Blockchain::new();

    let app_state = web::Data::new(AppState {
        blockchain: Mutex::new(blockchain),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/submit_verification_request", web::post().to(submit_verification_request))
            .route("/get_verification_requests", web::get().to(get_verification_requests))
            .route("/update_verification_status", web::put().to(update_verification_status))
            .route("/get_shop_verification_requests", web::get().to(get_shop_verification_requests))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
