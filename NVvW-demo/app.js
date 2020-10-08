var http = require('http');
var fs = require('fs');
var url = require('url');

var nodes = ['a','b'];
var neighbors = [];
var nStartNodes = nodes.length;

http.createServer(function (req, res) {
  if (req.url.startsWith("/getdata")) {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
  		"nodes": nodes,
  		"neighbors": neighbors
  	}));
  } else if (req.url.startsWith("/updatedata")) {
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
  } else if (req.url.startsWith("/addnode")) {
	  var data = url.parse(req.url,true).query;
	  if (data.name) {
  		// Add a node:
  		if (nodes.includes(data.name))
  			return res.writeHead(400,{message: "name "+data.name+" already present",errorfield: "name"}).end();
  		if (!nodes.includes(data.neighbor1))
  			return res.writeHead(400,{message: "neighbor1 "+data.neighbor1+" not present",errorfield: "neighbor1"}).end();
  		if (!nodes.includes(data.neighbor2))
  			return res.writeHead(400,{message: "neighbor1 "+data.neighbor2+" not present",errorfield: "neighbor2"}).end();

  		var id = nodes.length;
  		nodes.push(data.name);
  		neighbors.push({
  			"id": id,
  			"name": data.name,
  			"neighbor1": nodes.indexOf(data.neighbor1),
  			"neighbor2": nodes.indexOf(data.neighbor2),
  		});
  		console.log(neighbors);
  		console.log(nodes);
  		return res.end('okay');
	  }
  }
  console.log(req.url)

  fs.readFile('interface.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(8080);
