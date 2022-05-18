<template>
  <div id="login">
    <h2>登录</h2>
    <div class="label" >用户昵称</div>
    <input type="text" v-model="name" @keyup.enter="login" maxlength="10">
    <button @click="login">登录</button>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';
const name = ref('');
const emit = defineEmits(['change-login']);
const login = ()=>{
  if(name.value.trim() === '')
  {
    alert("用户昵称不能为空")
    return;
  }
  emit('change-login', name.value)
}
</script>

<style scoped>
#login{
  overflow: hidden;
  border-radius: 5px;
  margin: 0 auto;
  position: relative;
  top: 150px;
  background: white;
  width: 400px;
  padding: 50px 30px;
}
h2{
  text-align: center;
}
input{
  height: 30px;
  width: 95%;
  padding: 0 10px;
  border: 1px solid rgb(113, 113, 113);
  border-radius: 3px;
}
.label{
  font-size: .9em;
  margin: 10px 0;
}
button{
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
</style>