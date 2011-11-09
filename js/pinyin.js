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


var PinyinRules = [
    [ "1", "\u0304" ], 
    [ "2", "\u0301" ], 
    [ "3", "\u030C" ], 
    [ "4", "\u0300" ] 
];

