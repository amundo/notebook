var show = function(o){ console.log(JSON.stringify(o, null,2)) };

window.Mary = {};

atomicLingUnit = {atom: "I AM ATOMIC"};

langLevels = ["utterance", "word", "morpheme"]

$(function(){
  
  Mary.Entry = Backbone.Model.extend({
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
			if (this.get('parsed')==undefined) {
				this.set({
					'timestamp' :  Number(new Date()),
					//'order' : Mary.entryBook.nextOrder()
					'parsed': new Mary.LangSequence([], {}),
					'subUnitType': langLevels[langLevels.indexOf(this.get('unitType'))+1]
				});
				
				this.get('parsed').parentUnit = this;
				this.get('parsed').bind('all', this._onParsedEvent, this);
				
				if (this.get('unitType') == "utterance") {
					this.parseAt(' ');
					this.localStorage = Mary.entryBook.localStorage;
				}
				else if (this.get('unitType') == "word") {
					timestamp = Number(new Date());
					this.get('parsed').create({
						'timestamp': timestamp,
						'order': 0,
						'unitType': "morpheme",
						'targetLang': this.get('targetLang'),
						'metaLang': this.get('metaLang')
					});
					this.localStorage = new Store()
				}
				else {
					this.localStorage = new Store();
				}
			}
			else {
				console.log("Initing", this.get('unitType'), this.get('targetLang'));
				
				/*
				xxxxx // to keep firefox from crashing
				console.log("To begin, parsed of", this.get('unitType'), this.get('targetLang'), "is", this.get('parsed'));
				newParsed = new Mary.LangSequence([], {});
				newParsed.parentUnit = this;
				//newParsed.create({'order': -1, unitType: "fakeUnit"});
				_.each(this.get('parsed'), function(subunit) {
					console.log("Subunit of", this.get('unitType'), this.get('targetLang'), "is", subunit);
					console.log("Before, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
					newObj = new Mary.LangUnit(subunit);
					//newParsed.create(subunit);
					newParsed.add(newObj);
					console.log("After, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
				}, this);
				this.set({'parsed': newParsed});
				console.log("Finally, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
				newParsed.bind('all', this._onParsedEvent, this);
				*/
				
			}
			this.bind('change', this.changeStuff, this);
		},
		
		reparse: function() {
			console.log("Reparsing", this.get('unitType'), this.get('targetLang'), this);
			//console.log("To begin, parsed of", this.get('unitType'), this.get('targetLang'), "is", this.get('parsed'));
			var newParsed = new Mary.LangSequence([], {});
			newParsed.parentUnit = this;
			//newParsed.create({'order': -1, unitType: "fakeUnit"});
			_.each(this.get('parsed'), function(subunit) {
				//console.log("Subunit of", this.get('unitType'), this.get('targetLang'), "is", subunit);
				//console.log("Before, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
				if (_.isEqual(subunit.parsed,[])) {
					subunit.parsed = new Mary.LangSequence([], {});
				}
				var newObj = new Mary.LangUnit(subunit);
				newObj.reparse();
				//newParsed.create(subunit);
				newParsed.add(newObj);
				//console.log("After, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
			}, this);
			// May be dangerous. . .
			//this.attributes.parsed = newParsed
			
			this.set({'parsed': newParsed}, {'silent': 'true'});
			//console.log("Binding events on", newParsed, "(parent", newParsed.parentUnit.get('unitType'), newParsed.parentUnit.get('targetLang'), ") to ", this.get('unitType'), this.get('targetLang'));
			newParsed.bind('all', this._onParsedEvent, this);
		},
		
		sync: function(method, model, options) {
			if (method != "create" && model.get('unitType') != 'utterance') {
				console.log("We're crappin' out on. . .", method);
				return;
			}
			else {
				console.log("We're crappin' in on. . .", method);
				Backbone.sync.call(this, method, model, options);
			}
		},
		
		parse: function(resp, xhr) {
			// What the heck is xhr?  Poor documentation...
			console.log("Parsing model", resp);
			return resp;
			
			console.log("To begin, parsed of", resp.unitType, resp.targetLang, "is", resp.parsed);
			newParsed = new Mary.LangSequence([], {});
			newParsed.parentUnit = this;
			//newParsed.create({'order': -1, unitType: "fakeUnit"});
			_.each(this.get('parsed'), function(subunit) {
				console.log("Subunit of", this.get('unitType'), this.get('targetLang'), "is", subunit);
				console.log("Before, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
				newParsed.create(subunit);
				console.log("After, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
			}, this);
			this.set({'parsed': newParsed});
			console.log("Finally, parsed of", this.get('unitType'), this.get('targetLang'), "is", newParsed);
			newParsed.bind('all', this._onParsedEvent, this);
					
			return this;
		},
		
		changeStuff: function(ev) {
			console.log("Changed", this.get('unitType'), this.get('targetLang'),":", this.get('metaLang'));
			this.save();
		},
		
		parseAt: function(delim) {
			subUnitType = langLevels[langLevels.indexOf(this.get('unitType'))+1];
			
			words = this.get('targetLang').split(delim);
			
			this.parseInto(subUnitType, words, _.map(words, function() { return ""; }));
		},
		
		parseInto: function(type, targets, metas, options) {
			timestamp = Number(new Date());
			parsed = this.get('parsed');
			parsed.reset();
			subUnits = _.each(_.zip(targets, metas), function(el, ix, list) {
				newMod = parsed.create({
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
			console.log("Event in", this.get('unitType'), this.get('targetLang'));
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
    
    clearOut: function() {
    	localStorage.clear();
    	this.setLanguage('cmn');
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
    },
    
	parse: function(resp, xhr) {
		console.log("Parsing collection", typeof resp, resp);
		//return resp;
		
		result = [];
		_.each(resp, function(obj) {
			console.log("Obj is",obj);
			newObj = new Mary.LangUnit(obj);
			newObj.reparse();
			result.push(newObj);
		});
		console.log("Parsed", result);
		return result;
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

    listWords : function() {
      console.log(this.model.tokenize());
    },

    render : function() {
      var html = this.template(this.model.toJSON());
      $(this.el).html(html);
      $(this).find('.glossLine').html('');
      glossLine = $(this.el).find('.glossLine');
      console.log("Rendering", this.model.get('unitType'), this.model.get('targetLang'));
      this.model.get('parsed').each(function(word) {
      	view = new Mary.WordView({model: word});
      	glossLine.append(view.render().el);
      });
      return this;
    }

  });
  
  	Mary.WordView = Backbone.View.extend({
  		className: 'wordView',
  		template : _.template($('#wordTemplate').html()),
  		render: function () {
  			html = this.template(this.model.toJSON());
  			$(this.el).html(html);
  			morphs = $(this.el).find('.morphemes');
  			morphs.html('');
  			this.model.get('parsed').each(function(morpheme) {
  				view = new Mary.GlossView({model: morpheme});
  				morphs.append(view.render().el);
  			});
  			return this;
  		}
  	});
  				
  
	Mary.GlossView = Backbone.View.extend({
		className: 'glossView',
		template: _.template($('#glossTemplate').html()),
		
		events: {
			'dblclick .glossTarget': 'editTarget',
		},
		
		initialize: function(){
			//_.bindAll(this, 'editTarget');
			this.model.bind('change', this.render, this); 
		},
		
		render: function () {
			html = this.template(this.model.toJSON());
			$(this.el).html(html);
			return this
		},
		
		editTarget: function(ev) {
			ev.stopPropagation();
			target = $(this.el).find('.glossTarget');
			console.log(this);
			target.attr('contenteditable', 'true');
			target.one('blur', _.bind(this.editVal, this, '.glossTarget', 'targetLang'));
			target.focus();
		},
		
		editVal: function(selector, attr) {
    		subEl = $(this.el).find(selector);
    		
    		subEl.removeAttr('contenteditable');
    		obj = {};
    		obj[attr] = subEl.text();
    		this.model.set(obj);
    		this.model.save();
    	},
	});
		
		
  	

  Mary.entryBook = new Mary.EntryBook([], {store: localStorage.notebook_current});

  Mary.Source = Backbone.Model.extend({ });

  Mary.Sources = Backbone.Collection.extend({
    model : Mary.Source
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

  window.toolbox = new Mary.ToolboxView();
  window.language = languages.at(1);
  window.project = new Mary.Project();
  window.router = new Mary.Router();
  /*$.getJSON('data/cmn.js').success(function(data){
    Mary.entryBook.reset(data);
  });*/
  Backbone.history.start({});

});
