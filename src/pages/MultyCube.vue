<template>
  <div id="renderer" ref="el"></div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';

// import { render } from '../libs/MultyMaterial';
import { render } from '../libs/R';
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
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  if (el.value !== undefined) {
    // 5 - back
    // 4 - front
    // 2 - top
    // 1 - left
    // 0 - right
    render(el.value, [right, left, top, bottom, front, back]);
  }
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

#renderer {
  width: 100vw;
  height: 100vh;
}
</style>