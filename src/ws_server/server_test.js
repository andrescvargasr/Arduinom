var deviceLister = require('./deviceLister'); //move to other file ?
var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});
// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Emit welcome message on connection
io.on('connection', function (socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    setListeners(io);
    socket.emit('welcome', {message: 'Welcome!', id: socket.id});
    socket.on('i am client', console.log);
    socket.on('disconnect', function () {
        console.log('stopping socket.io client');
        clearListeners();
    });
});

app.listen(3000);


//Listeners
function setListeners(io) {
    deviceLister.on('update', (array)=> {
        console.log(array);
        io.emit('devices',JSON.stringify(array));
    });
}
function clearListeners() {
    deviceLister.removeAllListeners('update');
}
