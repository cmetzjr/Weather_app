$(document).ready(function () {

    //today's date
    var today = moment().format("l");

    //handy function to capitalize the first letter in a word, from blog article at https://attacomsian.com/blog/string-capitalize-javascript
    const capitalize = (str) => {
        if (typeof str === 'string') {
            return str.replace(/^\w/, c => c.toUpperCase());
        } else {
            return '';
        }
    };

    // new array if local storage is empty, otherwise populate from local storage
    if (localStorage.getItem("city") === null) {
        var searchHist = [];
    } else {
        var searchHist = JSON.parse(localStorage.getItem("city"));
        makeCityList();
    };
    // console.log(searchHist);

    //generate list items based on array searchHist
    function makeCityList() {
        var cityList = $("#cityList");//the <ul> container of <li> cities
        cityList.empty();
        for (i = 0; i < searchHist.length; i++) {
            var searchFieldListItem = $("<li>").text(searchHist[i]).attr("type", "button").addClass("list-group-item city");
            $("#cityList").prepend(searchFieldListItem);
        };
    };

    //add the searched city to the searchHist array and save to local storage
    function addToArray() {
        var searchField = capitalize($("#searchField").val().trim());//city they searched for
        searchHist.push(searchField);
        // console.log(searchHist);
        localStorage.setItem("city", JSON.stringify(searchHist));
    };

    //obtain current weather and populate HTML fields
    function getCurrentWeather() {
        var searchField = $("#searchField").val().trim();//city they searched for
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchField + "&appid=7a10d06f7cb08f419c846031b7cae29a&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response.weather[0].icon);
            $("#currentWeatherIcon").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png");
            $("#currentCity").html(capitalize(searchField) + " (" + today + ")");
            $("#cityHumidity").html(response.main.humidity + "%");
            $("#cityTempF").html(Math.round(response.main.temp) + " &deg;F");
            $("#cityWindSpeed").html(Math.round(response.wind.speed) + " MPH");
            var lon = response.coord.lon;
            var lat = response.coord.lat;
            //need to use lat & lon to get UV Index
            var queryURL2 = "https://api.openweathermap.org/data/2.5/uvi?appid=7a10d06f7cb08f419c846031b7cae29a&lat=" + lat + "&lon=" + lon;
            $.ajax({
                url: queryURL2,
                method: "GET"
            }).then(function (response) {
                // console.log(response);
                var currentUVI = Math.round(response.value);
                // console.log(currentUVI);
                $("#cityUvIndex").html(currentUVI);

                //based on the value of UV Index, create a background color
                if (currentUVI >= 0 && currentUVI < 3) {
                    $("#cityUvIndex").addClass("uvLow")
                } else if (currentUVI >= 3 && currentUVI <= 5) {
                    $("#cityUvIndex").addClass("uvModerate")
                } else if (currentUVI >= 6 && currentUVI <= 7) {
                    $("#cityUvIndex").addClass("uvHigh")
                } else if (currentUVI >= 8 && currentUVI <= 10) {
                    $("#cityUvIndex").addClass("uvVeryHigh")
                } else {
                    $("#cityUvIndex").addClass("uvExtreme")
                }
            });
        });
    };

    // //obtain 5-d forecast and populate HTML fields
    function getForecast() {
        var searchField = $("#searchField").val().trim();//city they searched for
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchField + "&appid=7a10d06f7cb08f419c846031b7cae29a&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response.list[4]);
            for (i = 4; i < response.list.length; i = i + 8) {
                $("#forecastDate" + [i]).html(moment(response.list[i].dt_txt).format("l"));
                $("#forecastIcon" + [i]).attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png");
                $("#forecastTempF" + [i]).html(Math.round(response.list[i].main.temp) + " &deg;F");
                $("#forecastHumidity" + [i]).html(response.list[i].main.humidity + "%");
            }
        });
    };

    //onclick of the search button
    $("#searchBtn").on("click", function (event) {
        event.preventDefault();
        // console.log("run");
        addToArray();
        makeCityList();
        getCurrentWeather();
        getForecast();
    });

    //
    //The stuff that's executing on the click listener below is EXTREMELY duplicative of the stuff happening on the listener above, but when i tried to re-use the functions, i had scope problems that i didn't have time to fix.
    //
    //onclick of city in the recent searches list
    $(document).on("click", ".list-group-item", function (event) {
        event.preventDefault();
        // console.log("run");
        var newsearchField = $(this).text();//city they searched for
        // console.log(newsearchField);
        //API call for the forecast data
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + newsearchField + "&appid=7a10d06f7cb08f419c846031b7cae29a&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response.list[4]);
            for (i = 4; i < response.list.length; i = i + 8) {
                $("#forecastDate" + [i]).html(moment(response.list[i].dt_txt).format("l"));
                $("#forecastIcon" + [i]).attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png");
                $("#forecastTempF" + [i]).html(Math.round(response.list[i].main.temp) + " &deg;F");
                $("#forecastHumidity" + [i]).html(response.list[i].main.humidity + "%");
            }
        });

        //API call for the current weather data
        // var newsearchField = $("#searchField").val().trim();//city they searched for
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + newsearchField + "&appid=7a10d06f7cb08f419c846031b7cae29a&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            $("#currentWeatherIcon").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png");
            $("#currentCity").html(capitalize(newsearchField) + " (" + today + ")");
            $("#cityHumidity").html(response.main.humidity + "%");
            $("#cityTempF").html(Math.round(response.main.temp) + " &deg;F");
            $("#cityWindSpeed").html(Math.round(response.wind.speed) + " MPH");
            var lon = response.coord.lon;
            var lat = response.coord.lat;
            //need to use lat & lon to get UV Index
            var queryURL2 = "https://api.openweathermap.org/data/2.5/uvi?appid=7a10d06f7cb08f419c846031b7cae29a&lat=" + lat + "&lon=" + lon;
            $.ajax({
                url: queryURL2,
                method: "GET"
            }).then(function (response) {
                // console.log(response);
                var currentUVI = Math.round(response.value);
                // console.log(currentUVI);
                $("#cityUvIndex").html(currentUVI);

                //based on the value of UV Index, create a background color
                if (currentUVI >= 0 && currentUVI < 3) {
                    $("#cityUvIndex").addClass("uvLow")
                } else if (currentUVI >= 3 && currentUVI <= 5) {
                    $("#cityUvIndex").addClass("uvModerate")
                } else if (currentUVI >= 6 && currentUVI <= 7) {
                    $("#cityUvIndex").addClass("uvHigh")
                } else if (currentUVI >= 8 && currentUVI <= 10) {
                    $("#cityUvIndex").addClass("uvVeryHigh")
                } else {
                    $("#cityUvIndex").addClass("uvExtreme")
                }
            });
        });
    });

})//close ready function
