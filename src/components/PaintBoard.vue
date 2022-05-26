<template>
  <el-dialog
    v-model="store.state.paintBoardFlag"
    title="画板"
    width="60%"
    class="dialog"
    :fullscreen="isMobile()"
    draggable
    @open="handleOpen"
    @close="handleClose"
    height="100vh"
    top="2vh"
  >
    <span>画笔颜色：</span>
    <el-color-picker v-model="color" :predefine="predefineColors" />
    <div class="width" style="display: flex;">
      <span >画笔粗细：</span>
      <el-slider v-model="width" :min="1"/>
    </div>
    <canvas id="canvas" width="800" height="500" ref="canvasRef" @change="change"/>
    <template #footer>
      <span class="dialog-footer" >
        <el-button type="warning" id="clearBtn">清空</el-button>
        <el-button type="primary" @click="store.state.paintBoardFlag = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {useStore} from 'vuex';
import {defineProps, nextTick, ref} from 'vue'

const store = useStore();
const props = defineProps(['socket'])

const canvasRef = ref('');
const color = ref('#000000');
const width = ref(1);
const predefineColors = ref([
  '#000000',
  '#ffffff',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
])

let cvs;  
let ctx;
let dialog;
let onDrawing = false;
let beginPoint;
const points = []; // 记录点用于控制贝塞尔曲线
// 由于dialog懒加载所以需要先获取到
const handleOpen = ()=>{
  nextTick(()=>{
    cvs = document.getElementById('canvas');
    dialog = document.getElementsByClassName('el-dialog')[0];
    cvs.width = dialog.offsetWidth - 40;
    cvs.height = isMobile() ? 500 : 400;

    ctx = cvs.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    cvs.addEventListener('mousedown',(e)=>{
      let rect = cvs.getBoundingClientRect(); // 可以解决有滚动时的位置
      let x = e.pageX - rect.left * (cvs.width / rect.width) || 0;
      let y = e.pageY  - rect.top * (cvs.height / rect.height) || 0;
      beginPoint = {x, y}
      onDrawing = true;
    })
    cvs.addEventListener('mouseup',()=>{
      onDrawing = false;
      points.splice(0)
    })
    cvs.addEventListener('mouseleave',()=>{
      onDrawing = false;
      points.splice(0)
    })
    cvs.addEventListener('mousemove',(e)=>{
      if(onDrawing){
        let rect = cvs.getBoundingClientRect();
        let x = e.pageX - rect.left * (cvs.width / rect.width) || 0;
        let y = e.pageY  - rect.top * (cvs.height / rect.height) || 0;
        points.push({x,y})
        if(points.length > 3){
          const lastTwoPoints = points.slice(-2);
          const controlPoint = lastTwoPoints[0];
          const endPoint = {
              x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
              y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
          }
          drawLine(ctx, beginPoint, controlPoint, endPoint, color.value, width.value);
          props.socket.emit('draw',{
            beginPoint,
            controlPoint,
            endPoint,
            color: color.value,
            width: width.value
          })
          beginPoint = endPoint;
        }
      }
    })
    cvs.addEventListener('touchstart',(e)=>{
      let touchPoint = e.touches[0];
      let rect = cvs.getBoundingClientRect(); // 可以解决有滚动时的位置
      let x = touchPoint.clientX - rect.left * (cvs.width / rect.width) || 0;
      let y = touchPoint.pageY  - rect.top * (cvs.height / rect.height) || 0;
      beginPoint = {x, y}
      onDrawing = true;
    })
    cvs.addEventListener('touchend',()=>{
      onDrawing = false;
      points.splice(0)
    })
    cvs.addEventListener('touchmove',(e)=>{
      if(onDrawing){
        let touchPoint = e.touches[0];
        let rect = cvs.getBoundingClientRect(); // 可以解决有滚动时的位置
        let x = touchPoint.clientX - rect.left * (cvs.width / rect.width) || 0;
        let y = touchPoint.pageY  - rect.top * (cvs.height / rect.height) || 0;
        points.push({x,y})
        if(points.length > 3){
          const lastTwoPoints = points.slice(-2);
          const controlPoint = lastTwoPoints[0];
          const endPoint = {
            x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
            y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
          }
          drawLine(ctx, beginPoint, controlPoint, endPoint, color.value, width.value);
          props.socket.emit('draw',{
            beginPoint,
            controlPoint,
            endPoint,
            color: color.value
          })
          beginPoint = endPoint;
        }
      }
    })
    
    // 收到draw事件
    props.socket.on('draw',data=>{
      drawLine(ctx, data.beginPoint, data.controlPoint, data.endPoint, data.color, data.width);
    })
    // 收到clear事件
    props.socket.on('clear',()=>{
      ctx.clearRect(0,0,cvs.width,cvs.height);
    })
    window.onresize = ()=>{
      cvs.width = dialog.offsetWidth - 40;
    }
    // 清空
    let clearBtn = document.getElementById('clearBtn')
    clearBtn.onclick = ()=>{
      ctx.clearRect(0,0,cvs.width,cvs.height);
      props.socket.emit('clear');
    }
  })

}
// 二次贝塞尔
function drawLine(ctx, beginPoint, controlPoint, endPoint, color, width) {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    ctx.stroke();
}
// isMobile
function isMobile(){
  return document.body.offsetWidth < 500
}
</script>

<style scoped>
.dialog{
}
#canvas{
  border: 1px solid #666;
}
.width{
  display: flex;
  align-items: center;
}
.width span{
  white-space: nowrap;
}
/* .width .el-slider {
  margin-top: 0;
  color: #666;
} */
</style>