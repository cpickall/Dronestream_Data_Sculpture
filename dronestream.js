var request = require('request');
var fs = require('fs');
var nodeCleanup = require('node-cleanup');
var wpi = require('wiring-pi');
var latest = 0;

//setup wiring pi and set pinmode
wpi.wiringPiSetup();
var pin = 2; //Change pin number according to your wiring
wpi.pinMode(pin, wpi.OUTPUT);
var value = 1;

//Get last drone strike from file
fs.readFile('latest.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  latest = data;
  console.log(latest);
});

//variables to schedule request every hour (note: interval is in milliseconds)
var minutes = 60;
var interval = minutes * 60 * 1000;

//read data and turn on motor to drive droplets when new strikes are logged
setInterval(function() {

    request('http://api.dronestre.am/data', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body)
            var data = JSON.parse(body);
            data = data.strike;
            var date = new Date();
            console.log(date);
            //loop through json data
            for(var i = 0; i < data.length; i++){
                //if there's a new strike
                        if(data[i].number > latest){
                            //update the latest strike number
                            latest = data[i].number;
                            var deaths = data[i].deaths_max;
                            var delay = 50 * deaths;
                                wpi.digitalWrite(pin, value);
                                setTimeout(function() {
                                    console.log("Wrote "+deaths+"drops.");
                                    console.log(headline);
                                    wpi.digitalWrite(pin,0);
                                }, delay);

                        }
            };
        }
    })
}, interval);

//write the latest dronestrike output before quitting
nodeCleanup(function () {
    fs.writeFileSync("latest.txt", latest);
    console.log("wrote latest");
});
