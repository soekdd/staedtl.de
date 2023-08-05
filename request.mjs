import { WBK } from 'wikibase-sdk'
import fs from 'fs';
import request from 'request';
import blacklist from './blacklist.mjs';

var arrayToValues = (arr) => {
  let res = [];
  for (let a of arr)
      res.push(parseInt(a))
  return res;
}

var getCoordinates = (city)=>{
  let geo = city.location.value.slice(6).slice(0,-1).split(' '); 
  for (let i in geo) { geo[i] = parseFloat(geo[i]) }
  // console.log(geo);
  return geo;
}

var lz = (p)=>{
  return "00000".concat(p).slice(-5)
}

var getPLZ = (city) => {
  if (city.plzMin == undefined) return 'unbekannt';
  let plzs = [...city.plzMin.value.split('–'), ...city.plzMax.value.split('–')];  
  let plz = lz(plzs[0]);
  if (plzs.length > 0) {
    let p1 = Math.min(...arrayToValues(plzs));
    let p2 = Math.max(...arrayToValues(plzs));
    if (p1 == p2)
      plz = lz(p1);
    else
      plz = [lz(p1), lz(p2)]
  }
  //console.log(city.plzMin.value,city.plzMax.value,plzs,plz)
  return plz
}

// Make sure you initialize wbk with a sparqlEndpoint
const wbk = WBK({
  instance: 'https://wikidata.org/',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const wikimedia = 'http://commons.wikimedia.org/wiki/Special:FilePath/';
for (let iso of ['de', 'eu']) {
  const sparql = fs.readFileSync('wikidata.'+iso+'.sparql');
  const url = wbk.sparqlQuery(sparql)
  const headers = { 'User-Agent': 'nodejs' }; // see https://meta.wikimedia.org/wiki/User-Agent_policy
  // request the generated URL with your favorite HTTP request library
  request({ method: 'GET', url, headers }, (error, response, body) => {
    let data = [];
    let cityNames = new Set(blacklist);
    // fs.writeFileSync('body.'+iso+'.js', body);
    for (let city of JSON.parse(body).results.bindings) {
      if (!cityNames.has(city.cityLabel?.value)) {
        let c = {
          n: city.cityLabel.value,
          z: getPLZ(city),
          s: city.stateLabels?.value || city.countryLabel?.value,
          c: city.countryLabel?.value,
          a: city.height?.value ||0,
          f: city.flag?.value.replace(wikimedia,'@') || 'wappen.svg',
          l: city.locationMap?.value.replace(wikimedia,'@') || 'place.svg',
          p: city.image?.value.replace(wikimedia,'@') || 'placeholder.jpg',
          i: city.inhabitants.value,
          g: getCoordinates(city),
          w: city.article?.value
        }
        data.push(c);
        cityNames.add(c.c);
      }
    }
    //console.log(body)
    fs.writeFileSync('data.'+iso+'.js', 'var data'+iso+' = ' + JSON.stringify(data) + ';');
    if (error) console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the Google homepage.
  
  });
}