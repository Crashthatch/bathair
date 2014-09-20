// Map
function init() {
  var map = L.map('map').setView([51.385802, -2.370667], 15);
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

  function addCircles(firstPoint) {
    /* Add a LatLng object to each item in the dataset */
    //console.log(collection[0]);
  }

  function update(timeRow) {
    console.log(timeRow);
    var feature = g.selectAll("circle")
      .data(timeRow)
      .enter()
      .append("circle")
      .attr('class', 'pollutioncircle nox')
      .attr("r", 20)
      .attr("fill", "red");

    d3.selectAll('.pollutioncircle')
    .transition().duration(500).ease("linear")
    .attr("transform",
    function(d) {
        return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
    })
    .attr("r", function(d){ return d.nox/4; })
    .style("opacity", function(d){ return d.nox/240; });

    $( "#date-range" ).val( currentSelectedDate );
    var fromDate = $('#data-from-year option:selected').val() + "-"+$('#data-from-month option:selected').val()+"-"+$('#data-from-day option:selected').val();
    fromDate = new Date(fromDate);
    $( "#slider" ).slider("value", Math.floor((currentSelectedDate-fromDate)/(1000*60*60*24)) );
  }

  var fromDate = $('#data-from-year option:selected').val() + "-"+$('#data-from-month option:selected').val()+"-"+$('#data-from-day option:selected').val();
  var currentSelectedDate = new Date(fromDate);
  var toDate = $('#data-to-year option:selected').val() + "-"+$('#data-to-month option:selected').val()+"-"+$('#data-to-day option:selected').val();
  var interval;
  var allData;
  onDateRangeUpdate();

    $('select').on('change', function(){
        console.log('changed!');
        onDateRangeUpdate();
    });

  $.getJSON('pulldata.php?startDate='+fromDate+'&endDate='+toDate, function(response){
    //Create reponse of form:
    // {2001-01-01: {location: X, reading: 1.1},{location:Y, reading: 2.2},
    //  2001-01-02: {location: X, reading: 1.2}, {location:Y, reading: 2.3},
    // ...}
    allData = {};
    response.forEach( function(reading){
      reading.datetime = new Date(reading.datetime);
      var dateMap = allData[reading.datetime.toISOString()];
      if( !dateMap ){
          dateMap = [];
          allData[reading.datetime.toISOString()] = dateMap;
      }
      dateMap.push( {
        id: reading.sensor_location_slug,
        LatLng: new L.LatLng(reading.sensor_location.latitude,
                             reading.sensor_location.longitude),
        nox: reading.nox,
        co: reading.co
      });
    });

    console.log(allData);
    update(allData[currentSelectedDate.toISOString()]);
    map.on("viewreset", update);
    interval = setInterval(function(){
        currentSelectedDate = new Date(currentSelectedDate.setHours( currentSelectedDate.getHours()+1 ));
        update(allData[currentSelectedDate.toISOString()]);
    }, 500 );
  });

  function onDateRangeUpdate(){
      // jQuery UI
      var fromDate = $('#data-from-year option:selected').val() + "-"+$('#data-from-month option:selected').val()+"-"+$('#data-from-day option:selected').val();
      var fromDate = new Date(fromDate);
      var toDate = $('#data-to-year option:selected').val() + "-"+$('#data-to-month option:selected').val()+"-"+$('#data-to-day option:selected').val();
      var toDate = new Date(toDate);

      var days = (toDate-fromDate)/(1000*60*60*24);

      $( "#slider" ).slider({
        value:0,
        min: 0,
        max: days,
        step: 1,
        slide: function( event, ui ) {
          $( "#date-range" ).val( ui.value );
        }
      });
  };

  $('#play-icon').on('click', function(){
    if( interval ){
        clearInterval( interval );
        interval = null;
        $('#play-icon').addClass('stopped');
    }
    else{
        interval = setInterval(function(){
            currentSelectedDate = new Date(currentSelectedDate.setHours( currentSelectedDate.getHours()+1 ));
            update(allData[currentSelectedDate.toISOString()]);
            $('#play-icon').addClass('playing');
        }, 500 );
    }
  });
}