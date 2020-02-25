const url = [];
const cam1 = 'http://weathercam.digitraffic.fi/C0157200.jpg';
const cam2 = 'http://weathercam.digitraffic.fi/C0157400.jpg';
const cam3 = 'http://weathercam.digitraffic.fi/C0167800.jpg';
const cam4 = 'http://weathercam.digitraffic.fi/C0153501.jpg';
url.push(cam1, cam2, cam3, cam4);

const eka = document.getElementById('eka');
const toka = document.getElementById('toka');

eka.src = url[0];
toka.src = url[1];

console.log('sssssssssssss');
fetch('http://tie.digitraffic.fi/api/v1/data/weather-data/1035')
.then((response) => {
  console.log('sadwawada');
  return response.json();
}).
    then((json) => {
      console.log(json);
      let lampotila = json.weatherStations[0].sensorValues[0].sensorValue;
      console.log('Tässä on lämpötila: ', lampotila);
      let lampotilaDiv = document.querySelector('#lampotilaDiv');
      lampotilaDiv.innerHTML = lampotila + ' &#8451';

    }).
    catch((error) => {
      console.log(error);
    });


console.log('kakkaa');
function setUrls(urlList) {

  console.log('ddddddd');
  if (eka.src === urlList[0] && toka.src === urlList[1]) {
    eka.src = urlList[2];
    toka.src = urlList[3];
  }
  else {
    eka.src = urlList[0];
    toka.src = urlList[1];
  }


}

let interval = setInterval(function() {
  setUrls(url);
}, 30000);


