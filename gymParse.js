const filepath = './gymRecords.txt';

var oGym = {
    'loaded': false,
    'dateCodes': [],
    'dates': {},
};

var exerciseCatagories = {
    'upper-body': ['lateral pulldown', 'lateral raise', 'biceps curl', 'triceps extension', 'diverging seated row', 'converging chest press', 'converging shoulder press'],
    'lower-body': ['inner thigh', 'outer thigh', 'angled leg press (unloaded 136lbs)']
}


window.onload = function() {

    console.log('######### window is loaded');

    //* Start Parsing Process
    (async () => {
        oGym['raw'] = await fetchData(filepath);
        oGym['loaded'] = true;
        getStarted(oGym);
        console.dir(oGym);
        
        if (oGym['loaded'] === true) {
            console.log('######### gym data is loaded, begin plotting');
            
            // google chart
            // doChart(oGym);
            webUi(oGym);
            
        } else {
            console.error('######### gym data not loaded');
        }     
        bigScreen();
        logStats(oGym);
    })()  ;
        
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
        console.log(sub, '>>>', 'total characters: ' + nChars);
        return data;
    } catch (error) {
        console.error('!!!!! There has been a problem with your fetch operation:', error);
    }
}

function getStarted(oGym) {
    console.groupCollapsed('Records Parsing');
    var sub = 'getStarted()';
    console.log(sub, '>>>>>', 'has been called');

    oGym['formatted'] = format(oGym['raw'])
    oGym['textArr'] = breakdown(oGym['formatted']);
    parse(oGym);
    totalWeights(oGym);
    console.groupEnd();
}

function doChart(label) {

    var exercise = label;
    
    console.group('Chart Plotting');

    // Set chart options
    var options = {
        'title': 'Reps x Weight Over Time',
        'width': 800,
        'height': 600
    };

    if (screen.width > 1200) {
        options['width'] = 1000;
        options['height'] = 800;
    }

    // ! sample
    // Create the data table.
    var data = new google.visualization.DataTable();
    // X-Axis (time)
    data.addColumn('string', 'Date');
    data.addColumn('number', exercise);
    // data.addRows([
    //     ['Mushrooms', 3],
    //     ['Onions', 1],
    //     ['Olives', 1],
    //     ['Zucchini', 1],
    //     ['Pepperoni', 2]
    // ]);

    var dataSet = getDataFromExercise(exercise);
    data.addRows(dataSet);
    
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);

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

function getDataFromExercise(exercise) {
    var data = [];
    Object.keys(oGym.dates).forEach(date => {
        if (Object.keys(oGym['dates'][date]['exercises']).includes(exercise)) {
            var readableDate = oGym['dates'][date]['readable'];
            var totalWeightReps = oGym['dates'][date]['exercises'][exercise]['totalWeightReps'];
            data.push([readableDate, totalWeightReps]);
        }
    })
    console.log(data);
    return data;
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

    var currentDate, currentExercise;

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

        // exercise
        if (el.match(/^[a-zA-Z]+/, 'i')) {
            var exercise = el.trim(); 
            currentExercise = exercise;
            oGym['dates'][currentDate]['exercises'][exercise] = {};
            oGym['dates'][currentDate]['exercises'][exercise].sets = [];
        } 

        // reps
        if (el.match(/^\d+lb/)) {
            oGym['dates'][currentDate]['exercises'][currentExercise].sets.push(el);
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

//* DOM MANIPULATION
class exeButton {
    constructor(label, category) {
        this.button = document.createElement('exe');
        this.button.innerHTML = label;
        this.button.setAttribute('id', label);
        this.button.classList.add(category);
        var button = this.button;
        this.button.addEventListener('click', function() {
            doChart(label);
            checkRadio(button);
        })
    }

    organize() {
        var cats = Array.from(document.getElementsByTagName('exe-cat'));
        cats = cats.filter(cat => {
            if (this.button.classList.contains(cat.id)) {
                return true;
            } else if (cat.id.replaceAll('-', ' ') === this.button.innerHTML) {
                return true;
            } else {
                return false;
            }
        });
        if (cats[0]) {
            cats[0].append(this.button);
        }
    }
}

function checkRadio(button) {
    console.log(button);
    var buttons = Array.from(document.getElementsByTagName('exe'));
    buttons.forEach(button => {
        if (button.classList.contains('active')) {
            button.classList.remove('active');
        }
    })

    button.classList.add('active');

}

class catDiv {
    constructor(cat) {
        this.div = document.createElement('exe-cat');
        this.div.setAttribute('id', cat);
        this.div.classList.add('category');
    }

    organize() {
        document.getElementById('exercises').append(this.div);
    }
}

function webUi(oGym) {
    console.group('*** Web UI ***')
    exercisePopulation(oGym);
    console.groupEnd();
}

function exercisePopulation(oGym) {
    var sub = 'exercisePopulation()';
    console.log(sub, '>>>>>', 'has been called');

    var exercises = ['upper body', 'lower body'];

    Object.keys(oGym['dates']).forEach(date => {
        var daysExes = Object.keys(oGym['dates'][date]['exercises']);
        daysExes.forEach(exe => {
            if (!exercises.includes(exe)) {
                exercises.push(exe);
            }
        })
    })

    console.log(sub, '>>>', exercises);

    createListDiv(exercises, exerciseCatagories);

}

function createListDiv(exercises, catagories) {
    var sub = 'createListDiv()';
    console.log(sub, '>>>>>', 'has been called');

    var continaner = document.createElement('div');
    continaner.setAttribute('id', 'exes-container');

    var upperBody = document.createElement('exercise-cat');
    upperBody.setAttribute('id', 'upper-body-exes');
    var upperBodyExes = [];

    var lowerBody = document.createElement('exercise-cat');
    lowerBody.setAttribute('id', 'lower-body-exes');
    var lowerBodyExes = [];
    
    Object.keys(catagories).forEach(cat => {
        var div = new catDiv(cat);
        div.organize();
    });

    exercises.forEach(exe => {
        var cat;
        if (catagories['upper-body'].includes(exe)) {
            upperBodyExes.push(exe);
            cat = 'upper-body';
        } else if (catagories['lower-body'].includes(exe)) {
            lowerBodyExes.push(exe);
            cat = 'lower-body';
        }
        var btn = new exeButton(exe, cat);
        btn.organize();
    })


}

function bigScreen() {

    if (screen.width > 1200) {
        console.log('big screen');
        document.body.style.flexDirection = 'row';
        document.getElementById('exercises').style.width = '600px';
        Array.from(document.getElementsByTagName('exe-cat')).forEach(div => {
            div.style.width = "250px";
        })
    } 
}