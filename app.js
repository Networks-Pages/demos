const { spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const network = require('./demos/NVvW-demo/app');

http.createServer(function(request, response) {
  let staticPath = `${__dirname}/..${request.url}`;
  if (request.url !== '/' && fs.existsSync(staticPath)) {
    let stats = fs.statSync(staticPath);
    if (stats.isDirectory()) {
      staticPath += '/index.html';
    }
    fs.readFile(staticPath, function (err, data) {
      response.writeHead(200);
      response.end(data);
    });
    return;
  }

  if (request.url !== '/network') {
    const reqUrlPhp = request.url.substr(0, request.url.length - 1);
    const child = spawnSync('env', ['-i', `HTTP_HOST=${request.headers.host}`,
        `REQUEST_URI=${reqUrlPhp}`, '/opt/alt/php74/usr/bin/php-cgi',
        '../php/index.php']);
    const phpOut = child.stdout.toString();
    const resMatch = /\r?\n\r?\n/.exec(phpOut);
    const headers_str = phpOut.substr(0, resMatch.index);
    const headers = {};
    const body = phpOut.substr(resMatch.index);
    for (let line of headers_str.split(/[\r\n]+/)) {
      let s = line.split(/: /);
      headers[s[0]] = s[1];
    }
    response.writeHead(200, headers);
    response.end(body);
  } else if (req.url.startsWith('/network')) {
    return network.redirect(request,response);
  }
}).listen(process.env.PORT);

console.log('App is running...');
