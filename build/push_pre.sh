#! /bin/bash

rm -rf .git
ember build -e preproduction
cp ./web.pre.config ./dist/web.config
cp -r ./bin ./dist/bin
cd ./dist
git init
git config user.email "interactive@bamideas.com"
git config user.name "BaM Interactive"
git remote add azure "https://baminteractive:$STAGING_PASS@manifold-site-pre.scm.azurewebsites.net:443/manifold-site-pre.git" || true
git checkout -b deploy
git add -A
git commit -am "Deployment $(date +%s)"
git push --force azure deploy:master
