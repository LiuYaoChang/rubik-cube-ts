<template>
  <canvas ref="canvasRef" width="800" height="800"></canvas>
</template>

<script setup lang="ts">
import { Line, Vector2 } from 'three';
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import BordLine, { render } from '../libs/BoldLine'
const road = new URL(`/src/assets/road.jpg`, import.meta.url).href
//console.log('1-开始创建组件-setup')
/**
* 数据部分
*/
const canvasRef = ref();
const data = reactive({})
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  const borderLine = new BordLine([
    new Vector2(-0.7, 0),
    new Vector2(-0.4, 0),
    new Vector2(-0.4, 0.4),
    new Vector2(0.3, 0.4),
    new Vector2(-0.3, -0.4),
    new Vector2(0.4, -0.4),
    new Vector2(0.4, 0),
    new Vector2(0.7, 0.4),
  ], 0.2)
  const canvas = canvasRef.value as HTMLCanvasElement;
  loader(road).then((texture: HTMLImageElement) => {
    render(canvas, borderLine, texture);
  })
  console.log("🚀 ~ file: BorderLine.vue:28 ~ onMounted ~ borderLine:", borderLine)
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})

const loader = (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    }
    img.src = url;
  })

}
// 使用toRefs解构
// let { } = { ...toRefs(data) } 
defineExpose({
  ...toRefs(data)
})

</script>
<style lang='scss'>
</style>