/*Last edited 2/11/2017
To-do:
2: Find out how to use the API to accurately check for precipitation.
3: Clean up code.
4: If possible, allow for the user to switch between 12 hour time and military time. Create a button that does so.

*/
  /*Declaring a variable to hold important weather parameters. As it stands it currently
  holds a status check, as well as the temperatures in fahrenheit and celsius.*/
  var weatherParams = {
    status: 0,
    tempF: null,
    tempC: null,
    lat: null,
    lon: null,
    timestatus: 0
  };

/*Our first function. It uses the geolocation API to get a very accurate location for the user.
It first checks to see if the user has geolocation enabled. If not, it tells the user that
geolocation is disabled, and then falls back on an ip geolocation method.*/
function getLocation() {
  //Checks to see if the user has geolocation available in their browser...
  if (navigator.geolocation) {
      //"usePosition" is the success callback, while "useError" is the error callback.
      navigator.geolocation.getCurrentPosition(usePosition,useError);
    //If they do not have geolocation available, we go to our fallback method, while simultaneously prompting the user.
  } else {
      $(".errMessg").html("Geolocation is not supported by this browser.");
      ipMethod();
  }
}

/*Our success callback, assuming the user has geolocation enabled and the browser was successful in getting the user's position. We store both the latitude and longitude into variables, and pass it to our weather function.*/
function usePosition(position) {
  //Storing latitude and longitude into variables...
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  weatherParams.lat = lat;
  weatherParams.lon = lon;
  //Calling our weather function.
  getWeather(lat, lon);
}

/*This is our error callback. There are three documented error codes on https://dev.w3.org/geo/api/spec-source.html#position_error_interface and the fourth "UNKNOWN_ERROR" was added by W3schools.
Personal note: I still don't exactly understand where "UNKNOWN_ERROR" came from, and I need to research that.'*/
function useError(error) {
  //Starting a switch statement, checking for all four possible cases.
  switch(error.code){
      //If the user blocks geolocation services and/or otherwise denies permission to the API...
    case error.PERMISSION_DENIED:
      ipMethod();
      $(".errMessg").html("User has denied permission. For more accurate results, enable geolocation.")
      break;
      //If the user's location can't be found...
    case error.POSITION_UNAVAILABLE:
      ipMethod();
      $(".errMessg").html("User position unavailable.");
      break;
      //If the geolocation has timed out...
    case error.TIMEOUT:
      ipMethod();
      $(".errMessg").html("User has timed out.");
      break;
      //If there is some other unknown error...
    case error.UNKNOWN_ERROR:
      ipMethod();
      $(".errMessg").html("Unknown error.")
  };
}

/*This is our fallback method. It will always activate in any scenarios where browser geolocation does not work.*/
function ipMethod(){
  /*Calling the ipinfo API. This finds the user location via IP address. While far more innacurate than browser geolocation, it still gives a sufficient ballpark estimate.*/
  $.getJSON("https://ipinfo.io", function(json){
      //Putting the location data into a variable...
      var location = json.loc.split(',');
      //Further parsing the data into the latitude and longitude information, and placing them into separate variables...
      var locLat = Number(location[0]);
      var locLon = Number(location[1]);
      //Calling my weather function, using the coordinate variables.
      getWeather(locLat, locLon);
  });
};

/*The main getWeather function. It just takes the user's location data and calls the openweather API to get the weather at their location. It then takes the desired information and outputs it onto the weather app in the desired locations.*/

