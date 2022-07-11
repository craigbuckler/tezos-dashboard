# Connection: mongodb://user:pass@localhost:27017/dbname?authSource=dbname
set -e

mongo <<EOF
use $MONGO_DBNAME;

db.createUser({
  user: '$MONGO_DBUSER',
  pwd: '$MONGO_DBPASS',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_DBNAME' }
  ]}
);
EOF
