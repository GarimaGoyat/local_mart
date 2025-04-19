use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static PRODUCTS: RefCell<Vec<Product>> = RefCell::new(Vec::new());
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: u64,
    pub name: String,
    pub price: f64,
    pub shop: String,
}

// Simulate an auto-increment ID
thread_local! {
    static NEXT_ID: RefCell<u64> = RefCell::new(1);
}

pub fn get_all_products() -> Vec<Product> {
    PRODUCTS.with(|products| products.borrow().clone())
}

pub fn add_product(name: String, price: f64, shop: String) -> String {
    let id = NEXT_ID.with(|counter| {
        let mut value = counter.borrow_mut();
        let id = *value;
        *value += 1;
        id
    });

    let product = Product {
        id,
        name,
        price,
        shop,
    };

    PRODUCTS.with(|products| {
        products.borrow_mut().push(product);
    });

    "Product added successfully".to_string()
}
