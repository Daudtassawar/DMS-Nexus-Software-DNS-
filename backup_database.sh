#!/bin/bash

# Configuration
DB_NAME="DmsDb"
BACKUP_DIR="/var/opt/mssql/backups"
DB_USER="SA"
# Please set the DB_PASSWORD environment variable or hardcode it below for the cron job context
# DB_PASSWORD="Your_Super_Strong_Password_123!" 
DATE=$(date +'%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/dms_database_backup_$DATE.bak"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Perform Backup
echo "Starting backup of $DB_NAME to $BACKUP_FILE..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U "$DB_USER" -P "$DB_PASSWORD" -Q "BACKUP DATABASE [$DB_NAME] TO DISK = N'$BACKUP_FILE' WITH NOFORMAT, NOINIT, NAME = '$DB_NAME-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10" -No

if [ $? -eq 0 ]; then
  echo "Backup successfully created at $BACKUP_FILE"
  
  # Compress Backup
  gzip "$BACKUP_FILE"
  echo "Backup compressed to $BACKUP_FILE.gz"
  
  # Delete older backups
  echo "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -type f -name "dms_database_backup_*.bak.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
  echo "Cleanup complete."
else
  echo "Error creating backup!"
  exit 1
fi
