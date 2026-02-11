# Microfrontends Module Federation - Deployment Guide

## Overview
This guide provides instructions for deploying the Microfrontends Module Federation project to various environments, including staging and production.

---

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- Vercel CLI installed (`npm install -g vercel`)
- Project linked to Vercel

#### Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Link Project**:
   ```bash
   vercel link
   ```

3. **Configure Project**:
   - Set up environment variables in Vercel dashboard
   - Configure build settings
   - Set up domain names

4. **Deploy Applications**:

   **Admin Shell**:
   ```bash
   cd apps/admin-shell
   vercel --prod
   ```

   **Web Shell**:
   ```bash
   cd apps/web-shell
   vercel --prod
   ```

   **Users Remote**:
   ```bash
   cd apps/users-remote
   vercel --prod
   ```

#### Environment Variables

Configure these in Vercel dashboard:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

**Optional (for future use):** `API_BASE_URL` is not used by the current codebase. When you add a real backend for remotes (e.g. users-remote), set `API_BASE_URL` and wire it into your API client; until then, remotes use mock data.

**Production requirements:** In production, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are required; the app will throw at startup if either is missing. Do not rely on fallbacks in production.

**Admin Shell (remote loading):** For the admin shell, set `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS` to a comma-separated list of allowed remote origins (e.g. `https://users.example.com`). Only remotes whose `remoteEntry.js` URL origin is in this list will be loaded. In development, only `localhost` and `127.0.0.1` are allowed by default.

#### CORS (development vs production)

- **Development:** The admin-shell Next config and remote Vite dev servers use permissive CORS (`Access-Control-Allow-Origin: *`) only when `NODE_ENV !== 'production'` so the shell can load remote entry scripts from localhost.
- **Production:** CORS is conditional: the admin shell does not send `*` in production; it uses the first value from `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS` in Next config, and middleware sets `Access-Control-Allow-Origin` to the request origin when it is in the allowlist (for `/config` and `/api`). Remotes (e.g. users-remote) do not set `*` in production; configure CORS for static assets at your host (e.g. Vercel) so only the admin shell origin is allowed if possible.

#### Content-Security-Policy (CSP) for remote script origins

The admin shell sets a Content-Security-Policy header (in [apps/admin-shell/next.config.js](../apps/admin-shell/next.config.js)) so that script and connect sources are restricted. When you add a new remote:

1. **Production:** Set `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS` to a comma-separated list of remote origins (e.g. `https://users.example.com`,`https://orders.example.com`). The CSP is built from this list: `script-src` and `connect-src` include `'self'` and those origins. Do not add wildcards; each remote origin must be explicitly listed so that loading scripts from unknown origins is blocked.
2. **Development:** CSP allows `'unsafe-inline'` and `'unsafe-eval'` for Next.js HMR and Module Federation; this is only applied when `NODE_ENV !== 'production'`.
3. **Adding a new remote:** After deploying a new remote, add its origin (the full base URL of where the remote is served, e.g. `https://my-remote.example.com`) to `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS`. Redeploy the admin shell so the new CSP and CORS allowlist take effect.

#### Custom Domains

1. Add custom domains in Vercel dashboard
2. Configure DNS records with your domain provider
3. Set up SSL certificates (automatic with Vercel)

---

### 2. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Compose
- Server with Docker support

#### Docker Configuration

1. **Create Dockerfile for each application**:

   Example for admin-shell:
   ```dockerfile
   # apps/admin-shell/Dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --frozen-lockfile
   
   COPY . .
   
   RUN pnpm run build
   
   EXPOSE 3000
   
   CMD ["pnpm", "start"]
   ```

2. **Create docker-compose.yml**:

   ```yaml
   version: '3.8'
   
   services:
     admin-shell:
       build: ./apps/admin-shell
       ports:
         - "3000:3000"
       environment:
         - NEXTAUTH_URL=https://your-domain.com
         - NEXTAUTH_SECRET=your-secret-key
         - API_BASE_URL=https://your-api-domain.com
         - NODE_ENV=production
       restart: unless-stopped
     
     web-shell:
       build: ./apps/web-shell
       ports:
         - "3000:3000"
       environment:
         - NEXTAUTH_URL=https://your-domain.com
         - NEXTAUTH_SECRET=your-secret-key
         - API_BASE_URL=https://your-api-domain.com
         - NODE_ENV=production
       restart: unless-stopped
     
     users-remote:
       build: ./apps/users-remote
       ports:
         - "6517:6517"
       environment:
         - NODE_ENV=production
       restart: unless-stopped
   ```

3. **Build and Run**:

   ```bash
   docker-compose build
   docker-compose up -d
   ```

---

### 3. Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster
- kubectl configured
- Helm (optional)

#### Deployment Steps

