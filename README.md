# LocalMart - Local Market Platform

LocalMart is a decentralized platform that connects local shops, farmers, and sellers directly to buyers in their area. Built on the Internet Computer Protocol (ICP), it provides a trustworthy and transparent marketplace for local commerce.

## Features

### For Buyers
- Browse nearby shops and products without login
- Search and filter by categories
- View shop details, locations, and products
- Verify shop authenticity through blockchain
- Interactive map interface

### For Sellers
- Create and manage shop profile
- Add, update, and delete products
- Apply for shop verification
- Track verification status
- Manage inventory

### For Admins
- Review and process shop verification requests
- Monitor all shops and products
- Manage platform operations

## Technology Stack

- Backend: Rust (ICP Canister)
- Frontend: React with Chakra UI
- Blockchain: Internet Computer Protocol
- Database: On-chain state management
- Maps: Leaflet.js
- Authentication: Internet Identity

## Prerequisites

- [DFX SDK](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html)
- Node.js (v14 or higher)
- Rust (latest stable)
- Internet Computer Wallet (Plug)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/local_market.git
   cd local_market
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Internet Computer replica:
   ```bash
   dfx start --background
   ```

4. Deploy the canisters:
   ```bash
   dfx deploy
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
local_market/
├── src/
│   ├── local_market_backend/      # Rust backend code
│   │   ├── src/
│   │   │   └── lib.rs            # Main backend logic
│   │   └── Cargo.toml            # Rust dependencies
│   └── local_market_frontend/     # React frontend code
│       ├── src/
│       │   ├── components/        # Reusable components
│       │   ├── pages/            # Page components
│       │   ├── App.jsx           # Main app component
│       │   └── main.jsx          # Entry point
│       └── package.json          # Frontend dependencies
├── dfx.json                      # DFX configuration
└── README.md                     # This file
```

## Development

### Backend Development

The backend is written in Rust and uses the Internet Computer's canister SDK. The main logic is in `src/local_market_backend/src/lib.rs`.

To modify the backend:
1. Update the Rust code
2. Build the canister: `dfx build local_market_backend`
3. Deploy the changes: `dfx deploy local_market_backend`

### Frontend Development

The frontend is a React application using Chakra UI for the interface. The main components are in `src/local_market_frontend/src/`.

To modify the frontend:
1. Update the React components
2. The development server will automatically reload with changes
3. For production: `npm run build`

## Testing

Run the test suite:
```bash
dfx test
npm test
```

## Deployment

To deploy to the Internet Computer mainnet:

1. Build the project:
   ```bash
   dfx build --network ic
   ```

2. Deploy:
   ```bash
   dfx deploy --network ic
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Internet Computer Protocol
- DFX SDK
- React and Chakra UI communities
- OpenStreetMap for map data