//This function takes the API key, an input latitude, an input longitude, and then outputs the weather in the user's area.
function getWeather(lat, lon){
      //Getting the info for the region location and state.
      var geocodeurl = "https://maps.googleapis.com/maps/api/geocode/json?"
      geocodeurl += "latlng=" + String(lat) + "," + String(lon) + "&key=AIzaSyAE2lObkWId38jn5vckJn5ThaAseN-OlJI"
      console.log(geocodeurl);
      //Calling the google geocode API.
      $.getJSON(geocodeurl, function(json){
        var city = json.results[0]["address_components"][3]["long_name"];
        var state = json.results[0]["address_components"][5]["long_name"];
        console.log(city);
        console.log(state);
        $(".location").html(city + " ," + state);
    });
      /*Calling the darksky API.*/
      //Our initial url, which has the input latitude and longitude appended to it.
      var darkurl = "https://api.darksky.net/forecast/";
      darkurl += "9c90a6565cab27a2e5bfe05ee26d44a9" + "\x2f"  + String(lat) + "\x2C" +  String(lon);
      //finally using ajax to get all of our relevant data.
      $.ajax({
        url: darkurl,
        dataType: 'jsonp',
        success: function(data){
          //upon success we begin using the data to output the user's weather informaton.
          var weather = data.currently;
          //Output temperature is in Fahrenheit.
          var wTemp = weather.temperature;
          weatherParams.tempF = wTemp;
          weatherParams.tempC = (wTemp - 32)*(5.0/9.0);
          $(".temp p").html("<span class='TempF'>" + weatherParams.tempF.toFixed(2) +"</span>" + " &deg" + "F");
          $(".weather").html("<span class='col-xs-4'>" + String(weather.summary) + "</span>" + "<span class='col-xs-3'>");
          //This is our switch statement. As it stands it will check the icon property for the weather. It will then output an icon that corresponds with the current weather.
          switch(weather.icon){
            case "clear-day":
              console.log("The sky is clear at daytime.");
              $(".weather").append(" <i class='wi wi-forecast-io-clear-day'></i>");
              break;
            case "clear-night":
              console.log("The sky is clear at nighttime.");
              $(".weather").append(" <i class='wi wi-forecast-io-clear-night'></i>");
              break;
            case "rain":
              console.log("It is raining.");
              $(".weather").append(" <i class='wi wi-forecast-io-rain'></i>");
              break;
            case "snow":
              console.log("It is snowing.");
              $(".weather").append(" <i class='wi wi-forecast-io-snow'></i>");
              break;
            case "sleet":
              console.log("There is sleet outside!");
              $(".weather").append(" <i class='wi wi-forecast-io-sleet'></i>");
              break;
            case "wind":
              console.log("It is windy out!");
              $(".weather").append(" <i class='wi wi-forecast-io-wind'></i>");
              break;
            case "fog":
              console.log("It is foggy.");
              $(".weather").append(" <i class='wi wi-forecast-io-fog'></i>");
              break;
            case "cloudy":
              console.log("It is cloudy outside.");
              $(".weather").append(" <i class='wi wi-forecast-io-cloudy'></i>");
              break;
            case "partly-cloudy-day":
              console.log("It is partly cloudy, and daytime.");
              $(".weather").append(" <i class='wi wi-forecast-io-partly-cloudy-day'></i>");
              break;
            case "partly-cloudy-night":
              console.log("It is partly cloudy, and night time.");
              $(".weather").append(" <i class='wi wi-forecast-io-partly-cloudy-night'></i>");
              break;
            case "hail":
              console.log("it is hailing");
              $(".weather").append(" <i class='wi wi-forecast-io-hail'></i>");
              break;
            case "thunderstorm":
              console.log("it is storming.");
              $(".weather").append(" <i class='wi wi-forecast-io-thunderstorm'></i>");
              break;
            case "tornado":
              console.log("there is a tornado!");
              $(".weather").append(" <i class='wi wi-forecast-io-tornado'></i>");
                             }
          $(".weather").append("</span>" + " <span class='col-xs-5'>" + "</span>");
              
          $(".atmospheric").html('<i class="wi wi-day-cloudy-high"></i>  ' + String((weather.cloudCover*100).toFixed(0)) + '%' + ' <i class="wi wi-humidity"></i>  ' + String(weather.humidity*100) + '%');
          $(".precip").html('<i class="wi wi-raindrops"></i>  ' + String((weather.precipProbability * 100).toFixed(0)) + " %");
        }
      });
    };


//A little extra item. Shows the current time.
function startTime(){
  //Getting the user's current date.
  var now = new Date();
  //setting variables for the hours, minutes, and seconds.
  var hour   = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  //Checking the minutes and seconds so they display properly.
  minute = checkTime(minute);
  second = checkTime(second);
  $(".time").html('<i class="wi wi-time-9"></i> ' + hour + ":" + minute + ":" + second);
  //Pausing, and then running the function again. Will run infinitely.
  var update = setTimeout(startTime, 500);
};

//Checks the value of minutes or seconds. If it is less than 10, a 0 is added in front.
function checkTime(i){
  if(i < 10){
    i = "0" + i;
    }
    return i;
}


$(document).ready(function(){
  //Calling the getLocation function, only when the document is completed.
  getLocation();
  $(".tempBtn").on("click",function(){
  if(weatherParams.status == 0){
      $(".temp p").html("<span class='TempC'>" + (weatherParams.tempC).toFixed(2) +"</span>" + " &deg" + "C");
      weatherParams.status = 1;
    }
    else if(weatherParams.status == 1){
      $(".temp p").html("<span class='TempF'>" + weatherParams.tempF.toFixed(2) +"</span>" + " &deg" + "F");
      weatherParams.status = 0;
    }
  });
  startTime();
});