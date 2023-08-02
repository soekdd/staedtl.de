import { WBK } from 'wikibase-sdk'
import fs from 'fs';
import request from 'request';

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

var getPLZ = (city) => {
  if (city.plzMin == undefined) return 'unbekannt';
  let plzs = [...city.plzMin.value.split('-'), ...city.plzMax.value.split('-')];
  let plz = plzs[0];
  if (plzs.length > 0) {
    let p1 = Math.min(...arrayToValues(plzs));
    let p2 = Math.max(...arrayToValues(plzs));
    if (p1 == p1)
      plz = p1;
    else
      plz = [p1, p2]
  }
  return plz
}

// Make sure you initialize wbk with a sparqlEndpoint
const wbk = WBK({
  instance: 'https://wikidata.org/',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
for (let iso of ['de', 'eu']) {
  const sparql = fs.readFileSync('wikidata.'+iso+'.sparql');
  const url = wbk.sparqlQuery(sparql)
  const headers = { 'User-Agent': 'nodejs' }; // see https://meta.wikimedia.org/wiki/User-Agent_policy
  // request the generated URL with your favorite HTTP request library
  request({ method: 'GET', url, headers }, (error, response, body) => {
    let data = [];
    let cityNames = new Set();
    fs.writeFileSync('body.'+iso+'.js', body);
    for (let city of JSON.parse(body).results.bindings) {
      if (!cityNames.has(city.cityLabel?.value)) {
        let c = {
          n: city.cityLabel.value,
          z: getPLZ(city),
          s: city.stateLabels?.value || city.countryLabel?.value,
          c: city.countryLabel?.value,
          a: city.height.value,
          f: city.flag?.value || 'wappen.svg',
          l: city.locationMap?.value || 'place.svg',
          p: city.image?.value || 'placeholder.jpg',
          i: city.inhabitants.value,
          g: getCoordinates(city)
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