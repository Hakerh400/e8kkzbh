'use strict';

var O = null;

(async () => {
  O = await require('./framework.js');
})();

const PORT = process.env.PORT || 5e3;

require('http').createServer((req, res) => {
  if(O === null) return err(req, res);
  res.end(O.sha256('abc').toString('hex'));
}).listen(PORT);

function err(req, res){
  res.end('The server is not ready yet.');
}