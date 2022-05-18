<template>
  <div class="main">
    <LoginModel v-if="!isLogin" @change-login="login"/>
    <ChatRoom
    :socket="socket"
    :username="username"
    :userImg="userImg"
    :users="users"
    v-else/>
  </div>
</template> 

<script setup>

import io from 'socket.io-client'
import ChatRoom from '@/components/ChatRoom.vue'
import LoginModel from '@/components/LoginModel.vue'
const { ref, reactive }=require("@vue/reactivity");

// 连接socketio服务(作了代理)
let socket = io('/')
const isLogin = ref(false)
const username = ref('')
const userImg = ref('')
const login = (name)=>{
  username.value = name;
  fetch('/api/avatar?format=json')
  .then(function(response) {
    return response.json()
  })
  .then(data=>{
    userImg.value = data.imgurl
    socket.emit('login', {
      username: name,
      avatar: userImg.value
    })
  })
}

const users = reactive([])

socket.on("loginSuccess", (allUsers)=>{
  console.log(allUsers)
  isLogin.value = true;
  users.push(...allUsers);
  socket.emit("addUser",{
    username: username.value,
    avatar: "http://localhost:3000/images/avatar01.jpg"
  })
})

socket.on("loginError", (data)=>{
  alert(data.msg)
})

socket.on('addUser', data=>{
  if(data.username !== username.value)
    if(!users.find(user=>user.username === data.username))
      users.push(data)
})

socket.on('delUser', data=>{
  for(let i in users){
    if(users[i].username === data.username){
      users.splice(i,1);
    }
  }
})
</script>

<style scoped>
.main{
  height: 100%;
}
</style>
