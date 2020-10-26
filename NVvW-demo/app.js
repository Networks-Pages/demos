// --- libraries ---------------------------------------------------------------
const _ = require('underscore');
const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

// --- constants ---------------------------------------------------------------
const ADMIN_PAGE = 'd431ee08-3835-07b8-e139-e8497ce03398-baa1489e-6cc7-d2f9-' +
    '26de-1885e246dae4-ec7669e4-ac07-a63b-0691-15d2be2f2c7b/';
const DEBUG = (process.env.DEBUG === 'true');
const MAX_DEGREE = 5;
const STANDALONE = (process.env.STANDALONE === 'true');
const SURVIVAL_P = 0.5;
const URL_PREFIX = '/network';

// --- globals -----------------------------------------------------------------
const db = require('./db');
const nodes = new Map();
const idx2id = [];
const links = [];

var percolationDone = false;
var percolationResult = null;

// --- functions ---------------------------------------------------------------
function _addnode(req, res) {
  //let ip = req.connection.remoteAddress;
  let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress

  if (percolationResult) {
    return res.writeHead(400, {
      message: "Cannot add nodes anymore, percolation has started.",
      errorfield: "id"
    }).end();
  }

  var data = url.parse(req.url, true).query;
  let ipUnique = true;
  nodes.forEach(function (n) {
    if (n.ip == ip) ipUnique = false;
  });
  if (!ipUnique && !data.id) {
    return res.writeHead(400, {
      message: "You have already added a node to the network.",
      errorfield: "id"
    }).end();
  }
  let newIDi;
  if (!data.id) {
    newIDi = 500+idx2id.length;
  } else {
    newIDi = parseInt(data.id, 10);
  }

  if (data.name) {
    // Check parameters
    const n1Idx = parseInt(data.neighbor1, 10);
    const n2Idx = parseInt(data.neighbor2, 10);
    if (nodes.has(newIDi)) {
      return res.writeHead(400, {
        message: `The id ${newIDi} has already been taken.`,
        errorfield: "id"
      }).end();
    }
    if (isNaN(n1Idx) || n1Idx >= idx2id.length) {
        return res.writeHead(400, {
          message: `neighbor1 ${n1Idx} does not exist`,
          errorfield: "neighbor1"
        }).end();
    }
    n1ID = idx2id[n1Idx];
    if (isNaN(n2Idx) || n2Idx >= idx2id.length) {
        return res.writeHead(400, {
          message: `neighbor2 ${n2Idx} does not exist`,
          errorfield: "neighbor2"
        }).end();
    }
    n2ID = idx2id[n2Idx];
    if (nodes.get(n1ID).degree >= MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor1 ${n1ID} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor1"
        }).end();
    }
    if (nodes.get(n2ID).degree >= MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor2 ${n2ID} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor2"
        }).end();
    }

    // Add node, update metadata
    debug(`adding node ${newIDi} with neighbors ${n1ID} and ${n2ID}`);
    let idx = nodes.size;
    nodes.set(newIDi, {
      name: data.name,
      degree: 2,
      idx: idx,
      ip: ip
    });
    idx2id.push(newIDi);
    db.query(`INSERT INTO nodes VALUES (${newIDi}, '${data.name}','${ip}')`);
    links.push([newIDi,n1ID]);
    db.query(`INSERT INTO links VALUES (${newIDi}, ${n1ID})`);
    links.push([newIDi,n2ID]);
    db.query(`INSERT INTO links VALUES (${newIDi}, ${n2ID})`);
    nodes.get(n1ID).degree++;
    nodes.get(n2ID).degree++;

    return res.end('okay');
  } else {
    return res.writeHead(400, {
      message: "Please provide a name.",
      errorfield: "name"
    }).end();
  }
}

function _getdata(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let returnNodes = [];
  nodes.forEach(n => returnNodes.push({
    id: n.idx,
    name: n.name
  }));
  var data = {
      nodes: returnNodes,
      links: links.map((link) => {
        return {
          source: nodes.get(link[0]).idx,
          target: nodes.get(link[1]).idx
        }
      })
  };
  if (percolationDone) {
    data.percolation = percolationResult;
  }
  return res.end(JSON.stringify(data));
}

function _updatedata(req, res) {
  var data = url.parse(req.url, true).query;
  if (!data.n) {
    return res.writeHead(400, {message: "Missing parameter n."}).end()
  }
  return res.end(JSON.stringify({
    neighbors: Array.from(nodes).slice(data.n).map((nodeInfo) => {
      var [id, node] = nodeInfo,
          neighbors = [];
      for (let link of links) {
        if (link[0] === id) {
          neighbors.push(nodes.get(link[1]).idx);
          if (neighbors.length === 2) {
            break;
          }
        }
      }
      return {
        id: nodes.get(id).idx,
        name: node.name,
        neighbor1: neighbors[0],
        neighbor2: neighbors[1]
      }
    })
  }));
}

