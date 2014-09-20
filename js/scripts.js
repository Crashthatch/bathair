// Map
function init() {
    var map = L.map('map').setView([51.385802, -2.370667], 15);
    mapLink =
        '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            //attribution: '&copy; ' + mapLink + ' Contributors',
            maxZoom: 15,
            minZoom: 15
        }).addTo(map);

    map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.

    /* Initialize the SVG layer */
    map._initPathRoot()

    /* We simply pick up the SVG from the map object */
    var svg = d3.select("#map").select("svg"),
        g = svg.append("g");
    map.on("viewreset", update);

    function addCircles(firstPoint) {
        /* Add a LatLng object to each item in the dataset */
        //console.log(collection[0]);
    }

    function getToFromDates(){
        var fromDate = $('#data-from-year option:selected').val() + "-"+$('#data-from-month option:selected').val()+"-"+$('#data-from-day option:selected').val();
        var fromDate = new Date(fromDate);
        var toDate = $('#data-to-year option:selected').val() + "-"+$('#data-to-month option:selected').val()+"-"+$('#data-to-day option:selected').val();
        var toDate = new Date(toDate);

        return({from: fromDate, to: toDate});
    }

    function update(timeRow) {
        var enterCircles = g.selectAll("circle")
            .data(timeRow,function(d) { return d.id; })
            .enter();

        enterCircles.append("circle")
            .attr('class', 'pollutioncircle')
            .style("opacity", 0.4)
            .attr("r", 20)
            .attr("fill", "black");

        d3.selectAll('.pollutioncircle')
            .attr("transform",
            function(d) {
                return "translate("+
                    map.latLngToLayerPoint(d.LatLng).x +","+
                    map.latLngToLayerPoint(d.LatLng).y +")";
            })
            .transition().duration(500).ease("linear")
            .attr("r", function(d){
                if(d.value ){
                    return 200*(d.value / maximums[d.pollutant]);
                }
                else{
                    return 0;
                }
                /*if(d.pollutant == 'nox'){
                    return d.value / maximums[d.pollutant];
                }
                else if(d.pollutant == 'pm10'){
                    return d.value;
                }
                else if(d.pollutant == 'o3'){
                    return d.value*3;
                }
                else if(d.pollutant == 'co'){
                    return d.value*30;
                }*/
            })
            .style("fill", function(d){
                if(d.pollutant == 'nox'){
                    return 'black';
                }
                else if(d.pollutant == 'pm10'){
                    return 'red'
                }
                else if(d.pollutant == 'o3'){
                    return 'orange'
                }
                else if(d.pollutant == 'co'){
                    return 'purple'
                }
            });

        $( "#date-range" ).val( currentSelectedDate );
        var fromDate = getToFromDates().from;
        var toDate = getToFromDates().to;
        $( "#slider" ).slider("value", Math.floor((currentSelectedDate-fromDate)/(1000*60*60*24)) );
    }

    var fromDate = getToFromDates().from;
    var toDate = getToFromDates().to;
    var currentSelectedDate = new Date(fromDate);
    var interval;
    var allData;
    var maximums = {};
    onDateRangeUpdate();

    $('select').on('change', function(){
        onDateRangeUpdate();
    });

    function onDateRangeUpdate(){
        // jQuery UI
        var fromDate = getToFromDates().from;
        var toDate = getToFromDates().to;
        currentSelectedDate = fromDate;

        var days = (toDate-fromDate)/(1000*60*60*24);

        $( "#slider" ).slider({
            value:0,
            min: 0,
            max: days,
            step: 1,
            slide: function( event, ui ) {
                var fromDate = getToFromDates().from;
                var toDate = getToFromDates().to;

                currentSelectedDate = new Date(fromDate.setDate( fromDate.getDate()+ui.value));
            }
        });


        $.getJSON('pulldata.php?startDate='+fromDate.toISOString()+'&endDate='+ toDate.toISOString(), function(response){
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
                ['nox','co','pm10','o3'].forEach( function(pollutant){
                    dateMap.push( {
                        id: reading.sensor_location_slug+pollutant,
                        LatLng: new L.LatLng(reading.sensor_location.latitude,
                            reading.sensor_location.longitude),
                        value: parseFloat(reading[pollutant]),
                        pollutant: pollutant
                    });
                    if( !maximums[pollutant] || parseFloat(reading[pollutant]) > maximums[pollutant]){
                        maximums[pollutant] = parseFloat(reading[pollutant]);
                    }
                });
            });
            console.log(maximums);
        });
    }

    function stop(){
        clearInterval( interval );
        interval = null;
        $('#play-icon').addClass('stopped');
        $('#play-icon').removeClass('playing');
    }

    function play(){
        interval = setInterval(function(){
            currentSelectedDate = new Date(currentSelectedDate.setHours( currentSelectedDate.getHours()+1 ));
            update(allData[currentSelectedDate.toISOString()]);
            $('#play-icon').removeClass('stopped');
            $('#play-icon').addClass('playing');
        }, 500 );
    }

    $('#play-icon').on('click', function(){
        if( interval ){
            stop();
        }
        else{
            play();
        }
    });

    play();
}