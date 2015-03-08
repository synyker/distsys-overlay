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
var routes = [];

// Create the UDP server
var dgram = require('dgram');
server = dgram.createSocket('udp4');

var controllerAddress = '86.50.20.183'; //'ukko182.hpc.cs.helsinki.fi';
var controllerPort = 40000;

// Local variables for full node history, number of local events counting, local clock timestamp.
var history = '';
var events = 0
var clock = 0;

// When the local server starts listening, start pinging other nodes on a specified (50ms) interval
server.on('listening', function() {
	var address = server.address();
	//console.log('listening on ' + address.address + ':' + address.port);

	messageMasterNode(new Buffer('NODE_STARTED ' + id));
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

		routed = setInterval(messageMasterNode(new Buffer('NODE_ROUTED ' + id)), 200);
	}
	
	if (messageContent.split(' ')[0] == 'ROUTED_RECEIVED') {
		console.log('clearing interval');
		clearInterval(routed);
	}

	if (messageContent.split(' ')[0] == 'START') {
		console.log('messaging others');
	}

	if (messageContent.split(' ')[0] == 'MSG') {
		var destination = messageContent.split(' ')[1].trim();
		var hops = messageContent.split(' ')[2].trim();
	}

});

// Listen to the port on the host and port specified in the config file.
server.bind(port, host);

function messageMasterNode(msg) {
	server.send(msg, 0, msg.length, controllerPort, controllerAddress, function (err, bytes) {
		if (err) throw err;
	});
}