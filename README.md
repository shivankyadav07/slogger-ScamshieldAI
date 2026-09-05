# ScamShield AI

ScamShield AI is a small rule-based scam message detector. The browser frontend sends a message to the Node.js backend, which returns a risk score, risk level, and matching signals.

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── analyzer.js       # Scam scoring rules
│   │   ├── config.js         # Environment-backed configuration
│   │   └── server.js         # HTTP API and static frontend server
│   └── test/
│       └── analyzer.test.js  # Analysis behavior tests
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .env.example
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://127.0.0.1:3000 in a browser. The server loads `.env` when it is present; shell environment variables take precedence over values in that file.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend with Node's file watcher |
| `npm start` | Start the backend for a normal run |
| `npm test` | Run the backend unit tests |

## API

### `POST /api/analyze`

Request:

```json
{ "message": "You won a prize. Click to claim it now." }
```

Response:

```json
{
  "riskScore": 60,
  "level": "high",
  "foundWords": ["won", "prize", "click", "claim"]
}
```

The default message limit is 2,000 characters and can be changed with `MAX_MESSAGE_LENGTH`. The API returns a `400` response for invalid JSON, missing messages, or messages over the configured limit.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `HOST` | `127.0.0.1` | Network interface to bind |
| `MAX_MESSAGE_LENGTH` | `2000` | Maximum accepted message length |