$(function(){

  window.key = localStorage.notebook;
  window.data = JSON.parse(localStorage['notebook-' + window.key]);

  window.data  = [
    {
      "translation": "What do you want to eat? ", 
      "sentence": "Ni xi\u01ceng y\u00e0o chi sh\u00e9nme?"
    }, 
    {
      "translation": "I want to learn Putonghua.", 
      "sentence": "w\u01d2 xi\u01ceng y\u00e0o xu\u00e9 P\u01d4t\u014dnghu\u00e0."
    }, 
    {
      "translation": "Did I say it correctly?", 
      "sentence": "w\u01d2 shu\u01d2 de du\u00ec m\u0101?"
    }, 
    {
      "translation": "What is this?", 
      "sentence": "zh\u00e8 sh\u00ec sh\u00e9nme?"
    }, 
    {
      "translation": "Please say that again.", 
      "sentence": "N\u01d0 n\u00e9ng za\u00ec shu\u01d2 bi\u00e0n m\u00e1?"
    }, 
    {
      "translation": "What is your name? Como te llamas?", 
      "sentence": "N\u00ed ji\u00e0o sh\u00e9nme m\u00edng z\u00ec?"
    }, 
    {
      "translation": "My name is Patrick.", 
      "sentence": "w\u01d2 de m\u00edng z\u00ec shi Patrick."
    }, 
    {
      "translation": "your name", 
      "sentence": "n\u01d0 de m\u00edng z\u00ec"
    }, 
    {
      "translation": "See you later. ", 
      "sentence": "de ho er jian "
    }, 
    {
      "translation": "I like coffee.", 
      "sentence": "w\u01d2 x\u01d0 hu\u0101n k\u0101f\u0113i."
    }, 
    {
      "translation": "I don't like tea.", 
      "sentence": "w\u01d2 b\u00f9 x\u01d0 hu\u0101n ch\u00e1."
    }, 
    {
      "translation": "Excuse me, but I don't like tea.", 
      "sentence": "b\u00f9 h\u01ceo y\u00ec s\u012b w\u01d2 b\u00f9 x\u01d0 hu\u0101n ch\u00e1."
    }
  ];


  window.Sentence = Backbone.Model.extend({ });

  window.Text = Backbone.Collection.extend({

    model : Sentence,

    localStorage : new Store('notebook')

  });


  window.SentenceView = Backbone.View.extend({
    tagName: 'li',

    events : {
      //'click' : 'logModel'
      //'dblclick' : 'editInPlace'
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
      var transliterated = this.transliterate($(ev.target).val());
      this.$('input#plain').val(transliterated);
    },

    transliterate : function (text){

      var rules = [ [ "1", "\u0304" ], [ "2", "\u0301" ], [ "3", "\u030C" ], [ "4", "\u0300" ] ];

      $.each(rules, function(i, rule){
        var beforeRE = new RegExp(rule[0], 'g'),
            after = rule[1];

        text = text.replace(beforeRE, after);

      })
      return text;
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

/*
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
*/

  window.text = new Text({ });
  window.text.reset(data);

  window.textView = new TextView({
    collection: window.text
  });

  window.sentenceEditorView = new SentenceEditorView({
    collection: window.text
  });

  window.textView.render();

})
