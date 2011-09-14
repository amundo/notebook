$(function(){


  window.Sentence = Backbone.Model.extend({ 

    initialize: function() {

    }

  });

  window.Text = Backbone.Collection.extend({

    model : Sentence,

    initialize: function(models, options){
      this.url = options.url;
    }
    
  });

  window.SentenceView = Backbone.View.extend({
    tagName: 'li',

    initialize : function(){
      _.bindAll(this, 'render');
      this.template = _.template($('#sentence_template').html());
    },

  
    render : function(){
      var rendered = this.template(this.model.toJSON());
      $(this.el).html(rendered);
      return this;
    }

  })

  window.TextView = Backbone.View.extend({

    el : $('#notebook') ,

    initialize : function(){
      _.bindAll(this, 'render');
    },

    render : function(){

      _(this.collection).each(function(sentence){
        var view = new SentenceView({model: sentence});
        this.$('ol#sentences').append(view.render().el);
      });

      return this;
    }

  });


  function Notebook(params){

    this.text = new Text( {}, { url: params.url });

    this.text.fetch({
       success: function(){
       }
    });


    this.start = function(){
console.log('hi');
      this.textView = new TextView({
        collection: this.text
      })
      $('body').append(this.textView.render().el);
    };
  }


  window.notebook = new Notebook(
    {
      'url': 'js/mandarin.js'
    }
  );

  window.notebook.start();
  
})
