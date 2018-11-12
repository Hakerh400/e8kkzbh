'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const REMOTE = 1;
const VERSION = 9;

const FORCE_EXIT = 1;

const DEFAULT_IP = '0.0.0.0';
const DEFAULT_PORT = 8080;

const HTTP_METHOD = 'POST';

var dataProcessor = null;

var ready = 0;

var server = null;

setTimeout(main);

async function main(){
  global.O = null;

  aels();

  server = http.createServer(onReq);
  server.listen(DEFAULT_PORT, DEFAULT_IP);

  server.on('error', err => {
    console.log(err);
    setInterval(() => {}, 1e3);
  });

  global.O = await require('./framework.js')(REMOTE);
  await onLoad();
}

function aels(){
  process.stdin.on('data', onInput);
}

async function onLoad(){
  dataProcessor = require('./data-processor');
  ready = 1;
}

function onInput(buf){
  if(buf.includes(0x03)){
    process.stdin.removeListener('data', onInput);
    process.stdin.unref();
    exit();
  }
}

async function onReq(req, res){
  req.on('error', console.log);

  if(!ready) return err('The server is not ready yet');
  if(req.method !== HTTP_METHOD) return err(`Request's method must be ${HTTP_METHOD}`);

  var data = await getReqData(req);

  try{ var json = JSON.parse(String(data)); }
  catch(error){ return err(error.message); }

  if(typeof json !== 'object') return err('JSON value must be an object');
  if(json === null) return err('JSON value can\'t be null');
  if(json.ver !== VERSION) return err('Version mismatch');

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

async function exit(){
  if(FORCE_EXIT){
    process.exit();
    return;
  }

  if(O === null) return process.exit();
  await O.while(() => server === null);
  server.close();
}