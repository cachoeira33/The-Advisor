# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring tools set up

### Supabase Setup
1. Create Supabase project
2. Configure authentication settings
3. Run database migrations
4. Set up Row Level Security policies
5. Configure Edge Functions for webhooks

### Stripe Configuration
1. Create Stripe account and get API keys
2. Set up webhook endpoints
3. Configure subscription products and pricing
4. Test payment flows in sandbox mode

### Frontend Deployment
```bash
cd web
npm run build
# Deploy to your CDN/hosting provider
```

### Backend Deployment
```bash
cd api
npm run build
# Deploy to your server with PM2
pm2 start ecosystem.config.js
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring Setup

### Application Monitoring
- Set up Sentry for error tracking
- Configure performance monitoring
- Set up alerting for critical issues

### Business Metrics
- Google Analytics 4 setup
- Conversion goal configuration
- Revenue tracking and attribution

## Backup and Recovery

### Database Backups
- Supabase provides automatic backups
- Test backup restoration procedures
- Document recovery workflows

### Application Backups
- Regular code repository backups
- Environment configuration backups
- SSL certificate backups

## Security Hardening

### Server Security
- Keep system packages updated
- Configure firewall rules
- Set up intrusion detection
- Regular security audits

### Application Security
- Regular dependency updates
- Security vulnerability scanning
- Code review processes
- Penetration testing schedule

## Performance Optimization

### Frontend Optimization
- Enable gzip compression
- Optimize images and assets
- Implement caching strategies
- Monitor Core Web Vitals

### Backend Optimization
- Database query optimization
- API response caching
- Connection pooling
- Load balancing setup

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- CDN implementation
- Auto-scaling policies

### Vertical Scaling
- Server resource monitoring
- Database performance tuning
- Memory optimization
- CPU utilization tracking