const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const DEBUG = ((typeof process.env.DEBUG === 'undefined') || (process.env.DEBUG === 'true'));
const URL_PREFIX = '/network';
var MAX_DEGREE = 5;

var nodes = ['a','b'];
var degrees = {};
nodes.forEach(n => degrees[n] = 0);
var neighbors = [];


function _addnode(req, res) {
  var data = url.parse(req.url, true).query;
  if (data.name) {
    // Add a node:
    if (nodes.includes(data.name)) {
        return res.writeHead(400, {
          message: `name ${data.name} already present`,
          errorfield: "name"
        }).end();
    }
    if (!nodes.includes(data.neighbor1)) {
        return res.writeHead(400, {
          message: `neighbor1 ${data.neighbor1} not present`,
          errorfield: "neighbor1"
        }).end();
    }
    if (!nodes.includes(data.neighbor2)>=MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor1 ${data.neighbor2} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor2"
        }).end();
    }
    if (degrees[data.neighbor1]>=MAX_DEGREE) {
        return res.writeHead(400, {
          message: `neighbor1 ${data.neighbor1} already has ${MAX_DEGREE} connections`,
          errorfield: "neighbor1"
        }).end();
    }

    const id = nodes.length;
    nodes.push(data.name);
    neighbors.push({
        "id": id,
        "name": data.name,
        "neighbor1": nodes.indexOf(data.neighbor1),
        "neighbor2": nodes.indexOf(data.neighbor2),
    });
    degrees[id] = 2;
    degrees[data.neighbor1]++;
    degrees[data.neighbor2]++;
    return res.end('okay');
  }
}

function _getdata(req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    "nodes": nodes,
    "neighbors": neighbors
  }));
}

function _updatedata(req, res) {
  var data = url.parse(req.url,true).query;
  if (!data.n) {
    return res.writeHead(400,{message: "Missing parameter n."}).end()
  }
  var newNodes = [];
  var newNeighbors = [];
  for (var i=data.n; i<nodes.length; i++) {
    newNeighbors.push(neighbors[i-2])
    newNodes.push(nodes[neighbors[i-2].id])
  }
  return res.end(JSON.stringify({
    "nodes": newNodes,
    "neighbors": newNeighbors
  }));
}


function route(req, res) {
  if (req.url.startsWith(`${URL_PREFIX}/getdata`)) {
    return _getdata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/updatedata`)) {
    return _updatedata(req, res);
  } else if (req.url.startsWith(`${URL_PREFIX}/addnode`)) {
    return _addnode(req, res);
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
  let port = process.env.PORT || 8080;
  http.createServer(route).listen(port);
  console.log(`Running on port ${port}`);
}
