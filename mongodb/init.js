// Connection: mongodb://tezdashusr:T2Da5hU53rDbPwCEB20220705@localhost:27017/tezdashapi?authSource=tezdashapi

db.createUser({ user: "tezdashusr", pwd: "T2Da5hU53rDbPwCEB20220705", roles: [{ role: "readWrite", db: "tezdashapi" }] });
