// Map
function init() {
  var map = L.map('map').setView([51.38,-2.36], 13);
  mapLink =
  '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
  'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      //attribution: '&copy; ' + mapLink + ' Contributors',
      //maxZoom: 18,
  }).addTo(map);

  map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.

  /* Initialize the SVG layer */
  map._initPathRoot()

  /* We simply pick up the SVG from the map object */
  var svg = d3.select("#map").select("svg"),
  g = svg.append("g");

  /*var circles = {"objects":[
    {"circle":{"coordinates":[51.38,-2.36]}}
    ,{"circle":{"coordinates":[51.39,3.35]}},
    {"circle":{"coordinates":[51.29,2.47]}},
    {"circle":{"coordinates":[51.38,2.39]}},
    {"circle":{"coordinates":[51.38,2.30]}}
  ]};*/

  function addCircles(collection) {
    /* Add a LatLng object to each item in the dataset */
    console.log(collection[0]);
    collection.forEach(function (d) {
        d.LatLng = new L.LatLng(d.sensor_location.latitude,
        d.sensor_location.longitude)
    });

    var feature = g.selectAll("circle")
    .data(collection)
    .enter()
    .append("circle")
    .attr('class', 'pollutioncircle')
    .attr("r", 20);

    map.on("viewreset", update);
    update();
  }

  function update() {
    d3.selectAll('.pollutioncircle')
    .attr("transform",
    function(d) {
        return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
    })
    .style("opacity", function(d){ return d.nox/300; });
  }

  $.getJSON('pulldata.php?startDate=2013-01-01&endDate=2013-02-02', function(response){
    //Create reponse of form: [{2001-01-01: {location: X, reading: 1.1},{location:Y, reading: 2.2}},{2001-01-01: {location: X, reading: 1.2}, {location:Y, reading: 2.3}}]
    var ret = {};
    response.forEach( function(reading){
      ret
    });

    addCircles(response);
  });





  // jQuery UI
  $( "#slider" ).slider({
    value:100,
    min: 0,
    max: 500,
    step: 50,
    slide: function( event, ui ) {
      $( "#date-range" ).val( ui.value );
    }
  });
  $( "#date-range" ).val( $( "#slider" ).slider( "value" ) );
}