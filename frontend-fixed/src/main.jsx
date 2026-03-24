import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App.jsx'

const manifestUrl = import.meta.env.VITE_APP_URL
  ? `${import.meta.env.VITE_APP_URL}/tonconnect-manifest.json`
  : `${window.location.origin}/tonconnect-manifest.json`

const tg = window.Telegram?.WebApp

if (tg) {
  tg.expand?.()
  tg.disableVerticalSwipes?.()
  try { tg.requestFullscreen?.() } catch(e) {}
  try { tg.setHeaderColor?.('#000000') } catch(e) {}
  try { tg.setBackgroundColor?.('#000000') } catch(e) {}
  try { tg.setBottomBarColor?.('#000000') } catch(e) {}
}

function applyTelegramSafeArea() {
  if (!tg) return
  const safe = tg.safeAreaInset || {}
  const content = tg.contentSafeAreaInset || {}
  const top = (safe.top || 0) + (content.top || 0)
  const bottom = Math.max(safe.bottom || 0, content.bottom || 0)
  document.documentElement.style.setProperty('--tg-safe-top', `${top}px`)
  document.documentElement.style.setProperty('--tg-safe-bottom', `${bottom}px`)
}

applyTelegramSafeArea()
tg?.onEvent?.('safeAreaChanged', applyTelegramSafeArea)
tg?.onEvent?.('contentSafeAreaChanged', applyTelegramSafeArea)
tg?.onEvent?.('viewportChanged', () => {
  applyTelegramSafeArea()
  tg?.expand?.()
  try { tg?.requestFullscreen?.() } catch(e) {}
})
tg?.onEvent?.('fullscreenChanged', () => {
  if (!tg?.isFullscreen) {
    try { tg?.requestFullscreen?.() } catch(e) {}
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
)
