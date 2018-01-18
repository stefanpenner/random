loop do
  print " hi > "
  input = gets.strip
  if input == '.exit'
    exit 0
  else
    puts "Unrecognized command '#{input}'.";
  end
end
