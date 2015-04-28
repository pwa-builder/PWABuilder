#! /bin/bash

rm -rf .git
ember build -prod
cp ./web.config ./dist
cd ./dist
git init
git config user.email "interactive@bamideas.com"
git config user.name "BaM Interactive"
git remote add azure "https://baminteractive:$STAGING_PASS@manifold-site-prod.scm.azurewebsites.net:443/manifold-site-prod.git" || true
git checkout -b deploy
git add -A
git commit -am "Deployment $(date +%s)"
git push --force azure deploy:master
