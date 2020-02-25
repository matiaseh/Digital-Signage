'use strict';

//#######################################
//#######################################

// HUOMIO LUKIJALLE!
/*

Tämän koodin sopivuutta ja tehokkuutta voi muuttaa muuttamalla eri parametreja

Näitä parametreja on seuraavat:
m = 10 // rivi 137??, kuvaa sitä, montako riviä ajovuoroja tulostetaan ruudulle

stopsByRadius:ksen parametrit
  lat:60.236144, 
  lon:24.818588, 
  radius: 500 // etäisyys käveltynä, jonka sisältä etsitään pysäkkejä. Yksikkönä metri.

stoptimesWithoutPatterns:sin parametri
  numberOfDepartures: 5 // kuvaa montako kappaletta ajovuoroja haetaan tietylle pysäkille



*/
//#######################################
//#######################################





// valitaan div, johon kaikki riviDivit tullaan sijoittamaan
const dataDiv = document.querySelector('.dataDiv');




//------------------------FUNKTIOT-------------------------------
// laita tähän osioon kaikki funktiot


const datataulukonLuominen = (json) => {

  // tehdään array, johon laitetaan näyttötaulun valmiiden rivien arrayt
  let taulukonRivitArray = [];

  // tehdään for-loop, jossa 'i' vastaa  noudetun datan pysäkkivaihtoehtotaulukon indeksiä (edges[])
  for (let i = 0; i < json.data.stopsByRadius.edges.length; i++) {

    // tehdään toinen for-loop, jossa 'k' vastaa kyseiseltä pysäkiltä lähtevien vuorojen taulukon indeksiä (stoptimesWithoutPatterns[])
    for (let k = 0; k < json.data.stopsByRadius.edges[i].node.stop.stoptimesWithoutPatterns.length; k++) {

      // luodaan array, johon laitetaan näyttötaulun riville tulevat tiedot säilöön väliaikaisesti
      let rivinTiedotArray = [];

      // työnnetään arrayhyn rivin arvot, jotka saadaan käyttämällä funktioita (ajanPoimintaJaMuotoilu, linjanPoiminta, maaranpaanPoiminta, pysakinNimenPoiminta, kavelyajanLaskeminen, matkanPoiminta ja tripGtfsidPoiminta)
      rivinTiedotArray.push(ajanPoiminta(json, i, k));
      rivinTiedotArray.push(linjanPoiminta(json, i, k));
      rivinTiedotArray.push(maaranpaanPoiminta(json, i, k));
      rivinTiedotArray.push(pysakinNimenPoiminta(json, i));
      rivinTiedotArray.push(kavelyajanLaskeminen(json, i));
      rivinTiedotArray.push(matkanPoiminta(json, i));
      rivinTiedotArray.push(tripGtfsidPoiminta(json, i, k));

      // työnnetään valmis rivi arrayhyn
      taulukonRivitArray.push(rivinTiedotArray);


    }

  }


  // tässä vaiheessa taulukonRivitArray-muuttuja on tyypiltään array, jonka alkioiden tyyppi on myös array
  // eli taulukonRivitArray on array, jonka sisällä on monta array:ta

  // tehdään setti (setissä voi olla vain yksi sananniminen alkio) eri gtfsId-arvoista noudetussa datassa, jotta voidaan lopulta karsia saman ajovuoron kaukaisemmat pysäkit pois
  let gtfsidSet = new Set();

  // käydään taulukonRiviArrayn alkiot (array) läpi ja lisätään settiin gtfsid-arvot
  taulukonRivitArray.forEach((subArray) => {
    gtfsidSet.add(subArray[6]);
  });

  // jaetaan data omiin taulukkoihinsa gtfsid:n perusteella
  // tähän tulevat syntyvät arrayt
  let gtfsidParentArray = [];

  // looppi, jossa 'p' saa arvoikseen jokaisen gtfsidSetin alkion (for of-loop)
  for (const p of gtfsidSet) {
    // tähän tulevat väliaikaisesti filterin ehdon täyttävät alkiot (alkion tyyppi: array)
    let gtfsidChildArray = taulukonRivitArray.filter((rivinTiedotArray) => rivinTiedotArray[6] === p);

    gtfsidParentArray.push(gtfsidChildArray);
  }

  // tähän array:hyn tulee tulee lopulta näyttötaulun rivit, jotka ovat kyseisen ajovuoron lähin pysäkki 
  let taulukonRivitArrayV2 = [];

  gtfsidParentArray.forEach((childArray) => {
    // sorttaus tapahtuu pysäkille käveltävän matkan perusteella pienimmästä suurimpaan
    childArray.sort(function (a, b) { return a[5] - b[5] });
    // valitaan jatkoon lyhyin kävelymatka pysäkille (nollas alkio)
    taulukonRivitArrayV2.push(childArray[0]);
  });


  // tässä sortataan rivit lähtöajan mukaan kasvavaan järjestykseen
  taulukonRivitArrayV2.sort();
  // jos lähtöaika on sama, niin näillä tiedoilla lajitteli pysäkin nimen mukaan.


  // tässä kohtaa koodia karsitaan näyttötaulusta ajovuorot, joiden lähtemiseen ei kerkeä enää kävellä

  // luodaan aikaNyt-muuttuja, joka on kellonaika dataa noudettaessa, reaaliaika
  // käytetään vertailemiseen onko aikaa kävellä pysäkille
  let aikaNyt = new Date();
  // TESTAUSTA VARTEN
  //console.log(aikaNyt, 'Tämä on kellonaika, jona sivu päivitettiin.');

  // tähän muuttujaan tulee lopulta näyttötaulun ajovuorojen rivi, joihin kerkeää vielä kävellä
  let taulukonRivitArrayV3 = taulukonRivitArrayV2.filter((rivi) => {

    // filterin ehto täyttyy: jos aikaNyt-kellonaikaan lisätään kävelyaika pysäkille ja ajovuoron lähtöaika kyseiseltä pysäkiltä on sama tai myöhempi
    return (rivi[0] - (rivi[4] * 60000)) >= aikaNyt.getTime();
  });



  // tässä alla ruvetaan kokoomaan näyttötaulun rivin elementtejä
  // for-loopin muuttuja 'm' kuvastaa montako riviä näyttötauluun tulostetaan
  for (let m = 0; m < 10; m++) {

    // luodaan div joka sisältää näyttötaulussa näkyvän rivin tiedot
    let riviDiv = document.createElement('div');
    // aetetaan divin luokaksi 'riviDiv'
    riviDiv.setAttribute('class', 'riviDiv');

    // luodaan näyttötaulun rivin ensimmäinen alkio-elementti, joka tulee sisältämään ajovuoron lähtöajan pysäkiltä
    let aikaDiv = document.createElement('div');
    aikaDiv.setAttribute('class', 'itemDivAika');
    // käytetään ajanMuotoilu-funktiota, joka palauttaa muuttujan 'lahtoaika' arvoksi muotoillun ajovuoron lähtöajan pysäkiltä
    let lahtoaika = ajanMuotoilu(taulukonRivitArrayV3[m][0]);
    aikaDiv.append(lahtoaika);

    // luodaan näyttötaulun rivin toinen alkio-elementti, joka tulee sisältämään ajovuoron linjanumeron
    let linjaDiv = document.createElement('div');
    linjaDiv.setAttribute('class', 'itemDivLinja');
    linjaDiv.append(taulukonRivitArrayV3[m][1]);

    // luodaan näyttötaulun rivin kolmas alkio-elementti, joka tulee sisältämään ajovuoron määränpään
    let maaranpaaDiv = document.createElement('div');
    maaranpaaDiv.setAttribute('class', 'itemDivMaaranpaa');
    maaranpaaDiv.append(taulukonRivitArrayV3[m][2]);

    // luodaan näyttötaulun rivin neljäs alkio-elementti, joka tulee sisältämään ajovuoron pysäkin nimen
    let pysakkiDiv = document.createElement('div');
    pysakkiDiv.setAttribute('class', 'itemDivPysakki');
    pysakkiDiv.append(taulukonRivitArrayV3[m][3]);

    // luodaan näyttötaulun rivin viides alkio-elementti, joka tulee sisältämään pysäkille käveltävän kävelymatkan ajan (yksikkönä minuutti)
    let kavelyAikaDiv = document.createElement('div');
    kavelyAikaDiv.setAttribute('class', 'itemDivKavelyaika');
    kavelyAikaDiv.append(taulukonRivitArrayV3[m][4]);

    // lisätään riviDivin alkiot riviDiviin
    riviDiv.append(aikaDiv);
    riviDiv.append(linjaDiv);
    riviDiv.append(maaranpaaDiv);
    riviDiv.append(pysakkiDiv);
    riviDiv.append(kavelyAikaDiv);

    // lisätään valmis riviDivi dataDiviin
    dataDiv.append(riviDiv);

  }

};


