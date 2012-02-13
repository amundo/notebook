var show = function(o){ console.log(JSON.stringify(o, null,2)) };

window.Mary = {};

$(function(){

  
  Mary.Entry  = Backbone.Model.extend({
    initialize: function(options){
      _.bindAll(this, 'tokenize');
     
      this.set({words : this.tokenize()});

      this.set({
        'timestamp' :  Number(new Date()),
        'order' : Mary.entryBook.nextOrder()
      });

    },
 
    tokenize : function(){
      return language.tokenize(this.get('sentence'));
    }

  });

  Mary.EntryBook = Backbone.Collection.extend({

    initialize : function(models, options){
      _.bindAll(this, 'index', 'setLanguage');
      this.localStorage = new Store(options.store);
    },

    lexicon : [],

    model : Mary.Entry,

    nextOrder : function(model){
      if (!this.length){ return 1 };
      return this.last().get('order') + 1;
    },

    setLanguage : function(code){
      var self = this; /* is there a better way to do this? */
      this.url = 'data/' + code + '.js';
      var key = 'notebook_' + code;
      this.localStorage = new Store(key);
      localStorage.notebook_current = key;
      self.fetch();
      /*$.getJSON(this.url).success(function(data){
        eb.reset(data);
      }) */
    },

    index : function(){
      eb = this;
      this.each(function(s){
        console.log(s.get('words'));
        eb.lexicon.push(s.get('words'));
      })    
    },

    comparator : function(model){
      return model.get('order');
    }

  });

  Mary.EntryView = Backbone.View.extend({

    className : 'entry',

    events : {
      'click .entry-destroy' : 'remove',
      'click .sentence' : 'listWords',
      'dblclick' : 'editEntry',
      'click .entry-gloss' : 'editGloss'
    },

    template : _.template($('#entryTemplate').html()),

    initialize : function(){
      _.bindAll(this, 'remove', 'editEntry', 'editGloss', 'listWords');
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

    editEntry : function(){
      //console.log('we need to edit ' + this.model.get('sentence'));
      $('#card input#sentence').val(this.model.get('sentence'));
      $('#card input#translation').val(this.model.get('translation'));
      this.model.destroy();
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

  Mary.entryBook = new Mary.EntryBook([], {store: localStorage.notebook_current});

  Mary.Source = Backbone.Model.extend({ });

  Mary.Sources = Backbone.Collection.extend({
    model : Mary.Source
  });

  Mary.ImporterView = Backbone.View.extend({

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
  
  Mary.ToolboxView = Backbone.View.extend({

    el : '#toolbox',

    initialize : function(){ 
      _.bindAll(this, 'exportData', 'toggleNotebook', 'toggleLexicon', 'setLanguage');
    },

    events : { 

      'click #export-button' : 'exportData',

      'click #lexicon-button'  : 'toggleLexicon',
      'click #notebook-button' : 'toggleNotebook',
      'click nav button.language' : 'setLanguage'

    },

    toggleNotebook : function(){ 
      views.notebook.fadeToggle();
    },

    toggleLexicon : function(){ 
      views.lexicon.fadeToggle();
    },
 
    setLanguage : function(ev){
console.log(this);
      var code = $(ev.currentTarget).data('code'); 
      Mary.entryBook.setLanguage(code); 
    },

    exportData : function(){ 

      var data = JSON.stringify(Mary.entryBook, null,2);
      $('#desk').html('<pre>' + data + '</pre>')

    }

  });
  

  Mary.Project = Backbone.View.extend({

    el : '#desk',

    events : {
      'keyup input' : 'createOnEnter',
      'keyup input#sentence' : 'sentenceKeyup',
      'click a#toggleToolbox' : 'toggleToolbox',
      'click a#toggleCard' : 'toggleCard'
    },

    initialize: function(){ 
  
      _.bindAll(this, 'sentenceKeyup', 'toggleToolbox', 'toggleToolbox', 'transliterate', 'createOnEnter', 'search');

      Mary.entryBook.bind('all',   this.render, this);

      Mary.entryBook.fetch();
    
    },

    render : function(){
      this.$('#entries').html('');
      Mary.entryBook.each(function(entry){
        var view = new Mary.EntryView({model: entry});
        this.$('#entries').append(view.render().el);
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
        Mary.entryBook.create({
          'sentence': $('#sentence').val(),
          'translation': $('#translation').val()
        });
        $('#card input').val('');
      $('#card input').first().focus();
      }
    },

  });

  Mary.Router = Backbone.Router.extend({

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

  window.importer = new Mary.ImporterView();
  window.toolbox = new Mary.ToolboxView();
  window.language = languages.at(1);
  window.project = new Mary.Project();
  window.router = new Mary.Router();
  /*$.getJSON('data/cmn.js').success(function(data){
    Mary.entryBook.reset(data);
  });*/
  Backbone.history.start({});

});
