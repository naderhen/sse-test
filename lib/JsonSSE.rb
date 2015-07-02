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
