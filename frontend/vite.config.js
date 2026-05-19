import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/auth': 'http://localhost:8080',
            '/board': 'http://localhost:8080',
            '/box': 'http://localhost:8080',
            '/task': 'http://localhost:8080',
            '/boxTask': 'http://localhost:8080',
            '/member': 'http://localhost:8080',
        }
    }
})


