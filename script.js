var data = [];
var main = () => {
    let cityNames = new Set();
    for (let city of rawData) {
        if (!cityNames.has(city.cityLabel)) {
            data.push(city);
            cityNames.add(city.cityLabel);
        }
    }
    let today = new Date();
    let seed = (today.getFullYear() * 100 + today.getMonth()) * 100 + today.getDay();
    currentCity = data[random(seed, data.length)];
    setInfoLevel( 1*level );
    console.log(currentCity);    
}

var random = (seed, max) => {
    seed = seed - 100;
    var x = Math.sin(seed++) * 10000;
    return Math.floor(max * (x - Math.floor(x)));
}
var level = 1;
var tries = [];
var maxLevel = 7;

var arrayToValues = (arr) => {
    let res = [];
    for (let a of arr)
        res.push(parseInt(a))
    return res;
}
var setInfoLevel = (level) => {
    let levels = ['alt', 'pop', 'wappen', 'plz', 'photo', 'state', 'location','cityname'].splice(0, level);
    if(levels.includes('alt')) {
        document.getElementById('alt').innerHTML = currentCity.height + ' m';
    }
    if(levels.includes('pop')) {
        document.getElementById('pop').innerHTML = currentCity.inhabitants;
    }
    if (levels.includes('plz')) {
        let plzs = [...currentCity.plzMin.split('-'), ...currentCity.plzMax.split('-')];
        plz = plzs[0];
        if (plzs.length > 0) {
            let p1 = Math.min(...arrayToValues(plzs));
            let p2 = Math.max(...arrayToValues(plzs));
            if (p1 == p1)
                plz = p1;
            else plz = p1 + '-' + p2;
        }  
        document.getElementById('plz').innerHTML = plz;
    }   
    if (levels.includes('wappen')) {
        document.getElementById('wappen').src = currentCity.flag+'?width=300px';
    }
    if (levels.includes('state')) {
        document.getElementById('state').innerHTML = currentCity.stateLabel;
    }    
    if (levels.includes('cityname')) {
        document.getElementById('cityname').innerHTML = currentCity.cityLabel;
    }    
    if (levels.includes('photo')) {
        document.getElementById('photo').src = currentCity.image+'?width=400px';
    }
    if (levels.includes('location')) {
        document.getElementById('location').src = currentCity.locationMap+'?width=400px';
    }
}
var currentCity;

var getCoordinates = (city)=>{
    let geo = city.location.slice(6).slice(0,-1).split(' '); 
    for (let i in geo) { geo[i] = parseFloat(geo[i]) }
    console.log(geo);
    return geo;
}

var getIndex = (label)=>{
    for (let index in data)
        if (data[index].cityLabel.toUpperCase() == label.toUpperCase())
            return index
    return -1;
}

var nextTry = () => {
    let input = document.getElementById('input').value.toUpperCase();
    if (currentCity.cityLabel.toUpperCase() == input) {
        document.getElementById('inputArea').innerHTML = '<h1 class="won">GEWONNEN!</h1>';
        setInfoLevel(99);
        return
    }
    let index = getIndex(input);
    if (index != -1) {
        level++;
        setInfoLevel(level);
        tries.push(data[index])
    }
    updateTries();
    if (level > maxLevel) {
        document.getElementById('inputArea').innerHTML = '<h1 class="lost">VERLOREN!</h1>';
    }
    document.getElementById('proposal').innerHTML = '';
    document.getElementById('input').value = '';
}

var checkOK = () => {
    let input = document.getElementById('input').value.toUpperCase();
    let found = false;
    for (let city of data)
        found = found || city.cityLabel.toUpperCase() == input

    document.getElementById('ok').disabled = !found;
}

var updateTries = () => {
    let s = 'Fehlversuche:<br>';
    let cGeo = getCoordinates(currentCity);
    let count = 0;
    for (let city of tries) {
        count++;
        let tGeo = getCoordinates(city);
        let long1 = cGeo[0];
        let long2 = tGeo[0];
        let lat1 = cGeo[1];
        let lat2 = tGeo[1];
        let dx = long1 - long2;
        let dy = lat1 - lat2;
        let deg = 180 * Math.atan2(dx, dy) / Math.PI;
        let distance = 6370 * Math.acos(
            (Math.sin(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180)) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.cos(long2 * Math.PI / 180 - long1 * Math.PI / 180 )
        );
        s += '<p>' +count+'. ' + city.cityLabel
            + '<img src="arrow.svg" style="transform: rotate('+Math.round(deg)+'deg);" class="arrow"/>'
            +  Math.round(distance) + ' km</p>';
    }
    document.getElementById('tries').innerHTML = s;
}

var setProp = (newValue) => {
    document.getElementById('input').value = newValue;
    checkOK();
    document.getElementById('proposal').innerHTML = "";
}

var proposal = () => {
    checkOK();
    let input = document.getElementById('input').value.toUpperCase();
    let counter = 0;
    let s = '';
    for (let city of data)
        if (city.cityLabel.toUpperCase().slice(0,input.length) == input) {
            counter++;
            if (counter < 5) {
              s += '<a href="#" onclick="setProp(\''+city.cityLabel+'\')" >' + city.cityLabel + '</a></br>';
            }
        }
    document.getElementById('proposal').innerHTML = s;
}