// Kulkuvälineen lähtöajan poiminta noudetusta datasta
const ajanPoiminta = (json, pysakkivaihtoehto, vuorovaihtoehtoPysakilta) => {
  let paivaUnix = json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.stoptimesWithoutPatterns[vuorovaihtoehtoPysakilta].serviceDay;
  let aikaUnix = json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.stoptimesWithoutPatterns[vuorovaihtoehtoPysakilta].realtimeArrival;
  let ajanhetkiUnix = paivaUnix + aikaUnix;
  ajanhetkiUnix *= 1000;
  return ajanhetkiUnix;
};

// Kulkuvälineen lähtöajan muotoilu muotoon (02:45)
const ajanMuotoilu = (ajanhetkiSekuntiUnix) => {
  let ajanhetkiDateObject = new Date(ajanhetkiSekuntiUnix);
  let tunnit = ajanhetkiDateObject.getHours();
  let minuutit = ajanhetkiDateObject.getMinutes();
  
  // katsotaan onko kumpikaan luku alle 10, jotta tarvitsisi lisätä nolla luvun eteen
  if (minuutit < 10) {
    minuutit = `0${minuutit}`;
    // testausta varten
    //console.log(`minuuttien tyyppi on: ${typeof minuutit}`);
  }

  if (tunnit < 10) {
    tunnit = `0${tunnit}`;
    // testausta varten
    //console.log(`tuntien tyyppi on: ${typeof tunnit}`);
  }

  // tuntien ja minuuttien muuttaminen merkkijonoiksi, jotta varmistetaan niiden molempien olevan merkkijonoja 
  tunnit = String(tunnit);
  minuutit = String(minuutit);
  let aikaString = `${tunnit}:${minuutit}`;
  
  return aikaString;
};


