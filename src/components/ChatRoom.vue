<template>
  <div id="chat">
    <div class="left">
      <div class="user">
        <img :src="userImg" class="avatar">
        <span class="name">{{username}}</span>
      </div>
      <hr/>
      <h3 class="label">在线列表（{{users.length}}）</h3>
      <hr/>
      <div class="users" >
        <div 
        class="user"
        @click="currentTarget = 'public'"
        :class="{active: currentTarget === 'public'}"
        >
          <img src="https://tse1-mm.cn.bing.net/th/id/R-C.29da32c0027b062d1bf812c9ccc0ba0b?rik=sGEZ1SPkZ9O4%2bQ&riu=http%3a%2f%2fn.sinaimg.cn%2fnews%2ftransform%2f20151126%2frio5-fxmazmz8864459.jpg&ehk=Q5%2bpUfPNzzCAWeDoJscIFVk5cCEfG6t4NIBzhkg9LSc%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1" class="avatar">
          <span class="name">广场</span>
        </div>
        <div 
        class="user"
        :class="{active: currentTarget === item.username}"
        v-for="(item, index) in users"
        :key="index"
        @click="currentTarget = item.username;unReaded[item.username] = 0;"
        v-show="item.username !== username"
        >
          <img :src="item.avatar" class="avatar">
          <span class="name">{{item.username}}</span>
          <span class="redPoint" v-if="unReaded[item.username]">{{unReaded[item.username] > 99 ? '99+' : unReaded[item.username]}}</span>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="title">{{currentTarget === 'public' ? '广场' : currentTarget}}</div>
      <hr/>
      <div class="chat-box" ref="chatBoxRef">
        <div 
          class="message-box" 
          :class="{
            other: item.username !== username, 
            my: item.username === username
            }"
          v-for="(item, index) in messages[currentTarget]"
          :key="index"
        >
          <img :src="item.avatar" alt="" class="avatar" v-if="item.avatar">
          <div class="content" v-if="item.avatar">
            <div class="bubble">
              <div class="bubble-cont">{{item.msg}}</div>
            </div>
          </div>
          <div class="system" :class="item.class" v-else>{{item.msg}}</div>
        </div>
      </div>
      <hr/>
      <div class="toolbar">
        😋
      </div>
      <textarea @keydown.enter="sendMessage" class="edit" contenteditable v-model="text"/>
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import {defineProps, nextTick, reactive, ref} from 'vue'
const props = defineProps(['socket','username','users','userImg'])
// eslint-disable-next-line vue/no-setup-props-destructure
const socket = props.socket;
const unReaded = reactive({})
const messages = reactive({
  public: []
})
let lastTime = 0;
const currentTarget = ref('public')
const text = ref('');
const chatBoxRef = ref('')
const sendMessage = (e)=>{
  e.preventDefault();
  if(text.value === '')
  return;
  if(currentTarget.value === 'public')
    socket.emit('sendMessage', text.value)
  else
    socket.emit('sendMessageToOne', {
      msg: text.value,
      toName: currentTarget.value,
      fromName: props.username
    })
  text.value = '';
}
socket.on('receiveMessage', data=>{

  if(!messages[data.fromName]){
    messages[data.fromName] = [];
  }
  if(!messages[data.toName]){
    messages[data.toName] = [];
  }
  if(!unReaded[data.fromName])
  {
    unReaded[data.fromName] = 0;
  }
  if(data.fromName)
  {
    if(data.fromName === props.username)
    {
      messages[data.toName].push(data)
    }else{
      messages[data.fromName].push(data)
      if(currentTarget.value !== data.fromName){
        unReaded[data.fromName]++;
      }
    }
  }else{
    if(new Date() - lastTime > 120000){
      messages.public.push({
        class: 'in',
        msg: new Date().getHours() + ':' + new Date().getMinutes()
      })
      lastTime = new Date();
    }
    messages.public.push(data)
    
  }
  nextTick(()=>{
    chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
  })
})

socket.on('addUser', data=>{
  messages.public.push({
    class: 'in',
    msg: data.username + "进来了"
  })
})
socket.on('delUser', data=>{
  messages.public.push({
    class: 'leave',
    msg: data.username + "离开了"
  })
})

