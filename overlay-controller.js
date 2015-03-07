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

		if (routedNodes % 128 == 0 || routedNodes > 1000) {
			console.log('routed: ' + routedNodes);
			//startNodes(nodes);
		}
	}

});

server.bind(port, host);

function routeNodes(nodes) {
	var centernodes = [];
	var chunkSize = 128;
	for (var i = 0; i < nodes.length; i+=chunkSize) {
		var subTree = nodes.slice(i,i+chunkSize);
		var subTreeCenter = nodes[i+chunkSize-1]
		centernodes.push(subTreeCenter);
		addToNodeRoutingTable(subtreeCenter, subtree[Math.ceil(subtree.length/2)], subtree[0].id, subtree[subtree.length-1].id);
		routeSubtree(subtreeCenter, subTree);
	}
}

function routeSubtree(parent, subtree) {

	if (chunk.length == 1) {
		setRoutingTableForSubtreeNode(subtree[0], parent, undefined, 0, undefined, undefined, undefined, 1024)
		return;
	}

	var curRoot = subtree[Math.ceil(subtree.length/2)];

	var leftSubTree = subtree.slice(0,curRootIndex);
	var leftChild = leftSubtree[Math.ceil(leftSubTree.length/2)];

	var rightSubTree = subtree.slice(curRootIndex+1, subtree.length);
	var rightChild = rightSubtree[Math.ceil(rightSubTree.length/2)];

	setRoutingTableForSubtreeNode(curRoot, parent, leftChild, leftSubTree[0].id, leftSubTree[leftSubTree.length-1].id, rightChild, rightSubtree[0].id, rightSubtree[rightSubtree.length-1].id);

	routeSubtree(parent, leftSubtree);
	routeSubtree(parent, rightSubtree);

}

function setRoutingTableForSubtreeNode(node, parent, leftChild, leftSmallest, LeftLargest, rightChild, rightSmallest, rightLargest) {

	var route = 'ROUTE_ADD ';

	route += generateRouteString(parent, leftSmallest, rightLargest);
	
	if (typeof leftChild !== undefined) {
		route += generateRouteString(leftChild, leftSmallest, leftLargest);
	}
	
	if (typeof rightChild !== undefined) {
		route += generateRouteString(rightChild, rightSmallest, rightLargest);
	}

	sendRouteAddMessage(new Buffer(route), node);

}

function addToNodeRoutingTable(node, destination, smallest, largest) {

	var route = 'ROUTE_ADD ';

	route += generateRouteString(destination, smallest, largest);

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
