<template>
  <el-dialog
    v-model="store.state.paintBoardFlag"
    title="画板"
    width="60%"
    :before-close="handleClose"
    class="dialog"
  >
    <canvas id="canvas" width="800" height="600">
    </canvas>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="store.state.paintBoardFlag = false"
          >关闭</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {useStore} from 'vuex';
import {defineProps} from 'vue'

const store = useStore();
const props = defineProps(['socket'])

let cvs;  
let ctx;
let dialog;
let onDrawing = false;
let startX, startY;

setTimeout(() => {
  cvs = document.getElementById('canvas');
  dialog = document.getElementsByClassName('el-dialog')[0];
  cvs.width = dialog.offsetWidth - 40;
  cvs.height = dialog.offsetHeight*0.6 - 40;
  ctx = cvs.getContext('2d');
  cvs.addEventListener('mousedown',(e)=>{
    startX = e.pageX - dialog.offsetLeft - cvs.offsetLeft || 0;
    startY = e.pageY - dialog.offsetTop - cvs.offsetTop  || 0;
    onDrawing = true;
  })
  cvs.addEventListener('mouseup',()=>{
    onDrawing = false;
  })
  cvs.addEventListener('mouseleave',()=>{
    onDrawing = false;
  })
  cvs.addEventListener('mousemove',(e)=>{
    if(onDrawing){
      // console.log(e.pageX, dialog.offsetLeft + cvs.offsetLeft)
      let x = e.pageX - dialog.offsetLeft - cvs.offsetLeft || 0;
      let y = e.pageY - dialog.offsetTop - cvs.offsetTop  || 0;
      console.log(x,y)
      drawLine(ctx, startX, startY, x, y, 1);
      props.socket.emit('draw',{
        startX,
        startY,
        x,
        y
      })
      startX = x;
      startY = y;
    }
  })

}, 50);

props.socket.on('draw',data=>{
  drawLine(ctx, data.startX, data.startY, data.x, data.y, 1);
})


// 画线函数
function drawLine(ctx, x1, y1, x2, y2, thick) {
    // console.log(x2,y2)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thick;
    ctx.strokeStyle = '#000';
    ctx.stroke();
}
</script>

<style scoped>
.dialog{
}
#canvas{
  border: 1px solid #666;
}
</style>