# Tezos dashboard

Tezos configurable statistics dashboard.


## Production environment configuration

Create a `.env` in `backend` with settings (replace `<NAME>` accordingly):

```ini
# configuration
NODE_ENV=production

# database credentials
MONGO_DBHOST=localhost
MONGO_DBPORT=27017
MONGO_DBNAME=<DBNAME>
MONGO_DBUSER=<DBUSER>
MONGO_DBPASS=<DBASS>

# API
API_PORT=3100
API_URL=http://<HOST>/api/
```

Then set:

```sh
export $(grep -v '^#' .env | xargs)
```

(Can unset with `unset $(grep -v '^#' .env | sed -E 's/(.*)=.*/\1/' | xargs)`)

Follow the steps in `production-install.sh`.


## Development environment configuration

Create a `.env` in the **project root** with settings (replace `<NAME>` accordingly):

```ini
# configuration
NODE_ENV=development

# database credentials
MONGO_DBHOST=mongodb
MONGO_DBPORT=27017
MONGO_DBNAME=<DBNAME>
MONGO_DBUSER=<DBUSER>
MONGO_DBPASS=<DBASS>

# API
API_PORT=3100
API_URL=http://localhost:8080/api/
```


### Docker start

The following Docker containers are started by `docker-compose.yml`:

1. `mongodb`: database (`mongodb:27017`)
1. `backend`: update, fetch, and reduce tasks (`backend`)
1. `api`: REST API (`api:3100`)
1. `frontend`: Browsersync live-loading web server (`frontend:3000`)
1. `nginx`: reverse proxy to all services (`nginx:8080`)

Launch a development system using Docker:

```sh
docker-compose up
```

Load the dashboard in a browser at <http://localhost:8080/>

Shutdown development system:

```sh
docker-compose down
```


### MongoDB Database

Connect to container: `docker exec -it mongodb sh`

The database is initiated with a new user in the script at `mongodb/init.sh` using the credentials defined in `.env` in the project root. DB failures usually indicate the file has failed to run; it may be necessary to stop Docker, delete the volumes, and restart. If necessary, enable MongoDB logging by removing the `driver: "none"` entry in `docker-compose.yml`.


### Backend

Connect to container: `docker exec -it backend sh`

Runs with `npm run debug` or `npm run start` (debug deletes the `tasks.log` file).

Initial installation and database updates:

```sh
node ./update.js
```

Task runner (run with PM2 or in background):

```sh
node ./tasks.js
```


### REST API

Runs with `npm run debugapi` or `npm run startapi` (debug enabled V8 inspector).

Express server (run with PM2 or in background):

```sh
node ./api.js
```


### Frontend

Connect to container: `docker exec -it frontend sh`

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
