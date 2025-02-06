import { createApp } from 'vue'
import App from './App.vue'
import './styles/app.css'
import { invoke } from '@tauri-apps/api/tauri'

// 确保 invoke 可用
window.addEventListener("DOMContentLoaded", () => {
  // 测试 Tauri API 是否可用
  invoke('launch_edge', { 
    profile: {
      name: '',
      selected_channel: 'stable',
      app_dir: '',
      exe_path: null,
      disabled_features: '',
      enabled_features: '',
      extra_params: ''
    }
  }).catch(console.error)
})

createApp(App).mount('#app')
