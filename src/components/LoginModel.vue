<template>
  <div id="login">
    <h2>登录</h2>
    <div class="label">用户昵称</div>
    <input type="text" v-model="name">
    <button @click="login">登录</button>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';
const name = ref('');
const emit = defineEmits(['change-login']);
const login = ()=>{
  emit('change-login', name.value)
}
</script>

<style scoped>
#login{
  overflow: hidden;
  border-radius: 5px;
  margin: 0 auto;
  margin-top: 150px;
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
}
.label{
  font-size: .9em;
  margin: 10px 0;
}
button{
  margin-top: 20px;
  float: right;
  width: 60px;
  height: 40px; 
  color: #fff; 
  background: linear-gradient(0deg, rgba(0, 172, 238, 1) 0%, rgba(2, 126, 251, 1) 100%);
  font-family: 'Lato', sans-serif;
  border-radius: 5px;
  box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, .5),
  7px 7px 20px 0px rgba(0, 0, 0, .1),
  4px 4px 5px 0px rgba(0, 0, 0, .1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  position: relative;
  padding: 0;
}
</style>