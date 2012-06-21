var Transliterator = function(options){ 
 
  this.rules = options.rules;

  this.sortRules = function(){
    return this.rules.sort(function(a,b){ return b[0].length < a[0].length ? -1 : 1; });
  },

  this.depunctuate = function(text){
    var punc =  ' .!,?',
        puncPAT = '([' + punc + ']+)',
        puncRE = new RegExp(puncPAT);
    
    return text.split(puncRE).join('');
   
  },

  this.convert = function(text){
    this.rules = this.sortRules(this.rules);
  
    for (var i=0; i<this.rules.length; i++){
      var rule = this.rules[i],
          beforeRE = new RegExp(rule[0], 'g'),
          after = rule[1];
  
   
      text = this.depunctuate(text);
      text = text.replace(beforeRE, after);
    };

    return text;
  }
}

var OswaltRules = [
  [
    "^h", 
    "\u02b0"
  ], 
  [
    "H", 
    "\u02b0"
  ], 
  [
    "$", 
    "s\u030c"
  ], 
  [
    "s'", 
    "s\u0313"
  ], 
  [
    "7", 
    "t\u0323"
  ], 
  [
    "?", 
    "\u0294"
  ], 
  [
    "i'", 
    "i\u0301"
  ], 
  [
    "u'", 
    "u\u0301"
  ], 
  [
    "o'", 
    "o\u0301"
  ], 
  [
    "e'", 
    "e\u0301"
  ], 
  [
    "t\u0323'", 
    "t\u0323\u0313"
  ], 
  [
    "t'", 
    "t\u0313"
  ], 
  [
    "q'", 
    "q\u0313"
  ], 
  [
    "c'", 
    "c\u0313"
  ], 
  [
    "k'", 
    "k\u0313"
  ], 
  [
    "p'", 
    "p\u0313"
  ], 
  [
    "q'", 
    "q\u0313"
  ], 
  [
    "a'", 
    "a\u0301"
  ], 
  [
    ":", 
    "\u00b7"
  ], 
  [
    ".-", 
    ".\u0304"
  ], 
  [
    ".^", 
    ".\u0302"
  ], 
  [
    "\u2593", 
    "\u25fb"
  ], 
  [
    "O", 
    "\u00b0"
  ]
]

var PinyinRules = [
    [ "1", "\u0304" ], 
    [ "2", "\u0301" ], 
    [ "3", "\u030C" ], 
    [ "4", "\u0300" ] 
];

