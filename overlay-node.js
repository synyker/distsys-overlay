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

// Create the UDP server
var dgram = require('dgram');
server = dgram.createSocket('udp4');

var controllerAddress = '127.0.0.1';
var controllerPort = 40000;

// Local variables for full node history, number of local events counting, local clock timestamp.
var history = '';
var events = 0
var clock = 0;

// When the local server starts listening, start pinging other nodes on a specified (50ms) interval
server.on('listening', function() {
	var address = server.address();
	//console.log('listening on ' + address.address + ':' + address.port);

	var readyMsg = new Buffer('STARTED ' + id);
	server.send(readyMsg, 0, readyMsg.length, controllerPort, controllerAddress, function (err, bytes) {
		if (err) throw err;
	});
});


// The function listening for the messages on the UDP server
server.on('message', function(message, remote) {

	// Since the message is of type Buffer, use its toString-method and trim unnecessary whitespaces.
	var messageContent = message.toString('utf8').trim();

	// When the node gets a 'PING'-message, it replies with a 'PONG' to let the sender know
	// the message went through.
	if (messageContent == 'PING') {

		var reply = new Buffer('PONG ' + host);
		server.send(reply, 0, reply.length, remote.port, remote.address, function (err, bytes) {
			if (err) throw err;
		});
	}

	if (messageContent.split(' ')[0] == 'ROUTE') {
		var neighbours = messageContent.split(' ')[1].split('/');
	}
	
	if (messageContent.split(' ')[0] == 'MSG') {
		var destination = messageContent.split(' ')[1].trim();
		var hops = messageContent.split(' ')[2].trim();
	}

	// Receiving message from another node
	if (messageContent.split(' ')[0] == 's') {
		

		// Pick the greater value from the local timestamp and received timestamp, add one to the chosen one.
		clock = parseInt(senderClock) > parseInt(clock) ? parseInt(senderClock)+1 : parseInt(clock) + 1;
		
		var out = 'r ' + senderId + ' ' + senderClock + ' ' + clock;
		history += ' ' + out;
		console.log(out);
	}

});

// Listen to the port on the host and port specified in the config file.
server.bind(port, host);

/**
 ** The actual run of the node, started when all other nodes are ready.
 ** The method is called on periodically, on a delay specified by a 
 ** setInterval call.
 **/
function runProcess() {

	// Random integer to decide whether to do a local event or send a message.
	var localOrSend = randomInteger(1,2);

	// Local event
	if (localOrSend === 1) {
		var increase = randomInteger(1,5);
		clock += increase;
		events += 1;

		var out = 'l ' + increase;
		history += ' ' + out;
		console.log(out);
	}
	// Send message to other node, chosen randomly.
	else if (localOrSend === 2) {
		var receivingNode = nodes[randomInteger(0,nodes.length-1)].split(' ');
		var receivingId = receivingNode[0];
		var receivingHost = receivingNode[1];
		var receivingPort = receivingNode[2];

		var syncMsg = new Buffer('s ' + id + ' ' + clock);
		server.send(syncMsg, 0, syncMsg.length, receivingPort, receivingHost, function (err, bytes) {
			if (err) throw err;
		});

		var out = 's ' + receivingId + ' ' + clock
		history += ' ' + out;
		console.log(out);
	}

	// When 100 events have been reached, clear the interval and exit the process.
	if (events === 100) {

		clearInterval(running);
		
		// Uncomment the line below to output the whole history of this node on one line.
		// console.log(history);
		
		process.exit();
	}
}

function pingMasterNode() {

}

/**
 ** Pings all the other nodes to make sure they are up and listening
 ** for input before starting the actual run. The method is called 
 ** periodically, on a delay specified by a setInterval call.
 **/
function pingOtherNodes() {

	for (var i = 0; i < notReadyNodes.length; i++) {
		if (notReadyNodes[i] != "") {
			var pingHost = notReadyNodes[i].split(' ')[1];
			var pingPort = notReadyNodes[i].split(' ')[2];
			var msg = new Buffer('PING');
			server.send(msg, 0, msg.length, pingPort, pingHost, function (err, bytes) {
				if (err) throw err;
			});
		}
	}
}

/** 
 ** Helper method for random integers.
 **/
function randomInteger(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}
