const fs = require('fs');
const path = require('path');

const fileUrl = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(fileUrl);

let data = '';
stream.on('data', partData => data += partData);
stream.on('end', () => console.log(data));
stream.on('error', error => console.log('Error', error.message));