defmodule DB do
  def repl do
    input = String.trim(IO.gets " hi > ")
    if String.equivalent?(input, ".exit") do
      System.halt(0)
    else
      IO.puts "Unrecognized command '#{input}'.";
      repl()
    end
  end
end

DB.repl()
