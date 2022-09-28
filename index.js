const express = require('express')
const socketIo = require('socket.io')
const http = require('http')
const PORT = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
const io = socketIo(server,{ 
    cors: {
      origin: 'http://localhost:3000'
    }
})
io.on('connection',(socket)=>{
  console.log('client connected: ',socket.id)

  socket.on('room', (data)=>{
  let clientsInRoom = 0;
  if (io.sockets.adapter.rooms.has(data)) {clientsInRoom = io.sockets.adapter.rooms.get(data).size}
  console.log(clientsInRoom)
  if(clientsInRoom <= 1){
  socket.join(data)
  if(clientsInRoom > 0){
    io.to(data).emit('opponent connected', "opponent connected")
  }}
  else{
  socket.emit('fullroom', "full room")
  }
})
// פונקציה כשהלקוח בוחר
  socket.on('select', (data)=>{
    console.log(data)
    console.log(socket.id)
    socket.to(data[0].roomid).emit('opponentSelect', data[1])
    })
//פונקציה כשאחד מהיריבים מתנתק
    socket.on("disconnecting", (reason) => {
      console.log(reason)
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          io.to(room).emit('opponentdisconnect', 'opponentdisconnect')
        }
      }
    });

//פונקציה כשהוא בוחר לא להמשיך אחרי 3 סיבובים
socket.on("iDisconnect", (data) => {
      io.to(data[0].roomid).emit('opponentdisconnect', 'opponentdisconnect')
});

//שליחת אימוג'י ליריב
socket.on("messageEmoji", (data) => {
  socket.to(data[0].roomid).emit('getMessage', data[1])
});
})

server.listen(PORT, err=> {
  if(err) console.log(err)
  console.log('Server running on Port ', PORT)
})