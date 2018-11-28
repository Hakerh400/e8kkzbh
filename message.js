'use strict';

const fs = require('fs');
const path = require('path');
const O = require('omikron');

class Message{
  constructor(id, name, msg, date, seen=[name]){
    this.id = id;
    this.name = name;
    this.msg = msg;
    this.date = date;

    this.seen = new Set(seen);
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

  static deserialize(msg){
    var {id, name, msg, date, seen} = msg;
    return new Message(id, name, msg, date, seen);
  }

  toJSON(){ return this.serialize(); }
};

module.exports = Message;