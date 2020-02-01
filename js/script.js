/**
//Made by Elian Van Cutsem
*/
(function ($){
  'use strict'

  //subscription key used to access API's
  const subscriptionKey = "a256fd6a0f7a49da8b076533e33d4c83";

  //DOM loaded
  $(document).ready(function() {
    //load instance of the GUI
    loadScript();

    //if departure is selected as radio
    $("#departureRadio").on('click', function() {
      //change the title to say:
      $("#departureDateLabel").text("Date & time of departure")
    })

    //if arrival is selected as radio
    $("#arrivalRadio").on('click', function() {
      //change the title to say:
      $("#departureDateLabel").text("Date & time of arrival")
    })

    //when a key is pressed and released in the start input
    $("#start").on('keyup', function() {
      //if the field is not empty
      if($("#start").val().trim() != ""){
        //search all haltes related to input
        zoekHaltes($("#start").val(), "#startSelect");
        //show dropdown and hide errors
        $("#startSelect").show();
        $("#start").removeClass("error");
      }
    })

    //when a key is pressed and released in the destination input
    $("#destination").on('keyup', function() {
      //if the field is not empty
      if($("#destination").val().trim() != ""){
        //search all haltes related to input
        zoekHaltes($("#destination").val(), "#destinationSelect");
        //show dropdown and hide errors
        $("#destination").removeClass("error");
        $("#destinationSelect").show();
      }
    })

    //when clicked on the get location button
    $("#locationButton").on('click', function() {
      //get the location
      getLocation();
    })

    //if clicked on switch button
    $("#switch").on('click', function() {
      //change the values of the dropdowns and inputs
      switchPlaces();
    })

    //when clicked on submit/Search
    $("#submitButton").on('click', function() {
      //log that the program is searching
      console.log("submit clicked");
      //empty the results list
      $("#results").empty();
      //start search
      trigger();
    })

    //when clicked on open detail button in the results
    $("#results").on('click','.detailsIcon', function(e) {
      //toggle the clicked element details
      $(e.currentTarget).parent().children("h4").slideToggle("10");
      if ($(".favouriteIcon").is(":hidden")){
        $(e.currentTarget).parent().children().slideToggle();
      }
    })

    $("#results").on('click','.favouriteIcon', function(e) {
      if ($(e.currentTarget).attr("src") == "img/favourited.png"){
        //remove favourite
        console.log("removed favourite");
        //console.log($(e.target).parent().parent().prop('outerHTML'));
        //check every localStorage element on a match with current favourite
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
          if($(e.target).parent().parent().prop('outerHTML') == localStorage.getItem(localStorage.key(i))){
            //when matched, remove the favourite
            localStorage.removeItem(localStorage.key(i));
          }
        }
        $(e.currentTarget).attr("src","img/favourite.png");
        //reload favourites
        getFavourites();
      }
      else {
        //add as favourite
        $(e.currentTarget).attr("src","img/favourited.png");
        console.log("added to favourites");
        addToStorage($(e.target).parent().parent().prop('outerHTML'));
      }
    })

    //if clicked on details in the favourites list
    $("#favourites").on('click','.detailsIcon', function(e) {
      //toggle the details
      $(e.currentTarget).parent().children("h4").slideToggle("10");
      $(e.currentTarget).parent().children().slideToggle();
    })

    //if clicked on the favourite button in the favourite list
    $("#favourites").on('click','.favouriteIcon', function(e) {
      console.log("removed favourite");
      //console.log($(e.target).parent().parent().prop('outerHTML'));

      //check localStorage on a match
      for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        if($(e.target).parent().parent().prop('outerHTML') == localStorage.getItem(localStorage.key(i))){
          //console.log("match found");
          //if match, remove the element
          localStorage.removeItem(localStorage.key(i));
        }
      }
      //reload favourites
      getFavourites();
    })
  });

  //loads the GUI
  function loadScript(){
    console.log("Loaded"); //Script ready to use

    //fills the time & date input field with current time
    var timevalue = $("#departureDate");
    timevalue.val(new Date(new Date().valueOf() + 3600000).toJSON().slice(0,16));

    //checks for favourites and prints them
    getFavourites();

    //empty the values
    emptyValues();
  }

  //empty all values
  function emptyValues(){
    $("#start").empty();
    $("#destination").empty();
    $("#startSelect").hide();
    $("#destinationSelect").hide();
    $("#errorp").hide();
  }

  //This function is triggered when search starts
  function trigger(){
    //check on errors
    if (!errorCheck()){
      //log the search you're requesting
      console.log("search " + $("#startSelect").find(":selected").text() + " -> " + $("#destinationSelect").find(":selected").val());

      //values of the options
      let startCoordinates = $("#startSelect").find(":selected").val();
      let destCoordinates = $("#destinationSelect").find(":selected").val();
      let vertrekAankomst = $('input[name=departureRadio]:checked').val();

      //make a list item that shows the search is happening
      $("#results").append("<li>Searching the best route for you...</li>");

      //start the request to the API
      geefRoutePlan(startCoordinates, destCoordinates, $("#departureDate").val(), vertrekAankomst);
    }
  }

  //check the form on errors
  //this returns a boolean
  function errorCheck(){
    let errors = false; //no errors yet

    //if the dropdown is empty
    if($("#destinationSelect").text() == ""){
      //return error
      $("#destination").addClass("error");
      errors = true;
    }

    //if the dropdown is empty
    if($("#startSelect").text() == ""){
      //return error
      $("#start").addClass("error");
      errors = true;
    }

    //if errors are present, show errors
    if (errors){
      $("#errorp").show();

    }
    //no errors present, hide error
    else {
      $("#errorp").hide();
    }
    return errors;
  }

  //API request to give a complete Route from A to B
  function geefRoutePlan(vertrekLatlng, bestemmingLatlng, timeOfDeparture, vertrekAankomst){
    var params = {
        // Request parameters
          "aanvraagType": "INITIEEL",
          //the time that is filled in in the input field
          "tijdstip": timeOfDeparture + ":00", //since the field returns no seconds in some browsers, add them manually
          //requests if its arrival or departure
          "vertrekAankomst": vertrekAankomst,
          //"vervoersOptie": vervoersOptie,
      };

      //the actual request to API
      $.ajax({
          url: "https://api.delijn.be/DLKernOpenData/v1/beta/routeplan/" + vertrekLatlng + "/" + bestemmingLatlng + "?" + $.param(params),
          beforeSend: function(xhrObj){
              // Request headers
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
          },
          type: "GET",
          // Request body
          data: "{body}",
      })
      .done(function(data) {
          //alert("success");
          console.log(data); //logs all given data if success

          //variables
          let duurtijd;

          //fill the title and empty the list
          $("#resultTitle").empty().append("<h3>Found routes:</h3>");
          $("#results").empty();

          //check if found no routes
          if(data.reiswegen.length == 0){
            $("#resultsTitle").append("<h3>No routes found</h3>");
          }
          else {
            //for every route found
            for (var i = 0; i < data.reiswegen.length; i++) {
              //the string that will be added to the HTML element of the results
              let result = "";
              duurtijd = data.reiswegen[i].duurtijd;
              //add the icons, time and name of the route
              result += "<li><a class='result'><img class='favouriteIcon' src='img/favourite.png'><h4>Route "+ (i+1) + ":</h4> " + changeStartString(duurtijd.start) + " -> " + changeStartString(duurtijd.einde) + " total duration: " + changeTimeString(data.reiswegen[i].duurtijd.duurtijd)+"<img src='img/openDetails.png' class='detailsIcon rotateimg270'><img src='img/openDetails.png' class='detailsIcon rotateimg90'><ul class='details'>";
              for (var j = 0; j < data.reiswegen[i].reiswegStappen.length; j++) {
                //console.log(data.reiswegen[i].reiswegStappen[j]); //logs the data for the given route
                //if it's a BUS
                if(data.reiswegen[i].reiswegStappen[j].type == "VOERTUIG" && data.reiswegen[i].reiswegStappen[j].lijnType == "BUS"){
                  //add busicon, ritnummer, departure and name
                  result += "<li><img class='transportIcon' src='img/bus.png'><p>bus "+ data.reiswegen[i].reiswegStappen[j].ritnummer +" from: " + data.reiswegen[i].reiswegStappen[j].vertrekPunt.naam + " to: " + data.reiswegen[i].reiswegStappen[j].aankomstPunt.naam+ " " + "</p></li>";
                  //add info
                  result += "<li class='info'>" + changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + " - " + checkdistance(data.reiswegen[i].reiswegStappen[j].afstand) + "</li>";
                }
                //if its a TREIN
                if(data.reiswegen[i].reiswegStappen[j].type == "VOERTUIG" && data.reiswegen[i].reiswegStappen[j].lijnType == "TREIN"){
                  //add trainicon, departure and name
                  result += "<li><img class='transportIcon' src='img/train.png'><p>"+ data.reiswegen[i].reiswegStappen[j].lijnrichting.bestemming +" from: " + data.reiswegen[i].reiswegStappen[j].vertrekPunt.naam +" to: "+data.reiswegen[i].reiswegStappen[j].aankomstPunt.naam + "</p></li>";
                  //add info
                  result +="<li class='info'>" +changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + " - " + checkdistance(data.reiswegen[i].reiswegStappen[j].afstand) + "</li>";
                }
                //if it's WANDELEN
                if(data.reiswegen[i].reiswegStappen[j].type == "WANDELEN"){
                  //if its WANDELEN given by route
                  if(data.reiswegen[i].reiswegStappen[j].hasOwnProperty("vertrekPunt") && data.reiswegen[i].reiswegStappen[j].hasOwnProperty("aankomstPunt")){
                    //add icon and name
                    result +="<li><img class='transportIcon' src='img/walk.png'><p>" + " from: " + data.reiswegen[i].reiswegStappen[j].vertrekPunt.naam + " to: " + data.reiswegen[i].reiswegStappen[j].aankomstPunt.naam + "</p></li>";
                    //add info
                    result +="<li class='info'>" +changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + " - " + checkdistance(data.reiswegen[i].reiswegStappen[j].afstand) + "</li>";
                  }
                  //if it's wandelen to your location
                  else if(!data.reiswegen[i].reiswegStappen[j].hasOwnProperty("aankomstPunt")){
                    //add name and icon
                    result +="<li><img class='transportIcon' src='img/walk.png'><p>" + " from: " + data.reiswegen[i].reiswegStappen[j].vertrekPunt.naam + " to: your location</p></li>";
                    //add info
                    result +="<li class='info'>" +changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + " - " + checkdistance(data.reiswegen[i].reiswegStappen[j].afstand) + "</li>";
                  }
                  //if it's wandelen from your location
                  else {
                    //add name and icon
                    result +="<li><img class='transportIcon' src='img/walk.png'><p>" + " from: your location to: " + data.reiswegen[i].reiswegStappen[j].aankomstPunt.naam + "</p></li>";
                    //add indo
                    result +="<li class='info'>" +changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + " - " + checkdistance(data.reiswegen[i].reiswegStappen[j].afstand) + "</li>";
                  }
                }
                //if its WACHTEN
                if(data.reiswegen[i].reiswegStappen[j].type == "WACHTEN"){
                  //add icon and time
                  result +="<li><img class='transportIcon' src='img/wait.png'><p>wait " + changeTimeString(data.reiswegen[i].reiswegStappen[j].duurtijd.duurtijd) + "</p></li>";
                }
              }
              //close the resultslist
              result += "</ul></a>";
              $("#results").append(result);
              //hide the icons and details
              $(".details").hide();
              $(".favouriteIcon").hide();
              $(".detailsIcon.rotateimg90").hide();
            }
          }
      })
      .fail(function() {
          //alert("error");
      });
  }

  //request zoekHaltes API
  function zoekHaltes(zoekArgument, idDropDown) {
    //actual request
    $.ajax({
        url: "https://api.delijn.be/DLZoekOpenData/v1/beta/zoek/haltes/" + zoekArgument +"?",
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "GET",
        // Request body
        data: "{body}",
    })
    .done(function(data) {
        //console.log(data); //logs data if succes
        //delete all data that was already added
        $(idDropDown).empty();
        //if no haltes are found
        if(data.aantalHits == 0){
          $(idDropDown).append("<option value='-1'>no found locations</option>");
        }
        else {
          //add all haltes found to the dropdown
          for (var i = 0; i < data.haltes.length; i++) {
            $(idDropDown).append("<option value='"+ data.haltes[i].geoCoordinaat.latitude + "," + data.haltes[i].geoCoordinaat.longitude +"'>" + data.haltes[i].omschrijving + "</option>")
          }
        }
    })
    //if error in API
    .fail(function(){
      console.log("there was an error searching locations");
    });
  }

  //using geolocation
  function getLocation() {
    //if browser is compatible
    if (navigator.geolocation) {
      //request location to browser
      navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
      //if browser isn't compatible
      console.log("Geolocation is not supported by this browser.");
    }
  }

  //get exact position
  function showPosition(position) {
    //set value as the exact coord you are located
    let value = position.coords.latitude+","+position.coords.longitude;
    //add your location to the dropdown and show  it
    $("#startSelect").append("<option value='"+value+"'>Your Location</option>");
    $("#destinationSelect").append("<option value='"+value+"'>Your Location</option>");
    $("#destinationSelect").show();
    $("#startSelect").show();
    //select the new added value
    $("#startSelect").val(value).change();
  }

  //this function changes the given API timestring to a better format
  function changeTimeString(timeString){
    //delete data that ist used
    let basic = timeString.substring(4, timeString.length - 2);
    let hours,minutes;
    //if the length is 4 there is no hour given
    if (basic.length == 4){
      minutes = basic.substring(2,3);
      //return only minutes
      return minutes + "m"
    }
    //if the length is 5 there is 1 digit hour given
    if (basic.length == 5){
      hours = basic.substring(0,1);
      minutes = basic.substring(2,4);
    }
    //if the length is 5 there is 2 digit hour given
    if (basic.length == 6){
      hours = basic.substring(0,2);
      minutes = basic.substring(3,5);
    }
    return hours + "h " + minutes + "m";
  }

  //change the string given by API to readable format
  function changeStartString(startString){
    let str = startString;
    let result = str.substring(11,16);
    return result;
  }

  //changes the string given by API to readable distance
  function checkdistance(distance){
    let str = distance;
    let km;
    if (str < 1000){
      km = 0;
      return km + "." + str + "km ";
    }
    else {
      km = str / 1000;
    }
    return km + "km ";
  }

  //change the values from destination to arrival
  function switchPlaces(){
    let start = $("#start").val();
    let dest = $("#destination").val();
    $("#destination").val(start);
    $("#start").val(dest);
    zoekHaltes($("#start").val(), "#startSelect");
    zoekHaltes($("#destination").val(), "#destinationSelect");
  }

  function addToStorage(stringToAdd){
    if (typeof(Storage) !== "undefined") {
      //set the new favourite with the current time and date as key
      localStorage.setItem(new Date(), stringToAdd);
      //print all favourites
      getFavourites();
    }
    //if localStorage isn't supported by your browser
    else {
      console.log("Your browser doesn't support this function");
    }
  }

  //function to print favourites if any
  function getFavourites() {
    //checks on stored favourites
    if (localStorage.length > 0){
      //prints title and empty the list
      $("#favouritesTitle").text("Your favourite routes:").show();
      $("#favourites").empty();

      //print all favourites
      for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        $("#favourites").append(localStorage.getItem(localStorage.key(i)));
      }
    }
    //if no favourites are stored, hide title and empty list
    else {
      $("#favouritesTitle").text("favourites").hide();
      $("#favourites").empty();
    }
  }

})(jQuery)
