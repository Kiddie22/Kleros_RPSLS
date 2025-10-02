_This file was generated via Cursor_

# Rock Paper Scissors Lizard Spock (RPSLS) dApp

A decentralized Rock Paper Scissors Lizard Spock game built on Ethereum Sepolia testnet. Players can create games, join existing games, and play using smart contracts.

## 🎮 Game Rules

**Rock Paper Scissors Lizard Spock** is an extended version of the classic Rock Paper Scissors game:

- **Rock** crushes Scissors and Lizard
- **Paper** covers Rock and disproves Spock
- **Scissors** cuts Paper and decapitates Lizard
- **Lizard** poisons Spock and eats Paper
- **Spock** vaporizes Rock and smashes Scissors

## 🚀 Features

### Core Gameplay

- **Smart Contract Integration**: Games are managed by Ethereum smart contracts
- **Real-time State Updates**: Game status updates automatically with pagination
- **Stake Management**: Players can stake ETH on games
- **Dispute Resolution**: Built-in timeout and solve mechanisms

### User Interface

- **MetaMask Integration**: Seamless wallet connection
- **Real-time Countdown**: Visual countdown for game timeouts
- **Game Status Badges**: Clear indication of game states
- **Pagination**: Browse through multiple games efficiently

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Ethers.js** for Ethereum interaction
- **React Query** for data fetching
- **React Hook Form** with Zod validation

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose

### Blockchain

- **Ethereum Sepolia Testnet**
- **MetaMask** wallet integration
- **Smart contracts** for game logic

## 📁 Project Structure

```
rps/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── forms/      # Game forms (Join, Solve, Timeout)
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React contexts (Web3)
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utility functions
│   └── package.json
├── backend/                # Node.js backend
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── lib/               # Database connection
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rps
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/rps-game
   PORT=3000
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   The API will be available at `http://localhost:3000`

2. **Start the frontend development server**

   ```bash
   cd client
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

3. **Connect MetaMask**
   - Make sure you're on Sepolia testnet
   - Ensure you have Sepolia ETH for gas fees
   - Connect your wallet to the dApp

## 🎯 How to Play

### Creating a Game

1. Click "Start a new game"
2. Enter the opponent's address
3. Choose your move (Rock, Paper, Scissors, Lizard, or Spock)
4. Set the stake amount
5. Deploy the smart contract

### Joining a Game

1. Click "Join a game"
2. Browse available games with pagination
3. Select a game to join
4. Choose your move
5. Submit your move to the contract

### Solving a Game

1. Once both players have moved
2. Click "Solve Game" on the game card
3. The contract will determine the winner
4. Stakes are distributed automatically

### Timeout Resolution

1. If a player doesn't respond within the timeout period
2. Click "Timeout Game" to claim the stake
3. The game is automatically resolved

## 🔧 API Endpoints

### Games

- `GET /api/game/all` - Get all games with pagination
  - Query params: `page`, `limit`
- `POST /api/game/new-game` - Create a new game
- `DELETE /api/game/delete/:contractAddress` - Delete a game

### Health Check

- `GET /health` - Server health status

## 🎨 UI Components

### Game Cards

- **Game Info**: Contract address, players, stake amount
- **Status Badges**: Player turn, game solved, timeout status
- **Action Buttons**: Join, Solve, Timeout based on game state
- **Countdown Timer**: Visual timeout countdown

### Forms

- **Join Game Form**: Submit moves to existing games
- **Solve Game Form**: Resolve completed games
- **Timeout Game Form**: Claim timed-out games

## 🔒 Security Features

- **Smart Contract Validation**: All game logic is enforced on-chain
- **Timeout Protection**: Automatic resolution prevents stuck games
- **Stake Security**: ETH is held in smart contracts until resolution
- **Input Validation**: Form validation with Zod schemas

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask Circuit Breaker Error**

   - Reset your MetaMask account: Settings → Advanced → Reset Account
   - Switch networks and switch back
   - Clear browser cache

2. **Wrong Network Error**

   - Ensure you're connected to Sepolia testnet
   - Add Sepolia network to MetaMask if needed

3. **Insufficient Gas Error**

   - Get more Sepolia ETH from faucets
   - Increase gas limit in MetaMask

4. **Connection Issues**
   - Check if backend server is running
   - Verify MongoDB connection
   - Check browser console for errors

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or local MongoDB
2. Update environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment

1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API endpoints in the code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Kleros** for the smart contract architecture
- **Ethereum Foundation** for the Sepolia testnet
- **MetaMask** for wallet integration
- **React** and **Vite** communities for excellent tooling

---

**Happy Gaming! 🎮**
