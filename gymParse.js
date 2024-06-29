const fs = require('fs').promises;
const filepath = './gymRecords.txt';

var oGym = {};

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

    // console.dir(oGym);

    // console.log(oGym['dates'].length);
    // console.log(oGym['workouts'].length);

})();   







//* MOTHER FUNCTIONS
function getStarted(oGym) {
    oGym['raw'] = inputFormat(oGym['raw'])
    getDates(oGym); // X-Axis
    getWorkouts(oGym);
}


//* PRE-PARSING
function inputFormat(string) {
    // string = string.replaceAll('\n', '');
    // string = string.replaceAll('\r', '+');
    // string = gapReplacer(string);

    // string = string.replaceAll(/(20\d{6})/g, '\r\n$1\n');
    // string = string.replaceAll(/(lbs)/g, ' $1\n');
    // string = string.replaceAll(/(x\d{1,})(\D)/g, '$1\n$2');
    // string = string.replaceAll(/(\s*\d{1,}lb\s)/g, '$1');


    console.log(string)
    return string;
}


//* PARSING
// X-Axis
function getDates(oGym) {

    const aMonths = '0 January February March April May June July August September October November December'.split(' ');

    console.group('\nDates / X-Axis');
    var text = oGym['raw'];
    var dateReg = new RegExp(/20\d{6}/, 'g');
    oGym['dates'] = text.match(dateReg);
    
    
    oGym['formatted dates'] = oGym['dates'].map(date => {
        var iMonth = parseInt(date.substring(4, 6));
        var month = aMonths[iMonth].substring(0, 3);
        var day = date.substring(6, 8);
        var year = date.substring(2, 4)
        return `${month}-${day} '${year}`;
    })
    console.dir(oGym['formatted dates']);
    
    console.groupEnd();
}

function getWorkouts(oGym) {
    var text = oGym['raw'];
    var workoutReg = new RegExp(/(?<=\d{8}\s).*(?=\s20\d{6})/, 'g');
    oGym['workouts'] = text.match(workoutReg);
    // console.dir(oGym['workouts']);
}


//* GENERAL FUNCTIONS
function gapReplacer(string) {
    string = string.replaceAll(/\s{2,}/g, ' ');
    return string;
}