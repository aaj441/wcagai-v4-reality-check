# Quick Setup Guide for WCAGAI v4.0

This guide will help you get WCAGAI v4.0 up and running in under 5 minutes.

## Option 1: Local Development (Fastest)

### Prerequisites
- Node.js 18+
- Redis (Docker recommended)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/aaj441/wcagai-v4-reality-check.git
cd wcagai-v4-reality-check

# 2. Install dependencies
npm install

# 3. Start Redis (with Docker)
docker run -d -p 6379:6379 redis:alpine

# 4. Create environment file
cp .env.example .env

# 5. Start application
npm run dev

# 6. Open browser
# App: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

Done! The app is now running with fallback data (no API key needed).

## Option 2: Docker Compose (Production-like)

### Prerequisites
- Docker and docker-compose installed

### Steps

```bash
# 1. Clone repository
git clone https://github.com/aaj441/wcagai-v4-reality-check.git
cd wcagai-v4-reality-check

# 2. Create environment file
cp .env.production .env
# Edit .env if you want to add API keys (optional)

# 3. Start all services
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Access application
# App: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
# Health: http://localhost:3000/health
```

## Option 3: Railway (Cloud Deployment)

### Prerequisites
- Railway account (free tier available)
- Railway CLI installed

### Steps

```bash
# 1. Clone repository
git clone https://github.com/aaj441/wcagai-v4-reality-check.git
cd wcagai-v4-reality-check

# 2. Login to Railway
railway login

# 3. Create project
railway init

# 4. Add Redis
railway add --plugin redis

# 5. Set environment variables (optional)
railway variables set NODE_ENV=production
railway variables set API_KEY=$(openssl rand -hex 32)

# 6. Deploy
railway up

# 7. Get your URL
railway domain

# 8. Test deployment
curl https://your-app.railway.app/health
```

## Testing Your Installation

Once running, test these endpoints:

```bash
# Health check
curl http://localhost:3000/health

# List verticals
curl http://localhost:3000/api/discovery/verticals

# Discover healthcare sites
curl http://localhost:3000/api/discovery?vertical=healthcare&maxResults=5

# Scan a single URL (this will take 10-30s)
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

## Optional: Add SerpAPI Key

To use live site discovery instead of fallback data:

1. Sign up at https://serpapi.com (free tier: 100 searches/month)
2. Get your API key
3. Add to `.env`:
   ```bash
   SERPAPI_KEY=your_api_key_here
   ```
4. Restart the application

## Optional: Enable API Authentication

For production deployments, enable API authentication:

1. Generate API key:
   ```bash
   openssl rand -hex 32
   ```

2. Add to `.env`:
   ```bash
   NODE_ENV=production
   API_KEY=your_generated_key_here
   ```

3. Restart and test:
   ```bash
   curl -H "X-API-Key: your_key" http://localhost:3000/api/scan/status
   ```

## Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Start Redis with Docker
docker run -d -p 6379:6379 redis:alpine
```

### Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm start
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the [API documentation](http://localhost:3000/api-docs)
- Check [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for Railway details
- Review [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for architecture

## Support

- Issues: https://github.com/aaj441/wcagai-v4-reality-check/issues
- Documentation: See README.md

Enjoy using WCAGAI v4.0! 🚀
