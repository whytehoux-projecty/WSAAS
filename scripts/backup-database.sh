#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="aurumvault-postgres-1"
DB_USER="postgres"
DB_NAME="aurumvault"
FILENAME="backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if Docker container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container $CONTAINER_NAME is not running."
    # Try finding any container with 'postgres' in the name if specific name fails
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep postgres | head -n 1)
    if [ -z "$CONTAINER_NAME" ]; then
        echo "Error: No Postgres container found running."
        exit 1
    fi
    echo "Found running container: $CONTAINER_NAME"
fi

echo "Starting backup of $DB_NAME from $CONTAINER_NAME..."

# Execute dump
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/$FILENAME"
    # Optional: Delete backups older than 7 days
    # find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete
else
    echo "Backup failed!"
    exit 1
fi
