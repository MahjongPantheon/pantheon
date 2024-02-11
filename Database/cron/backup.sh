#!/bin/bash

cd ~ || exit
rm -rf ~/backup/frey ~/backup/mimir ~/backup/hugin
pg_dump --clean -Z0 -Fd frey -f ~/backup/frey
pg_dump --clean -Z0 -Fd mimir -f ~/backup/mimir
pg_dump --clean -Z0 -Fd hugin -f ~/backup/hugin
cd /var/lib/postgresql/backup || exit

cd frey && ls | xargs lzma && cd ..
cd mimir && ls | xargs lzma && cd ..
cd hugin && ls | xargs lzma && cd ..

git add .
git commit -m "Backup @ `date`"

if [ -z "$BACKUP_GIT_REMOTE" ]; then
  echo "No remote backups are set up"
  exit 1
else
  git remote set-url origin $BACKUP_GIT_REMOTE
fi

git push origin main 2>~/gitpush.log
if [ $? -eq 0 ]; then
  echo "Success"
else
  echo "Backup failed!"
  php /var/lib/postgresql/ErrMailer.php
fi
