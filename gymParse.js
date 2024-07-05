const filepath = './gymRecords.txt';

var oGym = {
    'loaded': false,
    'dateCodes': [],
    'dates': {},
};

async function fetchData(filePath) {
    var sub = 'fetchData()';
    console.log(sub, '>>>>>', 'has been called');
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.text();
        var nChars = data.length;
        console.log(sub, '>>>', 'File read');
        // console.log(data);
        console.log(sub, '>>>', 'total characters: ' + nChars);
        return data;
    } catch (error) {
        console.error('!!!!! There has been a problem with your fetch operation:', error);
    }
}

(async () => {
    oGym['raw'] = await fetchData(filepath);
    oGym['loaded'] = true;
    getStarted(oGym);

    // console.log(util.inspect(oGym.dates, { depth: null, colors: true }));        
})();  


window.onload = function() {

    console.log('######### window is loaded');

    if (oGym['loaded'] === true) {
        console.log('######### gym data is loaded, begin plotting');

        // debug
        var text = document.createElement('p');
        text.innerHTML = oGym['raw'];
        document.body.append(text);
        // google chart

    } else {
        console.error('######### gym data not loaded');       
    }     

};



function getStarted(oGym) {
    console.group('Records Parsing');
    var sub = 'getStarted()';
    console.log(sub, '>>>>>', 'has been called');

    oGym['formatted'] = format(oGym['raw'])
    oGym['textArr'] = breakdown(oGym['formatted']);
    parse(oGym);
    totalWeights(oGym);
    logStats(oGym);
    console.groupEnd();
}

function format(string) {
    var sub = 'format()';
    console.log(sub, '>>>>>', 'has been called');

    string = string.toLowerCase();

    string = string.replaceAll(/\blat\b/g, 'lateral');
    string = string.replaceAll(/\bpull\sdown\b/g, 'pulldown');
    string = string.replaceAll(/(\bunloaded\s\d+lbs\b)/g, '($1)');

    return string;

}

function totalWeights(oGym) {
    var sub = 'totalWeights()';
    // console.log(sub, '>>>>>', 'has been called');

    var dates = Object.keys(oGym['dates']);

    dates.forEach(date => {
        var exercises = Object.keys(oGym['dates'][date]['exercises']);
        exercises.forEach(exercise => {
            var exe = oGym['dates'][date]['exercises'][exercise];
            var weightReps = repAdder(exe['sets']);
            exe['totalReps'] = weightReps.totalReps;
            // Y-Axis
            exe['totalWeightReps'] = weightReps.totalWeightReps;
        })
    });
}

function repAdder(sets) {
    var sub = 'repAdder()';
    // console.log(sub, '>>>>>', 'has been called');

    var weightObject = {
        'totalReps': 0,
        'totalWeightReps': 0
    }

    var weights = [], reps = [];
    sets.forEach(set => {
        set = set.split(' ');
        weights.push(set[0]);
        reps.push(set[1]);
    });

    weights = weights.map(weight => {
        return weight.match(/^\d+/)[0];
    })

    reps = reps.map(rep => {
        rep = rep.split('x');
        var nSets = parseInt(rep[0]);
        var nReps = parseInt(rep[1]);
        return nSets*nReps;
    })

    var weightRepsArr = reps.map((total, i, a) => {
        return parseInt(weights[i])*total;
    })

    var totalWeightReps = weightRepsArr.reduce((a,b) => a+b)

    var totalReps = reps.reduce((a,b) => a+b);

    weightObject['totalReps'] = totalReps;
    weightObject['totalWeightReps'] = totalWeightReps;

    return weightObject;
}

function breakdown(string) {
    var sub = 'breakdown()';
    console.log(sub, '>>>>>', 'has been called');

    var arr = string.split('\n');
    arr = arr.filter(el => el !== '');
    // console.log(sub, '>>>', 'output array\n', arr);
    return arr;
}

function parse(oGym) {
    var sub = 'parse()';
    console.log(sub, '>>>>>', 'has been called');

    var currentDate, currentExcercise;

    oGym['textArr'].forEach((el, i, a) => {

        el = el.trim();
        el = gapReplacer(el);

        // date
        if (el.match(/^20\d{6}$/)) {
            console.log('\n' + sub, '>>>', 'date code found', el);
            var dateCode = el.trim();
            oGym['dateCodes'].push(dateCode);

            currentDate = dateCode;

            oGym['dates'][dateCode] = {};
            oGym['dates'][dateCode]['readable'] = dateReadable(dateCode);
            oGym['dates'][dateCode]['exercises'] = {};
        }

        // excercise
        if (el.match(/^[a-zA-Z]+/, 'i')) {
            var exercise = el.trim(); 
            currentExcercise = exercise;
            oGym['dates'][currentDate]['exercises'][exercise] = {};
            oGym['dates'][currentDate]['exercises'][exercise].sets = [];
        } 

        // reps
        if (el.match(/^\d+lb/)) {
            oGym['dates'][currentDate]['exercises'][currentExcercise].sets.push(el);
        }
    });
}

function dateReadable(date) {
    var sub = 'dateReadable()';
    // console.log(sub, '>>>>>', 'has been called');
    
    const aMonths = '0 January February March April May June July August September October November December'.split(' ');
    
    var iMonth = parseInt(date.substring(4, 6));
    var month = aMonths[iMonth].substring(0, 3);
    var day = date.substring(6, 8);
    var year = date.substring(2, 4);
    
    var hrDate = `${month}-${day} '${year}`;
    console.log(sub, '>>>', 'human readable date: ' + hrDate);
    
    return hrDate;
}


//* GENERAL FUNCTIONS
function gapReplacer(string) {
    string = string.replaceAll(/\s{2,}/g, ' ');
    return string;
}


//* LOGGING FUNCTIONS
function logStats(oGym) {
    var sub = 'logStats()';
    // console.log(sub, '>>>>>', 'has been called');

    console.group('\n+++ GYM STATS +++');

    var numWorkouts = oGym['dateCodes'].length;

    var exercises = [];
    Object.keys(oGym['dates']).forEach(date => {
        var exes = Object.keys(oGym['dates'][date]['exercises']);
        exercises.push(exes);
    })
    exercises = new Set(exercises.flat());

    console.log('### total number of workouts: ' + numWorkouts);
    console.log('### total number of unique exercises: ' + exercises.size);
    console.groupEnd();
}