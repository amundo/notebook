
var show = function(o){ console.log(JSON.stringify(o, null,2)) }


$(function(){

  var Sentence  = Backbone.Model.extend({
    initialize: function(options){
      _.bindAll(this, 'tokenize');
     
      this.set({words : this.tokenize()});

      this.set({
        'timestamp' :  Number(new Date()),
        'order' : entryBook.nextOrder(),
      });

    },
 
    tokenize : function(){
      return language.tokenize(this.get('sentence'));
    }

  });

  var EntryBook = Backbone.Collection.extend({

    initialize : function(options){
      _.bindAll(this, 'index');
    },

    lexicon : [],

    model : Sentence,

    localStorage : new Store('entryBook'),

    nextOrder : function(model){
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    index : function(){
      this.each(function(s){
        EntryBook.lexicon.push(s.get('words'))
      })    
    },

    comparator : function(model){
      return model.get('order');
    }


  });

  var EntryView = Backbone.View.extend({

    className : 'entry',

    events : {
      'click .sentence-destroy' : 'remove',
      'click .sentence' : 'listWords',
      'click .sentence-gloss' : 'editGloss'
    },

    template : _.template($('#entryTemplate').html()),

    initialize : function(){
      _.bindAll(this, 'remove', 'editGloss', 'listWords');
      this.model.bind('change', this.render, this); 
    },

    remove : function(){
      if (window.confirm("Remove?")) { 
        this.model.destroy();
      }
    },

    editGloss : function(){
      console.log(show(this.model.get('gloss')));
    },

    listWords : function(){
      console.log(this.model.tokenize());
    },

    render : function(){
      var html = this.template(this.model.toJSON());
      $(this.el).html(html);
      return this;
    }

  });

  entryBook = new EntryBook();

  var Source = Backbone.Model.extend({ });

  var Sources = Backbone.Collection.extend({
    model : Source
  });

  var ImporterView = Backbone.View.extend({

    el : '#importer',

    initialize : function(){ 
      _.bindAll(this, 'importData');
    },

    events : { 

      'click #import-button' : 'importData'

    },

    toggle : function(){ 
      $(this.el).fadeToggle()
    },

    importData : function(){ 

    }

  });
  
  var ToolboxView = Backbone.View.extend({

    el : '#toolbox',

    initialize : function(){ 
      _.bindAll(this, 'exportData');
    },

    events : { 

      'click #export-button' : 'exportData'

    },

    exportData : function(){ 

      var data = JSON.stringify(entryBook, null,2);
      $('#desk').html('<pre>' + data + '</pre>')

    }

  });
  

  var Project = Backbone.View.extend({

    el : '#desk',

    events : {
      'keyup input' : 'createOnEnter',
      'keyup input#sentence' : 'sentenceKeyup',
      'click a#toggleToolbox' : 'toggleToolbox',
      'click a#toggleCard' : 'toggleCard'
    },

    initialize: function(){ 
  
      _.bindAll(this, 'sentenceKeyup', 'toggleToolbox', 'toggleToolbox', 'transliterate', 'createOnEnter', 'search');

      entryBook.bind('add',   this.addOne, this);
      entryBook.bind('reset', this.addAll, this);
      entryBook.bind('all',   this.render, this);

      entryBook.fetch();
    
    },

    render : function(){
      this.$('#sentences').html('');
      entryBook.each(function(sentence){
        var view = new EntryView({model: sentence});
        this.$('#sentences').append(view.render().el);
      })
    },

    toggleCard : function(){
      views.card.fadeToggle()
    },

    toggleToolbox : function(){
      views.toolbox.slideToggle()
    },

    search : function(query){
    },

    transliterate : function(ev){
      var transliterated = language.transliterate($(ev.target).val());
      this.$('input#sentence').val(transliterated);
    },

    sentenceKeyup : function(ev){
      this.transliterate(ev);
    },

    translationKeyup : function(ev){
    },

    createOnEnter : function(ev){
      if(ev.keyCode == 13){
        entryBook.create({
          'sentence': $('#sentence').val(),
          'translation': $('#translation').val()
        });
        $('#card input').val('');
      $('#card input').first().focus();
      }
    },

    addOne : function(sentence){
    
    },

    addAll : function(){
    }

  });

  var Router = Backbone.Router.extend({

    initialize: function(){
    },

    routes: {
      "help":                 "help",    // #help
      "search/:query":        "search",  // #search/kiwis
      "lexicon":        "lexicon",  // #search/kiwis
      "*actions/:query": "defaultRoute" ,
    },

    help: function() {
      console.log('help');
    },

    lexicon: function() {
      
    },


    search: function(query) {
      console.log('searching for: ' + query);
    },

    defaultRoute: function(query) {
        console.log(query);
    }

  });

  views = { 
    notebook : $('#notebook'),
    glosser : $('#glosser'),
    help : $('#help'),
    importer : $('#importer'),
    card : $('#card'),
    toolbox : $('#toolbox'),
    lexicon : $('#lexicon')
  };

  window.importer = new ImporterView();
  window.toolbox = new ToolboxView();
  window.language = languages.at(1);
  window.project = new Project();
  window.router = new Router();
  /*$.getJSON('data/kju.js').success(function(data){
    entryBook.reset(data);
  })*/
  Backbone.history.start({});

});
