var fetched;

function iconFromWeatherId(weatherId) {
  if (weatherId > 199 && weatherId < 233) {
    return 0; //Thunderstorm
  } 
	else if (weatherId > 299 && weatherId < 322) {
    return 1; //Drizzle
  } 
	else if (weatherId > 499 && weatherId < 523) {
    return 2; //Rain
  } 
	else if (weatherId > 599 && weatherId < 622) {
    return 3; //Snow
  } 
	else if (weatherId > 700 && weatherId < 742) {
	return 4; //Haze or fog
  }
	else if (weatherId == 800){
	return 5; //Clear
  }
	else if (weatherId == 801){
	return 6; //Few clouds
  }
	else if (weatherId > 801){
	return 7; //Scattered, broken, or overcast clouds
  }
}

function fetchWeather(latitude, longitude) {
  var response;
  var req = new XMLHttpRequest();
  req.open('GET', "http://api.openweathermap.org/data/2.5/weather?" + "lat=" + latitude + "&lon=" + longitude, true);
	
  console.log("http://api.openweathermap.org/data/2.5/weather?" + "lat=" + latitude + "&lon=" + longitude);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        console.log(req.responseText);
        response = JSON.parse(req.responseText);
		console.log("Response: " + response);
        var temperature, icon, city, address, sunset;
			var weatherResultList = response.weather[0];
			temperature = response.main.temp;
			icon = iconFromWeatherId(weatherResultList.id);
			city = response.name;
			sunset = response.sys.sunset;
			address = "http://api.openweathermap.org/data/2.5/weather?" + "lat=" + latitude + "&lon=" + longitude;
			console.log("It is " + temperature + " degrees");
			console.log("You are currently residing in: " +city);
			console.log("Icon resource loaded: " + icon);
			localStorage.setItem("latitude1", latitude);
			localStorage.setItem("longitude1", longitude);
			console.log("Working latitude: " + localStorage.getItem("latitude1"));
			console.log("Working longitude: " + localStorage.getItem("longitude1"));
			
          Pebble.sendAppMessage({
            "icon":icon,
            "temperature":temperature,
			});
      } else {
			console.log("Error: could not connect! (is api.openweathermap.com down?)");
      }
    }
  };
  req.send(null);
}

function locationSuccess(pos) {
  var coordinates = pos.coords;
	if(fetched === 0){
		fetchWeather(coordinates.latitude, coordinates.longitude);
		fetched = 1;
	}
	else if(fetched == 1){
		return;
	}
}

function locationError(err) {
  console.warn('Location error (' + err.code + '): ' + err.message);
	var workingLatitude = localStorage.getItem("latitude1");
	var workingLongitude = localStorage.getItem("longitude1");
	
	fetchWeather(workingLatitude, workingLongitude);
	console.log("Fetching previous working temperature from latitude: " + workingLatitude + " and longitude: " + workingLongitude);
}

var locationOptions = { "timeout": 15000, "maximumAge": 60000 }; 

var long_s = 0;
var lat_s = 0;
var fetchtype = 0;

function weather_try_fetch(){
	long_s = parseFloat(localStorage.getItem("long_s"));
	lat_s = parseFloat(localStorage.getItem("lat_s"));
	fetchtype = parseInt(localStorage.getItem("fetchtype"));
	console.log("Got values: " + long_s + " and " + lat_s + " and " + fetchtype);
	if(fetchtype === 1){
		console.log("Fetching weather with specified coordinates: " + long_s + " and " + lat_s);
		fetchWeather(lat_s, long_s);
	}
	else{
		console.log("Specified coordinates is false...");
		console.log("Fetching with GPS location.");
		window.navigator.geolocation.watchPosition(locationSuccess, locationError, locationOptions);	
	}
}

Pebble.addEventListener("ready",
                        function(e) {
                          console.log("connect!" + e.ready);
                          weather_try_fetch();
                          console.log(e.type);
                        });

Pebble.addEventListener("appmessage",
                        function(e) {
                          weather_try_fetch();
                          console.log(e.type);
                          console.log(e.payload.temperature);
                          console.log("message!");
                        });
var url = "http://edwinfinch.github.io/config-palmclock";

Pebble.addEventListener("showConfiguration", function(e) {
	console.log("Opening configuration page: " + url);
	Pebble.openURL(url);
});

Pebble.addEventListener("webviewclosed", function(e) {
	if(e.response) {
		var values = JSON.parse(decodeURIComponent(e.response));

		Pebble.sendAppMessage(values,
			function(e) {
				console.log("Successfully sent options to Pebble");
			},
			function(e) {
				console.log("Failed to send options to Pebble.\nError: " + e.error.message);
			}
		);
		
		if(values.fetchtype === 1){
			localStorage.setItem("fetchtype", 1);
			console.log("Fetch type is specific coordinates.");
		}
		else{
			localStorage.setItem("fetchtype", 0);
			console.log("Fetch type is NOT specific coordinates.");
		}
		localStorage.setItem("long_s", parseFloat(values.custlong));
		localStorage.setItem("lat_s", parseFloat(values.custlat));
	}
});

