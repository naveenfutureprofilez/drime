# Deployment Pipeline Updates for MySQL Migration

## Overview
This document outlines the necessary changes to deployment pipelines following the migration from SQLite to MySQL.

## Required Infrastructure Changes

### 1. Database Provisioning
**Before**: No external database required (SQLite file-based)
**After**: MySQL 8.0+ server required

#### Production Environment
```yaml
# Example Docker Compose addition
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: <secure-root-password>
      MYSQL_DATABASE: bedrive
      MYSQL_USER: bedrive
      MYSQL_PASSWORD: <secure-password>
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Kubernetes Example
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  MYSQL_DATABASE: "bedrive"
  MYSQL_USER: "bedrive"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  template:
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: root-password
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: user-password
        envFrom:
        - configMapRef:
            name: mysql-config
```

### 2. Environment Variable Updates

Update your deployment configuration to include:

```bash
# Required MySQL connection variables
DB_CONNECTION=mysql
DB_HOST=<mysql-host>          # e.g., mysql-service, 127.0.0.1, or RDS endpoint
DB_PORT=3306                  # or custom port
DB_DATABASE=bedrive
DB_USERNAME=bedrive
DB_PASSWORD=<secure-password> # Use secrets management

# Remove old SQLite variables (if any)
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite
```

### 3. Deployment Script Updates

#### Before Deployment
```bash
#!/bin/bash
# OLD: No database setup needed
echo "Deploying with SQLite..."
```

#### After Deployment  
```bash
#!/bin/bash
# NEW: Database migration and health checks
echo "Checking MySQL connection..."
php artisan tinker --execute="DB::connection()->getPdo();"

echo "Running database migrations..."
php artisan migrate --force

echo "Verifying database setup..."
php artisan tinker --execute="echo 'Tables: ' . implode(', ', DB::connection()->getSchemaBuilder()->getTableListing());"
```

### 4. Health Check Updates

Update application health checks to verify MySQL connectivity:

```php
// Add to your health check endpoint
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'healthy', 'database' => 'connected']);
    } catch (Exception $e) {
        return response()->json(['status' => 'unhealthy', 'database' => 'disconnected'], 500);
    }
});
```

### 5. Backup Strategy Updates

#### Before (SQLite)
```bash
# Simple file backup
cp database/database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

#### After (MySQL)
```bash
# Database dump backup
mysqldump -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE > backups/bedrive-$(date +%Y%m%d).sql

# Or using Docker
docker exec mysql mysqldump -u bedrive -pstrong_password bedrive > backups/bedrive-$(date +%Y%m%d).sql
```

## Cloud Provider Specific Updates

### AWS
- **RDS**: Provision MySQL 8.0 RDS instance
- **Environment**: Update ECS/EKS task definitions with new environment variables
- **Secrets**: Store DB credentials in AWS Secrets Manager

### Google Cloud Platform  
- **Cloud SQL**: Create MySQL 8.0 Cloud SQL instance
- **Environment**: Update Cloud Run/GKE deployments
- **Secrets**: Use Secret Manager for credentials

### Azure
- **Azure Database**: Provision Azure Database for MySQL
- **Environment**: Update Container Apps/AKS deployments
- **Secrets**: Use Azure Key Vault

### DigitalOcean
- **Managed Database**: Create MySQL managed database cluster
- **Environment**: Update App Platform or Kubernetes configs
- **Secrets**: Use encrypted environment variables

## Migration Checklist for DevOps Team

### Pre-Migration
- [ ] Provision MySQL database server
- [ ] Create `bedrive` database and user
- [ ] Test database connectivity from application
- [ ] Update deployment scripts
- [ ] Update backup procedures
- [ ] Update monitoring/alerting for MySQL

### During Migration  
- [ ] Deploy updated application code
- [ ] Run database migrations: `php artisan migrate --force`
- [ ] Verify application functionality
- [ ] Test database connectivity and performance

### Post-Migration
- [ ] Monitor application logs and performance
- [ ] Verify backup procedures work
- [ ] Update documentation
- [ ] Train team on new database management procedures
- [ ] Schedule SQLite backup cleanup (after confidence period)

## Rollback Procedure

If issues arise, rollback steps:

1. **Immediate Rollback**:
   ```bash
   # Restore SQLite database
   mv database/database.sqlite.backup database/database.sqlite
   
   # Update environment
   export DB_CONNECTION=sqlite
   export DB_DATABASE=database/database.sqlite
   
   # Restart application
   ```

2. **Update Deployment**: Revert environment variables in deployment configuration

3. **Verify**: Test application functionality with SQLite

## Performance Monitoring

Monitor these key metrics post-migration:
- Database connection pool usage
- Query response times  
- Database CPU and memory usage
- Connection timeouts/failures
- Application response times

## Security Considerations

- Use strong, unique passwords for MySQL
- Enable SSL/TLS for database connections in production
- Restrict database access to application servers only
- Regular security updates for MySQL server
- Monitor for unauthorized access attempts

---

**Next Steps**: Review this document with your DevOps/Infrastructure team and schedule the deployment pipeline updates.
