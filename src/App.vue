<template>
  <div class="main">
    <LoginModel v-if="!isLogin" @change-login="login" />
    <ChatRoom
    :socket="socket"
    :username="username"
    :userImg="userImg"
    :users="users"
    :friends="friends"
    SERVER_URL='https://chat.asea.fun'
    @updateUsers="updateUsers"
    @updateFriends="updateFriends"
    v-else/>
    <paint-board
    
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
// import { useStore } from 'vuex';
const { ref, reactive }=require("@vue/reactivity");
// const store = useStore()
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
const friends = reactive([])

const updateUsers = (name)=>{
  for(let key in friends){
    if(friends[key] === name)
    {
      let tempUser = friends[key];
      friends.splice(key, 1);
      friends.unshift(tempUser)
      break;
    }
  } 
}

const updateFriends = ({type, name})=>{
  if(type === 'add'){
    friends.unshift(name);
  }else{
    friends.splice(friends.indexOf(name), 1);
  }
}
socket.on("loginSuccess", (data)=>{
  // console.log(allUsers)
  ElMessage({
    message: '登录成功',
    type: 'success',
  })
  isLogin.value = true;
  users.splice(0);
  users.push(...data.users);
  friends.push(...data.friends);
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
      {
        users.push(data);
        if(friends.includes(data.username))
        {
          ElMessage({
            message: data.username + "上线了",
            type: 'success'
          })
        }
      }
})

socket.on('delUser', data=>{
  for(let i in users){
    if(users[i].username === data.username){
      users.splice(i,1);
      if(friends.includes(data.username))
      {
        ElMessage({
          message: data.username + "离线了",
          type: 'warning'
        })
      }
      break;
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

socket.on('addFriend',(name)=>{
  updateFriends({type:'add',name})
  ElMessage({
    message: name + "添加你为好友",
    type: 'success'
  })
})
socket.on('deleteFriend',(name)=>{
  updateFriends({type:'del',name})
  ElMessage({
    message: name + "解除了和你的好友关系",
    type: 'success'
  })
})
</script>

<style scoped>
.main{
  height: 100%;
}
</style>
