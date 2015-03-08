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

controllerAddress = '86.50.20.183'; //'ukko182.hpc.cs.helsinki.fi';
controllerPort = 40000;

// Local variables for full node history, number of local events counting, local clock timestamp.
var history = '';
var events = 0
var clock = 0;

// When the local server starts listening, start pinging other nodes on a specified (50ms) interval
server.on('listening', function() {
	var address = server.address();
	//console.log('listening on ' + address.address + ':' + address.port);

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
					smallest: routePieces[3],
					largest: routePieces[4]
				}
				routes.push(route);
				
			}

		}

		routed = setInterval(function() { messageNode(new Buffer('NODE_ROUTED ' + id), controllerAddress, controllerPort) }, 200);
	}
	
	if (messageContent.split(' ')[0] == 'ROUTED_RECEIVED') {
		clearInterval(routed);
	}

	if (messageContent.split(' ')[0] == 'START') {
		messageOtherNodes();
	}

	if (messageContent.split(' ')[0] == 'MSG') {

		console.log(messageContent);

		var destinationId = messageContent.split(' ')[1].trim();
		var hops = parseInt(messageContent.split(' ')[2].trim());

		if (parseInt(destinationId) == parseInt(id)) {
			console.log('jahuu');
		}
		else {
			hops += 1;
			sendMessage(destinationId, hops);
		}
	}

});

// Listen to the port on the host and port specified in the config file.
server.bind(port, host);

function messageOtherNodes() {
	for (var id = 1; id <= 1024; id++) {
		sendMessage(id, 1);
	}
}

function sendMessage(id, hops) {
	for (var i = 0; i < routes.length; i++) {
		if (id > routes[i].smallest && id < routes[i].largest) {
			var destination = routes[i];
			break;
		}
	}
	console.log(routes);
	console.log(destination);
	var m = new Buffer('MSG ' + id + ' ' + hops);
	messageNode(m, destination.address, destination.port);
}

function messageNode(msg, targetHost, targetPort) {
	server.send(msg, 0, msg.length, targetPort, targetHost, function (err, bytes) {
		if (err) throw err;
	});
}