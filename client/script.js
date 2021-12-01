//this is where the server is hosting the socket.js application
const socket = io('http://localhost:3000')
//container to display messages
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
//
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
  //this is the pop up that asks the users for their username
  const name = prompt('What is your name?')
  //basic display message
  appendMessage('You joined')
  //new-user request to server with roomName and name variables
  socket.emit('new-user', roomName, name)
//whenever the form is submitted
  messageForm.addEventListener('submit', e => {
    //the page is stopped from refreshing. Without this the page would lose all chat messages everytime send is pressed
    e.preventDefault()
    const message = messageInput.value
    //shows the sender YOU instead of their username with the message variable
    appendMessage(`You: ${message}`)
    //send-chat-message request to the server with roomName and message variables
    socket.emit('send-chat-message', roomName, message)
    //clears the message box after message is sent
    messageInput.value = ''
  })
}

//this is the request 'room-created' sent to the server with room variable
//I THINK this is what shows the available rooms
socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

//chat-message request to server
socket.on('chat-message', data => {
  //displays the users name infront of the message "RITHIK: hello"
  appendMessage(`${data.name}: ${data.message}`)
})

//user-connected request to server and displays it
socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

//user-disconnected request to server and displays it
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

//this displays messages
function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  //message element is the data
  messageContainer.append(messageElement)
}
