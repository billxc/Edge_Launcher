<template>
  <div class="container">
    <h1>Edge浏览器启动器</h1>
    
    <div class="form-group">
      <label>配置名称:</label>
      <input v-model="profile.name" type="text" placeholder="输入配置名称"/>
    </div>

    <div class="form-group">
      <label>浏览器版本:</label>
      <select v-model="profile.selected_channel">
        <option value="stable">正式版</option>
        <option value="beta">Beta版</option>
        <option value="dev">开发版</option>
        <option value="canary">Canary版</option>
      </select>
    </div>

    <div class="form-group">
      <label>数据目录:</label>
      <div class="input-group">
        <input v-model="profile.app_dir" type="text" placeholder="自定义用户数据目录路径"/>
      </div>
    </div>

    <div class="form-group">
      <label>自定义可执行文件路径:</label>
      <input v-model="profile.exe_path" type="text" placeholder="自定义Edge浏览器可执行文件路径（可选）"/>
    </div>

    <div class="form-group">
      <label>禁用的功能:</label>
      <input v-model="profile.disabled_features" type="text" placeholder="要禁用的功能，用逗号分隔"/>
    </div>

    <div class="form-group">
      <label>启用的功能:</label>
      <input v-model="profile.enabled_features" type="text" placeholder="要启用的功能，用逗号分隔"/>
    </div>

    <div class="form-group">
      <label>额外参数:</label>
      <input v-model="profile.extra_params" type="text" placeholder="其他命令行参数"/>
    </div>

    <button @click="launchEdge">启动Edge浏览器</button>

    <div v-if="message" :class="['message', { error: isError }]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEdgeLauncher } from './composables/useEdgeLauncher'

const { profile, message, isError, launchEdge } = useEdgeLauncher()
</script>

<style>
@import './styles/app.css';
</style>
