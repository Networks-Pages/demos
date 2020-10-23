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
const URL_PREFIX = '/network';
const MAX_DEGREE = 5;
const SURVIVAL_P = 0.5;

// --- globals -----------------------------------------------------------------
const db = require('./db');
const nodes = new Map();
const links = [];

var percolationDone = false;
var percolationResult = null;


// --- functions ---------------------------------------------------------------
function _addnode(req, res) {
  if (percolationResult) {
    return res.writeHead(400, {
      message: "Cannot add nodes anymore, percolation has started.",
      errorfield: "id"
    }).end();
  }

  var data = url.parse(req.url, true).query;
  if (data.name && data.id) {
    // Check parameters
    const newID = data.id;
    const n1ID = parseInt(data.neighbor1, 10);
    const n2ID = parseInt(data.neighbor2, 10);
    var idMatch, newIDi;
    debug(`ID: ${newID}, neighbors: ${n1ID},${n2ID}`);
    
    if ((idMatch = newID.match(/^ID(\d+)$/)) === null) {
      return res.writeHead(400, {
        message: `The id ${newID} is not valid`,
        errorfield: "id"
      }).end();
    } else {
      newIDi = parseInt(idMatch[1], 10);
    }
    if (nodes.has(newIDi)) {
      return res.writeHead(400, {
        message: `The id ${newID} has already been taken.`,
        errorfield: "id"
      }).end();
    }
    if (!nodes.has(n1ID)) {
        return res.writeHead(400, {
          message: `neighbor1 ${n1ID} does not exist`,
          errorfield: "neighbor1"
        }).end();
    }
    if (!nodes.has(n2ID)) {
        return res.writeHead(400, {
          message: `neighbor2 ${n2ID} does not exist`,
          errorfield: "neighbor2"
        }).end();
    }
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
    nodes.set(newIDi, {
      name: data.name,
      degree: 2
    });
    links.push([n1ID, newIDi]);
    links.push([n2ID, newIDi]);
    nodes.get(n1ID).degree++;
    nodes.get(n2ID).degree++;
    
    return res.end('okay');
  } else {
    return res.writeHead(400, {
      message: "Please provide a name and an ID.",
      errorfield: "name"
    }).end();
  }
}

function _getdata(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const nodesArray = getNodesArray();
  var data = {
      nodes: nodesArray,
      links: links.map((link) => {
        return {
          source: nodesArray.findIndex(n => (n.id === link[0])),
          target: nodesArray.findIndex(n => (n.id === link[1]))
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
  const nodesArray = getNodesArray();
  return res.end(JSON.stringify({
    neighbors: Array.from(nodes).slice(data.n).map((nodeInfo) => {
      var [id, node] = nodeInfo,
          neighbors = [];
      for (let link of links) {
        if (link[1] === id) {
          neighbors.push(nodesArray.findIndex(n => (n.id === link[0])));
          if (neighbors.length === 2) {
            break;
          }
        }
      }
      return {
        id: nodesArray.findIndex(n => (n.id === id)),
        name: node.name,
        neighbor1: neighbors[0],
        neighbor2: neighbors[1]
      }
    })
  }));
}

function _percolate(req, res) {
  percolationDone = false;
  const node2component = {};
  // Assign each node to a component consisting only of itself
  for (const id of nodes.keys()) {
    node2component[id] = {
      members: [id]
    };
  }
  // (Randomly) decide which links remain and merge connected components of remaining links
  const remainingLinks = _.sample(links, Math.ceil(links.length * SURVIVAL_P));
  for (const link in remainingLinks) {
    const [i, j] = link;
    // Merge connected components when necessary.
    if (node2component[i] != node2component[j]) {
      node2component[j].members.forEach(function(m) {
        node2component[m] = node2component[i];
        node2component[i].members.push(m);
      });
    }
  }
  // Find the size of the largest component
  let largestComponentId = null, largestComponentSize = 0;
  for (const id of nodes.keys()) {
    if (node2component[id].members.length > largestComponentSize) {
      largestComponentSize = node2component[id].members.length;
      largestComponentId = id;
    }
  }

  percolationResult = {
    "winners": node2component[largestComponentId].members,
    "remainingLinks": remainingLinks
  };
  return res.end(JSON.stringify(percolationResult));
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
  return Array.from(nodes).map((nodeInfo) => {
    return {
      id: nodeInfo[0],
      name: nodeInfo[1].name
    }
  });
}

function open() {
  db.open(() => {
    db.query('SELECT * from nodes', function(results) {
      results.forEach((row) => {
        nodes.set(row.id, {
          name: row.name,
          degree: 0
        });
      });
    });
    db.query('SELECT * from links', function(results) {
      results.forEach((row) => {
        links.push([row.id_source, row.id_target]);
        nodes.get(row.id_source).degree++;
        nodes.get(row.id_target).degree++;
      });
    });
  });
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

if (DEBUG && require.main === module) {
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
