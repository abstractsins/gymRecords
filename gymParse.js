const fs = require('fs').promises;
const filepath = './gymRecords.txt';

var oGym = {
    'dates': {},
};

async function readFileAsync(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

(async () => {
    oGym['raw'] = await readFileAsync(filepath);
    getStarted(oGym);
})();   



function getStarted(oGym) {
    oGym['textArr'] = breakdown(oGym['raw']);
    parse(oGym);
    logStats(oGym);
}

function breakdown(string) {
    var sub = 'breakdown()';
    console.log(sub, '>>>>>', 'has been called');

    var arr = string.split('\r\n');
    arr = arr.filter(el => el !== '');
    console.log(sub, '>>>', 'output array\n', arr);
    return arr;
}

function parse(oGym) {
    var sub = 'parse()';
    console.log(sub, '>>>>>', 'has been called');

    oGym['textArr'].forEach((el, i, a) => {
        if (el.match(/^20\d{6}$/)) {
            console.log(sub, '>>>', 'date code found', el);
            oGym['dates'][el] = {};
            oGym['dates'][el].readable = ''; //! FORMAT 
            oGym['dates'][el].excercizes = {};
            var excersize = a[i+1]; //? how to do more than one
        }
    });
}

function logStats(oGym) {
    var sub = 'logStats()';
    console.log(sub, '>>>>>', 'has been called');
    console.group('\n+++ GYM STATS +++');
    var numWorkouts = oGym['dates'].length;
    console.log('### total number of workouts: ' + numWorkouts)
    console.groupEnd();
}

