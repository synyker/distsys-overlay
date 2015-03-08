/**
 ** Distributed Systems Project, Spring 2015
 ** Jonne Airaksinen, 013932592
 **/

var fs = require('fs');
var nl = require('os').EOL;
var os = require('os');

var id = process.argv[2];
var host = os.hostname();
var port = 42000 + parseInt(id);
routes = [];

// Create the UDP server
var dgram = require('dgram');
server = dgram.createSocket('udp4');

controllerAddress = '86.50.20.183'; // ukko182 actual ip
controllerPort = 40000;

server.on('listening', function() {
	var address = server.address();

	messageNode(new Buffer('NODE_STARTED ' + id), controllerAddress, controllerPort);
});


// The function listening for the messages on the UDP server
server.on('message', function(message, remote) {

	// Since the message is of type Buffer, use its toString-method and trim unnecessary whitespaces.
	var messageContent = message.toString('utf8').trim();

	if (messageContent.split(' ')[0] == 'ROUTE_ADD') {

		var routesTmp = messageContent.split(' ')[1].split('|');
		for (var i = 0; i < routesTmp.length; i++) {
			
			if (routesTmp[i]) {
				
				routePieces = routesTmp[i].split('/');
				var route = {
					id: routePieces[0],
					address: routePieces[1],
					port: routePieces[2],
					smallest: parseInt(routePieces[3]),
					largest: parseInt(routePieces[4])
				}
				routes.push(route);
				
			}

		}

		routed = setInterval(function() { messageNode(new Buffer('NODE_ROUTED ' + id + ' ' + routes.length), controllerAddress, controllerPort) }, 200);
	}
	
	if (messageContent.split(' ')[0] == 'ROUTED_RECEIVED') {
		clearInterval(routed);
	}

	if (messageContent.split(' ')[0] == 'START') {
		messageOtherNodes();
	}

	if (messageContent.split(' ')[0] == 'MSG') {

		var originId = messageContent.split(' ')[1].trim();
		var destinationId = messageContent.split(' ')[2].trim();
		var hops = parseInt(messageContent.split(' ')[3].trim());


		if (parseInt(destinationId) == parseInt(id)) {
			found = setInterval(function() { messageNode(new Buffer('FOUND ' + id + ' ' + hops), controllerAddress, controllerPort) }, randomInteger(250, 500));
		}
		else {
			hops += 1;
			sendMessage(originId, destinationId, hops);
		}
	}

	if (messageContent.split(' ')[0] == 'FOUND_RECEIVED') {
		clearInterval(found);
	}

});

server.bind(port, host);

function messageOtherNodes() {
	for (var destId = 1; destId <= 1024; destId++) {
		if (id != destId)
			sendMessage(id, destId, 1);
	}
}

function sendMessage(originalId, destinationId, hops) {
	for (var i = 0; i < routes.length; i++) {
		if (destinationId >= routes[i].smallest && destinationId <= routes[i].largest) {
			var destination = routes[i];
			break;
		}
	}

	var m = new Buffer('MSG ' + originalId + ' ' + destinationId + ' ' + hops + ' ');
	messageNode(m, destination.address, destination.port);
}

function messageNode(msg, targetHost, targetPort) {
	server.send(msg, 0, msg.length, targetPort, targetHost, function (err, bytes) {
		if (err) throw err;
	});
}

function randomInteger(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}