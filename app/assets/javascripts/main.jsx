$( document ).ready(function() {
    console.log('creating source')

    


    var TestMixin = {
      componentWillMount: function() {
        console.log('will mount')
      },
      componentDidMount: function() {
        console.log('did mount')
      },
      componentWillUnmount: function() {
        console.log('will unmount')
      },
      componentDidUnmount: function() {
        console.log('did unmount')
      },
      subscribe: function(url, options) {
        var self = this;
        console.log('subscribing to ' + url)
        this.source = new EventSource("/start/show");

        _.each(options, function(fn, event_name) {
            console.log("listening for " + event_name)
            self.source.addEventListener(event_name, function(e) {
                fn.call(null, JSON.parse(e.data));
            })
        })
      }
    };

    var App = React.createClass({
      mixins: [TestMixin], // Use the mixin
      getInitialState: function() {
        return {
            articles: []
        };
      },
      componentWillMount: function() {
        var self = this;
        self.subscribe('/start/show', {
            "all": function(r) {
                self.setState({articles: r})
            },
            "item": function(r) {
                console.log('item', r)
            }
        })
      },
      componentDidMount: function() {
        
      },
      render: function() {
        console.log('current state', this.state)
        return (
          <ul>
            {_.map(this.state.articles, function(article) {
                return <li>{article.created_at}</li>
            })}
          </ul>
        );
      }
    });

    React.render(
        <App/>,
        document.getElementById('root')
      );
});
