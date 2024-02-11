#!/bin/bash

cd ~ || exit
rm -rf ~/backup/frey ~/backup/mimir
pg_dump --clean -Z0 -Fd frey -f ~/backup/frey
pg_dump --clean -Z0 -Fd mimir -f ~/backup/mimir
pg_dump --clean -Z0 -Fd hugin -f ~/backup/hugin
cd /var/lib/postgresql/backup || exit

tar -c --lzma -f frey.tar.xz frey
rm -rf frey
tar -c --lzma -f mimir.tar.xz mimir
rm -rf mimir
tar -c --lzma -f hugin.tar.xz hugin
rm -rf hugin

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
  echo -e "Pantheon backup has failed. Here is what git said: \n\n" > ~/message.txt
  cat ~/gitpush.log >> ~/message.txt
  mail -s "[CRITICAL] Pantheon backup failed" $ADMIN_EMAIL < ~/message.txt
fi
