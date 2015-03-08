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

	if (messageContent.split(' ')[0] == 'NODE_STARTED') {

		var pieces = messageContent.split(' ');

		var node = {
			id: parseInt(pieces[1].trim()),
			address: remote.address,
			port: remote.port
		}

		nodes[node.id-1] = node;
		startedNodes += 1;

		if (startedNodes % 128 == 0)
			console.log(startedNodes + ' started');

		if (startedNodes == 1024) {
			console.log('all nodes started');
			console.log(nodes);
			routeNodes(nodes);
		}
	}

	if (messageContent.split(' ')[0] == 'NODE_ROUTED') {

		routedNodes += 1;

		if (routedNodes % 128 == 0 || routedNodes > 1020) {
			console.log('routed: ' + routedNodes);
			//startNodes(nodes);
		}
	}

});

server.bind(port, host);

function routeNodes(nodes) {
	console.log('routing subtrees');
	var centernodes = [];
	var chunkSize = 128;

	for (var i = 0; i < nodes.length; i+=chunkSize) {
		var subtreeCenter = nodes[i+chunkSize-1]
		centernodes.push(subtreeCenter);
	}
	console.log(centernodes);

	for (var i = 0; i < nodes.length; i+=chunkSize) {
		console.log('routing subtree ' + ( (i+chunkSize) / 128 ) );
		var subtree = nodes.slice(i,i+chunkSize-1);
		var currentCenter = nodes[i+chunkSize-1]
		
		addRoutesToCenterNode(currentCenter, subtree[Math.ceil(subtree.length/2)-1], subtree[0].id, subtree[subtree.length-1].id, centernodes);
		routeSubtree(currentCenter, subtree);
	}
}

function routeSubtree(parent, subtree) {

	if (subtree.length == 1) {
		setRoutingTableForSubtreeNode(subtree[0], parent, undefined, 0, undefined, undefined, undefined, 1024)
		return;
	}

	var curRootIndex = Math.ceil(subtree.length/2)-1;
	var curRoot = subtree[curRootIndex];

	console.log('routing node ' + curRoot.id);

	if (subtree.length < 5) {
		console.log(subtree);
	}

	var leftSubtree = subtree.slice(0,curRootIndex);
	var leftChild = leftSubtree[Math.ceil(leftSubtree.length/2)-1];

	var rightSubtree = subtree.slice(curRootIndex+1, subtree.length);
	var rightChild = rightSubtree[Math.ceil(rightSubtree.length/2)-1];

	setRoutingTableForSubtreeNode(curRoot, parent, leftChild, leftSubtree[0].id, leftSubtree[leftSubtree.length-1].id, rightChild, rightSubtree[0].id, rightSubtree[rightSubtree.length-1].id);

	routeSubtree(parent, leftSubtree);
	routeSubtree(parent, rightSubtree);

}

function setRoutingTableForSubtreeNode(node, parent, leftChild, leftSmallest, leftLargest, rightChild, rightSmallest, rightLargest) {

	console.log('setRoutingTableForSubtreeNode');

	console.log(leftChild);
	console.log(rightChild);

	var route = 'ROUTE_ADD ';

	route += generateRouteString(parent, leftSmallest, rightLargest);
	
	if (leftChild !== undefined) {
		route += generateRouteString(leftChild, leftSmallest, leftLargest);
	}
	
	if (rightChild !== undefined) {
		route += generateRouteString(rightChild, rightSmallest, rightLargest);
	}

	sendRouteAddMessage(new Buffer(route), node);

}

function addRoutesToCenterNode(node, subtreeRoot, smallest, largest, centernodes) {

	var route = 'ROUTE_ADD ';


	route += generateRouteString(subtreeRoot, smallest, largest);

	sendRouteAddMessage(new Buffer(route), node);
}

function generateRouteString(destination, smallest, largest) {
	return destination.id + '/' + destination.address + '/' + destination.port + '/' + smallest + '/' + largest + '|';
}

function sendRouteAddMessage(msg, node) {

	server.send(msg, 0, msg.length, node.port, node.address, function (err, bytes) {
		if (err) throw err;
	});

}

function startNodes(nodes) {

}
