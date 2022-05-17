<template>
  <div id="chat">
    <!-- 左侧用户栏 -->
    <div class="left">
      <!-- 我 -->
      <div class="user">
        <img :src="userImg" class="avatar">
        <span class="name">{{username}}</span>
      </div>
      <hr/>
      <h3 class="label">在线列表（{{users.length}}）</h3>
      <hr/>
      <!-- 用户列表 -->
      <div class="users" >
        <!-- 广场 -->
        <div 
        class="user"
        @click="currentTarget = 'public'"
        :class="{active: currentTarget === 'public'}"
        >
          <img src="http://img95.699pic.com/photo/40168/4515.jpg_wh300.jpg" class="avatar">
          <span class="name">广场</span>
        </div>
        <!-- 个人用户 -->
        <div 
        class="user"
        :class="{active: currentTarget === item.username}"
        v-for="(item, index) in users"
        :key="index"
        @click="currentTarget = item.username;unReaded[item.username] = 0;"
        >
          <img :src="item.avatar" class="avatar">
          <span class="name">{{item.username}}</span>
          <span v-if="item.username === username">(我)</span>
          <span class="redPoint" v-if="unReaded[item.username]">{{unReaded[item.username] > 99 ? '99+' : unReaded[item.username]}}</span>
        </div>
      </div>
    </div>
    <!-- 右侧聊天栏 -->
    <div class="right">
      <div class="title">
        {{currentTarget === 'public' ? '广场' : currentTarget}}
      </div>
      <hr/>
      <!-- 信息展示区 -->
      <div class="chat-box" ref="chatBoxRef">
        <div 
          class="message-box" 
          :class="item.username !== username ? 'other' : 'my'"
          v-for="(item, index) in messages[currentTarget]"
          :key="index"
        >
          <!-- 用户消息 -->
          <img 
            :src="item.avatar" 
            class="avatar" 
            v-if="item.type === 'common'"
            @click="currentTarget = item.username;unReaded[item.username] = 0;"
          >
            <!-- 文字消息 -->
            <div class="content" v-if="item.type === 'common'">
              <div class="bubble">
                <div class="bubble-cont">{{item.msg}}</div>
              </div>
            </div>
            <!-- 文件消息 -->
            <div class="content" v-if="item.type === 'file'">
              <div class="bubble">
                <label 
                  class="iconfont icon-wenjianjia"
                >
                <div class="bubble-cont">{{item.fileName}}</div>
                </label>
              </div>
            </div>
          <!-- 系统消息 -->
          <div class="system" :class="item.class" v-if="item.type === 'system'">{{item.msg}}</div>
        </div>
      </div>
      <hr/>
      <!-- 工具栏 -->
      <div class="toolbar">
        <DiscordPicker
        class="emoji"
        gif-format="md"
        @emoji="text += $event"
        />
        <label 
        class="iconfont icon-wenjianjia"
        >
        <input 
          type="file" 
          ref="fileRef" 
          style="display:none;"
          @change="fileUpload"
          > 
        </label>
      </div>
      
      <!-- 输入框 -->
      <textarea 
        @keydown.enter="sendMessage" 
        class="edit" 
        v-model="text"
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import {defineProps, nextTick, reactive, ref} from 'vue'
import timeFormat from '@/utils/timeFormat'
import DiscordPicker from 'vue3-discordpicker'
const props = defineProps(['socket','username','users','userImg'])
// eslint-disable-next-line vue/no-setup-props-destructure
const socket = props.socket;
// 未读消息记录
const unReaded = reactive({})
// 消息记录
const messages = reactive({
  public: []
})
// 最近一次信息时间
let lastTime = reactive({
  public: 0
});
// 当前聊天对象
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
  // 初始化
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
  if(!lastTime[data.fromName])
  {
    lastTime[data.fromName] = 0;
  }
  if(!lastTime[data.toName])
  {
    lastTime[data.toName] = 0;
  }
  // 私聊
  if(data.fromName)
  {

    // 是否是自己发的消息
    if(data.fromName === props.username)
    {
      // 时间
      if(new Date() - lastTime[data.toName] > 120000){
        messages[data.toName].push({
          type: 'system',
          class: 'time',
          msg: timeFormat(new Date())
        })
      }
      lastTime[data.toName] = new Date();
      messages[data.toName].push(data)
    }else{
      // 时间
      if(new Date() - lastTime[data.fromName] > 120000){
        messages[data.fromName].push({
          type: 'system',
          class: 'time',
          msg: timeFormat(new Date())
        })
      }
      lastTime[data.fromName] = new Date();
      messages[data.fromName].push(data)
      // 小红点
      if(currentTarget.value !== data.fromName){
        unReaded[data.fromName]++;
      }
    }
  }
  // 群聊
  else{
    // 时间
    if(new Date() - lastTime.public > 120000){
      messages.public.push({
        type: 'system',
        class: 'time',
        msg: timeFormat(new Date())
      })
    }
    messages.public.push(data)
    lastTime.public = new Date();
  }
  nextTick(()=>{
    chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
  })
})
// 增加和删除用户操作在App组件
socket.on('addUser', data=>{
  // 时间
  if(new Date() - lastTime.public > 120000){
    messages.public.push({
      class: 'time',
      type: 'system',
      msg: timeFormat(new Date())
    })
  }
  lastTime.public = new Date();
  messages.public.push({
    class: 'in',
    msg: data.username + "进来了"
  })
})
socket.on('delUser', data=>{
  // 时间 
  if(new Date() - lastTime.public > 120000){
    messages.public.push({
      type: 'system',
      class: 'time',
      msg: timeFormat(new Date())
    })
  }
  lastTime.public = new Date();
  messages.public.push({
    class: 'leave',
    msg: data.username + "离开了"
  })
})

const fileRef = ref('')
function fileUpload(){
  // 拿到文件
  let file = fileRef.value.files[0];
  let fr = new FileReader()
  // 二进制读取
  fr.readAsArrayBuffer(file)
  fr.onload = ()=>{
    socket.emit('sendFile',{
      name: file.name,
      size: file.size,
      type: file.type,
      raw: fr.result
    })
  }
}
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
    cursor: pointer;
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
    position: relative;
    align-items: center;
    display: flex;
    padding: 10px;
    height: 40px;
  }
  .redPoint{
    position: absolute;
    right: 8px;
    padding: 2px;
    width: 13px;
    height: 13px;
    line-height: 13px;
    font-size: 11px;
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
  .time{
    font-size: 12px;
    color: white;
    background: rgb(169, 169, 169);
    padding: 2px 3px;
    border-radius: 5px;
  }
  .emoji{
    margin-top: -1rem;
  }
  .vue3-discord-emojipicker{
    margin-left: 100px;
  }
  .icon-wenjianjia{
    font-size: 26px;
    color: rgb(189, 188, 188);
    margin-left: 10px;
    transition: .2s;
    cursor: pointer;

  }
  .icon-wenjianjia:hover{
    transform-origin: center;
    transform: scale(1.1);
    color: rgb(255,206,71)
  }
</style>