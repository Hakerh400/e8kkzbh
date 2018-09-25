'use strict';

const crypto = require('crypto');

const HASH = '8e72c6a860e250094dcc3cdab7b4fbaff45653ee47d9976341802c0d4c7f43cf';

module.exports = {
  process,
};

async function process(data){
  switch(data.type){
    case 'ping': return 'ok'; break;
    case 'check_hash': return data.hash === HASH; break;
  }
}