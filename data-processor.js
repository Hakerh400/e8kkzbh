'use strict';

const crypto = require('crypto');

module.exports = {
  process,
};

async function process(data){
  switch(data.type){
    case 'check_hash':
      return data.hash === '8e72c6a860e250094dcc3cdab7b4fbaff45653ee47d9976341802c0d4c7f43cf';
      break;
  }
}