# Apex Agents - Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Anthropic API key (optional)
- Pinecone account (for vector search)

## Environment Setup

Create `.env` file with:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."
PINECONE_INDEX="apex-agents"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Database Setup

```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push
```

## Build & Deploy

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t apex-agents .

# Run container
docker run -p 3000:3000 --env-file .env apex-agents
```

### Manual

```bash
# Build
npm run build

# Start
npm start
```

## Post-Deployment

1. Verify database connection
2. Test agent creation
3. Run sample workflow
4. Configure monitoring
5. Set up backups

## Scaling

- Use Redis for caching
- Configure load balancer
- Enable CDN for static assets
- Set up database read replicas
- Implement queue system for long-running tasks

## Monitoring

- Application logs
- Database performance
- API usage and costs
- Agent execution metrics
- Error tracking

## Security

- Enable HTTPS
- Configure CORS
- Set up rate limiting
- Implement API authentication
- Regular security audits

