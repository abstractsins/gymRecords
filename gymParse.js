const fs = require('fs');
const filepath = './gymRecords.txt';

async function getText(filepath) {
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            return err;
        } 
        return data;
    })
}

var text = await(getText(filepath));

