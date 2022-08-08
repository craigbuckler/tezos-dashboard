#!/bin/bash

HOME="~/tezos-dashboard"
BACKEND="$HOME/backend"
FRONTEND="$HOME/frontend"

ENV="$BACKEND/.env"

cd $HOME

# update environment variables
export $(grep -v '^#' $ENV | xargs)

# stop PM2 tasks
pm2 stop all && pm2 delete all && pm2 flush && pm2 save --force

# pull latest repo (main branch)
git pull

# backend installation
cd $BACKEND
rm -f tasks.log
npm install

# update database
node --no-warnings ./update.js

# run tasks
pm2 start ./tasks.js

# start Express app in cluster mode
pm2 start ./api.js -i max

# save PM2 state
pm2 save

# frontend installation
cd $FRONTEND
npm install
npm run build

# finish
cd $HOME

echo 'Update complete'
