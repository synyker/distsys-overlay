/**
 ** Distributed Systems Project, Spring 2015
 ** Jonne Airaksinen, 013932592
 **/

var basePort = 42000;

var nodes = [];
var startedNodes = 0;
var routedNodes = 0;

var dgram = require('dgram');
server = dgram.createSocket('udp4');

var os = require('os');
var host = os.hostname();
var port = 40000;

server.on('listening', function() {
	console.log(server.address().address);
});

server.on('message', function(message, remote) {

	// Since the message is of type Buffer, use its toString-method and trim unnecessary whitespaces.
	var messageContent = message.toString('utf8').trim();

	if (messageContent.split(' ')[0] == 'STARTED') {

		var pieces = messageContent.split(' ');

		var node = {
			id: pieces[1].trim(),
			address: remote.address,
			port: remote.port
		}

		nodes[node.id-1] = node;
		startedNodes += 1;

		if (startedNodes % 128 == 0 || startedNodes > 950)
			console.log(startedNodes + ' started');
		
		if (startedNodes == 1024) {
			console.log('all nodes started');
			//routedNodes(nodes);
		}
	}

	if (messageContent.split(' ')[0] == 'ROUTED') {

		routedNodes += 1;

		if (routedNodes == 1024) {
			startNodes(nodes);
		}
	}

});

server.bind(port, host);

function routeNodes(nodes) {
	var centernodes = [];
	var chunkSize = 128;
	for (var i = 0; i < nodes.length; i+=chunkSize) {
		var chunk = nodes.slice(i,i+chunkSize);
		centernodes.push(nodes[i+chunkSize]);
	}
}

function startNodes(nodes) {

}