// Kulkuvälineen linjanumeron poiminta
const linjanPoiminta = (json, pysakkivaihtoehto, vuorovaihtoehtoPysakilta) => {
  return json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.stoptimesWithoutPatterns[vuorovaihtoehtoPysakilta].trip.routeShortName;
};

// Kulkuvälineen määränpään poiminta
const maaranpaanPoiminta = (json, pysakkivaihtoehto, vuorovaihtoehtoPysakilta) => {
  return json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.stoptimesWithoutPatterns[vuorovaihtoehtoPysakilta].trip.tripHeadsign;
};

// Kulkuvälineen pysäkin nimen poiminta
const pysakinNimenPoiminta = (json, pysakkivaihtoehto) => {
  return json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.name;
};

// Matkan pysäkille poiminta ja siitä kävelyajan laskeminen
const kavelyajanLaskeminen = (json, pysakkivaihtoehto) => {
  // etäisyyden yksikkö on metri
  let etaisyysPysakilleNumber = json.data.stopsByRadius.edges[pysakkivaihtoehto].node.distance;
  // kävelynopeus on yksiöltään m/s ja on muutettavissa
  // kävelynopeuden oletusarvo 1.157 (saatu laskemalla käsin HSL:n reittioppaasta)
  let kavelyaikaSekunteina = etaisyysPysakilleNumber / 1.157;
  let kavelyaikaMinuutteina = kavelyaikaSekunteina / 60;
  // pyöristetään kävelyaika ylöspäin seuraavaan minuuttiin
  let kavelyaikaPyoristetty = Math.ceil(kavelyaikaMinuutteina);
  return kavelyaikaPyoristetty;
};

// Matkan pysäkille poiminta
const matkanPoiminta = (json, pysakkivaihtoehto) => {
  return json.data.stopsByRadius.edges[pysakkivaihtoehto].node.distance;
};

// Ajovuoron gtfsId:n poiminta
const tripGtfsidPoiminta = (json, pysakkivaihtoehto, vuorovaihtoehtoPysakilta) => {
  return json.data.stopsByRadius.edges[pysakkivaihtoehto].node.stop.stoptimesWithoutPatterns[vuorovaihtoehtoPysakilta].trip.gtfsId;
};


// Poista dataDivin sisältö, hae dataa HSL-apin kautta 
const haeJaTee = () => {
  // tyhjennä dataDiv
  dataDiv.innerHTML = '';

  //--------------------
  // bodyn stoptimesWithoutPatterns parametri 'numberOfDepartures: 5' korvattu 'timeRange: 1800'

  // url helsinki https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql
  // url finland https://api.digitransit.fi/routing/v1/routers/finland/index/graphql
  // ville lat:60.236144, lon:24.818588
  // matias lat:60.1929041, lon:25.0318307
  // lepuski lat:60.2210086, lon:24.8050682
  // verhon lat:60.99122, lon:24.4396378
  // ylä lat:60.513816, lon:26.8939424
  // luu lat:60.9804881, lon:27.8304306
  // tuu lat:61.1308002, lon:24.8268066
  //--------------------

  // nouda data HSL-apista
  fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
    method: 'POST', headers: { "Content-Type": "application/graphql" }, body: `{
    stopsByRadius(lat:60.1929041, lon:25.0318307, radius: 1000) {
      edges {
        node {
          stop {
            gtfsId
            platformCode
            name
            stoptimesWithoutPatterns(numberOfDepartures: 5, omitNonPickups: true) {
              serviceDay
              scheduledArrival
              realtimeArrival
              arrivalDelay
              realtime
              realtimeState
              trip {
                gtfsId
                tripHeadsign
                routeShortName
                alerts {
                  alertUrl
                  alertHeaderText
                  alertDescriptionText
                }
              }
            }
          }
          distance
        }
      }
    }
  }`}).then((respo) => respo.json()).then((json) => {
      
    // tässä tulostetaan konsoliin HSL:n apista noudettu data
      console.log(json);

      // luodaan haetun datan mukainen taulukko lähtevistä vuoroista funktiolla 'datataulukonLuominen'
      datataulukonLuominen(json);
    });
};
//-------------------FUNKTIOT LOPPUVAT----------------------

//#########################KOODIN SUORITUS ALKAA#######################################

// hae ja tee näyttötaulun sisältö sivun päivittyessä
haeJaTee();

// kutsu haeJaTee-funktiota minuutin välein (60000 millisekuntia)
const jokaMinuutti = setInterval(() => { haeJaTee() }, 60000);

//#########################KOODIN SUORITUS LOPPUU######################################