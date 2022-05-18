const express = require('express')
const fs = require('fs');
// app
const app = express()
// http服务器
let server = require('http').Server(app)
// socket
let io = require('socket.io')(server,{maxHttpBufferSize:1024*1024*10}) // 限制最大10M

// let path = require('path')
// 记录所有已经登录过的用户
const users = []

server.listen(3000, () => {
  console.log('启动在 http://localhost:3000')
})

// 指定静态资源文件夹
app.use(require('express').static('upload'))
// 下载
app.get('/upload', (req, res) => {
  let fileName = req.query.fileName || '';
  console.log(fileName)
  res.download(__dirname+'/upload/' + fileName);
});
// 重定向根目录
app.get('/', function (req, res) {
  res.redirect('/index.html')
})

io.on('connect', function (socket) {
  // 监听用户登录的功能
  socket.on('login', data => {
    console.log(data)
    // 如果用户已经登录
    const user = users.find(item => item.username === data.username)
    if (user) {
      socket.emit('loginError', { msg: '用户名已存在' })
      console.log('登录失败')
    } else {
      users.push(data)
      socket.emit('loginSuccess', users)
      console.log('登录成功')
      // 广播所有用户有用户添加
      io.emit('addUser', data)
      // 把登录成功的用户名和头像存储起来
      socket.username = data.username
      socket.avatar = data.avatar
    }
  })

  // 用户断开连接的功能
  socket.on('disconnect', () => {
    // 把当前用户的信息从users中删除
    const idx = users.findIndex(item => item.username === socket.username)
    users.splice(idx, 1)
    // 如果登录了，告诉所有人，有人离开了聊天室
    if(socket.username)
    {
      io.emit('delUser', {
        username: socket.username,
        avatar: socket.avatar
      })
    }
    // 告诉所有人，userlist发生更新
    io.emit('userList', users)
  })

  // 用户发送消息的功能
  socket.on('sendMessage', msg => {
    console.log(msg)
    // 广播给所有用户
    io.emit('receiveMessage', {
      username: socket.username,
      avatar: socket.avatar,
      msg,
      type: 'common'
    })
  })

  // 传输文件
  socket.on('sendFile', data => {
    console.log(data.toName)
    // 存储二进制文件
    let buf = Buffer.from(data.raw);
    fs.writeFile('./upload/' + data.fileName, buf,function(err) {
        if(err) 
          console.log(err);
        console.log('Saved');
    });
    console.log("收到文件"+data.fileName)
    // 广播给所有用户
    if (data.toName === 'public') {
      io.emit('receiveMessage', {
        username: socket.username,
        avatar: socket.avatar,
        type: 'file',
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType
      })
    } else {
      // 广播给指定用户
      let toSocket = null
      for (const [key,value] of io.sockets.sockets) {
        if (value.username === data.toName) {
          toSocket = key
          break
        }
      }
      if (toSocket) {
        console.log("hhhh")
        // 发送给指定用户
        socket.to(toSocket).emit('receiveMessage', {
          username: socket.username,
          avatar: socket.avatar,
          type: 'file',
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          fromName: data.fromName,
          toName: data.toName
        })
        // 同时也要发送给自己
        socket.emit('receiveMessage', {
          username: socket.username,
          avatar: socket.avatar,
          type: 'file',
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          fromName: data.fromName,
          toName: data.toName
        })
      }
    }
  })

  // 私聊功能的实现
  socket.on('sendMessageToOne', data => {
    console.log("sendtoOne", data)
    var allSockets = io.sockets.sockets;
    // console.log(allSockets)
    // 广播给指定用户
    let toSocket = null
    for (const [key,value] of allSockets) {
      if (value.username === data.toName) {
        toSocket = key
        break
      }
    }
    if (toSocket) {
      // 发送给指定用户
      socket.to(toSocket).emit('receiveMessage', {
        ...data,
        username: socket.username,
        avatar: socket.avatar,
        type: 'common'
      })
      // 发送给自己
      socket.emit('receiveMessage', {
        ...data,
        username: socket.username,
        avatar: socket.avatar,
        type: 'common'
      })
    }
  })
})
