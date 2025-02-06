import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

export interface Profile {
  name: string
  selected_channel: string
  app_dir: string
  exe_path: string
  disabled_features: string
  enabled_features: string
  extra_params: string
}

export function useEdgeLauncher() {
  const profile = ref<Profile>({
    name: '',
    selected_channel: 'stable',
    app_dir: '',
    exe_path: '',
    disabled_features: '',
    enabled_features: '',
    extra_params: ''
  })

  const message = ref('')
  const isError = ref(false)

  const launchEdge = async () => {
    try {
      const response = await invoke<string>('launch_edge', { 
        profile: {
          ...profile.value,
          exe_path: profile.value.exe_path || null // 如果为空字符串则转为null
        }
      })
      message.value = response
      isError.value = false
    } catch (error) {
      message.value = error as string
      isError.value = true
    }
  }

  return {
    profile,
    message,
    isError,
    launchEdge
  }
}
