import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://x6au4w6374bk3ntf7wyo3wacmm0wwlaq.lambda-url.us-east-1.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy para los PDFs de Google Cloud Storage
      '/pdf-proxy': {
        target: 'https://storage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf-proxy/, '/soli_books_pdf'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('PDF proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📄 Proxying PDF:', req.method, req.url);
            // Agregar headers necesarios
            proxyReq.setHeader('Accept', 'application/pdf');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📄 PDF Response:', proxyRes.statusCode, req.url);
            // Agregar headers CORS a la respuesta
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
          });
        },
      },
    },
  },
})