function _percolate(req, res) {
  percolationDone = false;
  const node2component = new Map();
  // Assign each node to a component consisting only of itself
  for (const id of nodes.keys()) {
    node2component.set(id, {
      members: [id]
    });
  }
  // (Randomly) decide which links remain and merge connected components of remaining links
  const remainingLinks = _.sample(links, Math.ceil(links.length * SURVIVAL_P));
  debug(remainingLinks);
  let outputLinks = [];
  remainingLinks.forEach(function (link) {
    const [i, j] = link;
    // Merge connected components when necessary.
    if (node2component.get(i) != node2component.get(j)) {
      node2component.get(j).members.forEach(function(m) {
        node2component.set(m,node2component.get(i));
        node2component.get(i).members.push(m);
      });
    }
    outputLinks.push([nodes.get(i).idx,nodes.get(j).idx]);
  });
  // Find the size of the largest component
  let largestComponentSize = 0;
  for (const id of nodes.keys()) {
    if (node2component.get(id).members.length > largestComponentSize) {
      largestComponentSize = node2component.get(id).members.length;
    }
  }
  // We need to find the winners separately in case their are multiple components of equal size.
  let winners = [];
  for (const id of nodes.keys()) {
    if (node2component.get(id).members.length == largestComponentSize) {
      winners.push(nodes.get(id).idx);
    }
  }

  percolationResult = {
    "winners": winners,
    "remainingLinks": outputLinks
  };
  return res.end(JSON.stringify(percolationResult));
}

function _restart() {
  db.query(`SET FOREIGN_KEY_CHECKS = 0;
            TRUNCATE links;
            TRUNCATE nodes;
            SET FOREIGN_KEY_CHECKS = 1`);
  nodes.clear();
  idx2id.length = 0;
  links.length = 0;
  percolationDone = false;
  percolationResult = null;
  db.query("INSERT INTO nodes VALUES (1, 'Dummy A', null), (2, 'Dummy B', null)");
  initFromDB();
}


function close() {
  db.close();
}

function debug() {
  if (DEBUG) {
    console.log.apply(this, arguments);
  }
}

function getNodesArray() {
  return Array.from(nodes).map((nodeInfo,idx) => {
    return {
      id: nodeInfo[0],
      idx: idx,
      name: nodeInfo[1].name
    }
  });
}

function initFromDB() {
  nodes.clear();
  links.length = 0;
  idx2id.length = 0;
  db.query('SELECT * from nodes', function(results) {
    results.forEach((row, idx) => {
      nodes.set(row.id, {
        name: row.name,
        degree: 0,
        idx: idx,
        ip: row.ip_address
      });
      idx2id.push(row.id);
    });
  }, [
    {id: 1, name: 'Dummy A', ip_address: null},
    {id: 2, name: 'Dummy B', ip_address: null}
  ]);
  db.query('SELECT * from links', function(results) {
    results.forEach((row) => {
      links.push([row.id_source, row.id_target]);
      nodes.get(row.id_source).degree++;
      nodes.get(row.id_target).degree++;
    });
  });
}

function open() {
  if (STANDALONE) {
    db.setMock(true);
  }
  db.open(initFromDB);
}

function route(req, res) {
  if (req.url.startsWith(`${URL_PREFIX}/getdata`)) {
    return _getdata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/updatedata`)) {
    return _updatedata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/addnode`)) {
    return _addnode(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/${ADMIN_PAGE}`)) {
    // Admin page
    if (req.url.endsWith('/finishPercolation')) {
      percolationDone = true;
      return res.end('okay');
    } else if (req.url.endsWith('/percolate')) {
      return _percolate(req, res);
    } else if (req.url.endsWith('/restart')) {
      _restart();
      let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress
      return res.end('okay'+ip);
    } else if (req.url.endsWith('/undoPercolation')) {
      percolationDone = false;
      percolationResult = null;
      return res.end('okay');
    }
    fs.readFile(path.resolve(__dirname, './admin.html'), function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  } else {
    fs.readFile(path.resolve(__dirname, './interface.html'), function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  }
}


// --- exports and entry point -------------------------------------------------
module.exports = {
  'close': close,
  'open': open,
  'route': route
};

if (STANDALONE && require.main === module) {
  let port = process.env.PORT;
  open();
  let server = http.createServer(route);
  server.on('close', close);
  process.on('SIGINT', function() {
    server.close();
  });
  server.listen(port);
  debug(`Running on port ${port}`);
}
