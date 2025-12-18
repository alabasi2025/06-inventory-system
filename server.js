const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 4200;
const API_HOST = 'localhost';
const API_PORT = 3006;

// Manual proxy for API requests
app.use('/api', (req, res) => {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api' + req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${API_HOST}:${API_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  });

  req.pipe(proxyReq);
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/apps/web/browser')));

// Handle Angular routing - send all other requests to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/apps/web/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API proxy: /api/* -> http://${API_HOST}:${API_PORT}/api/*`);
});
