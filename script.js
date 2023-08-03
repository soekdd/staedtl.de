var data, game;
var level = 1;
var tries = [];
var maxLevel = 7;
const wikimedia = 'http://commons.wikimedia.org/wiki/Special:FilePath/';
var spruch = ['', 'Glück gehabt!', 'Du bist ein Genie!', 'Das war sehr gut!', 'Ziemlich gut!', 'Immer noch ganz gut!', 'Du brauchtest viel Hilfe!', 'Knappe Sache!'];
var main = () => {    
    setISO('de');
}

var handleURL = (url) => {
    return url.replace('@', wikimedia);
}

var setISO = (iso) => {    
    if (level == 1) {
        game = iso;
        if (game == 'de') {
            data = datade;
            document.getElementById('eu').style = "opacity:0.3";
            document.getElementById('de').style = "";
            } else {
            data = dataeu;
            document.getElementById('eu').style = "";
            document.getElementById('de').style = "opacity:0.3";
        }
        let today = new Date();
        let seed = (today.getFullYear() * 100 + today.getMonth()) * 100 + today.getDay();
        currentCity = data[random(seed, data.length)];    
        console.log(currentCity);
        setInfoLevel( 1*level );    
        } else {
        document.getElementById('eu').style = "display:none";
        document.getElementById('de').style = "display:none";    
    }
    document.getElementById('proposal').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('ok').disabled = true;

}

var random = (seed, max) => {
    seed = seed - 51;
    var x = Math.sin(seed++) * 10000;
    return Math.floor(max * (x - Math.floor(x)));
}

var arrayToValues = (arr) => {
    let res = [];
    for (let a of arr)
        res.push(parseInt(a))
    return res;
}
var setInfoLevel = (level) => { 
    if (level > 1) {
        document.getElementById('eu').style = "display:none";
        document.getElementById('de').style = "display:none";
        document.getElementById('privacy').style = "display:none";
    }
    try {
        document.getElementById('label').innerHTML = level + '/' + maxLevel + ':';
    } catch(e) {}
    let levels = ['alt', 'pop', 'wappen', 'plz', 'photo', 'location',     'state','cityname'].splice(0, level);
    if(levels.includes('alt')) { 
        document.getElementById('alt').innerHTML = '<h4>Höhe über N.N.</h4><p>' + currentCity.a + ' m</p>';
    }
    if(levels.includes('pop')) {
        document.getElementById('pop').innerHTML = '<h4>Einwohnerzahl:</h4><p>' + parseInt(currentCity.i).toLocaleString("de-DE") + '</p>';
    }
    if (levels.includes('plz') && game=="de") {
        if (Array.isArray(currentCity.z))
            document.getElementById('plz').innerHTML = '<h4>Postleitzahlen:</h4><p>' + currentCity.z.join('-') + '</p>';
        else 
            document.getElementById('plz').innerHTML = '<h4>Postleitzahl:</h4><p>' + currentCity.z + '</p>';
    }   
    if (levels.includes('plz') && game=="eu") {
        document.getElementById('plz').innerHTML = '<h4>Land:</h4><p>' + currentCity.c + '</p>';
    }   
    if (levels.includes('wappen')) {
        document.getElementById('wappen').src = handleURL(currentCity.f)+'?width=300px';
    }
    if (levels.includes('state')) {
        document.getElementById('state').innerHTML = '<h4>Verwaltungseinheit:</h4><p>' + currentCity.s.split(',')[0] + '</p>';
    }    
    if (levels.includes('cityname')) {
        document.getElementById('cityname').innerHTML = currentCity.w==''?currentCity.n:'<a href="'+currentCity.w+'" target="_blank">'+currentCity.n+'</a>';
    }    
    if (levels.includes('photo')) {
        document.getElementById('header').style = 'background-image: url('+ handleURL(currentCity.p)+'?width=1200px)';
    }
    if (levels.includes('location')) {
        document.getElementById('location').src = handleURL(currentCity.l)+'?width=400px';
    }
}
var currentCity;

var getCoordinates = (city)=>{
    let geo = city.location.slice(6).slice(0,-1).split(' '); 
    for (let i in geo) { geo[i] = parseFloat(geo[i]) }
    // console.log(geo);
    return geo;
}

var getIndex = (label)=>{
    for (let index in data)
        if (data[index].n.toUpperCase() == label.toUpperCase())
            return index
    return -1;
}

var nextTry = () => {
    document.getElementById('infoField').style="display:none"
    document.getElementById('impressum').style = "display:none"
    document.getElementById('location').style = '';
    let input = document.getElementById('input').value.toUpperCase();
    if (currentCity.n.toUpperCase() == input) {
        document.getElementById('inputArea').innerHTML = '<h2 class="won">GEWONNEN!</h2><p>' + spruch[level] +'</p>';
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
        document.getElementById('inputArea').innerHTML = '<h2 class="lost">VERLOREN!</h2>';
    }
    document.getElementById('proposal').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('ok').disabled = true;
}

var checkOK = () => {
    let input = document.getElementById('input').value.toUpperCase();
    let found = false;
    for (let city of data)
        found = found || city.n.toUpperCase() == input

    document.getElementById('ok').disabled = !found;
}

var updateTries = () => {
    let s = '<h4>Fehlversuche:</h4>';
    let cGeo = currentCity.g;
    let count = 0;
    for (let city of tries) {
        count++;
        let tGeo = city.g;
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
        s += '<p>' +count+'. ' + ('<a href="https://www.google.com/maps/search/?api=1&query='+city.g[1]+'%2C'+city.g[0]+'&zoom=2&hl=de" target="_blank">'+city.n+'</a>')
            + '<img src="arrow.svg" style="transform: rotate('+Math.round(deg)+'deg);" class="arrow"/>'
            +  Math.round(distance) + ' km</p>';
    }
    document.getElementById('tries').style = '';    
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
        if (city.n.toUpperCase().slice(0,input.length) == input) {
            counter++;
            if (counter < 6) {
              s += '<a href="#" onclick="setProp(\''+city.n+'\')" >' + city.n + '</a></br>';
            }
        }
    document.getElementById('proposal').innerHTML = s;
}

var impressum = (action) => {
    if (action == 'show') {
        document.getElementById('privacy').style = "display:none";
        document.getElementById('infoField').style="display:none"
        document.getElementById('impressum').style="display:block"
    }
    else {
        document.getElementById('impressum').style = "display:none"
        if (level == 1) {
            document.getElementById('privacy').style = "";
        }        
    }

}

var info = (action) => {
    if (action == 'show') {
        document.getElementById('privacy').style = "display:none";
        document.getElementById('impressum').style="display:none"
        document.getElementById('infoField').style = "display:block"
        document.getElementById('numDe').innerHTML = datade.length + ' Städte';
        document.getElementById('numEu').innerHTML = dataeu.length + ' Städte';        
        document.getElementById('minDe').innerHTML = '&gt;' + Math.trunc(Math.min(...datade.map(d => d.i)) / 1000) + ' TEinw.';
        document.getElementById('minEu').innerHTML = '&gt;' + Math.trunc(Math.min(...dataeu.map(d => d.i)) / 1000) + ' TEinw.';   
    }
    else {
        document.getElementById('infoField').style = "display:none"
        if (level == 1) {
            document.getElementById('privacy').style = "";
        }    
    }

}