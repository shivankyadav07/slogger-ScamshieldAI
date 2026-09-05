const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeMessage } = require('./analyzer');
const config = require('./config');

const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function serveFrontend(request, response) {
  const requestedPath = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = path.resolve(FRONTEND_DIR, relativePath);
  if (filePath !== FRONTEND_DIR && !filePath.startsWith(`${FRONTEND_DIR}${path.sep}`)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: 'Page not found' });
      return;
    }
    response.writeHead(200, { 'Content-Type': CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}

function handleAnalysis(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > config.maxMessageLength * 2) request.destroy();
  });
  request.on('end', () => {
    try {
      const { message } = JSON.parse(body);
      if (typeof message !== 'string' || !message.trim()) {
        sendJson(response, 400, { error: 'Please enter a message first.' });
        return;
      }
      if (message.length > config.maxMessageLength) {
        sendJson(response, 400, { error: `Message must be ${config.maxMessageLength} characters or fewer.` });
        return;
      }
      sendJson(response, 200, analyzeMessage(message.trim()));
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON.' });
    }
  });
}

function createServer() {
  return http.createServer((request, response) => {
    const requestPath = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
    if (request.method === 'POST' && requestPath === '/api/analyze') {
      handleAnalysis(request, response);
      return;
    }
    if (request.method === 'GET') {
      serveFrontend(request, response);
      return;
    }
    sendJson(response, 405, { error: 'Method not allowed' });
  });
}

if (require.main === module) {
  createServer().listen(config.port, config.host, () => {
    console.log(`ScamShield AI is running at http://${config.host}:${config.port}`);
  });
}

module.exports = { createServer };