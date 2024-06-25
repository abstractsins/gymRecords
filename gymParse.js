const fs = require('fs');
const filepath = './gymRecords.txt';

var txt = '';

var getText = fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    } 
    txt = data;
})

