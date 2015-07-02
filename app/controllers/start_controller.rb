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
  include Tubesock::Hijack

  def show
    response.headers['Content-Type'] = 'text/event-stream'
     
    sse = SSE.new(response.stream, retry: 300)

    test_articles = Article.where(title: "Test")
    
    sse.write(test_articles, {event: "all"});

    test_articles.raw.changes.each do |change|
      sse.write(change, {event: "item"})
    end
  rescue *client_disconnected
  ensure
    sse.close rescue nil
    NoBrainer.disconnect rescue nil
  end

  def socket
    hijack do |tubesock|
      tubesock.onmessage do |data|
        if data == "test_articles"
          test_articles = Article.where(title: "Test")

          tubesock.send_data({event: "all", data: test_articles}.to_json)

          test_articles.raw.changes.each do |change|
            tubesock.send_data({event: "item", data: change}.to_json)
          end
        end
      end
    end

  end

  private

  def client_disconnected
    return ActionController::Live::ClientDisconnected, IOError
  end
end
