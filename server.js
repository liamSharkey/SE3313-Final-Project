//serverside javascript


//creates a server on the designated port
const io = require('socket.io')('3000')


//creates an inital message. 
io.on('connection', socket => {
    socket.emit('initial-message', 'joined')
})