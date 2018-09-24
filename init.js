(function(){
  'use strict';

  window.VIRTUAL_URL_BASE = 'https://hakerh400.github.io/';
  window.VIRTUAL_URL = window.VIRTUAL_URL_BASE + '?project=other-projects&sub-project=grid';

  window.addEventListener('load', function(){
    var O = {
      doc: document,
      body: document.body,

      init: function(){
        var noscript = document.querySelector('noscript');

        try{
          new Function('1**1');
        }catch(err){
          var html = noscript.innerHTML.split(/\r\n|\r|\n/);
          html = html.map(function(a){ return a.trim(); });
          html = html.filter(function(a){ return a.length; });
          var msg = html[html.length - 1];
          O.fatalError(msg);
          return;
        }

        noscript.remove();

        O.rf(window.VIRTUAL_URL_BASE + 'framework.js', function(status, script){
          if(status != 200) return O.fatalError('Cannot load framework script. Try clearing cache or restarting your browser.');
          new Function(script)();
        });
      },

      fatalError: function(msg){
        var h1 = O.doc.createElement('h1');
        var t = O.doc.createTextNode('Fatal Error');
        O.body.appendChild(h1);
        h1.appendChild(t);
        t = O.doc.createTextNode(msg);
        O.body.appendChild(t);
      },

      urlTime: function(url){
        var char = url.indexOf('?') != -1 ? '&' : '?';
        return '' + url + char + '_=' + Date.now();
      },

      rf: function(file, cb){
        var xhr = new window.XMLHttpRequest();
        xhr.onreadystatechange = function(){
          if(xhr.readyState == 4){
            cb(xhr.status, xhr.responseText);
          }
        };
        xhr.open('GET', O.urlTime(file));
        xhr.send();
      },
    };

    O.init();
  });
})()