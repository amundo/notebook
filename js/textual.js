/*

  textual.js - a standalone library for various string-processing utilities
  
  should also work with nodejs. 

  © 2010 Patrick Hall
  pathall@gmail.com

  MIT License

  (for freaky export business, see: http://caolanmcmahon.com/writing_for_node_and_the_browser.html )


*/
(function(exports){

    exports.trim = function(text){
      var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
      return (text || "").replace( rtrim, "" );
    };
    
    exports.extractLines = function(text){
      return trim(text).split(/\n+/);
    };
    
    exports.doublespace = function(text){
      return text.replace(/\n/g, '\n\n');
    };

    exports.squish = function(text){
      // compress all whitespace
      //var text = text.replace(/[\n]/g, ' ');
      //text = text.replace(/[\n ]+/g, ' ');
      //var text = text.replace(/[\n\t ]+/g, '_');
      //return text.replace(/^\s+|\s+$/g, ''); 
      //return text; 
      return text.replace(/\s+/g, ' '); 
    };

    exports.splitSentences = function(text){
      var delimiters = '.?!।。'
        , pattern
        , sentencesAndDelimiters
        , sentence = ''
        , element = ''
        , sentences = [];

      text = exports.squish(text);

      pattern = '([' + delimiters + '] )';
      var delimRE = new RegExp(pattern, 'g');
   
      sentencesAndDelimiters = text.split(delimRE)  ;

      for(var i=0; i < sentencesAndDelimiters.length; i++){
        element = sentencesAndDelimiters[i];
        if(element.match(delimRE)){
          sentence += element;
          sentences.push(sentence);
          sentence = '';
        } else {
          sentence += element;
        }
      }
      if(sentence.length){sentences.push(sentence)};
      return sentences;
      
    };

    exports.JSONsentences = function(text){
      var sentences = exports.splitSentences(text);
      return JSON.stringify(sentences);
    };

    exports.removeBlankLines = function(text){
      var rawlines = text.split('\n'),
          lines = [];
       
      for (var i=0; i<rawlines.length; i++){
        var line = rawlines[i];
        if( exports.trim(line).length > 0 ) { lines.push(line) ; }
      }
      return lines.join('\n');
    };

    exports.depunctuate = function(text){
      /* remove punctuation characters
         @@TODO how to pass in specific punctuation list? 
       */
      return text.replace(/[\.\?\!]/g, ' ');
    };

    exports.letters = function(text){
      /* just returns a list of characters
         @@TODO language-specificity */
      return text.split('');
    };

    exports.frequency = function(sequence){
      // return frequency dictionary of sequence 
      //    frequency('abbccc') => {'a':1,'b':2,'c':3} 
      var count = {};
      for (var i=0; i<sequence.length; i++){
        var elem = sequence[i];
        if ( elem in count ) {
          count[elem] += 1;
        } else {
          count[elem] = 1;
        }
      }
      return count;
    };

    exports.sortByFrequency = function(sequence){
      var fq = this.frequency(sequence), sortable = []; 
      
      for(var k in fq){ sortable.push([k, fq[k]]) } 
      sortable.sort(function(a,b){ return b[1] - a[1] } );
      return sortable;
    }

    exports.bag = function(sequence){
      var seen = []; 
      for (var elem in sequence){
        if (!sequence.hasOwnProperty(elem))
          continue 
        seen.push(elem) 
      }
      return seen; 
    };


    exports.ngrams = function(n, text) {
      var r = [];
      for(var i = 0; i <= text.length - n; i++){
         r.push(text.substring(i, i + n));
      }
      return r;
    };

    exports.bigrams = function(text) { 
      return exports.ngrams(2, text)
    };

    exports.charset = function(text){
      var cs = this.bag( this.frequency( this.letters(text)));
      cs.sort();
      return cs;
    };

    exports.alphabetize = function(sequence, alphabet){
      // alphabet contains the collation order 
      sequence.sort(function(a,b){
        return alphabet.indexOf(a) < alphabet.indexOf(b) ? -1 : 1;
      });
      return sequence;
    };

    exports.dict = function(pairs){
      // like python dict, only works on lists of two-element lists!
      var d = {};
      for(var i=0;i<pairs.length;i++){
        var a = pairs[i][0], b = pairs[i][1];
        d[a] = b;
      } 
      return d;
    };

    exports.extractChunks = function(text){
     return text.split(/\n\n+/)
    };

    exports.countLines = function(chunks){
      return chunks.split(/\n/).length
    };

    exports.hasWord = function(word, text){
      var fq = this.frequency(this.tokenize(text)) ;
      return fq[word] > 0;
    };

    exports.totalLetters = function(text){
      /* not Unicode-savvy */
      return text.length;
    };

    exports.totalWords = function(text){
      return this.tokenize(text).length;
    };

    exports.asciify = function(text){
      return;
    };

    exports.tokenize = function(text){
      return this.trim(this.depunctuate(text)).split(/[ ]+/);
    };

    exports.zip = function(a, b){
      // like python zip
      result = [];
      for(var i=0; i<a.length;i++){
        result.push( [a[i], b[i]] );
      }
      return result;
    }

})(typeof exports === 'undefined'? this['textual']={}: exports);
