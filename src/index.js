import React from "react";
import ReactDOM from "react-dom";
import Leaflet from "leaflet";
import "./styles.css";
import border_data from "./border.js";
import leafletPip from "@mapbox/leaflet-pip";

const lengthOfVT = 160;
const milesPerDegree = 69;
const vermont = Leaflet.geoJSON(border_data);


class GameMap extends React.Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef();
    this.map = null;
    this.answerCoords = null;    
  }
  componentDidMount() {
    this.map = Leaflet.map(this.mapRef.current).setView([44.4759, -73.2121], 16);
    Leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(this.map);
    this.getNewPoint()
  }
  componentWillUnmount() {
    this.map = null;
  }
  randomLat() {
    let lat = Math.random() * (45.00541896831666 - 42.730315121762715) + 42.730315121762715;
    return lat;
  }
  randomLong() {
    let long = (Math.random() * (71.51022535353107 - 73.35218221090553) + 73.35218221090553) * -1;
    return long;
  }

  isInVT(lat, long) {
    let result = leafletPip.pointInLayer([long, lat], vermont);
    console.log("result: " + result)
    console.log("length of VT array: " + result.length);
    if (result.length >= 1) {
      console.log("in vermont!")
      return true;
    } else {
      console.log("not in vermont! coords: " + long, lat)
      return false;
    };
  };

  getNewPoint() {
    let latitude = this.randomLat();
    let longitude = this.randomLong();
    if (this.isInVT(latitude, longitude)) {
      this.answerCoords = [latitude, longitude]
      this.goToMysteryLocation();
    } else {
      this.getNewPoint();
    }
  };

  goToMysteryLocation(){
    this.map.panTo(this.answerCoords);
    this.showAnswer();
  };

  showAnswer() {
    let answermarker = new Leaflet.marker(this.answerCoords, { draggable: false }).addTo(this.map);
    answermarker.bindPopup("<strong>Actual Location</strong>").addTo(this.map).openPopup();
  };



  render() {
    return <div ref={this.mapRef} id="game-map" className="map"/>;
  }
}

class GuessMap extends React.Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef();
    this.map = null;
    this.guessCoords = null
  }
  componentDidMount() {
    this.map = Leaflet.map(this.mapRef.current).setView([44., -72.7317], 8);
    Leaflet.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
    //vermont.addTo(this.map);
    this.map.once('click', this.addMarker);
  }

  componentWillUnmount() {
    this.map.off("click", this.addMarker);
    this.map = null;
  }

  addMarker = (e) => {
    const {lat, lng} = e.latlng;
    this.guessCoords = e.latlng;

    let marker = new Leaflet.marker([lat, lng], { draggable: true });
    marker.addTo(this.map);
    
    marker.on('dragend', function (e) {      
      this.guessCoords = e.target._latlng;
      console.log("new coords: " + this.guessCoords)      
    })
  };

  render() {
    return <div ref={this.mapRef} id="guess-map" className="map" />;
  }
}

class GameInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    guessCoords: this.guessCoords,
    answerCoords: this.answerCoords,
    score: this.score || 0
    }
  }
  getDistance(){
    let distance = milesPerDegree * Math.sqrt(Math.square(this.guessCoords.lat - this.answerCoords.lat) + Math.square(this.guessCoords.long - this.answerCoords.long));
    console.log('distance: ' + distance);
    return distance;
  }

  getScore() {
    let distance = this.getDistance();
    let score = Math.floor((lengthOfVT*lengthOfVT)/(distance*distance));
    console.log('score: ' + score)
    //document.getElementById('highscores').innerHTML = "Score: " + score;
    return score;
  }
}

const pageContainer = document.getElementById("page-container");
ReactDOM.render(<GuessMap />, document.getElementById('guess-area'));
ReactDOM.render(<GameMap />, document.getElementById('game-area'))

/*
functions: 
start game,
get new random point,
is it VT?!!!!!
generate random map,
add marker,
submit this.guessCoords,
give up,
move around the map,
show answer marker,
*/
