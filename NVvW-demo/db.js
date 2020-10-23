const mysql = require('mysql');


const db = {
  active: false,
  
  close: function() {
    if (db.active) {
      db.active = false;
      db.conn.end();
    }
  },
  
  open: function(then = null) {
    if (!db.active) {
      db.conn = mysql.createConnection({
        host: 'localhost',
        database: 'tcasterm_networks',
        user: 'networks',
        password: 'G6ca#z70'
      });
      db.conn.connect(function(err) {
        if (err) {
          console.error('Error connecting: ' + err.stack);
        } else {
          db.active = true;
          if (then !== null && typeof then === 'function') {
            then();
          }
        }
      });
    }
  },
  
  query: function(query, callback = null) {
    if (!db.active) {
      throw 'DB not connected';
    }
    db.conn.query(query, function(error, results, fields) {
      if (error) {
          throw error;
      }
      if (typeof callback === 'function') {
        callback(results, fields);
      }
    });
  }
};


module.exports = db;
