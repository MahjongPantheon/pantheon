#!/bin/sh

setup_git() {
  git config --global user.email "actions@github.com"
  git config --global user.name "Automatic build"
}

commit_built() {
  git checkout master
  git add Tyr-dist
  git add Ratatosk-prebuilt
  git commit --message "Auto build: $GITHUB_RUN_NUMBER"
}

upload_files() {
  git remote add origin-pntn https://${GITHUB_ACTOR}:${INPUT_GITHUB_TOKEN}@github.com/MahjongPantheon/pantheon.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-pntn master
}

setup_git
commit_built
upload_files
