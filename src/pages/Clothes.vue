<template>
  <canvas ref="canvasRef" width="800" height="800"></canvas>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';

import { render } from '../libs/clothes';
const p1 = new URL(`/src/assets/erha.jpg`, import.meta.url).href;
const img = new URL(`/src/assets/dress.jpg`, import.meta.url).href;
const mask = new URL(`/src/assets/mask-dress.jpg`, import.meta.url).href;
const pattern2 = new URL(`/src/assets/pattern2.jpg`, import.meta.url).href;
const canvasRef = ref<HTMLCanvasElement>();
//console.log('1-开始创建组件-setup')
/**
* 数据部分
*/
const data = reactive({})
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  const canvas = canvasRef.value as HTMLCanvasElement;
  render([img, mask, pattern2], canvas)
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})
watchEffect(()=>{
})
// 使用toRefs解构
// let { } = { ...toRefs(data) } 
defineExpose({
  ...toRefs(data)
})

</script>
<style lang='scss'>
</style>