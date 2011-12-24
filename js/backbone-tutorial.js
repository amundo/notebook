/* Scaled-down Backbone.js demonstration
 * By Jacob Oscarson (http://twitter.com/jacob414), 2010
 * MIT Licenced, see http://www.opensource.org/licenses/mit-license.php */
$(function() {
    window.ulog = function(msg) { $('#log').append($('<div>'+msg+'</div>')); }
/*
    // Faking a little bit of Backbone.sync functionallity
    Backbone.sync = function(method, model, succeeded) {
        ulog('<strong>'+method + ":</strong>  " + model.get('label'));
        if(typeof model.cid != 'undefined') {
            // It's a freshly made model
            var cid = model.cid;
            // ..fake that it's .cid turns into a "real" .id:
            model.unset('cid').set({id:cid}, {silent:true});
        }
        // Oh yes, it all went sooo well ;-)
        succeeded(model);
    };
*/

    // Models represent your data
    Model = Backbone.Model.extend();

    // Collections represent a list of models (typically a query on a server)
    Models = Backbone.Collection.extend({
      localStorage: new Store("minimal"),
      model:Model
    });

    // Create a 'Models' instance, and give it a dataset we can play with
    models = new Models([ {id: 'm1', label:'Item 1'},
                          {id: 'm2', label:'Item 2'} ]);

    // Views represent what should be visible
    View = Backbone.View.extend({
        render: function() {
            // Redraw - notice that we don't know if this.el is inserted
            // in the DOM or not
            $(this.el).html(
                _.template('<input type="text" value="<%= label %>" />',
                           this.model.toJSON()));
            // Returning this.el instead could also be a good idea..
            return this;
        },
        events: {
            'change input': 'change'
        },
        change: function() {
            var newval = this.$('input').val();
            ulog('<em>Changing '+this.model.get('label')+' to '+newval+"</em>");
            this.model.set({label:newval});
        }
    });


    // Create view instances for every model
    views = models.map(function(model) {
        var view = new View({model: model});
        $('#content').append(view.render().el);
        return view;
    });

    $('#save').click(function() {
        // This doesn't feel completely right..
        models.each(function(model) { model.save(); });
    });

    $('#add').click(function() {
        var model = models.create({label:'New item'});
        var view = new View({model:model});
        $('#content').append(view.render().el);
    });
});