1. **Create Kubernetes Manifests**:

   Example deployment for admin-shell:
   ```yaml
   # apps/admin-shell/k8s/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: admin-shell
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: admin-shell
     template:
       metadata:
         labels:
           app: admin-shell
       spec:
         containers:
         - name: admin-shell
           image: your-registry/admin-shell:latest
           ports:
           - containerPort: 3000
           env:
           - name: NEXTAUTH_URL
             value: "https://your-domain.com"
           - name: NEXTAUTH_SECRET
             valueFrom:
               secretKeyRef:
                 name: auth-secrets
                 key: nextauth-secret
           - name: API_BASE_URL
             value: "https://your-api-domain.com"
           - name: NODE_ENV
             value: "production"
   ```

2. **Create Service**:

   ```yaml
   # apps/admin-shell/k8s/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: admin-shell
   spec:
     selector:
       app: admin-shell
     ports:
       - protocol: TCP
         port: 80
         targetPort: 3000
     type: LoadBalancer
   ```

3. **Apply Manifests**:

   ```bash
   kubectl apply -f apps/admin-shell/k8s/
   kubectl apply -f apps/web-shell/k8s/
   kubectl apply -f apps/users-remote/k8s/
   ```

---

## Deployment Strategies

### 1. Blue-Green Deployment

1. Deploy new version to staging environment
2. Test thoroughly
3. Switch traffic from old to new version
4. Monitor for issues
5. Rollback if necessary

### 2. Canary Deployment

1. Deploy new version to a small percentage of users
2. Monitor performance and errors
3. Gradually increase traffic to new version
4. Full rollout if successful

### 3. Rolling Deployment

1. Gradually replace old instances with new ones
2. Monitor during the process
3. Rollback if issues detected

---

## Monitoring and Logging

### 1. Logging

- Use structured logging (JSON format)
- Implement log rotation
- Centralize logs using ELK stack or similar

### 2. Monitoring

- Set up health checks
- Monitor response times
- Track error rates
- Monitor resource usage

### 3. Alerting

- Configure alerts for critical errors
- Set up notifications for performance degradation
- Monitor remote module loading failures

---

## Scaling

### Horizontal Scaling

- Use load balancers
- Scale based on traffic
- Implement auto-scaling

### Caching

- Implement CDN caching
- Use browser caching
- Implement server-side caching

### Performance Optimization

- Enable compression
- Optimize images
- Minify assets
- Use lazy loading

---

## Security

### 1. HTTPS

- Enforce HTTPS
- Use HSTS headers
- Keep certificates updated

### 2. Authentication

- Secure authentication endpoints
- Implement rate limiting
- Use strong password policies

### 3. Authorization

- Implement proper RBAC
- Validate permissions
- Secure API endpoints

### 4. Secrets Management

- Use Kubernetes secrets
- Use Vercel environment variables
- Rotate secrets regularly

---

## Backup and Recovery

### 1. Database Backup

- Regular database backups
- Test restore procedures
- Store backups securely

### 2. Disaster Recovery

- Implement failover mechanisms
- Test disaster recovery plans
- Document recovery procedures

---

## CI/CD Pipeline

The repository uses GitHub Actions for CI/CD. The actual workflow is in [.github/workflows/ci-cd.yml](../.github/workflows/ci-cd.yml). It runs on push and pull_request to `main` and `develop`.

**Pipeline summary:**

1. **Setup:** Checkout, Node 20, pnpm 9, install, Turbo cache.
2. **Lint**, **typecheck**, and **test** run in parallel (all workspaces that define these scripts).
3. **Build** runs after lint, typecheck, and test pass; uploads `.next` and `dist` artifacts.
4. **Deploy:** On push to `main` or `develop`, downloads artifacts and runs `vercel deploy --prebuilt` for admin-shell, web-shell, and users-remote (using per-app `VERCEL_*` secrets).

For local setup and required env vars, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## Post-Deployment Checklist

- [ ] Verify all applications are running
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify authentication and authorization
- [ ] Test remote module loading
- [ ] Check API integrations
- [ ] Verify caching is working
- [ ] Test failover procedures

---

## Troubleshooting

### Common Deployment Issues

1. **Module Federation Not Working**:
   - Verify remote URLs in `remote-configs.json` are correct
   - Check CORS settings
   - Ensure all remotes are deployed and accessible
   - Verify CSS URLs are set for production environment

2. **Authentication Failures**:
   - Verify environment variables
   - Check session management
   - Test authentication flow

3. **Performance Issues**:
   - Check server resources
   - Monitor response times
   - Optimize remote loading

4. **Build Failures**:
   - Clear build cache
   - Check dependencies
   - Verify Node.js version

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

For deployment issues, please:
1. Check logs and error messages
2. Review deployment documentation
3. Contact infrastructure team
4. Open a support ticket if needed