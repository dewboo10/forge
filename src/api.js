// ═══════════════════════════════════════════════════════════
// api.js — All backend API calls for Forge
// Base URL: set VITE_API_URL in .env
// ═══════════════════════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function req(method, path, body) {
  const tg = window?.Telegram?.WebApp
  const token = tg?.initData || ''
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

// ─── AUTH ───────────────────────────────────────────────────
export const auth = {
  // Validate Telegram initData and get/create user
  login: () => req('POST', '/api/auth/login'),
}

// ─── MINING ─────────────────────────────────────────────────
export const mining = {
  // Get current balance, rate, upgrades, auto-mine status
  getState: () => req('GET', '/api/mining/state'),

  // Start a mining session
  start: () => req('POST', '/api/mining/start'),

  // Stop mining session — server calculates earned amount
  stop: () => req('POST', '/api/mining/stop'),

  // Claim auto-mine earnings (offline period)
  claimOffline: () => req('POST', '/api/mining/claim-offline'),

  // Get all available upgrades + user levels
  getUpgrades: () => req('GET', '/api/mining/upgrades'),

  // Purchase upgrade with FRG balance
  buyUpgrade: (upgradeId) => req('POST', '/api/mining/upgrades/buy', { upgradeId }),
}

// ─── STORE / TON PAYMENTS ───────────────────────────────────
export const store = {
  // Get all store items + purchased status for user
  getItems: () => req('GET', '/api/store/items'),

  // Verify a TON transaction and activate the purchased item
  // Call this after tonConnectUI.sendTransaction() succeeds
  verifyPurchase: (boc, itemId) => req('POST', '/api/store/verify', { boc, itemId }),

  // Get user's active purchases
  getPurchased: () => req('GET', '/api/store/purchased'),
}

// ─── REFERRALS ──────────────────────────────────────────────
export const referrals = {
  // Get user's referral code, count, earnings
  getInfo: () => req('GET', '/api/referrals/info'),

  // Get full referral list
  getList: () => req('GET', '/api/referrals/list'),

  // Get referral tier progress
  getTiers: () => req('GET', '/api/referrals/tiers'),

  // Claim a referral tier reward
  claimTier: (refs) => req('POST', '/api/referrals/claim', { refs }),
}

// ─── MISSIONS ───────────────────────────────────────────────
export const missions = {
  // Get all missions + progress
  getAll: () => req('GET', '/api/missions'),

  // Claim a checkpoint reward
  claimCheckpoint: (missionId, checkpointIndex) =>
    req('POST', '/api/missions/claim', { missionId, checkpointIndex }),
}

// ─── SECURITY CIRCLE ────────────────────────────────────────
export const circle = {
  // Get user's circle members + incoming requests
  getCircle: () => req('GET', '/api/circle'),

  // Send invite to a Telegram user
  invite: (telegramId) => req('POST', '/api/circle/invite', { telegramId }),

  // Accept an incoming request
  accept: (requestId) => req('POST', '/api/circle/accept', { requestId }),

  // Decline an incoming request
  decline: (requestId) => req('POST', '/api/circle/decline', { requestId }),

  // Remove a member from circle
  remove: (memberId) => req('DELETE', `/api/circle/${memberId}`),
}

// ─── PROFILE ────────────────────────────────────────────────
export const profile = {
  // Get full profile: stats, badges, active items
  getProfile: () => req('GET', '/api/profile'),

  // Get global leaderboard
  getLeaderboard: (limit = 50) => req('GET', `/api/leaderboard?limit=${limit}`),

  // Get daily reward status
  getDailyReward: () => req('GET', '/api/daily-reward'),

  // Claim daily reward
  claimDailyReward: () => req('POST', '/api/daily-reward/claim'),
}

// ─── WALLET ─────────────────────────────────────────────────
export const wallet = {
  // Link a TON wallet address to user account
  linkWallet: (address) => req('POST', '/api/wallet/link', { address }),

  // Get linked wallet
  getWallet: () => req('GET', '/api/wallet'),
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export const notifications = {
  // Get all notifications with read status
  getAll: () => req('GET', '/api/notifications'),

  // Mark a single notification as read
  markRead: (id) => req('PATCH', `/api/notifications/${id}/read`),

  // Mark all notifications as read
  markAllRead: () => req('PATCH', '/api/notifications/read-all'),
}
