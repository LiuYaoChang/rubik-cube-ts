<script setup lang="ts">
  // import HelloWorld from './components/HelloWorld.vue';
  import { onMounted, ref } from 'vue';
  // import Rubik from './libs/Rubik';
  import  { r, Rubik } from './libs/R'
  import { Select, crateCube, draw } from './libs/Selected'

  type RubikObj = {}
  const el = ref<HTMLElement>();
  const rubik = ref<RubikObj>();
  

  onMounted(() => {
    // Select();
    // draw(el.value as HTMLElement);
    // console.log(r)
    rubik.value = Rubik(el.value as HTMLElement);
  })


</script>

<template>
  <div id="renderer" ref="el"></div>
  <!-- <h1>SELECT</h1> -->
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>

* {
  margin: 0;
  padding: 0;
}

#renderer {
  width: 100vw;
  height: 100vh;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
