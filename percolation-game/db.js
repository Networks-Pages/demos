const mysql = require('mysql');

const logger = require('./logging');


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
        database: process.env.DB_USE,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        multipleStatements: true
      });
      db.conn.connect(function(err) {
        if (err) {
          logger.error('Error connecting: ' + err.stack);
        } else {
          db.active = true;
          logger.debug(`connected to database ${process.env.DB_USE}`);
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

  query: function(query, options = {}) {
    const opts = {
      callback: null,
      mockResult: [],
      vars: null
    };
    Object.assign(opts, options);

    if (dbParams.mock) {
      if (typeof opts.callback === 'function') {
        opts.callback(opts.mockResult, null);
      }
      return;
    }

    if (!db.active) {
      throw 'DB not connected';
    }
    if (opts.vars !== null) {
      query = mysql.format(query, opts.vars);
    }
    logger.debug('executing query', {query: query});
    db.conn.query(query, function(error, results, fields) {
      if (error) {
        logger.error('error executing query', {error: error});
        throw error;
      }
      logger.debug('query results', {results: results});
      if (typeof opts.callback === 'function') {
        opts.callback(results, fields);
      }
    });
  }
};


module.exports = db;
