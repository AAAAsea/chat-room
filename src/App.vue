<template>
  <div class="main">
    <LoginModel v-if="!isLogin" @change-login="login" />
    <ChatRoom
    :socket="socket"
    :username="username"
    :userImg="userImg"
    :users="users"
    SERVER_URL='https://chat.asea.fun'
    @updateUsers="updateUsers"
    v-else/>
    <paint-board
    v-if="store.state.paintBoardFlag"
    :socket="socket"
    />
  </div>
</template> 

<script setup>
import io from 'socket.io-client'
import ChatRoom from '@/components/ChatRoom.vue'
import LoginModel from '@/components/LoginModel.vue'
import PaintBoard from '@/components/PaintBoard.vue'
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
const { ref, reactive }=require("@vue/reactivity");
const store = useStore()
// 连接socketio服务(作了代理)
let socketUrl = '/';  
// electron可以设置允许跨域
if(process.env.IS_ELECTRON){
  socketUrl = 'https://chat.asea.fun';
  document.getElementsByTagName('html')[0].style.background = "transparent"
  document.getElementById('app').style.overflow = "hidden";
}
let socket = io(socketUrl)
// setTimeout(() => {
//   // console.log(socket)
// }, 1000);
const isLogin = ref(false)
const username = ref('')
const userImg = ref('')

const login = (name)=>{
  if(!socket.connected)
    socket = io(socketUrl)
  // if(socket.connect)
  username.value = name;
  userImg.value = 'https://cravatar.cn/avatar/'+name+'?d=wavatar'
  socket.emit('login', {
    username: name,
    avatar: 'https://cravatar.cn/avatar/'+name+'?d=wavatar'
  })
}

const users = reactive([])

const updateUsers = (name)=>{
  for(let key in users){
    if(users[key].username === name)
    {
      let tempUser = users[key];
      users.splice(key, 1);
      users.unshift(tempUser)
      break;
    }
  } 
}
socket.on("loginSuccess", (allUsers)=>{
  // console.log(allUsers)
  ElMessage({
    message: '登陆成功',
    type: 'success',
  })
  isLogin.value = true;
  users.splice(0)
  users.push(...allUsers);
  if(process.env.IS_ELECTRON)
  {
    window.electron.ipcRenderer.send('resize', true)
  }
  // socket.emit("addUser",{
  //   username: username.value,
  //   avatar: "http://localhost:3000/images/avatar01.jpg"
  // })
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

socket.on('disconnect',()=>{
  // alert("长时间未操作，已断开连接...")
  ElMessage.error('长时间未操作，已断开连接...')
  isLogin.value = false;
  socket.connect()
  if(process.env.IS_ELECTRON)
  {
    window.electron.ipcRenderer.send('resize', false)
  }
})

// 重新连接后，发送登录信息
socket.on('reconnect', () => {
  // console.log('重新连接')
  // socket.emit('login', {
  //   username: name,
  //   avatar: userImg.value
  // })
})

</script>

<style scoped>
.main{
  height: 100%;
}
</style>
