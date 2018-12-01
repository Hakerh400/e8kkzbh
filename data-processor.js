'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Message = require('./message');
const O = require('omikron');

const HASH = '0f7cd040e65380fecde5e918012663e3bcdda941b925e8b7f8d61841ecde7466';
const SECRET_KEY = genSecretKey();

const msgsFile = path.join(O.PVC, 'messages.json');

var msgs = [];

load();

module.exports = {
  clear,
  save,
  load,
  process,
};

function clear(){
  fs.writeFileSync(msgsFile, '[]');
  msgs.length = 0;
}

function save(){
  fs.writeFileSync(msgsFile, JSON.stringify(msgs));
}

function load(json=null){
  if(json === null){
    if(!fs.existsSync(msgsFile))
      clear();
    json = fs.readFileSync(msgsFile, 'utf8');
  }

  var arr = [];
  try{ arr = JSON.parse(json); }catch{}

  msgs.length = 0;
  for(var msg of arr){
    msg = Message.deserialize(msg);
    msgs.push(msg);
  }

  save();
}

async function process(data){
  var {type} = data;

  if(getType(type) !== 'string')
    throw `Message type must be a string. Got "${getType(type)}"`;

  switch(data.type){
    case 'ping': return 'ok'; break;
    
    case 'get_secret_key':
      if(sha256(data.hash, 1) !== HASH) throw `Wrong password`;
      return SECRET_KEY;
      break;

    case 'post_msg':
      checkKey();
      var {name, msg} = data;

      if(getType(name) !== 'string' || getType(msg) !== 'string')
        throw 'Parameters "name" and "msg" must be strings';

      var id = msgs.length;
      var date = Date.now() / 1e3 | 0;
      msgs.push(new Message(id, name, msg, date));

      save();

      return id;
      break;

    case 'get_msgs':
      checkKey();
      var {name, id} = data;

      if(!(name === null || typeof name === 'string'))
        throw `Invalid user name`;

      if(getType(id) !== 'number' || id !== (id | 0) || id < 0 || id > msgs.length)
        throw `Parameter "id" must be an integer in range [0, ${msgs.length}]`;

      var newMsgs = msgs.slice(id);
      if(name !== null && name.length !== 0){
        newMsgs.forEach(msg => {
          msg.see(name);
        });
      }

      return newMsgs;
      break;

    default:
      throw `Unknown message type ${JSON.stringify(data.type)}`;
      break;
  }

  function checkKey(){
    var {key} = data;

    if(getType(key) !== 'string')
      throw `Secret key must be a string. Got "${getType(key)}"`;

    if(key !== SECRET_KEY)
      throw `Invalid secret key`;
  }
}

function genSecretKey(){
  return Buffer.from(O.ca(64, () => O.rand(256))).toString('hex');
}

function getType(val){
  if(val === null) return 'null';
  return typeof val;
}

function sha256(buf, stringify=0){
  var hash = crypto.createHash('sha256');
  hash.update(buf);
  var out = hash.digest();
  if(stringify) out = out.toString('hex');
  return out;
}