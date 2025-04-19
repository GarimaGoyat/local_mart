#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
// main.mo (Motoko canister)
// Note: While you requested Rust, ICP canisters primarily use Motoko.
// Here's a Rust-inspired approach using Motoko semantics

actor Main {
    type Product = {
      id: Nat;
      name: Text;
      price: Text;
      shop: Text;
      onBlinkit: Bool;
      location: ?Text;
      category: ?Text;
      quantity: ?Nat;
      image: ?Text;
    };
  
    type Credentials = {
      username: Text;
      password: Text;
      shopName: ?Text;
      email: ?Text;
      role: ?Text;
    };
  
    type Claims = {
      username: Text;
      role: Text;
      exp: Nat;
    };
  
    stable var products: [Product] = [];
    stable var users: [(Text, Text, Text)] = []; // (username, password, role)
    stable var shops: [(Text, Text, Text)] = []; // (username, shopName, email)
    stable var verificationRequests: [(Text, Text, Text, Text, Text)] = []; // (username, businessName, address, documentUrl, status)
    stable var jwtKey: Text = "your_secret_key";
  
    // Blockchain implementation
    stable var blockchain: [Block] = [];
    type Block = {
      index: Nat;
      timestamp: Nat;
      data: Product;
      previousHash: Text;
      hash: Text;
    };
  
    public shared func http_request(request: HttpRequest) : async HttpResponse {
      let path = request.url;
      let method = request.method;
      
      // Route handling
      if path == "/api/products" && method == "GET" {
        return get_products();
      } else if path == "/api/login" && method == "POST" {
        return await login(request);
      }
      // Add other routes...
      
      return {status_code = 404; headers = []; body = Text.encodeUtf8("Not found")};
    }
  
    func get_products() : HttpResponse {
      let json = to_candid(products);
      {
        status_code = 200;
        headers = [("Content-Type", "application/json")];
        body = json;
      }
    }
  
    async func login(request: HttpRequest) : HttpResponse {
      let body = request.body;
      let credentials = from_candid<Credentials>(body);
      
      switch (Array.find(users, func (u: (Text, Text, Text)) : Bool { u.0 == credentials.username })) {
        case null { return unauthorized() };
        case (?user) {
          if (user.1 != credentials.password) return unauthorized();
          
          let claims: Claims = {
            username = credentials.username;
            role = user.2;
            exp = Time.now() + 86400_000_000_000; // 24 hours
          };
          
          let token = generate_jwt(claims);
          return {
            status_code = 200;
            headers = [("Set-Cookie", "token=" # token)];
            body = Text.encodeUtf8("Login successful");
          };
        }
      }
    }
  
    func generate_jwt(claims: Claims) : Text {
      // JWT implementation using ICP crypto
      // Simplified example - use proper crypto in production
      let header = "{ \"alg\": \"HS256\", \"typ\": \"JWT\" }";
      let payload = to_candid(claims);
      let signature = Crypto.sha256(header # payload # jwtKey);
      base64(header) # "." # base64(payload) # "." # base64(signature)
    }
  
    func unauthorized() : HttpResponse {
      {
        status_code = 401;
        headers = [];
        body = Text.encodeUtf8("Unauthorized");
      }
    }
  
    // Add other CRUD operations, blockchain implementation, etc.
    
    // HTTPS outcall example for external verification
    async func verify_document(url: Text) : async Text {
      let response = await Http.outcall({
        url = url;
        method = "GET";
        headers = [];
        body = null;
        transform = null;
      });
      Text.decodeUtf8(response.body) ?? ""
    }
  }