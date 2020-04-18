'use strict';

import Mongoose from 'mongoose';
import Parameters from './../constants/settings.constants';

let host = process.env.NODE_ENV == 'production' ? Parameters.database.proHost : Parameters.database.devHost;

const options = {
    server: {
        auto_reconnect: true,
        poolSize: 10
    },
    user: Parameters.database.username,
    pass: Parameters.database.password
};

Mongoose.connect('mongodb://' + host + ':' +  Parameters.database.port + '/' + Parameters.database.db,
  options, function(err, res) {
      if (err) {
          console.log(err);
      }
  });


let db = Mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection Failed!'));
db.once('open', () => {
    console.log('DB Connection Success!');
});

export default db;
