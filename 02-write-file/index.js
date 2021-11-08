const fs = require('fs');
const path = require('path');
const readline = require('readline');

const fileUrl = path.join(__dirname, 'textfile.txt');

const stdout = process.stdout;
const stdin = process.stdin;

fs.writeFile(
  fileUrl,
  '',
  { flag: 'a+' },
  (err) => {
    if (err !== null) {
      console.log(err.name + ': ' + err.message);
    }
  }
);

const rl = readline.createInterface({ input: stdin, output: stdout });

rl.on('close', () => {
  console.log('Bye!');
});

rl.on('line', (input) => {
  if (input.toString().toLowerCase().trim() == 'exit') {
    rl.close();
  } else {
    fs.appendFile(
      fileUrl,
      input,
      (err) => {
        if (err !== null) {
          console.log(err.name + ': ' + err.message);
        }
      });
  }
});

console.log('Enter your text:');