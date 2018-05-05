// When the page is loaded, query the state of all the sensors
$(document).ready(function(){
    refresh_all()
});

document.getElementById("solenoid-toggle").onclick = function() {
    solenoid_status(toggle=true)
};

Array.prototype.forEach.call(document.getElementsByClassName("tripwire"), function(tripwire) {
    tripwire.onclick = function() {
        tripwire_status(number = tripwire.name, toggle = true)
    }
});

document.getElementById("keypad-code").addEventListener("keypress", function(e) {
    // prevent non-hex input
    if(! /[a-f0-9]/.test(e.key.toString())){
        e.preventDefault();
    }
});

document.getElementById("keypad-code").onchange = function(e){
    keycode_status(e.srcElement.value);
    e.srcElement.blur()
};

document.getElementById("rgb-select").onchange = function(e) {
    rgb_select(e.srcElement.value);
    e.srcElement.blur()
};

document.getElementById("tripwire-all").onclick = function() {
    tripwire_all(toggle=true)
};

document.getElementById("tripwire-randomize").onclick = function() {
    tripwire_randomize();
};

document.getElementById("timer-start-reset").onclick = function() {
    timer_status(toggle=true)
};

document.getElementById("ultrasonic-enable").onclick = function() {
    ultrasonic_status(toggle=true)
};

document.getElementById("submitEntry").onclick = function(e) {
  e.preventDefault();
  add_team(teamName=document.getElementById("addTeam").value);
};

function keycode_status(code){
    // Don't refresh this part of the page if it is in focus
    var x = new XMLHttpRequest();
    if (code === "status") {
        if (!$(document.getElementById("keypad-code")).is(':focus')) {
            x.open('GET', 'http://' + document.location.host + '/api/keycode/', true);
        }
    } else{
        x.open('PUT', 'http://' + document.location.host + '/api/keycode/' + code, true);
    }
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                document.getElementById("keypad-code").value = data["status"];
            }
        }
    };
    x.send();
}

function refresh_all(){
    keycode_status("status");
    solenoid_status(toggle=false);
    timer_status(toggle=false);
    tripwire_all(toggle=false);
    ultrasonic_status(toggle=false);
    rgb_select("status")
}

function rgb_select(color){
    // Don't refresh this part of the page if it is in focus
    if (!$(document.getElementById("rgb-select")).is(':focus')) {
        var x = new XMLHttpRequest();
        x.open('GET', 'http://' + document.location.host + '/api/rgb_select/' + color, true);
        x.onload = function () {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    var data = JSON.parse(x.response);
                    document.getElementById("rgb-select").selectedIndex = data["status"];
                    document.getElementById("rgb-select").style.backgroundColor = data["color"];
                }
            }
        };
        x.send();
    }
}

function solenoid_status(toggle){
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/solenoid' + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                document.getElementById("solenoid-toggle").innerHTML = data["status"];
            }
        }
    };
    x.send();
}

function timer_status(toggle){
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/timer' + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                document.getElementById("timer-start-reset").innerHTML = data["status"];
            }
        }
    };
    x.send();
}

function tripwire_status(number, toggle) {
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/tripwire/' + number + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                document.getElementById("tripwire-" + number.toString()).style.backgroundColor=data["color"];
            }
        }
    };
    x.send();
}

function tripwire_all(toggle) {
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/tripwire/all' + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                Array.prototype.forEach.call(document.getElementsByClassName("tripwire"), function(tripwire) {
                    document.getElementById("tripwire-" + tripwire.name.toString()).style.backgroundColor=data[tripwire.name];
                });
            }
        }
    };
    x.send();
}

function tripwire_randomize(toggle) {
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/tripwire/randomize' + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                tripwire_all(toggle=false);
            }
        }
    };
    x.send();
}

function ultrasonic_status(toggle){
    var x = new XMLHttpRequest();
    x.open('GET', 'http://' + document.location.host + '/api/ultrasonic' + (toggle? "/toggle": "/status"), true);
    x.onload = function () {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var data = JSON.parse(x.response);
                document.getElementById("ultrasonic-enable").innerHTML = data["status"];
            }
        }
    };
    x.send();
}

function add_team(teamName) {
  var x = new XMLHttpRequest();
  x.open('POST', 'http://' + document.location.host + '/api/submit-entry/' + teamName + '/');
  x.send();
  document.getElementById("addTeam").value = "";
}

/*
setInterval(function(){
    // TODO after the project is complete the refresh time can be set based on how long it takes python code to run
    refresh_all()
}, 1600);
*/
