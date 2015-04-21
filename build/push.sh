#! /bin/bash

git remote add azure "https://baminteractive:$STAGING_PASS@manifold-site-staging.scm.azurewebsites.net:443/manifold-site-staging.git" || true
git checkout -b deploy
git push --force azure deploy:master
