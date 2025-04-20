use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use serde::Serialize;
use std::collections::HashMap;
use std::cell::RefCell;

// Data structures
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct User {
    pub principal: Principal,
    pub name: String,
    pub email: String,
    pub user_type: UserType,
    pub created_at: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq)]
pub enum UserType {
    Buyer,
    Seller,
    Admin,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Shop {
    pub id: u64,
    pub owner: Principal,
    pub name: String,
    pub description: String,
    pub location: Location,
    pub is_verified: bool,
    pub products: Vec<Product>,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub address: String,
    pub geohash: String,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Product {
    pub id: u64,
    pub shop_id: u64,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub category: String,
    pub stock: u32,
    pub available: bool,
    pub created_at: u64,
}

// State management
thread_local! {
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
    static SHOPS: RefCell<HashMap<u64, Shop>> = RefCell::new(HashMap::new());
    static PRODUCTS: RefCell<HashMap<u64, Product>> = RefCell::new(HashMap::new());
    static VERIFICATION_REQUESTS: RefCell<HashMap<u64, VerificationRequest>> = RefCell::new(HashMap::new());
    static SHOP_ID_COUNTER: RefCell<u64> = RefCell::new(0);
    static PRODUCT_ID_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct VerificationRequest {
    pub shop_id: u64,
    pub owner: Principal,
    pub documents: Vec<String>,
    pub status: VerificationStatus,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum VerificationStatus {
    Pending,
    Approved,
    Rejected,
}

// Helper function to generate unique IDs
fn generate_id(prefix: &str) -> String {
    let timestamp = time();
    format!("{}-{}", prefix, timestamp)
}

// Initialize the canister
#[init]
fn init() {
    let caller = ic_cdk::caller();
    let admin = User {
        principal: caller,
        name: String::from("Admin"),
        email: String::from("admin@localmarket.ic"),
        user_type: UserType::Admin,
        created_at: time(),
    };
    
    USERS.with(|users| {
        users.borrow_mut().insert(caller, admin);
    });
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// User Management
#[update]
fn register_user(name: String, email: String, user_type: UserType) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if users.contains_key(&caller) {
            return Err("User already registered".to_string());
        }
        
        let user = User {
            principal: caller,
            name,
            email,
            user_type,
            created_at: time(),
        };
        
        users.insert(caller, user);
        Ok("User registered successfully".to_string())
    })
}

#[query]
fn get_user(principal: Principal) -> Option<User> {
    USERS.with(|users| users.borrow().get(&principal).cloned())
}

// Shop Management
#[update]
fn create_shop(name: String, description: String, location: Location) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let user = get_user(caller).ok_or("User not found")?;
    
    if user.user_type != UserType::Seller {
        return Err("Only sellers can create shops".to_string());
    }

    SHOPS.with(|shops| {
        let mut shops = shops.borrow_mut();
        SHOP_ID_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            let shop_id = *counter;
            *counter += 1;

            let shop = Shop {
                id: shop_id,
                owner: caller,
                name,
                description,
                location,
                is_verified: false,
                products: Vec::new(),
            };

            shops.insert(shop_id, shop);
            Ok(shop_id)
        })
    })
}

#[query]
fn get_shop(shop_id: u64) -> Option<Shop> {
    SHOPS.with(|shops| {
        shops.borrow().get(&shop_id).cloned()
    })
}

#[query]
fn get_shops_by_location(latitude: f64, longitude: f64, radius: f64) -> Vec<Shop> {
    SHOPS.with(|shops| {
        shops.borrow()
            .values()
            .filter(|shop| {
                let dx = shop.location.latitude - latitude;
                let dy = shop.location.longitude - longitude;
                (dx * dx + dy * dy).sqrt() <= radius
            })
            .cloned()
            .collect()
    })
}

// Product Management
#[update]
fn add_product(shop_id: u64, name: String, description: String, price: f64, category: String, stock: u32) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    
    SHOPS.with(|shops| {
        let mut shops = shops.borrow_mut();
        let shop = shops.get_mut(&shop_id).ok_or("Shop not found")?;
        
        if shop.owner != caller {
            return Err("Only shop owner can add products".to_string());
        }

        PRODUCT_ID_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            let product_id = *counter;
            *counter += 1;

            let product = Product {
                id: product_id,
                shop_id,
                name,
                description,
                price,
                category,
                stock,
                available: true,
                created_at: time(),
            };

            shop.products.push(product);
            Ok(product_id)
        })
    })
}

#[query]
fn get_product(product_id: u64) -> Option<Product> {
    PRODUCTS.with(|products| products.borrow().get(&product_id).cloned())
}

#[query]
fn get_shop_products(shop_id: u64) -> Vec<Product> {
    PRODUCTS.with(|products| {
        products
            .borrow()
            .values()
            .filter(|product| product.shop_id == shop_id)
            .cloned()
            .collect()
    })
}

// Shop Verification
#[update]
fn request_verification(shop_id: u64, documents: Vec<String>) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    SHOPS.with(|shops| {
        let shops = shops.borrow();
        let shop = shops.get(&shop_id).ok_or("Shop not found")?;
        
        if shop.owner != caller {
            return Err("Only shop owner can request verification".to_string());
        }
        
        VERIFICATION_REQUESTS.with(|requests| {
            let mut requests = requests.borrow_mut();
            let request = VerificationRequest {
                shop_id,
                owner: caller,
                documents,
                status: VerificationStatus::Pending,
            };
            
            requests.insert(shop_id, request);
            Ok("Verification request submitted successfully".to_string())
        })
    })
}

#[update]
fn process_verification(shop_id: u64, approved: bool) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        let users = users.borrow();
        let user = users.get(&caller).ok_or("User not found")?;
        
        match user.user_type {
            UserType::Admin => {
                VERIFICATION_REQUESTS.with(|requests| {
                    let mut requests = requests.borrow_mut();
                    let request = requests.get_mut(&shop_id).ok_or("Verification request not found")?;
                    
                    request.status = if approved {
                        SHOPS.with(|shops| {
                            let mut shops = shops.borrow_mut();
                            if let Some(shop) = shops.get_mut(&shop_id) {
                                shop.is_verified = true;
                            }
                        });
                        VerificationStatus::Approved
                    } else {
                        VerificationStatus::Rejected
                    };
                    
                    Ok("Verification request processed successfully".to_string())
                })
            }
            _ => Err("Only admins can process verification requests".to_string()),
        }
    })
}

// Helper function to calculate distance between two points using Haversine formula
fn calculate_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const EARTH_RADIUS_KM: f64 = 6371.0;
    
    let lat1_rad = lat1.to_radians();
    let lat2_rad = lat2.to_radians();
    let delta_lat = (lat2 - lat1).to_radians();
    let delta_lon = (lon2 - lon1).to_radians();
    
    let a = (delta_lat / 2.0).sin().powi(2)
        + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();
    
    EARTH_RADIUS_KM * c
}

#[query]
pub fn get_verification_requests() -> Vec<VerificationRequest> {
    VERIFICATION_REQUESTS.with(|requests| {
        requests.borrow().values().cloned().collect()
    })
}

#[query]
pub fn get_user_shops(principal: Principal) -> Vec<Shop> {
    SHOPS.with(|shops| {
        shops.borrow()
            .values()
            .filter(|shop| shop.owner == principal)
            .cloned()
            .collect()
    })
}