</script>

<style scoped>
  #chat{
    display: flex;
    width: 1000px;
    height: 100vh;
    margin: 0 auto;
  }
  .left{
    padding: 15px;
    box-sizing: border-box;
    background: rgb(46,50,56);
    flex: 1;
  }
  .right{
    flex: 3;
    background: #eee;
  }
  .users{
    height: 85%;
    overflow: auto;
  }
  .users::-webkit-scrollbar {/*滚动条整体样式*/
    width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
  }
  .users::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
      border-radius: 5px;
      background: rgba(106, 106, 106, 0.2);
  }
  .users::-webkit-scrollbar-track {/*滚动条里面轨道*/
      border-radius: 0;
      background: rgba(129, 129, 129, 0.1);
  }
  .user{
    color: white;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .avatar{
    width: 45px;
    height: 45px;
    object-fit: cover;
  }
  .name{
    padding: 10px;
  }
  h3{
    color: white;
    margin: 10px 0;
  }
  .user{
    position: relative;
    padding: 10px 5px;
  }
  hr{
    border: none;
    border-bottom: 1px solid #777;
  }
  .title{
    color: #000;
    text-align: center;
    font-size: 1.2em;
    line-height: 40px;
  }
  .right hr{
    border-color: #ccc;
  }
  .chat-box{
    height: 62%;
    padding: 20px;
    overflow: auto;
  }
  .message-box{
    display: flex;
    margin: 15px 0;
  }
  .chat-box::-webkit-scrollbar {/*滚动条整体样式*/
    width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
  }
  .chat-box::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
      border-radius: 5px;
      background: rgba(106, 106, 106, 0.2);
  }
  .chat-box::-webkit-scrollbar-track {/*滚动条里面轨道*/
      border-radius: 0;
      background: rgba(129, 129, 129, 0.1);
  }

  .message-box .content{
    max-width: 81%;
    position: relative;
    border-radius: 4px;
    padding: 10px;
    background: #b2e281;
  }
  .message-box .content .bubble-cont{
    word-break: break-all;
  }
  .other .content{
    background: white;
    margin-right: 10px;
    margin-left: 10px;
  }
  .other .content::before {
    position: absolute;
    top: 14px;
    border: 6px solid transparent;
    content: "";
    left: -10px;
    border-right-color: #fff;
    border-right-width: 4px
  }
  .my{
    flex-direction: row-reverse;
  }
  .my .content{
    margin-right: 10px;
  }
  .my .content::after {
    position: absolute;
    left: 100%;
    top: 14px;
    border: 6px solid transparent;
    content: "";
    border-left-color: #b2e281;
    border-left-width: 4px
  }
  .edit{
    font-size: 1.3em;
    border:0;
    background: transparent;
    resize: none;
    box-sizing: border-box;
    padding: 10px;
    width: 100%;
    height: 120px;
    overflow: auto;
    outline: 0;
    word-break:break-all; 
  }
  .edit::-webkit-scrollbar {/*滚动条整体样式*/
    width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
  }
  .edit::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
      border-radius: 5px;
      background: rgba(106, 106, 106, 0.2);
  }
  .edit::-webkit-scrollbar-track {/*滚动条里面轨道*/
      border-radius: 0;
      background: rgba(129, 129, 129, 0.1);
  }
  button{
    float: right;
    width: 60px;
    margin-right: 15px;
    height: 35px; 
    color: #fff; 
    background: rgb(186, 186, 186);
    font-family: 'Lato', sans-serif;
    border-radius: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    position: relative;
    padding: 0;
  }
  button:hover{
    background: #848684;
  }
  .active{
    background: rgb(87, 94, 105);
  }
  .toolbar{
    padding: 10px;
  }
  .redPoint{
    position: absolute;
    right: 10px;
    padding: 3px;
    width: 15px;
    height: 15px;
    line-height: 15px;
    font-size: 13px;
    text-align: center;
    background-color: rgb(215, 3, 3);
    border-radius: 10px;
  }
  .system{
    margin: 0 auto;
    font-size: 13px;
  }
  .leave{
    color: rgb(250, 113, 92);
  }
  .in{
    color: #888
  }
</style>