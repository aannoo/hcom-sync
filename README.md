# hcom-sync

Cloudflare Workers + D1 sync server for [HCOM](https://github.com/aannoo/claude-hook-comms) cross-device communication.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aannoo/hcom-sync)

## Setup

1. Click deploy button
2. Authorize Cloudflare
3. Fill in project name and D1 database name
4. Copy your Worker URL: `https://hcom-sync.<you>.workers.dev`
5. Configure HCOM:
   ```bash
   export HCOM_SYNC=https://hcom-sync.<you>.workers.dev
   ```

## Optional: Auth token

1. In Cloudflare dashboard, add `SYNC_TOKEN` environment variable to your Worker
2. Configure HCOM:
   ```bash
   export HCOM_SYNC_HTTP_TOKEN=<your-token>
   ```

## API

- `GET /` - List files (JSON array)
- `GET /{filename}` - Read file
- `POST /{filename}` - Write file
- `DELETE /{filename}` - Delete file

## Free tier limits (no credit card required)

- 5GB total D1 storage
- 5M rows read/day
- 100k rows written/day
