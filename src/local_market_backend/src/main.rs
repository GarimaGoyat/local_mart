use candid::candid_method;
use ic_cdk::export::candid::{self};
use ic_cdk_macros::*;
mod product_routes;
use product_routes::{add_product, get_all_products, Product};

#[query]
#[candid_method(query)]
fn get_products() -> Vec<Product> {
    get_all_products()
}

#[update]
#[candid_method(update)]
fn create_product(name: String, price: f64, shop: String) -> String {
    add_product(name, price, shop)
}

#[init]
fn init() {
    ic_cdk::println!("Canister initialized");
}
use candid::candid_method;
use ic_cdk_macros::*;
use shop_verification::{
    get_verification_requests, init_blockchain, submit_verification_request,
    update_verification_status, ShopVerificationRequest, Block,
};

mod shop_verification;

#[init]
fn init() {
    init_blockchain();
}

#[update]
#[candid_method(update)]
fn submit_request(req: ShopVerificationRequest) -> String {
    submit_verification_request(req);
    "Verification request submitted successfully".to_string()
}

#[query]
#[candid_method(query)]
fn get_requests() -> Vec<Block> {
    get_verification_requests()
}

#[update]
#[candid_method(update)]
fn update_status(shop_id: String, status: String) -> String {
    update_verification_status(shop_id, status)
}
