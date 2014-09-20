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

  var circles = {"objects":[
    {"circle":{"coordinates":[51.38,-2.36]}}
    /*,{"circle":{"coordinates":[51.39,3.35]}},
    {"circle":{"coordinates":[51.29,2.47]}},
    {"circle":{"coordinates":[51.38,2.39]}},
    {"circle":{"coordinates":[51.38,2.30]}}*/
  ]};

  function addCircles(collection) {
    /* Add a LatLng object to each item in the dataset */
    collection.objects.forEach(function (d) {
        d.LatLng = new L.LatLng(d.circle.coordinates[0],
        d.circle.coordinates[1])
    })

    var feature = g.selectAll("circle")
    .data(collection.objects)
    .enter()
    .append("circle")
    .attr('class', 'pollutioncircle')
    .style("stroke", "black")
    .style("opacity", .6)
    .style("fill", "red")
    .attr("r", 20);

    map.on("viewreset", update);
    update();
  }

  function update() {
    console.log('updating!');

    d3.selectAll('.pollutioncircle')
    .attr("transform",
    function(d) {
        return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
    })
    .style("opacity", function(d){ return d.opacity; });
  }

  addCircles(circles);
}