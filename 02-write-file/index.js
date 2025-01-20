const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

console.log('Welcome! Please enter text to write. Type "exit" to quit.');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askForInput() {
  rl.question('Enter text: ', (input) => {
    if (input.trim().toLowerCase() === 'exit') {
      console.log('Goodbye! Thank you for using the program.');
      rl.close();
      process.exit(0);
    } else {
      writeStream.write(input + '\n');
      askForInput();
    }
  });
}

askForInput();

process.on('SIGINT', () => {
  console.log('\nGoodbye! Thank you for using the program.');
  rl.close();
  process.exit(0);
});
