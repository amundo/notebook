/*

  language.js - representations of languages

*/

var Language = Backbone.Model.extend({

  defaults :  {
    code : 'unknown',
    tokenPATTERN : '([ \\?\\.\!]+)',
    scheme : [ ],
  },

  initialize: function(options){
    _.bindAll(this, 'transliterate');
    this.set(options);
  },

  transliterate : function(text){
    var scheme = this.get('scheme');
    _.each(scheme, function(pair){
      var before =  pair[0];
      var after =  pair[1];
      text = text.replace(before, after, 'g');
    });

    return text;
  }, 

  tokenize : function(text, options){
    text = this.transliterate(text);
    var tokenRE = new RegExp( this.get('tokenPATTERN') , 'g' );
    var tokens = text.split(tokenRE);

    /* factor this into an isWhitespace method */
    return _.reject(tokens, function(e){ return e.match(/^[ ]*$/) } );
  }
   
});

var Languages = Backbone.Collection.extend({
 
  model : Language,

  initialize : function(options){
    _.bindAll(this, 'byCode');
  },

  byCode : function(code){
    this.find(function(lg){
console.log(code);
      return lg.get('code') == code;
    })
  }

});

var LanguagesView = Backbone.View.extend({

  template : _.template('<li><%= name.en %></li>'),
  

});

var kashaya = {

  code : 'kju',

  name : {
    'en' : 'Kashaya Pomo'
  },
  tokenPATTERN : '([ \?])',

  scheme : [
      [ "^h", "\u02b0" ], 
      [ "$", "s\u030c" ], 
      [ "s'", "s\u0313" ], 
      [ "7", "t\u0323" ], 
      [ "?", "\u0294" ], 
      [ "i'", "i\u0301" ], 
      [ "u'", "u\u0301" ], 
      [ "o'", "o\u0301" ], 
      [ "e'", "e\u0301" ], 
      [ "t\u0323'", "t\u0323\u0313" ], 
      [ "t'", "t\u0313" ], 
      [ "q'", "q\u0313" ], 
      [ "c'", "c\u0313" ], 
      [ "k'", "k\u0313" ], 
      [ "p'", "p\u0313" ], 
      [ "q'", "q\u0313" ], 
      [ "a'", "a\u0301" ], 
      [ ":", "\u00b7" ], 
      [ ".-", ".\u0304" ], 
      [ ".^", ".\u0302" ], 
      [ "\u2593", "\u25fb" ], 
      [ "O", "\u00b0" ]
  ],

};

var chinese = {

  code : 'cmn',

  name : {
    'en' : 'Mandarin'
  },

    tokenPATTERN : '([ \\?\\.\!]+)',

  scheme : [
    [ "1", "\u0304" ], 
    [ "2", "\u0301" ], 
    [ "3", "\u030C" ], 
    [ "4", "\u0300" ] 
  ],

};

//window.language  = new Languages([chinese]);
window.languages  = new Languages([kashaya, chinese]);

