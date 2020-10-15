const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const DEBUG = (process.env.DEBUG === 'true');
const URL_PREFIX = '/network';
const MAX_DEGREE = 5;
const SURVIVAL_P = 0.5;

var id2node = {
  'START_A': {
    'id': 'START_A',
    'name': 'A',
    'neighbors': []
  },
  'START_B': {
    'id': 'START_B',
    'name': 'B',
    'neighbors': []
  }
};
var presentNodes = ['START_A','START_B'];
var nStartNodes = presentNodes.length;

for (var i=0; i<500;i++) {
  id2node[`ID${i}`] = null;
}
var neighbors = [];


function _addnode(req, res) {
  var data = url.parse(req.url, true).query;
  if (data.name && data.id) {
    // Check parameters
    let newID = data.id;
    let n1idx = parseInt(data.neighbor1);
    let n2idx = parseInt(data.neighbor2);
    console.log(`ID: ${newID}, neighbors: ${n1idx},${n2idx}`)
    if (!id2node.hasOwnProperty(newID)) {
      return res.writeHead(400, {
        message: `The id ${newID} is not valid`,
        errorfield: "id"
      }).end();
    }
    if (id2node[newID] != null) {
      return res.writeHead(400, {
        message: `The id ${newID} has already been taken.`,
        errorfield: "id"
      }).end();
    }
    if (n1idx >= presentNodes.length) {
        return res.writeHead(400, {
          message: `neighbor1 ${n1idx} does not exist`,
          errorfield: "neighbor1"
        }).end();
    }
    if (n2idx >= presentNodes.length) {
        return res.writeHead(400, {
          message: `neighbor2 ${n2idx} does not exist`,
          errorfield: "neighbor2"
        }).end();
    }
    let n1ID = presentNodes[n1idx], n2ID = presentNodes[n2idx];
    if (id2node[presentNodes[n1idx]].neighbors.length>=MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor1 ${n1idx} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor1"
        }).end();
    }
    if (id2node[presentNodes[n2idx]].neighbors.length>=MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor2 ${n2idx} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor2"
        }).end();
    }

    // Add node:
    id2node[newID] = {
      'id': newID,
      'name': data.name,
      'neighbors': [n1ID,n2ID]
    }
    neighbors.push({
      'id': presentNodes.length,
      'name': data.name,
      'neighbor1': n1idx,
      'neighbor2': n2idx
    });
    presentNodes.push(newID);
    id2node[n1ID].neighbors.push(newID);
    id2node[n2ID].neighbors.push(newID);
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
  let nodes = [];
  let links = [];
  for (let i = 0; i<presentNodes.length; i++) {
    let node = id2node[presentNodes[i]]
    nodes.push({
      name: node.name,
      id: i
    });
    // Only add nodes with i>j because they are directed in that way
    node.neighbors.forEach(function(nID) {
      let j = presentNodes.indexOf(nID);
      if (j < i) {
        links.push({
          source: i,
          target: j
        });
      }
    });
  }
  return res.end(JSON.stringify({
    "nodes": nodes,
    "links": links
  }));
}

function _updatedata(req, res) {
  var data = url.parse(req.url,true).query;
  if (!data.n) {
    return res.writeHead(400,{message: "Missing parameter n."}).end()
  }
  var newNeighbors = [];
  for (var i=data.n-nStartNodes; i<neighbors.length; i++) {
    newNeighbors.push(neighbors[i]);
  }
  return res.end(JSON.stringify({
    "neighbors": newNeighbors
  }));
}

function _percolate(req,res) {
  let remainingLinks = [];
  let node2component = {};
  // Assign each node to a component consisting only of itself
  for (let i=0; i<presentNodes.length; i++) {
    let node = id2node[presentNodes[i]];
    node2component[i] = {
      members: [i]
    };
  }
  // (Randomly) decide which links remain and merge connected components of remaining links
  for (let i=0; i<presentNodes.length; i++) {
    let node = id2node[presentNodes[i]];
    node.neighbors.forEach(function(nID) {
      let j = presentNodes.indexOf(nID);
      // Direct links as i>j
      if (j<i && Math.random()<SURVIVAL_P) {
        remainingLinks.push({
          source: i,
          target: j
        });
        // Merge connected components when necessary.
        if (node2component[i]!=node2component[j]) {
          node2component[j].members.forEach(function(m){
            node2component[m] = node2component[i];
            node2component[i].members.push(m);
          });
        }
      }
    });
  }
  // Find the size of the largest component
  let largestComponent = 0;
  for (let i=0; i<presentNodes.length; i++) {
    largestComponent = Math.max(node2component[i].members.length, largestComponent);
  }
  // Find nodes which are in components of this size
  let winners = [];
  for (let i=0; i<presentNodes.length; i++) {
    if (node2component[i].members.length == largestComponent) {
      winners.push(i);
    }
  }
  return res.end(JSON.stringify({
    "winners": winners,
    "remainingLinks": remainingLinks
  }));

}

function route(req, res) {
  if (req.url.startsWith(`${URL_PREFIX}/getdata`)) {
    return _getdata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/updatedata`)) {
    return _updatedata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/addnode`)) {
    return _addnode(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/percolate`)) {
    return _percolate(req, res);
  }
  fs.readFile(path.resolve(__dirname, './interface.html'), function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}

module.exports = {
  "route": route
};

if (DEBUG) {
  let port = process.env.PORT;
  http.createServer(route).listen(port);
  console.log(`Running on port ${port}`);
}
