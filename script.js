var data, game, fuse,fireworks;
var level = 1;
var tries = [];
dataeu = [...dataeu, ...dataes, ...databe,...dataru, ...datade.filter(e => e.i > 250000)];
var maxLevel = 7;
const wikimedia = 'http://commons.wikimedia.org/wiki/Special:FilePath/';
var spruch = ['', 'Glück gehabt!', 'Du bist ein Genie!', 'Das war sehr gut!', 'Ziemlich gut!', 'Immer noch ganz gut!', 'Du brauchtest viel Hilfe!', 'Knappe Sache!'];
var main = () => {    
    setISO(window.location.hash.slice(1)||'de');        
}

var handleURL = (url) => {
    return url.replace('@', wikimedia);
}

var setISO = (iso) => {    
    window.location.hash = '#' + iso;
    if (level == 1) {
        game = iso;
        if (game == 'de') {
            data = datade;
            dataRandom = data;
            document.getElementById('eu').style = "opacity:0.3";
            document.getElementById('de').style = "";
        } else {
            data = dataeu;
            dataRandom = dataeu.filter(e => e.c != 'Deutschland');
            document.getElementById('eu').style = "";
            document.getElementById('de').style = "opacity:0.3";
        }
        let today = new Date();        
        let seed = (today.getFullYear() * 100 + today.getMonth()) * 100 + today.getDay();
        currentCity = dataRandom[random(seed+3, dataRandom.length)];    
        console.log(currentCity);
        setInfoLevel( 1*level );    
    } else {
        document.getElementById('eu').style = "display:none";
        document.getElementById('de').style = "display:none";    
    }
    fuse = new Fuse(data, { keys: ['n'],location:0,distance:2 });
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
        try{
            document.getElementById('input').setAttribute('placeholder', (level < maxLevel ? level + '.' : 'letzter') + ' Versuch');
        } catch(e) {}
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
var nextGame = () => {
    if (game=='de')
        document.getElementById('nowEU').style = "";
    else
        document.getElementById('nowDE').style = "";
}

var nextTry = () => {
    document.getElementById('infoField').style="display:none"
    document.getElementById('impressum').style = "display:none"
    document.getElementById('outerLocation').style = '';
    let input = document.getElementById('input').value.toUpperCase();
    if (currentCity.n.toUpperCase() == input) {
        document.getElementById('inputArea').innerHTML = '<h2 class="won">GEWONNEN!</h2><p>' + spruch[level] +'</p>';
        setInfoLevel(99);
        fireworks = new Fireworks.default(document.getElementById('firework'), {explosion:(maxLevel-level)+1,particles:10*((maxLevel-level)+1)})
        document.getElementById('firework').style=""
        fireworks.start();
        nextGame();
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
        nextGame();
    }
    document.getElementById('proposal').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('ok').disabled = true;
}

var newGame = (iso) => {
    window.location.hash = '#' + iso;
    window.location.reload();
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
        let geo = window.geodesic.Geodesic.WGS84.Inverse(tGeo[1], tGeo[0], cGeo[1], cGeo[0]);
        let distance = Math.round(geo.s12 / 1000);
        let deg = Math.round(geo.azi1);
        s += '<p>' + count + '. ';
        //https://maps.google.com/?q=38.6531004,-90.243462&ll=38.6531004,-90.243462&z=3
        s += '<a href="https://maps.google.com/?q=' + tGeo[1] + ',' + tGeo[0] + '&ll=' + tGeo[1] + ',' + tGeo[0] + '&z='+(game=='de'?9:7) +'" target="_blank">' + city.n + '</a>';
        //s += '<a href="https://www.google.com/maps/search/?api=1&query=' + tGeo[1] + '%2C' + tGeo[0] + '&zoom=2&hl=de" target="_blank">' + city.n + '</a>';
        s += '<img src="arrow.svg" alt="course:' + deg + '°" style="transform: rotate(' + deg + 'deg);" class="arrow"/>';
        s += Math.round(distance) + ' km</p>';
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
    for (let f of fuse.search(input).slice(0,5)) {
        s += '<div class="pLine" onclick="setProp(\'' + f.item.n + '\')" >' + f.item.n + '</div>';
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
        if (level == 1)
            document.getElementById('privacy').style = "";
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
        if (level == 1)
            document.getElementById('privacy').style = "";
    }

}