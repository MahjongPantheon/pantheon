#!/bin/sh

cd ~ || exit
pg_dump -p 5532 mimir > /var/lib/postgresql/backup/mimir.sql
pg_dump -p 5532 frey > /var/lib/postgresql/backup/frey.sql
cd /var/lib/postgresql/backup || exit

git add .
git commit -m "Backup @ `date`"

if [ -z "$BACKUP_GIT_REMOTE" ]; then
  echo "No remote backups are set up"
  exit 1
fi

git push origin main
