# Tezos dashboard

Tezos configurable statistics dashboard.


## Configuration

The following Docker containers are by `docker-compose.yml`:

1. `mongodb`: database (`mongodb:27017`)
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


## Frontend installation

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

## Production AWS EC2 server

<http://18.170.87.208/>

```sh
ssh ubuntu@18.170.87.208
```

[Install MongoDB 5](https://www.cloudbooklet.com/how-to-install-mongodb-on-ubuntu-22-04/)

* database: `tezdashapi`
* username: `tezdashusr`
* password: `T2Da5hU53rDbPwCEB20220705`

```js
use tezdashapi;
db.createUser({ user: "tezdashusr", pwd: "T2Da5hU53rDbPwCEB20220705", roles: [{ role: "readWrite", db: "tezdashapi" }] });

mongosh -u tezdashusr -p T2Da5hU53rDbPwCEB20220705 --authenticationDatabase tezdashapi
```


Connection string:

```
mongodb://tezdashusr:T2Da5hU53rDbPwCEB20220705@localhost:27017/tezdashapi?authSource=tezdashapi
```
