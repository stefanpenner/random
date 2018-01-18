const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt(" hi > ");
rl.prompt();
rl.on('line', input => {
  if (input === '.exit') {
    process.exit(0);
  } else {
    console.log(`Unrecognized command '${input}'.`);
    rl.prompt();
  }
});

