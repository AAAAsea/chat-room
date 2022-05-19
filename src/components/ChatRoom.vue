<template>
  <div id="chat">
    <!-- 左侧用户栏 -->
    <div class="left">
      <!-- 我 -->
      <div class="user">
        <img :src="userImg" class="avatar">
        <span class="name">{{username}}</span>
      </div>
      <h3 class="label">在线列表（{{users.length}}）</h3>
      <!-- 用户列表 -->
      <div class="users" >
        <!-- 广场 -->
        <div 
        class="user"
        @click="currentTarget = 'public';unReaded.public = 0; initScroll();"
        :class="{active: currentTarget === 'public'}"
        >
          <img src="http://img95.699pic.com/photo/40168/4515.jpg_wh300.jpg" class="avatar">
          <span class="name">广场</span>
          <span class="redPoint" v-if="unReaded.public">{{unReaded.public > 99 ? '99+' : unReaded.public}}</span>
        </div>
        <!-- 个人用户 -->
        <div 
        class="user"
        :class="{active: currentTarget === item.username}"
        v-for="item in users"
        :key="item.username"
        @click="currentTarget = item.username;unReaded[item.username] = 0;initScroll();"
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

      <!-- 标题栏 -->
      <div class="title">
        <!-- 标题 -->
        <span>
          {{currentTarget === 'public' ? '广场' : currentTarget}}
        </span>
      </div>
      <!-- 控制按钮 -->
      <div class="control" v-if="showControl">
        <span class="iconfont icon-2zuixiaohua-2" @click="minimize"></span>
        <span class="iconfont icon-4guanbi-2" @click="shutDown"></span>
      </div>
      <!-- 信息展示区 -->
      <div class="chat-box" ref="chatBoxRef" id="chat-box">
        <!-- 消息主窗口 -->
        <div 
          class="message-box" 
          :class="item.username !== username ? 'other' : 'my'"
          v-for="(item, index) in messages[currentTarget]"
          :key="index"
        >
          <!-- 用户消息 -->
            <!-- 头像 -->
            <img 
              :src="item.avatar" 
              class="avatar" 
              v-if="item.type !== 'system'"
              @click="currentTarget = item.username;unReaded[item.username] = 0;"
            >
            <div class="content-box" >
              <!-- 用户昵称 -->
              <div class="nickname">
                {{item.username}}
              </div>
              <!-- 文字消息 -->
              <div class="content" v-if="item.type === 'common'">
                <div class="bubble">
                  <div class="bubble-cont">{{item.msg}}</div>
                </div>
              </div>
              <!-- 文件消息 -->
              <div 
                class="content file" 
                v-if="item.type === 'file'"
              >
                <div class="bubble">
                  <!-- 如果是图片直接展示 -->
                  <a 
                    :href="SERVER_URL + '/upload?fileName='+item.fileName"
                    v-if="item.fileType.startsWith('image')"
                  >
                    <img
                      style="
                      margin: 10px 0; 
                      borderRadius: 4px; 
                      maxWidth: 100%;
                      objectFit:cover;
                      overflow:hidden" 
                      :src="SERVER_URL + '/upload?fileName='+item.fileName"
                    >
                  </a>
                  <a 
                    class="bubble-cont" 
                    v-else 
                    :href="SERVER_URL + '/upload?fileName='+item.fileName"
                    download=""
                  >
                    <div class="file-info">
                      <p>{{item.fileName}}</p>
                      <span>{{fileSizeFormat(item.fileSize)}}</span>
                    </div>
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-file1"></use>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          <!-- 系统消息 -->
          <div class="system" :class="item.class" v-if="item.type === 'system'">{{item.msg}}</div>
        </div>
      </div>
      <div class="bottom">
        <!-- 工具栏 -->
        <div class="toolbar">
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
          <DiscordPicker
          class="emoji"
          gif-format="md"
          @emoji="text += $event"
          />
        </div>
        <!-- 输入框 -->
          <textarea 
            @keydown.enter="sendMessage" 
            class="edit" 
            v-model="text"
            maxlength="500"
          />
          <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, nextTick, reactive, ref} from 'vue'
import timeFormat from '@/utils/timeFormat'
import fileSizeFormat from '@/utils/fileSizeFormat'
import DiscordPicker from 'vue3-discordpicker'
const showControl = ref(process.env.IS_ELECTRON)
console.log(process.env)
const props = defineProps(['socket','username','users','userImg', 'SERVER_URL'])
const emit = defineEmits(['updateUsers'])
// eslint-disable-next-line vue/no-setup-props-destructure
const socket = props.socket;
// 未读消息记录
const unReaded = reactive({
  public: 0
})
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
// const chatBoxRef = ref('')
const sendMessage = (e)=>{
  // console.log(socket)
  e.preventDefault();
  if(text.value === '')
  return;
  if(currentTarget.value !== 'public' && !props.users.find(user=>user.username ===currentTarget.value))
  {
    alert('该用户已下线')
    return;
  }
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
  console.log(data)
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
      emit('updateUsers', data.toName)
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
      emit('updateUsers', data.fromName)
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
    // 小红点
    if(currentTarget.value !== 'public')
    {
      unReaded.public++;
    }
    // console.log(unReaded.public)
    lastTime.public = new Date();
  }
  initScroll()
})
// 调整聊天窗口在最下面
function initScroll(){
  nextTick(()=>{
    let chatBox = document.getElementById('chat-box')
    chatBox.scrollTop = chatBox.scrollHeight + 200;
  })
}
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
    type: 'system',
    msg: data.username + "进来了"
  })
  initScroll()
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
    type: 'system',
    msg: data.username + "离开了"
  })
  initScroll()
})

