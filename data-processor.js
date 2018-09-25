'use strict';

const crypto = require('crypto');

const HASH = '8e72c6a860e250094dcc3cdab7b4fbaff45653ee47d9976341802c0d4c7f43cf';

var msgs = [];

module.exports = {
  process,
};

async function process(data){
  var {type} = data;

  if(typeof type !== 'string')
    throw `Message type must be a string. Got "${typeof type}"`;

  switch(data.type){
    case 'ping': return 'ok'; break;
    case 'check_hash': return data.hash === HASH; break;

    case 'post_msg':
      var {name, msg} = data;
      if(typeof name !== 'string' || typeof msg !== 'string')
        throw 'Parameters "name" and "msg" must be strings';

      var id = msgs.length;
      var date = Date.now();
      msgs.push({id, name, msg, date});

      return id;
      break;

    case 'get_msgs':
      var {id} = data;
      if(typeof id !== 'number' || id !== (id | 0) || id < 0 || id > msgs.length)
        throw `Parameter "id" must be an integer in range [0, ${msgs.length}]`;
      return msgs.slice(id);
      break;

    default:
      throw `Unknown message type ${JSON.stringify(data.type)}`;
      break;
  }
}