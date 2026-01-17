#!/bin/bash

# Database Backup Script for AURUM VAULT
# Creates timestamped backups of the PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="aurumvault_backup_${DATE}.sql"
CONTAINER_NAME="aurumvault-db-prod"
DB_USER="${DB_USER:-aurumvault_prod}"
DB_NAME="aurumvault"
RETENTION_DAYS=30

echo -e "${YELLOW}🔄 Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo -e "${YELLOW}📦 Creating backup: ${BACKUP_FILE}${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
FILESIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✅ Backup completed: ${BACKUP_FILE} (${FILESIZE})${NC}"

# Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up backups older than ${RETENTION_DAYS} days...${NC}"
find "$BACKUP_DIR" -name "aurumvault_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/aurumvault_backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Total backups: ${BACKUP_COUNT}${NC}"

# Optional: Upload to cloud storage (uncomment and configure)
# echo -e "${YELLOW}☁️  Uploading to cloud storage...${NC}"
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://your-bucket/backups/
# echo -e "${GREEN}✅ Uploaded to S3${NC}"

echo -e "${GREEN}✅ Backup process completed successfully!${NC}"
