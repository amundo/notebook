var show = function(o){ console.log(JSON.stringify(o, null,2)) };

window.Mary = {};

atomicLingUnit = {atom: "I AM ATOMIC"};

langLevels = ["utterance", "word", "morpheme"]

$(function(){
  
  Mary.Entry  = Backbone.Model.extend({
    initialize: function(options){
      _.bindAll(this, 'tokenize');
     
      this.set({words : this.tokenize()});

		this.set({langStuff: [
				{
					unit: "utterance",
					targetLang: "yo quiero comer una p- mm un perro caliente",
					metaLang: "I want to eat a h- mm a hot dog",
					parsed: [		
						{
							unit: "word",
							targetLang: "yo",
							metaLang: "1SG.NOM",
							parsed: atomicLingUnit
						},
						{
							unit: "word",
							targetLang: "quiero",
							metaLang: "want.1SG",
							parsed: [
								{
									unit: "morpheme",
									targetLang: "quier",
									metaLang: "want"
								},
								{
									unit: "morpheme",
									targetLang: "o",
									metaLang: "1SG"
								}
							]
						},
						{
							unit: "word",
							targetLang: "comer",
							metaLang: "eat.INF",
							parsed: [
								{
									unit: "morpheme",
									targetLang: "com",
									metaLang: "eat",
								},
								{
									unit: "morpheme",
									targetLang: "er",
									metaLang: "INF"
								}
							],
						},
						{
							unit: "word",
							targetLang: "un",
							metaLang: "INDEF.MASC",
							parsed: atomicLingUnit
						},
						{
							unit: "word",
							targetLang: "perro",
							metaLang: "dog",
							parsed: atomicLingUnit
						},
						{
							unit: "word",
							targetLang: "caliente",
							metaLang: "hot",
							parsed: atomicLingUnit
						}
					]

		}]});

      this.set({
        'timestamp' :  Number(new Date()),
        'order' : Mary.entryBook.nextOrder()
      });

    },
 
    tokenize : function(){
      return language.tokenize(this.get('sentence'));
    }

  });
  
	Mary.LangUnit = Backbone.Model.extend({
		initialize: function(options) {
			this.set({
				'timestamp' :  Number(new Date()),
				//'order' : Mary.entryBook.nextOrder()
				'parsed': new Mary.LangSequence([], {}),
			});
			
			this.get('parsed').parentUnit = this;
			this.get('parsed').bind('all', this._onParsedEvent, this);
			
			if (this.get('unitType') == "utterance") {
				this.parseAt(' ');
				this.localStorage = Mary.entryBook.localStorage;
			}
			else {
				this.localStorage = new Store();
			}
			
		},
		
		parseAt: function(delim) {
			subUnitType = langLevels[langLevels.indexOf(this.get('unitType'))+1];
			
			words = this.get('targetLang').split(delim);
			
			this.parseInto(subUnitType, words, _.map(words, function() { return ""; }));
		},
		
		parseInto: function(type, targets, metas) {
			timestamp = Number(new Date());
			parsed = this.get('parsed');
			parsed.reset();
			subUnits = _.each(_.zip(targets, metas), function(el, ix, list) {
				parsed.create({
					'timestamp': timestamp,
					'order': ix,
					'unitType': type,
					'targetLang': el[0],
					'metaLang': el[1]
				});
			});
			//this.get('parsed').reset(newSeq);
		},
		
		_onParsedEvent: function(ev, model, collection, options) {
			this.trigger.apply(this, arguments);
		},
	});
			

	Mary.LangSequence = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.localStorage = Mary.entryBook.localStorage;
		},
		
		model: Mary.LangUnit,
		
		comparator: function(model){
			return model.get('order');
		}
	});
	
  Mary.EntryBook = Backbone.Collection.extend({

    initialize : function(models, options){
      _.bindAll(this, 'index', 'setLanguage');
      this.localStorage = new Store(options.store);
    },

    lexicon : [],

    //model : Mary.Entry,
    model: Mary.LangUnit,

    nextOrder : function(model){
      if (!this.length){ return 1 };
      return this.last().get('order') + 1;
    },

    setLanguage : function(code){
    	console.log("I set the language!");
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
      //'click .sentence' : 'listWords',
      //'dblclick' : 'editEntry',
      'dblclick .utterance.targetLang': 'editSentence',
      'click .entry-gloss' : 'editGloss',
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
    
    	editVal: function(selector, attr) {
    		console.log(this);
    		console.log(selector);
    		console.log(this.$(selector));
    		subEl = this.$(selector)
    		
    		subEl.removeAttr('contenteditable');
    		obj = {}
    		console.log(content);
    		obj[attr] = subEl.text();
    		console.log(show(obj));
    		this.model.save(obj);
    	},
    	
	editSentence: function(ev) {
		//ev.stopPropagation();
		sentence = this.$('.utterance.targetLang');
		sentence.attr('contenteditable', 'true');
		sentence.one('blur', _.bind(this.editVal, this, '.utterance.targetLang', 'targetLang'));
		/*sentence.one('blur', 
			function() {
				console.log($(this));
				$(this).removeAttr('contenteditable');
				this.model.set({'sentence': this.
			}
		);*/
		sentence.focus();
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
      $('#entries').html('<pre>' + data + '</pre>')

    }

  });
  

  Mary.Project = Backbone.View.extend({

    el : '#desk',

    events : {
	'keyup input#sentence': 'sentenceKeyup',
	'keyup input#gloss': 'glossKeyup',	
      'keyup input#translation' : 'createOnEnter',

      
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
	if(ev.keyCode == 13) {
		$('input#gloss').val(language.tokenize($('input#sentence').val()))
		$('input#gloss').focus()
	}
    },
    
    glossKeyup : function(ev){
	if(ev.keyCode == 13) {
		$('input#translation').focus()
	}
    },

    translationKeyup : function(ev){
    },

    createOnEnter : function(ev){
      if(ev.keyCode == 13){
        /*Mary.entryBook.create({
          'sentence': $('#sentence').val(),
          'translation': $('#translation').val()
        });*/
		Mary.entryBook.create({
			'unitType': 'utterance',
			'targetLang': $('#sentence').val(),
			'metaLang': $('#translation').val(),
			'order': Mary.entryBook.nextOrder(),
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
