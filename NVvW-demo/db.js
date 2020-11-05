const mysql = require('mysql');


const dbParams = {
  /**
   * Whether the connection to the database and all queries should be mocked. If
   * true, no connection to a database will be made and no queries will be
   * executed. Queries will return no results, except when a mock result is
   * specified explicitly (see #query).
   */
  mock: false
};
const db = {
  active: false,

  close: function() {
    if (!dbParams.mock && db.active) {
      db.active = false;
      db.conn.end();
    }
  },

  isMocked: function() {
    return dbParams.mock;
  },

  open: function(then = null) {
    if (dbParams.mock) {
      if (then !== null && typeof then === 'function') {
        then();
      }
    } else if (!db.active) {
      db.conn = mysql.createConnection({
        host: 'localhost',
        database: 'tcasterm_networks',
        user: 'networks',
        password: 'G6ca#z70',
        multipleStatements: true
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

  setMock: function(mock) {
    if (mock !== true) {
      db.close(); // ensure the database is closed if it is open now
    }
    dbParams.mock = (mock === true);
  },

  query: function(query, callback = null, mockResult = []) {
    if (dbParams.mock) {
      if (typeof callback === 'function') {
        callback(mockResult, null);
      }
      return;
    }

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
