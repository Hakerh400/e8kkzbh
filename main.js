'use strict';

const REMOTE = 1;
const VERSION = '2.0.2';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const O = require('omikron');

O.PVC = REMOTE ? '/data'
               : 'D:/Data/e8kkzbh';

const dataProcessor = require('./data-processor');

const FORCE_EXIT = 1;

const DEFAULT_IP = '0.0.0.0';
const DEFAULT_PORT = 8080;
const HTTP_METHOD = 'POST';

const M = VERSION.match(/^\d+/) | 0;

var ready = 0;
var server = null;

setTimeout(main);

function main(){
  aels();

  server = http.createServer(onReq);
  server.listen(DEFAULT_PORT, DEFAULT_IP);

  server.on('error', err => {
    console.log(err);
    setInterval(() => {}, 1e3);
  });
}

function aels(){
  var lines = [];
  var str = '';

  process.stdin.on('data', buf => {
    str = (str + buf).replace(/([\s\S]*?)(?:\r\n|\r|\n)/g, (match, line) => {
      onInput(line);
      return '';
    });
  });
}

function onInput(str){
  var [cmd, ...args] = str.split(' ');
  var arg = args.join(' ');

  switch(cmd){
    case '': break;

    case 'exit': case '.exit': case 'q': case ':q':
      process.stdin.removeListener('data', onInput);
      process.stdin.unref();
      exit();
      break;

    case 'load':
      dataProcessor.load(arg);
      break;

    case 'clear':
      dataProcessor.clear();
      break;

    default:
      log('Unknown command');
      break;
  }
}

async function onReq(req, res){
  req.on('error', console.log);
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
    if(msg instanceof Error)
      msg = msg.toString();
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