
window.q = { 

  show : function(o){ console.log(JSON.stringify(o, null,2)) }

};


$(function(){

  var Sentence  = Backbone.Model.extend({
    initialize: function(options){
      _.bindAll(this, 'tokenize');
     
      this.set({
        'timestamp' :  Number(new Date()),
        'order' : text.nextOrder(),
      });

    },
 
    tokenize : function(){
      return mandarin.tokenize(this.get('sentence'));
    }

  });

  var Text = Backbone.Collection.extend({

    model : Sentence,

    nextOrder : function(model){
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    words : function(){
      
    },

    comparator : function(model){
      return model.get('order');
    },

    localStorage : new Store('text')

  });

  var SentenceView = Backbone.View.extend({

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
    },

    initialize: function(){ 
  
      _.bindAll(this, 'sentenceKeyup', 'transliterate', 'createOnEnter' );

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

    transliterate : function(ev){
      //var PinyinTransliterator = new Transliterator({rules: PinyinRules});
      //var transliterated = PinyinTransliterator.convert($(ev.target).val());
      var transliterated = mandarin.transliterate($(ev.target).val());
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

  window.project = new Project();
  window.mandarin = languages.at(1);

});
