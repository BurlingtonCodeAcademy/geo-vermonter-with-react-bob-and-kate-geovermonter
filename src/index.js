import React from "react";
import ReactDOM from "react-dom";
import Leaflet from "leaflet";
import "./styles.css";
import border_data from "./border.js";
import leafletPip from "@mapbox/leaflet-pip";

const lengthOfVT = 160;
const milesPerDegree = 69;
const vermont = Leaflet.geoJSON(border_data);

function randomLat() {
  let lat = Math.random() * (45.00541896831666 - 42.730315121762715) + 42.730315121762715;
  return lat;
}
function randomLong() {
  let long = (Math.random() * (71.51022535353107 - 73.35218221090553) + 73.35218221090553) * -1;
  return long;
}
function isInVT(lat, long) {
  let result = leafletPip.pointInLayer([long, lat], vermont);
  console.log("result: " + result)
  console.log("length of VT array: " + result.length);
  if (result.length >= 1) {
    return true;
  } 
  return false;
}
function getNewPoint() {
  let latitude = randomLat();
  let longitude = randomLong();
  if (isInVT(latitude, longitude)) {
    //let mysteryPoint = [latitude, longitude]
    console.log("answer coordinates: " + [latitude, longitude]);
    return [latitude, longitude];
  } else {
    getNewPoint();
  }
}

class GameMap extends React.Component {
  constructor(props) {
    super(props)
    //this.mapRef = React.createRef();
    this.map = null;   
    this.state = {
      currentCoords: [44.4759, -73.2121]
    }
  }
  componentDidMount() {
    console.log(this.props.answerCoords)
    this.map = Leaflet.map('game-map').setView(this.state.currentCoords, 16);
    Leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(this.map);
    this.goToMysteryLocation()
  }
  componentWillUnmount() {
    this.map = null;
  };

  goToMysteryLocation(){
    console.log(this.props.answerCoords)        
    this.map.panTo(this.props.answerCoords);
    this.setState({currentCoords: this.props.answerCoords})
    this.showAnswer();
  };

  showAnswer() {
    let answermarker = new Leaflet.marker(this.props.answerCoords, { draggable: false }).addTo(this.map);
    answermarker.bindPopup("<strong>Actual Location</strong>").addTo(this.map).openPopup();
  };

  render() {
    return <div ref={this.mapRef} id="game-map" className="map"/>;
  }
}

class GuessMap extends React.Component {
  constructor(props) {
    super(props)
    //this.mapRef = React.createRef();
    this.map = null;
    //this.addMarker = this.addMarker.bind(this)
  }
  componentDidMount() {
    console.log("guess coordinates : " + this.props.guessCoords)
    this.map = Leaflet.map('guess-map').setView([44., -72.7317], 7.5);
    Leaflet.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
    vermont.addTo(this.map);
    this.map.once('click', this.addMarker);
    this.showAnswer();
  }

  componentWillUnmount() {
    this.map.off("click", this.addMarker);
    this.map = null;
  }

  addMarker = (e) => {
    const {lat, lng} = e.latlng;
    //this.setState({guessCoords: e.latlng});
    this.props.updateCoordinates(lat, lng)      

    let marker = new Leaflet.marker([lat, lng], { draggable: true });
    marker.addTo(this.map);

    marker.on('dragend', (e) => { 
     // const {lat, lng} = e._latlng;
     let lat = e.target._latlng.lat;
     let long = e.target._latlng.lng;
      this.props.updateCoordinates(lat, long);    
      console.log("new guess coords: " + this.props.guessCoords);
    })
  };

  showAnswer() {
    let answermarker = new Leaflet.marker(this.props.answerCoords, { draggable: false }).addTo(this.map);
    answermarker.bindPopup("<strong>Actual Location</strong>").addTo(this.map).openPopup();
  };


  render() {
    return <div ref={this.mapRef} id="guess-map" className="map" />;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      guessCoords: [],
      answerCoords: getNewPoint(),
      score: this.score || 0
    }
  }
  updateCoordinates = (lat, long) => {
      this.setState({guessCoords: [lat, long]})
      console.log('guess: ' + this.props.guessCoords)
  }
  /*
  getDistance(){
    let distance = milesPerDegree * Math.sqrt(Math.square(this.guessCoords.lat - this.answerCoords.lat) + Math.square(this.guessCoords.long - this.answerCoords.long));
    console.log('distance: ' + distance);
    return distance;
  }
  */

  getScore() {
    let distance = this.getDistance();
    let score = Math.floor((lengthOfVT*lengthOfVT)/(distance*distance));
    console.log('score: ' + score)
    //document.getElementById('highscores').innerHTML = "Score: " + score;
    return score;
  }

  render() {
    console.log('answer coords: ' + this.state.answerCoords)
    return (
    <div id='grid'>
    <div id='nav'></div>
    <div id="game-area"><GameMap answerCoords={this.state.answerCoords} /></div>
    <div id="guess-area"><GuessMap answerCoords={this.state.answerCoords} guessCoords={this.state.guessCoords} updateCoordinates={this.updateCoordinates}/></div>
    </div>
    )
  }
}

const pageContainer = document.getElementById("page-container");
//ReactDOM.render(<GuessMap />, document.getElementById('guess-area'));
//ReactDOM.render(<GameMap />, document.getElementById('game-area'));
ReactDOM.render(<Game />, pageContainer);


/*
functions: 
start game,

submit this.guessCoords,
show score
give up,
move around the map,
show answer marker,
*/
