'use strict';

const http = require('http');
const https = require('https');

class Window{
  constructor(){
    this.document = new Document();
  }
};

class Document{
  constructor(){}
};

setGlobalVars();

module.exports = getFramework;

function setGlobalVars(){
  global.require = (...args) => {
    if(args.length !== 1)
      throw new TypeError('Expected 1 argument');
    
    var arg = args[0];
    if(typeof args[0] !== 'string')
      throw new TypeError('Expected a string');

    if(/[\.\/\\]/.test(arg))
      throw new TypeError('Expected a native module name');

    return require(arg);
  };
}

async function getFramework(remote){
  const FRAMEWORK_URL = remote ? 'https://raw.githubusercontent.com/Hakerh400/browser-projects/master/framework.js'
                               : 'http://localhost/framework.js';

  var data = await get(FRAMEWORK_URL);

  var str = data.toString();
  str = str.split(/\r\n|\r|\n/);
  str[str.length - 1] = 'return O;';
  str = str.join('\n');

  var func = new Function('window', 'document', str);
  var window = new Window();
  var document = window.document;

  var O = func(window, document);
  O.init(0);

  return O;
}

function get(url){
  return new Promise(resolve => {
    var type = url.startsWith('https') ? https : http;
    
    type.get(url, res => {
      var buffs = [];

      res.on('data', buff => buffs.push(buff));
      res.on('end', () => resolve(Buffer.concat(buffs)));
    });
  });
}