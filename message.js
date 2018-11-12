'use strict';

const fs = require('fs');
const path = require('path');

class Message{
  constructor(id, name, msg, date){
    this.id = id;
    this.name = name;
    this.msg = msg;
    this.date = date;

    this.seen = new Set([name]);
  }

  see(name){
    this.seen.add(name);
  }

  serialize(){
    return {
      id: this.id,
      name: this.name,
      msg: this.msg,
      date: this.date,
      seen: Array.from(this.seen),
    };
  }

  toJSON(){ return this.serialize(); }
};

module.exports = Message;