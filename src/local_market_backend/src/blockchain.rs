use candid::CandidType;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Debug, Serialize, Deserialize, CandidType)]
pub struct Block {
    pub index: u64,
    pub timestamp: String,
    pub data: HashMap<String, String>,
    pub prev_hash: String,
    pub hash: String,
}

#[derive(Default)]
pub struct Blockchain {
    pub blocks: Vec<Block>,
}

impl Blockchain {
    pub fn new() -> Self {
        let mut blockchain = Blockchain { blocks: vec![] };
        let empty_data = HashMap::new();

        let genesis_block = Block {
            index: 0,
            timestamp: current_time(),
            data: empty_data,
            prev_hash: String::from(""),
            hash: String::from(""),
        };

        let mut genesis = genesis_block.clone();
        genesis.hash = calculate_hash(&genesis_block);
        blockchain.blocks.push(genesis);
        blockchain
    }

    pub fn add_block(&mut self, data: HashMap<String, String>) -> Block {
        let prev_block = self.blocks.last().unwrap();
        let new_index = prev_block.index + 1;

        let mut new_block = Block {
            index: new_index,
            timestamp: current_time(),
            data,
            prev_hash: prev_block.hash.clone(),
            hash: String::new(),
        };

        new_block.hash = calculate_hash(&new_block);
        self.blocks.push(new_block.clone());
        new_block
    }

    pub fn validate(&self) -> bool {
        for i in 1..self.blocks.len() {
            let current = &self.blocks[i];
            let previous = &self.blocks[i - 1];

            if current.hash != calculate_hash(current) || current.prev_hash != previous.hash {
                return false;
            }
        }
        true
    }

    pub fn get_blocks(&self) -> &Vec<Block> {
        &self.blocks
    }

    pub fn add_shop_verification_request(&mut self, request: ShopVerificationRequest) {
        let mut data = HashMap::new();
        data.insert("shop_id".to_string(), request.shop_id);
        data.insert("shop_name".to_string(), request.shop_name);
        data.insert("owner_name".to_string(), request.owner_name);
        data.insert("status".to_string(), request.status);
        data.insert("timestamp".to_string(), request.timestamp);
        self.add_block(data);
    }

    pub fn get_products_by_shop(&self, shop_name: &str) -> Vec<Product> {
        let mut products = vec![];

        for block in &self.blocks {
            if let Some(block_shop_name) = block.data.get("shop") {
                if block_shop_name == shop_name {
                    let product = Product {
                        id: block.data.get("id").and_then(|v| v.parse().ok()).unwrap_or(0),
                        name: block.data.get("name").cloned().unwrap_or_default(),
                        price: block.data.get("price").cloned().unwrap_or_default(),
                        shop: block_shop_name.clone(),
                        on_blinkit: block.data.get("onBlinkit").map_or(false, |v| v == "true"),
                        location: block.data.get("location").cloned(),
                        category: block.data.get("category").cloned(),
                        quantity: block.data.get("quantity").and_then(|v| v.parse().ok()),
                        image: block.data.get("image").cloned(),
                    };
                    products.push(product);
                }
            }
        }

        products
    }
}

fn calculate_hash(block: &Block) -> String {
    let record = format!(
        "{}{}{}{:?}",
        block.index, block.timestamp, block.prev_hash, block.data
    );
    let mut hasher = Sha256::new();
    hasher.update(record.as_bytes());
    hex::encode(hasher.finalize())
}

fn current_time() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH).unwrap();
    format!("{}", since_the_epoch.as_secs())
}

#[derive(Clone, Debug, Serialize, Deserialize, CandidType)]
pub struct ShopVerificationRequest {
    pub shop_id: String,
    pub shop_name: String,
    pub owner_name: String,
    pub status: String,
    pub timestamp: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, CandidType)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub price: String,
    pub shop: String,
    pub on_blinkit: bool,
    pub location: Option<String>,
    pub category: Option<String>,
    pub quantity: Option<i32>,
    pub image: Option<String>,
}
