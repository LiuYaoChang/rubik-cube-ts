<template>
  <div id="renderer" ref="el"></div>
  <div class="fixed">
    <el-button type="primary" @click="handleClick">打乱</el-button>
    <el-button type="success" @click="handleRecover">复原</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';

// import { render } from '../libs/MultyMaterial';
import { render } from '../libs/R';
import { RubikCube } from '../libs/RubikCube';
const right = new URL(`/src/assets/mftexture/right.jpg`, import.meta.url).href;
const left = new URL(`/src/assets/mftexture/left.jpg`, import.meta.url).href;
const top = new URL(`/src/assets/mftexture/top.jpg`, import.meta.url).href;
const bottom = new URL(`/src/assets/mftexture/bottom.jpg`, import.meta.url).href;
const front = new URL(`/src/assets/mftexture/front.jpg`, import.meta.url).href;
const back = new URL(`/src/assets/mftexture/back.jpg`, import.meta.url).href;
//console.log('1-开始创建组件-setup')
// 右 -> 左 -> 上 -> 下 -> 前 -> 后
const el = ref<HTMLElement>();
/**
* 数据部分
*/
const data = reactive({})
const rubikCube = ref();
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(async () => {
  if (el.value !== undefined) {
    // 5 - back
    // 4 - front
    // 2 - top
    // 1 - left
    // 0 - right
    rubikCube.value = await RubikCube(el.value, 3, [right, left, top, bottom, front, back]);

  }
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})

const handleClick = () => {
  rubikCube.value.shuffle();
}
const handleRecover = () => {
  rubikCube.value.solve();
}
watchEffect(()=>{
})
// 使用toRefs解构
// let { } = { ...toRefs(data) } 
defineExpose({
  ...toRefs(data)
})

</script>
<style lang='scss'>

#renderer {
  width: 100vw;
  height: 100vh;
}
.fixed {
  color: white;
  position: fixed;
  top: 50px;
  right: 50px;
  z-index: 1000;
}
</style>