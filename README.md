# Tezos dashboard

Tezos configurable statistics dashboard.


## Configuration

The following Docker containers are by `docker-compose.yml`:

1. `mongodb`: database (`mongodb:27017`)
1. `backend`: update, fetch, and reduce tasks (`backend`)
1. `api`: REST API (`api:3100`)
1. `frontend`: Browsersync live-loading web server (`frontend:3000`)
1. `nginx`: reverse proxy to all services (`nginx:8080`)


## Docker development environment

Launch a development system using Docker:

```sh
docker-compose up
```

Load the dashboard in a browser at <http://localhost:8080/>

Shutdown development system:

```sh
docker-compose down
```


## Backend

Initial installation:

```sh
node ./update.js
```

If not run for some time, load initial database values:

```sh
node ./tasks/fillday.js -retain=28
```

Task runner (run with PM2 or in background):

```sh
node ./tasks.js
```


## REST API

Express server (run with PM2 or in background):

```sh
node ./api.js
```


## Frontend

Initial installation:

```sh
cd frontend
npm i
```

Run in development mode with live reloading:

```sh
npm start
```

Build production-level minified site in `./static` directory:

```sh
npm run build
```