const fileRef = ref('')
function fileUpload(){
  // 拿到文件
  let file = fileRef.value.files[0];
  if(!file) return;
  if(file.size > 1024*1024*5)
  {
    alert("文件不能大于10M")
    return;
  }
  // 二进制读取
  let fr = new FileReader()
  fr.readAsArrayBuffer(file)
  fr.onload = ()=>{
    console.log("发送文件")
    socket.emit('sendFile',{
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      raw: fr.result,
      toName: currentTarget.value,
      fromName: props.username
    })
  }
}

function shutDown(){
  window.electron.ipcRenderer.send('shutDown')
}
function minimize(){
  window.electron.ipcRenderer.send('minimize')
}

</script>

<style scoped>
  #chat{
    display: flex;
    width: 1000px;
    height: 100%;
    margin: 0 auto;
  }
  @media screen and (max-width: 1000px) {
    #chat{
      display: flex;
      width: 100%;
      min-width: 500px;
      height: 100%;
      margin: 0 auto;
    }
  }
  
  .left{
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    background: rgb(46,50,56);
    position: relative;
    flex: 1;
    min-width: 200px;
  }
  .right{
    height: 100%;
    flex: 3;
    background: rgb(245,245,245);
    position: relative;
  }
  .users{
    position: absolute;
    top: 140px;
    right: 0;
    left: 15px;
    bottom: 10px;
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
    transition: .2s ease;
    margin-right: 15px;
  }
  .user:hover{
    background: rgb(87,94,105);
  }
  .avatar{
    width: 45px;
    height: 45px;
    object-fit: cover;
    cursor: pointer;
  }
  .name{
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical; 
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
    position: sticky;
    top: 0;
    -webkit-app-region: drag;
    background: rgb(245,245,245);
    z-index: 2;
    color: #000;
    text-align: center;
    font-size: 1.2em;
    line-height: 40px;
    border-bottom: 1px solid rgb(231,231,231);
  }
  .control{
    position: absolute;
    right: 0;
    top: 0px;
    z-index: 9;
    -webkit-app-region: no-drag;
    display: flex;
  }
  .control span{
    padding: 3px 10px;
    color: #444;
    font-size: 12px;
  }
  .control span:hover{
    background: rgb(226,226,226);
    cursor: pointer;
  }
  .control span:last-child:hover{
    background: rgb(251,115,115);
    color: white;
    cursor: pointer;
  }
  .chat-box{
    height: 63%;
    padding: 0 20px 5px 20px;
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
    position: relative;
    border-radius: 4px;
    background: #b2e281;
    padding: 0 10px;
    display: flex;
    align-items: center;
  }
  .message-box .content-box{
    display: flex;
    flex-direction: column;
    max-width: 80%;
  }
  .message-box .content-box .nickname{
    font-size: 13px;
    color: rgb(178,178,178);
    margin-top: -10px;
  }
  .message-box .content .bubble-cont{
    color: #000;
    word-break: break-all;
    font-size: 14px;
    padding: 10px 0;
  }
  .message-box .file{
    min-height: 80px;
    width: 100%;
    background: white;
  }
  .message-box .file:hover{
    background: rgb(235,235,235);
  }
  .message-box .file .bubble{
    flex: 1;
    height: 100%;
  }
  .message-box .file .bubble-cont{
    height: 100%;
    font-size: 14px;
    line-height: 14px;
    display: flex;
    text-decoration: none;
    align-items: center;
    justify-content: space-between;
  }
  .message-box .file .bubble-cont .file-info{
    padding-right: 10px;
    flex: 4;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 5px 0;
  }
  .message-box .file .bubble-cont .file-info p{
    columns: black;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .message-box .file .bubble-cont .file-info span{
    color: rgb(183, 183, 183);
    font-size: 13px;
  }
  .message-box .file .bubble-cont svg{
    flex: 1;
    width: 50px;
    height: 50px;
    font-size: 50px;
    padding: 0;
    text-align: center;
    color: rgb(172, 172, 172);
  }
  .other .content{
    background: white;
  }
  .other .content-box{
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
  .other{
    align-items: flex-start;
  }
  .my{
    flex-direction: row-reverse;
  }
  .my .content-box{
    margin-right: 10px;
    align-items: flex-end;
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
  .my .file::after{
    border-left-color: white;
  }
  .bottom{
    height: 27%;
  }
  .edit{
    position: relative;
    font-size: 1.2em;
    color: black;
    border:0;
    background: transparent;
    resize: none;
    box-sizing: border-box;
    padding: 10px;
    width: 100%;
    height: 80%;
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
    position: absolute;
    right: 0px;
    bottom: 15px;
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
    justify-content: space-between;
    padding: 10px;
    height: 40px;
    border-top: 1px solid rgb(231,231,231);
  }
  .redPoint{
    position: absolute;
    right: 8px;
    width: 16px;
    height: 16px;
    font-size: 13px;
    background-color: rgb(215, 3, 3);
    border-radius: 7.5px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    background: rgb(200, 200, 200);
    padding: 1px 3px;
    border-radius: 5px;
  }
  .emoji{
    margin-top: -1rem;
  }
  .vue3-discord-emojipicker{
    margin-left: 100px;
  }
  .icon-wenjianjia{
    font-size: 23px;
    color: rgb(165, 165, 165);
    transition: .2s;
    cursor: pointer;
  }
  .bubble .icon-wenjianjia:hover{
    color: rgb(0, 119, 255);
  }
  .toolbar .icon-wenjianjia:hover{
    transform-origin: center;
    transform: scale(1.1);
    color: rgb(255,206,71)
  }
</style>