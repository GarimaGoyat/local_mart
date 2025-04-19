use std::sync::{Arc, Mutex};
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};
use chrono::Utc;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Block {
    pub index: usize,
    pub timestamp: String,
    pub data: serde_json::Value,
    pub prev_hash: String,
    pub hash: String,
}

#[derive(Debug, Clone)]
pub struct Blockchain {
    pub blocks: Arc<Mutex<Vec<Block>>>,
}

impl Blockchain {
    pub fn new() -> Self {
        let genesis_block = Block {
            index: 0,
            timestamp: Utc::now().to_rfc3339(),
            data: serde_json::json!({}),
            prev_hash: String::new(),
            hash: String::new(), // will be calculated
        };

        let hash = Blockchain::calculate_hash(&genesis_block);
        let mut genesis_block = genesis_block;
        genesis_block.hash = hash;

        Blockchain {
            blocks: Arc::new(Mutex::new(vec![genesis_block])),
        }
    }

    pub fn add_block(&self, data: serde_json::Value) {
        let mut blocks = self.blocks.lock().unwrap();
        let prev_block = blocks.last().unwrap();

        let mut new_block = Block {
            index: prev_block.index + 1,
            timestamp: Utc::now().to_rfc3339(),
            data,
            prev_hash: prev_block.hash.clone(),
            hash: String::new(),
        };

        new_block.hash = Blockchain::calculate_hash(&new_block);
        blocks.push(new_block);
    }

    fn calculate_hash(block: &Block) -> String {
        let record = format!(
            "{}{}{}{}",
            block.index,
            block.timestamp,
            block.prev_hash,
            block.data.to_string()
        );
        let mut hasher = Sha256::new();
        hasher.update(record);
        format!("{:x}", hasher.finalize())
    }

    pub fn validate(&self) -> bool {
        let blocks = self.blocks.lock().unwrap();

        for i in 1..blocks.len() {
            let current = &blocks[i];
            let previous = &blocks[i - 1];

            if current.hash != Blockchain::calculate_hash(current) {
                return false;
            }

            if current.prev_hash != previous.hash {
                return false;
            }
        }

        true
    }

    pub fn get_blocks(&self) -> Vec<Block> {
        self.blocks.lock().unwrap().clone()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ShopVerificationRequest {
    pub shop_id: String,
    pub shop_name: String,
    pub owner_name: String,
    pub status: String,
    pub timestamp: String,
}

impl Blockchain {
    pub fn add_shop_verification_request(&self, request: ShopVerificationRequest) {
        let data = serde_json::to_value(request).unwrap();
        self.add_block(data);
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Product {
    pub id: usize,
    pub name: String,
    pub price: String,
    pub shop: String,
    pub on_blinkit: bool,
    pub location: Option<String>,
    pub category: Option<String>,
    pub quantity: Option<usize>,
    pub image: Option<String>,
}

impl Blockchain {
    pub fn get_products_by_shop(&self, shop_name: &str) -> Vec<Product> {
        let blocks = self.blocks.lock().unwrap();
        let mut products = vec![];

        for block in blocks.iter() {
            if let Ok(product) = serde_json::from_value::<Product>(block.data.clone()) {
                if product.shop == shop_name {
                    products.push(product);
                }
            }
        }

        products
    }
}
use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
pub struct ShopVerificationRequest {
    pub shop_id: String,
    pub shop_name: String,
    pub owner_name: String,
    pub status: String,
    pub timestamp: String,
}

#[derive(Serialize, Clone)]
pub struct Block {
    pub index: usize,
    pub timestamp: String,
    pub data: serde_json::Value,
    pub prev_hash: String,
    pub hash: String,
}

pub struct Blockchain {
    pub blocks: Vec<Block>,
}

impl Blockchain {
    pub fn new() -> Self {
        let genesis_block = Block {
            index: 0,
            timestamp: Utc::now().to_rfc3339(),
            data: serde_json::json!({}),
            prev_hash: String::new(),
            hash: String::new(), // Hash will be calculated later
        };

        let mut blockchain = Blockchain {
            blocks: vec![genesis_block],
        };

        blockchain.blocks[0].hash = Blockchain::calculate_hash(&blockchain.blocks[0]);

        blockchain
    }

    pub fn add_shop_verification_request(&mut self, request: ShopVerificationRequest) {
        let last_block = self.blocks.last().unwrap();
        let new_block = Block {
            index: last_block.index + 1,
            timestamp: Utc::now().to_rfc3339(),
            data: serde_json::json!(request),
            prev_hash: last_block.hash.clone(),
            hash: String::new(), // Will be calculated later
        };

        let mut new_block = new_block;
        new_block.hash = Blockchain::calculate_hash(&new_block);
        self.blocks.push(new_block);
    }

    pub fn get_blocks(&self) -> &Vec<Block> {
        &self.blocks
    }

    pub fn calculate_hash(block: &Block) -> String {
        let record = format!(
            "{}{}{}{}{}",
            block.index, block.timestamp, block.prev_hash, block.data, block.prev_hash
        );
        let hash = sha2::Sha256::digest(record.as_bytes());
        hex::encode(hash)
    }
}
