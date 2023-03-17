import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Cube from './pages/Rotate.vue'
import Cloud from './pages/Cloud.vue';
import Door from './pages/Door.vue';
import Texture from './pages/Texture.vue';
import Clothes from './pages/Clothes.vue';
import BorderLine from './pages/BorderLine.vue'
import MultyCube from './pages/MultyCube.vue'
// createApp(App).mount('#app')
createApp(MultyCube).mount('#app')
