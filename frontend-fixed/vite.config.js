import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appUrl = env.VITE_APP_URL || 'https://your-frontend-domain.com'

  return {
    plugins: [
      react(),
      // Auto-fill tonconnect-manifest.json with real URLs at build time
      {
        name: 'tonconnect-manifest',
        buildStart() {
          const manifest = {
            url:     appUrl,
            name:    'Forge Mining',
            iconUrl: `${appUrl}/Forge.svg`,
          }
          fs.writeFileSync(
            path.resolve(__dirname, 'public/tonconnect-manifest.json'),
            JSON.stringify(manifest, null, 2)
          )
        },
      },
    ],
    server: { port: 5173 },
    build:  { outDir: 'dist' },
  }
})
