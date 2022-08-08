#!/bin/bash

HOME="~/tezos-dashboard"
BACKEND="$HOME/backend"
FRONTEND="$HOME/frontend"
NGINXCONF="$HOME/nginx/nginx-live.conf"
NGINX="/etc/nginx/nginx.conf"

ENV="$BACKEND/.env"

cd $HOME

# log exists?
if [ ! -f $ENV ]; then
  echo "$ENV does not exist - please create it"
  exit 1
fi

# ready to proceed?
echo "Are you sure MongoDB has been installed and configured?"
echo "Are you sure all settings in $ENV are correct?"
read -p "Press Enter to continue..."

# load environment variables
export $(grep -v '^#' $ENV | xargs)

# install PM2
npm install pm2@latest -g

# stop PM2 tasks
pm2 stop all && pm2 delete all && pm2 flush && pm2 save --force

# backend installation
cd $BACKEND
rm -f tasks.log
npm install

# update database
node --no-warnings ./update.js

# run tasks
pm2 start ./tasks.js

# launch Express app in cluster mode
pm2 start ./api.js -i max

# save PM2 state
pm2 save

# build frontend files
cd $FRONTEND
npm install
npm run build
cd ..

# configure NGINX
rm -f ~/nginx-bak.conf
cp $NGINX ~/nginx-bak.conf
sudo cp $NGINXCONF $NGINX
# test with: sudo nginx -t

# restart NGINX
sudo systemctl reload nginx
