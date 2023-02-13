let destinos = document.getElementById('destinos');
navigator.geolocation.getCurrentPosition(mostrarPosicion);
function mostrarPosicion(coordenadas) {
    let latitud = coordenadas.coords.latitude; 
    let longitud = coordenadas.coords.longitude;
 
	
   
    
    // Costa Rica

    const origin = [longitud, latitud];
   // const destination = [-102.37964978557667, 39.743671747579924];
  let originU = [];
   const destination = [];
    //mapa
     mapboxgl.accessToken = 'pk.eyJ1IjoicHJvaW5hIiwiYSI6ImNrZnVrend3ajBsMDIycm1mazB1Zm8wNmgifQ.L4zh6opxeFzRxupV8IX8Cw';
    const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: origin,
    zoom: 4,
    pitch: 40
    });

    
    destinos.addEventListener('change', (e)=>{
        let lat;
        let longi;
        let lat1;
        let longi1;
        const destination = [];
        // Washington DC
       

        if(destinos.value === 'usa'){
            lat = 39.743671747579924; 
            longi = -102.37964978557667;
            originU = [ -102.37964978557667,  39.743671747579924]
            //ruta(origin, [longi, lat]);
        }
        if (destinos.value === 'francia') {
            lat = 46.67682493776834; 
            longi = 2.72719542152751;
            originU = [ 2.72719542152751, 46.67682493776834 ]
        } 
        if (destinos.value === 'egipto'){
            lat = 27.206885688242604; 
            longi = 30.820885656650162;
            originU = [ 30.820885656650162, 27.206885688242604 ]
            
        }

        if (destinos.value === 'japon'){
            lat = 35.762416372324104;
            longi = 139.73675787252276;
            originU = [ 139.73675787252276,  35.762416372324104]
            // lat = ; 
            // longi =  ; 
        }
        if (destinos.value === 'cuj') {

            originU = [ -102.37964978557667,  39.743671747579924]
            lat = 35.762416372324104;
            longi = 139.73675787252276;
            
        }
        ruta(origin, originU, [longi, lat]);   
    });

  
}

// Para que funcione la animacion
  function ruta(origin, originU, destination){
     
    
    mapboxgl.accessToken = 'pk.eyJ1IjoicHJvaW5hIiwiYSI6ImNrZnVrend3ajBsMDIycm1mazB1Zm8wNmgifQ.L4zh6opxeFzRxupV8IX8Cw';
    const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: origin,
    zoom: 4,
    pitch: 40
    });
        //const origin = [-122.414, 37.776];
        //const destination = [-77.032, 38.913];    
        console.log(origin, destination); 
        const route = {
            'type': 'FeatureCollection',
            'features': [
            {
            'type': 'Feature',
            'geometry': {
            'type': 'LineString',
            'coordinates': [origin, originU, destination]
            }
            }
            ]
            };
             
            // A single point that animates along the route.
            // Coordinates are initially set to origin.
            const point = {
            'type': 'FeatureCollection',
            'features': [
            {
            'type': 'Feature',
            'properties': {},
            'geometry': {
            'type': 'Point',
            'coordinates': origin
            }
            }
            ]
            };
             
            // Calculate the distance in kilometers between route start/end point.
            const lineDistance = turf.length(route.features[0]);
             
            const arc = [];
             
            // Number of steps to use in the arc and animation, more steps means
            // a smoother arc and animation, but too many steps will result in a
            // low frame rate
            const steps = 500;
             
            // Draw an arc between the `origin` & `destination` of the two points
            for (let i = 0; i < lineDistance; i += lineDistance / steps) {
            const segment = turf.along(route.features[0], i);
            arc.push(segment.geometry.coordinates);
            }
             
            // Update the route with calculated arc coordinates
            route.features[0].geometry.coordinates = arc;
             
            // Used to increment the value of the point measurement against the route.
            let counter = 0;
             
            map.on('load', () => {
            // Add a source and layer displaying a point which will be animated in a circle.
            map.addSource('route', {
            'type': 'geojson',
            'data': route
            });
             
            map.addSource('point', {
            'type': 'geojson',
            'data': point
            });
             
            map.addLayer({
            'id': 'route',
            'source': 'route',
            'type': 'line',
            'paint': {
            'line-width': 2,
            'line-color': '#007cbf'
            }
            });
             
            map.addLayer({
            'id': 'point',
            'source': 'point',
            'type': 'symbol',
            'layout': {
            // This icon is a part of the Mapbox Streets style.
            // To view all images available in a Mapbox style, open
            // the style in Mapbox Studio and click the "Images" tab.
            // To add a new image to the style at runtime see
            // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
            'icon-image': 'airport',
            'icon-size': 1.5,
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
            }
            });
             
            function animate() {
            const start =
            route.features[0].geometry.coordinates[
            counter >= steps ? counter - 1 : counter
            ];
            const end =
            route.features[0].geometry.coordinates[
            counter >= steps ? counter : counter + 1
            ];
            if (!start || !end) return;
             
            // Update point geometry to a new position based on counter denoting
            // the index to access the arc
            point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[counter];
             
            // Calculate the bearing to ensure the icon is rotated to match the route arc
            // The bearing is calculated between the current point and the next point, except
            // at the end of the arc, which uses the previous point and the current point
            point.features[0].properties.bearing = turf.bearing(
            turf.point(start),
            turf.point(end)
            );
             
            // Update the source with this new data
            map.getSource('point').setData(point);
             
            // Request the next frame of animation as long as the end has not been reached
            if (counter < steps) {
            requestAnimationFrame(animate);
            }
             
            counter = counter + 1;
            }
             
            document.getElementById('replay').addEventListener('click', () => {
                // Set the coordinates of the original point back to origin
                point.features[0].geometry.coordinates = origin;
                
                // Update the source layer
                map.getSource('point').setData(point);
                
                // Reset the counter
                counter = 0;
                
                // Restart the animation
                animate(counter);
                });
                
                // Start the animation
                animate(counter);
            });
  }