$(function(){

  window.key = localStorage.notebook;
  /*window.data = JSON.parse(localStorage['notebook-' + window.key]);*/

  window.data  = [
    {
        "sentence": "Ni xi\u01ceng y\u00e0o chi sh\u00e9nme?", 
        "translation": "What do you want to eat? "
    }, 
    {
        "sentence": "w\u01d2 xi\u01ceng y\u00e0o xu\u00e9 P\u01d4t\u014dnghu\u00e0.", 
        "translation": "I want to learn Putonghua."
    }, 
    {
        "sentence": "w\u01d2 shu\u01d2 de du\u00ec m\u0101?", 
        "translation": "Did I say it correctly?"
    }, 
    {
        "sentence": "zh\u00e8 sh\u00ec sh\u00e9nme?", 
        "translation": "What is this?"
    }, 
    {
        "sentence": "N\u01d0 n\u00e9ng za\u00ec shu\u01d2 bi\u00e0n m\u00e1?", 
        "translation": "Please say that again."
    }, 
    {
        "sentence": "N\u00ed ji\u00e0o sh\u00e9nme m\u00edng z\u00ec?", 
        "translation": "What is your name? Como te llamas?"
    }, 
    {
        "sentence": "w\u01d2 de m\u00edng z\u00ec shi Patrick.", 
        "translation": "My name is Patrick."
    }, 
    {
        "sentence": "n\u01d0 de m\u00edng z\u00ec", 
        "translation": "your name"
    }, 
    {
        "sentence": "de ho er jian ", 
        "translation": "See you later. "
    }, 
    {
        "sentence": "w\u01d2 x\u01d0 hu\u0101n k\u0101f\u0113i.", 
        "translation": "I like coffee."
    }, 
    {
        "sentence": "w\u01d2 b\u00f9 x\u01d0 hu\u0101n ch\u00e1.", 
        "translation": "I don't like tea."
    }, 
    {
        "sentence": "b\u00f9 h\u01ceo y\u00ec s\u012b w\u01d2 b\u00f9 x\u01d0 hu\u0101n ch\u00e1.", 
        "translation": "Excuse me, but I don't like tea."
    }, 
    {
        "sentence": "k\u00e0n sh\u016b", 
        "translation": "see book (read for pleasure)"
    }, 
    {
        "sentence": "d\u00fa sh\u016b", 
        "translation": "read (study book)"
    }, 
    {
        "sentence": "ni\u00e0n sh\u016b", 
        "translation": "read (study book; Taiwan)"
    }, 
    {
        "sentence": "h\u00e8n ji\u00f2u", 
        "translation": "very old"
    }, 
    {
        "sentence": "b\u012bng", 
        "translation": "cold (to the touch)"
    }, 
    {
        "sentence": "j\u016b r\u00f2u", 
        "translation": "pork (pig meat)"
    }, 
    {
        "sentence": "r\u00f2u", 
        "translation": "meat"
    }, 
    {
        "sentence": "w\u01d2 b\u00f9 ch\u0113 r\u00f2u", 
        "translation": "I don't eat meat."
    }, 
    {
        "sentence": "m\u00e0ng", 
        "translation": "busy"
    }, 
    {
        "sentence": "w\u01cen", 
        "translation": "play"
    }, 
    {
        "sentence": "d\u01ce l\u00e1n qi\u00fa", 
        "translation": "play basketball"
    }, 
    {
        "sentence": "d\u01ce", 
        "translation": "to beat"
    }, 
    {
        "sentence": "l\u00e1n", 
        "translation": "basket"
    }, 
    {
        "sentence": "qi\u00fa", 
        "translation": "ball"
    }, 
    {
        "sentence": "z\u00fa qi\u00fa", 
        "translation": "football"
    }, 
    {
        "sentence": "z\u00fa", 
        "translation": "foot"
    }, 
    {
        "sentence": "g\u01cen l\u01cen qi\u00fa", 
        "translation": "American football"
    }, 
    {
        "sentence": "b\u00e0ng qi\u00fa", 
        "translation": "baseball"
    }, 
    {
        "sentence": "b\u00e0ng", 
        "translation": "stick"
    }, 
    {
        "sentence": "m\u011bi sh\u00ec z\u00fa qi\u00fa", 
        "translation": "American style football"
    }
];

  window.Word = Backbone.Model.extend({ 
  });

  window.Sentence = Backbone.Model.extend({ 
    tokenize: function(){
      var words = this.get('sentence').split(' ');
      this.set({words: words});
      console.log(this.get('sentence').split(' '));
    }
  });

  window.Text = Backbone.Collection.extend({

    model : Sentence,

    localStorage : new Store('notebook')

  });


  window.SentenceView = Backbone.View.extend({
    tagName: 'li',

    events : {
      //'click' : 'logModel'
      'dblclick' : 'editInPlace'
    },

    initialize : function(){
      _.bindAll(this, 'render');
    },
  
    editInPlace : function(ev){
      console.log(this.model.get('sentence'));
    },

    render : function(){
      var rendered = _.template('<ol class=phrase><li class=sentence> <%= sentence %></li><li  class=translation> <%= translation %> </li></ol>', this.model.toJSON());
      $(this.el).html(rendered);
      return this;
    }

  })

  window.SentenceEditorView = Backbone.View.extend({
    el: '#sentenceEditor',

    events : {
      'keyup #plain' : 'transliterateInPlace',
      'submit' : 'addPhrase',
      'click #toggleSentenceEditorView' : 'toggleSentenceEditorView'
    },

    initialize : function(){
      _.bindAll(this, 'transliterateInPlace', 'addPhrase', 'toggleSentenceEditorView');
    },

    toggleSentenceEditorView : function(ev){
    },

    addPhrase : function(ev){
      ev.preventDefault();
      var sentence = new Sentence({});
      sentence.set({
        'sentence': this.$('.sentence').val(),
        'translation': this.$('.translation').val(),
      }); 
      this.collection.add(sentence);
      this.$('input').val('').first().focus();
    },
  
    transliterateInPlace : function(ev){
      var PinyinTransliterator = new Transliterator({rules: PinyinRules});
      var transliterated = PinyinTransliterator.convert($(ev.target).val());
      this.$('input#plain').val(transliterated);
    },

    transliterate : function (text){

    }
  })

  window.TextView = Backbone.View.extend({

    el : $('#notebook') ,

    initialize : function(){
      _.bindAll(this, 'render');
      //this.collection.bind('add', this.render);
      this.collection.bind('add', this.render, this)
    },

    render : function(){
      this.$('#sentences').empty();

      this.collection.each(function(sentence){
        var view = new SentenceView({model: sentence});
        this.$('ul#sentences').prepend(view.render().el);
      });
      return this;
    }

  });

  Notebook = {};
  Notebook.text = new Text({ });
  Notebook.text.reset(data);
  Notebook.textView = new TextView({
    collection: Notebook.text
  });
  Notebook.sentenceEditorView = new SentenceEditorView({
    collection: Notebook.text
  });
  Notebook.textView.render();


})
