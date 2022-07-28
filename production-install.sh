#!/bin/bash

ENV="./backend/.env"

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

# backend installation
cd ./backend
npm install

# update database
node --no-warnings ./update.js

# run tasks
pm2 start ./tasks.js

# launch Express app in cluster mode
pm2 start ./api.js -i max

# build frontend files
cd ../frontend
npm install
npm run build
cd ..

# configure NGINX
# cp /etc/nginx/nginx.conf ~/nginx-bak.conf
# sudo cp ./nginx/nginx-live.conf /etc/nginx/nginx.conf
# sudo systemctl reload nginx
