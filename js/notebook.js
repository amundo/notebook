
var show = function(o){ console.log(JSON.stringify(o, null,2)) }


$(function(){

  var Sentence  = Backbone.Model.extend({
    initialize: function(options){
      _.bindAll(this, 'tokenize');
     
      this.set({words : this.tokenize(this.get()) });

      this.set({
        'timestamp' :  Number(new Date()),
        'order' : text.nextOrder(),
        'indexed' : false
      });

    },
 
    tokenize : function(){
      return language.tokenize(this.get('sentence'));
    }

  });

  var Text = Backbone.Collection.extend({

    initialize : function(options){
      _.bindAll(this, 'index');
    },

    lexicon : [],

    model : Sentence,

    localStorage : new Store('text'),

    nextOrder : function(model){
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    index : function(){
      this.each(function(s){
        Text.lexicon.push(s.get('words'))
      })    
    },

    comparator : function(model){
      return model.get('order');
    }


  });

  var SentenceView = Backbone.View.extend({

    className : 'entry',

    events : {
      'click .sentence-destroy' : 'remove',
      'click .sentence' : 'listWords'
    },

    template : _.template($('#sentenceTemplate').html()),

    initialize : function(){
      _.bindAll(this, 'remove', 'listWords');
      this.model.bind('change', this.render, this); 
    },

    remove : function(){
      if (window.confirm("Remove?")) { 
        this.model.destroy();
      }
    },

    listWords : function(){
      console.log(this.model.tokenize());
    },

    render : function(){
      var sentenceTemplate = $('#sentenceTemplate').html(); 
      var html = _.template(sentenceTemplate, this.model.toJSON());
      $(this.el).html(html);
      return this;
    }

  });

  text = new Text();

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

      text.bind('add',   this.addOne, this);
      text.bind('reset', this.addAll, this);
      text.bind('all',   this.render, this);

      text.fetch();
    
    },

    render : function(){
      this.$('#sentences').html('');
      text.each(function(sentence){
        var view = new SentenceView({model: sentence});
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
        text.create({
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
    help : $('#help'),
    card : $('#card'),
    toolbox : $('#toolbox'),
    lexicon : $('#lexicon')
  };

  window.language = languages.at(1);
  window.project = new Project();
  window.router = new Router();
  Backbone.history.start({});

});
