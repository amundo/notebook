var PinyinTransliterator = { 
 
  rules : [
    [ "1", "\u0304" ], 
    [ "2", "\u0301" ], 
    [ "3", "\u030C" ], 
    [ "4", "\u0300" ] 

  ],

  sortRules : function(rules){
    return this.rules.sort(function(a,b){ return b[0].length < a[0].length ? -1 : 1; });
  },

  convert : function(text){
    this.rules = this.sortRules(this.rules);
  
    for (var i=0; i<this.rules.length; i++){
      var rule = this.rules[i],
          beforeRE = new RegExp(rule[0], 'g'),
          after = rule[1];
  
      text = text.replace(beforeRE, after);
  
    };
    return text;
  }

}

 
