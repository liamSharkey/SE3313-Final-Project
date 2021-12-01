const express = require('express')
const app = express()
const server = require('http').Server(app)
//creates a server on the port server
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('client'))
app.use(express.urlencoded({ extended: true }))

//list of users
const rooms = { }

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(3000)
//makes every user have thier own socket
io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
      //joins the room
    socket.join(room)
    rooms[room].users[socket.id] = name
    //uses broadcast to let everybody know user connected along with uses username
    //'user-connected' handled on client passes the name variable
    socket.to(room).broadcast.emit('user-connected', name)
  })
  //gets the room and message variables and then sends it
  socket.on('send-chat-message', (room, message) => {
      //sends the message to everyone in the room besides the user who sent it, without the room it would sent it to everybody.
      //
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })

  //uses broadcast to let everybody know user disconnected along with uses username
  //'user-disconnected' handled on client
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      //delets the user from the array of objects
      delete rooms[room].users[socket.id]
    })
  })
})

//
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}