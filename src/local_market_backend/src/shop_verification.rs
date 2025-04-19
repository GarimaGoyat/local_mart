use candid::CandidType;
use ic_cdk::println;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ShopVerificationRequest {
    pub shop_id: String,
    pub shop_name: String,
    pub location: String,
    pub contact: String,
    pub status: String,
    pub timestamp: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Block {
    pub index: u64,
    pub timestamp: String,
    pub data: ShopVerificationRequest,
}

thread_local! {
    static CHAIN: RefCell<Vec<Block>> = RefCell::new(Vec::new());
}

// Initialize blockchain with genesis block
pub fn init_blockchain() {
    let genesis_request = ShopVerificationRequest {
        shop_id: "0".to_string(),
        shop_name: "Genesis".to_string(),
        location: "Nowhere".to_string(),
        contact: "0000000000".to_string(),
        status: "Approved".to_string(),
        timestamp: current_time(),
    };

    let genesis_block = Block {
        index: 0,
        timestamp: current_time(),
        data: genesis_request,
    };

    CHAIN.with(|chain| {
        chain.borrow_mut().push(genesis_block);
    });

    println!("Blockchain initialized with genesis block");
}

// Add a new verification request
pub fn submit_verification_request(request: ShopVerificationRequest) {
    CHAIN.with(|chain| {
        let mut blockchain = chain.borrow_mut();
        let index = blockchain.len() as u64;

        let mut new_request = request.clone();
        new_request.status = "Pending".to_string();
        new_request.timestamp = current_time();

        let block = Block {
            index,
            timestamp: current_time(),
            data: new_request,
        };

        blockchain.push(block);
    });
}

// Get the full chain (all verification requests)
pub fn get_verification_requests() -> Vec<Block> {
    CHAIN.with(|chain| chain.borrow().clone())
}

// Update verification status (Approved / Rejected)
pub fn update_verification_status(shop_id: String, new_status: String) -> String {
    CHAIN.with(|chain| {
        for block in chain.borrow_mut().iter_mut() {
            if block.data.shop_id == shop_id {
                block.data.status = new_status.clone();
                return "Status updated successfully".to_string();
            }
        }
        "Shop ID not found".to_string()
    })
}

fn current_time() -> String {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{}", now.as_secs())
}
