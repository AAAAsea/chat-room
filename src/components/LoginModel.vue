<template>
  <div id="login">
    <!-- 图标 -->
    <chat-icon class="chat-icon"/>
    <!-- 控制按钮 -->
    <div class="control" v-if="showControl">
      <span class="iconfont icon-2zuixiaohua-2" @click="minimize"></span>
      <span class="iconfont icon-4guanbi-2" @click="shutDown"></span>
    </div>
    <h2>登录</h2>
    <div class="label" >用户昵称</div>
    <input type="text" v-model="name" @keyup.enter="login" maxlength="10" autofocus="autofocus">
    <button @click="login">登录</button>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';
import { ElMessage } from 'element-plus';
import ChatIcon from '@/components/ChatIcon.vue'
const name = ref('');
const emit = defineEmits(['change-login']);
const showControl = ref(process.env.IS_ELECTRON)
console.log(process.env)
const login = ()=>{
  if(name.value.trim() === '')
  {
    ElMessage.error("用户昵称不能为空")
    
    return;
  }
  emit('change-login', name.value)
}

function shutDown(){
  window.electron.ipcRenderer.send('shutDown')
}
function minimize(){
  window.electron.ipcRenderer.send('minimize')
}
</script>

<style scoped>
#login{
  -webkit-app-region: drag;
  overflow: hidden;
  border-radius: 5px;
  margin: 0 auto;
  position: relative;
  top: 50px;
  background: white;
  width: 400px;
  height: 280px;
  box-sizing: border-box;
  padding: 70px 30px 30px 30px;
}

@media screen and (max-height: 500px) {
  #login{
    top: 0;
  }
}
h2{
  text-align: center;
}
input{
  -webkit-app-region: no-drag;
  height: 30px;
  width: 95%;
  padding: 0 10px;
  border: 1px solid rgb(113, 113, 113);
  border-radius: 3px;
}
.label{
  font-size: .9em;
  margin: 10px 0;
  -webkit-app-region: no-drag;
}
button{
  -webkit-app-region: no-drag;
  margin-top: 40px;
  float: right;
  width: 70px;
  height: 40px; 
  color: #fff; 
  background: rgb(41,220,112);
  font-family: 'Lato', sans-serif;
  border-radius: 5px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  position: relative;
  padding: 0;
}

button:hover{
  background: rgb(45, 178, 98);
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
  .chat-icon{
    position: absolute;
    top: -60px;
    left: -80px;
    height: 200px;
    width: 320px;
    margin: 0 auto;
  }
</style>