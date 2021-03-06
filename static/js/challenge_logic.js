// Code check
console.log("working");

// Create tile layer that will be the background of the map.
//  (Note - tileLayer() before accessing large datasets ensures that the map gets loaded before data is added)

let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Create satellite view tile layer as option for the map
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Create third layer option (light) for the map
let light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Create base layer that holds both maps.
// (Names of street/dark variables represents what will be seen when toggling between different map layers)
let baseMaps = {
    "Streets": streets,
    "Satellite Streets": satelliteStreets, 
    "Light": light
  };

  // Create the three layers for the map
let earthquakes = new L.layerGroup();
let tectonicPlates = new L.layerGroup();
let majorEarthquakes = new L.layerGroup();

// Define an object that contains the overlays.
let overlays = {
    "Earthquakes": earthquakes, 
    "Tectonic Plates": tectonicPlates, 
    "Major Earthquakes": majorEarthquakes
  };
// Create the map object with a center and zoom level.
// layers:[streets] offers streets map as the default map
let map = L.map("mapid", {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [streets]
  });

// Pass map layers into layers control and add the layers control to the map.
// baseMaps argument passed - allows having two different styles of map to be shown on the index.html file 
L.control.layers(baseMaps, overlays).addTo(map);

// Accessing earthquakes GeoJSON URL.
let earthQuakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// This function returns the style data for each of the earthquakes plotted on to the map
// Pass magnitude of the earthquake into a function to calculate radius.
function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the circle based on the magnitude of the earthquake.
function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
// ( Note - Earthquakes with a magnitude of 0 will be plotted with a radius of 1)
function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

// Accessing GeoJSON data
d3.json(earthQuakes).then(function(data) {
    console.log(data);
  // Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
      // Turn each feature into a circleMarker on the map.
      pointToLayer: function(feature, latlng) {
          console.log(data);
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      // Create a popup for each circleMarker to display the magnitude and
    //  location of the earthquake after the marker has been created and styled.
       onEachFeature: function(feature, layer) {
           layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
      }

  }).addTo(earthquakes);

//   Add earthquake layer to the map 
earthquakes.addTo(map)
});

// 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
majorQuakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

d3.json(majorQuakeData).then(function(data) {

    // 4. Use the same style as the earthquake data.
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.properties.mag),
          color: "#000000",
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      }
    
    // 5. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "purple";
        }
        if (magnitude > 4) {
            return "blue";
        }
        if (magnitude < 4){
            return "green";
          }
    };
    
    // 6. Use the function that determines the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 4;
      }
    
    // 7. Creating a GeoJSON layer with the retrieved data that adds a circle to the map, sets 
    // style of the circle, and displays the magnitude and location of the earthquake after the marker has been created.
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }

    }).addTo(majorEarthquakes);
    
    // 8. Add the major earthquakes layer to the map.
    });
    majorEarthquakes.addTo(map);
    
  

// Create a legend control object.
var legend = L.control({
    position: "bottomright"
  });

// Then add all the details for the legend.
legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
    magnitudes = [0, 1, 2, 3, 4, 5], 
    colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
];
// Looping through intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < magnitudes.length; i++) {
        console.log(colors[i]);
        div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
};

legend.addTo(map);

  // 3. Use d3.json to make a call to get Tectonic Plate geoJSON data.
plateData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(plateData).then(function(data) {
    L.geoJson(data, {
      fillOpacity: 1, 
      color: "blue", 
      fillColor: "blue", 
      weight: 2
}).addTo(tectonicPlates);
});

tectonicPlates.addTo(map);
