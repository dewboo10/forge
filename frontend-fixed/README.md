# Forge Frontend

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## TON Connect Setup

1. Deploy the app to a public URL
2. Update `public/tonconnect-manifest.json` with your real URL
3. Update `manifestUrl` in `src/main.jsx` with your manifest URL
4. Update the payment recipient address in `src/App.jsx` (search for `UQBFck`)

## API Wiring

All API calls are in `src/api.js`. Import and use them in App.jsx:

```js
import { mining, store, referrals } from './api.js'

// Example: load state on mount
useEffect(() => {
  mining.getState().then(state => {
    setBalance(state.balance)
    setUpgrades(state.upgrades)
  })
}, [])

// Example: verify TON purchase after payment
const tx = await tonConnectUI.sendTransaction({...})
await store.verifyPurchase(tx.boc, item.id)
```

## File Structure

```
src/
  App.jsx          — Main app (all UI)
  App.css          — All styles
  main.jsx         — Entry point + TonConnectUIProvider
  api.js           — All backend API calls

public/
  Forge.svg                  — Logo
  tonconnect-manifest.json   — TON Connect config (update URL)
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_TON_NETWORK` | `mainnet` or `testnet` |
