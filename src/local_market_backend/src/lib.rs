use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use serde::Serialize;
use std::collections::HashMap;
use std::cell::RefCell;
use geo_types::{Coord, Point};

// Data structures
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct User {
    pub principal: Principal,
    pub name: String,
    pub email: String,
    pub user_type: UserType,
    pub created_at: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum UserType {
    Buyer,
    Seller,
    Admin,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Shop {
    pub id: String,
    pub owner: Principal,
    pub name: String,
    pub description: String,
    pub location: Location,
    pub contact: String,
    pub is_verified: bool,
    pub verification_expiry: Option<u64>,
    pub created_at: u64,
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
    pub id: String,
    pub shop_id: String,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub category: String,
    pub images: Vec<String>,
    pub available: bool,
    pub created_at: u64,
}

// State management
thread_local! {
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
    static SHOPS: RefCell<HashMap<String, Shop>> = RefCell::new(HashMap::new());
    static PRODUCTS: RefCell<HashMap<String, Product>> = RefCell::new(HashMap::new());
    static VERIFICATION_REQUESTS: RefCell<HashMap<String, VerificationRequest>> = RefCell::new(HashMap::new());
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct VerificationRequest {
    pub shop_id: String,
    pub documents: Vec<String>,
    pub status: VerificationStatus,
    pub created_at: u64,
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
fn register_user(name: String, email: String, user_type: UserType) -> Result<User, String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        if users.borrow().contains_key(&caller) {
            return Err("User already exists".to_string());
        }
        
        let user = User {
            principal: caller,
            name,
            email,
            user_type,
            created_at: time(),
        };
        
        users.borrow_mut().insert(caller, user.clone());
        Ok(user)
    })
}

#[query]
fn get_user(principal: Principal) -> Option<User> {
    USERS.with(|users| users.borrow().get(&principal).cloned())
}

// Shop Management
#[update]
fn create_shop(name: String, description: String, location: Location, contact: String) -> Result<Shop, String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        if let Some(user) = users.borrow().get(&caller) {
            if !matches!(user.user_type, UserType::Seller) {
                return Err("Only sellers can create shops".to_string());
            }
        } else {
            return Err("User not found".to_string());
        }
        
        let shop = Shop {
            id: generate_id("shop"),
            owner: caller,
            name,
            description,
            location,
            contact,
            is_verified: false,
            verification_expiry: None,
            created_at: time(),
        };
        
        SHOPS.with(|shops| {
            shops.borrow_mut().insert(shop.id.clone(), shop.clone());
        });
        
        Ok(shop)
    })
}

#[query]
fn get_shop(shop_id: String) -> Option<Shop> {
    SHOPS.with(|shops| shops.borrow().get(&shop_id).cloned())
}

#[query]
fn get_shops_by_location(latitude: f64, longitude: f64, radius_km: f64) -> Vec<Shop> {
    let coord = Coord { x: longitude, y: latitude };
    let _center_hash = geohash::encode(coord, 7).unwrap_or_default();
    
    SHOPS.with(|shops| {
        shops.borrow()
            .values()
            .filter(|shop| {
                let _shop_hash = &shop.location.geohash;
                let distance = calculate_distance(
                    latitude,
                    longitude,
                    shop.location.latitude,
                    shop.location.longitude,
                );
                distance <= radius_km
            })
            .cloned()
            .collect()
    })
}

// Product Management
#[update]
fn add_product(
    shop_id: String,
    name: String,
    description: String,
    price: f64,
    category: String,
    images: Vec<String>,
) -> Result<Product, String> {
    let caller = ic_cdk::caller();
    
    SHOPS.with(|shops| {
        if let Some(shop) = shops.borrow().get(&shop_id) {
            if shop.owner != caller {
                return Err("Only shop owner can add products".to_string());
            }
            
            let product = Product {
                id: generate_id("product"),
                shop_id,
                name,
                description,
                price,
                category,
                images,
                available: true,
                created_at: time(),
            };
            
            PRODUCTS.with(|products| {
                products.borrow_mut().insert(product.id.clone(), product.clone());
            });
            
            Ok(product)
        } else {
            Err("Shop not found".to_string())
        }
    })
}

#[query]
fn get_product(product_id: String) -> Option<Product> {
    PRODUCTS.with(|products| products.borrow().get(&product_id).cloned())
}

#[query]
fn get_shop_products(shop_id: String) -> Vec<Product> {
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
fn request_verification(shop_id: String, documents: Vec<String>) -> Result<VerificationRequest, String> {
    let caller = ic_cdk::caller();
    
    SHOPS.with(|shops| {
        if let Some(shop) = shops.borrow().get(&shop_id) {
            if shop.owner != caller {
                return Err("Only shop owner can request verification".to_string());
            }
            
            let request = VerificationRequest {
                shop_id: shop_id.clone(),
                documents,
                status: VerificationStatus::Pending,
                created_at: time(),
            };
            
            VERIFICATION_REQUESTS.with(|requests| {
                requests.borrow_mut().insert(shop_id, request.clone());
            });
            
            Ok(request)
        } else {
            Err("Shop not found".to_string())
        }
    })
}

#[update]
fn process_verification(shop_id: String, status: VerificationStatus) -> Result<Shop, String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        if let Some(user) = users.borrow().get(&caller) {
            if !matches!(user.user_type, UserType::Admin) {
                return Err("Only admins can process verifications".to_string());
            }
            
            SHOPS.with(|shops| {
                if let Some(mut shop) = shops.borrow_mut().get(&shop_id).cloned() {
                    match status {
                        VerificationStatus::Approved => {
                            shop.is_verified = true;
                            shop.verification_expiry = Some(time() + 30 * 24 * 60 * 60 * 1_000_000_000); // 30 days
                        }
                        _ => {
                            shop.is_verified = false;
                            shop.verification_expiry = None;
                        }
                    }
                    shops.borrow_mut().insert(shop_id, shop.clone());
                    Ok(shop)
                } else {
                    Err("Shop not found".to_string())
                }
            })
        } else {
            Err("User not found".to_string())
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
