#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_built_tyr() {
  git checkout master
  git add Tyr-prebuilt
  git commit --message "[TYR] Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-pntn https://${GH_TOKEN}@github.com/MahjongPantheon/pantheon.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-pntn master
}

setup_git
commit_built_tyr
upload_files
