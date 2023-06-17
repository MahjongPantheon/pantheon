#!/bin/sh

cd ~ || exit
rm -rf ~/backup/frey ~/backup/mimir
pg_dump -p5532 --clean -Z0 -Fd frey -f ~/backup/frey
pg_dump -p5532 --clean -Z0 -Fd mimir -f ~/backup/mimir
cd /var/lib/postgresql/backup || exit

git add .
git commit -m "Backup @ `date`"

if [ -z "$BACKUP_GIT_REMOTE" ]; then
  echo "No remote backups are set up"
  exit 1
fi

git push origin main
