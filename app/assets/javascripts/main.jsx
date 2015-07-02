$( document ).ready(function() {

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

        var host = window.location.host;
        this.socket = new WebSocket("ws://" + host + url)

        this.socket.onmessage = function(e) {
            var payload = JSON.parse(e.data);
            options[payload.event].call(null, payload.data)
        }
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
        self.subscribe('/start/socket', {
            "all": function(r) {
                self.setState({articles: r})
            },
            "item": function(r) {
                var articles = self.state.articles;
                articles.push(r.new_val)
                self.setState({articles: articles})
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
