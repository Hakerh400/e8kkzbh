'use strict';

module.exports = {
  process,
};

var list = [];

async function process(data){
  if(list.length === 10)
    list.length = 0;

  list.push(data);
  
  return list;
}