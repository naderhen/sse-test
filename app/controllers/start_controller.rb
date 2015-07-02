require 'json'

class JsonSSE
  def initialize(io)
    @io = io

  end

  def write(object)
    @io.write "data: #{JSON.dump(object)}\n\n"
  end

  def close
    @io.close
  end
end



class StartController < ApplicationController
  include ActionController::Live

  def show
    response.headers['Content-Type'] = 'text/event-stream'
    
    all_sse = SSE.new(response.stream, retry: 300, event: "all")
    item_sse = SSE.new(response.stream, retry: 300, event: "item")

    test_articles = Article.where(title: "Test")
    
    all_sse.write(test_articles);

    test_articles.raw.changes.each do |change|
      item_sse.write(change)
    end
  rescue *client_disconnected
  ensure
    sse.close rescue nil
    NoBrainer.disconnect rescue nil
  end

  private

  def client_disconnected
    return ActionController::Live::ClientDisconnected, IOError
  end
end
