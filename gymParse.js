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

    oGym['raw'] = inputFormat(oGym['raw'])

    getDates(oGym);
    getWorkouts(oGym);

})();   




function getDates(oGym) {
    var text = oGym['raw'];
    var dateReg = new RegExp(/20\d{6}/, 'g');
    oGym['dates'] = text.match(dateReg);
    console.dir(oGym['dates']);
}

function getWorkouts(oGym) {
    var text = oGym['raw'];
    var workoutReg = new RegExp(/(?<=\d{8}\s).*(?=\s20\d{6})/, 'g');
    oGym['workouts'] = text.match(workoutReg);
    console.dir(oGym['workouts']);
}

function inputFormat(string) {
    string = string.replaceAll('\n', ' ');
    string = string.replaceAll('\r', '');
    string = gapReplacer(string);

    return string;
}

function gapReplacer(string) {
    string = string.replaceAll(/\s{2,}/g, ' ');
    return string;
}