'use strict';

const REMOTE = 1;
const VERSION = 8;

const http = require('http');
const https = require('https');
const dataProcessor = require('./data-processor');

const DEFAULT_PORT = 80;

var server = null;
var port = null;

setTimeout(main);

async function main(){
  global.O = null;

  server = http.createServer(onReq);

  port = process.env.PORT || DEFAULT_PORT;
  server.listen(port);

  server.on('error', console.log);

  global.O = await require('./framework.js')(REMOTE);
}

async function onReq(req, res){
  req.on('error', console.log);

  if(O === null) return err('The server is not ready yet');
  if(req.method !== 'POST') return err('Request\'s method must be POST');

  var data = await getReqData(req);

  try{ var json = JSON.parse(String(data)); }
  catch(error){ return err(error.message); }

  if(typeof json !== 'object') return err('JSON value most be an object');
  if(json === null) return err('JSON value can\'t be null');
  if(json.v !== VERSION) return err('Version mismatch');

  dataProcessor.process(json)
    .then(send)
    .catch(err);

  function err(msg){
    send(msg, 0);
  }

  function send(data, ok=1){
    var obj;
    if(ok) obj = {data, err: null};
    else obj = {data: null, err: data};

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(obj));
  }
}

function getReqData(req){
  return new Promise(res => {
    var buffs = [];

    req.on('data', buff => buffs.push(buff));
    req.on('end', () => res(Buffer.concat(buffs)));
  });
}