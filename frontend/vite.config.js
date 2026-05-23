import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/auth': 'https://wordnote-production.up.railway.app',
            '/board': 'https://wordnote-production.up.railway.app',
            '/box': 'https://wordnote-production.up.railway.app',
            '/task': 'https://wordnote-production.up.railway.app',
            '/boxTask': 'https://wordnote-production.up.railway.app',
            '/member': 'https://wordnote-production.up.railway.app',
        }
    }
})


