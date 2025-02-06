// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::path::Path;

#[derive(serde::Deserialize)]
struct Profile {
    name: String,
    app_dir: String,
    #[serde(rename = "selected_channel")]
    channel: String,
    exe_path: Option<String>,
    disabled_features: Option<String>,
    enabled_features: Option<String>,
    extra_params: String,
}

fn get_edge_path(channel: &str) -> Option<String> {

    #[cfg(target_os = "windows")]
    {
        let program_files = std::env::var("ProgramFiles(x86)").unwrap_or("C:\\Program Files (x86)".to_string());
        let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
        
        let path = match channel {
            "beta" => format!("{}\\Microsoft\\Edge Beta\\Application\\msedge.exe", program_files),
            "dev" => format!("{}\\Microsoft\\Edge Dev\\Application\\msedge.exe", program_files),
            "canary" => format!("{}\\Microsoft\\Edge SxS\\Application\\msedge.exe", local_app_data),
            _ => format!("{}\\Microsoft\\Edge\\Application\\msedge.exe", program_files)
        };
        Some(path)
    }
    
    #[cfg(target_os = "macos")]
    {
        let path = match channel {
            "beta" => "/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta",
            "dev" => "/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev",
            "canary" => "/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary",
            _ => "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
        };
        Some(path.to_string())
    }
    
    #[cfg(target_os = "linux")]
    {
        let path = match channel {
            "beta" => "/usr/bin/microsoft-edge-beta",
            "dev" => "/usr/bin/microsoft-edge-dev",
            "canary" => "/usr/bin/microsoft-edge-canary",
            _ => "/usr/bin/microsoft-edge-stable"
        };
        Some(path.to_string())
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        None
    }
}

#[tauri::command]
fn launch_edge(profile: Profile) -> Result<String, String> {
    let exe_path = if let Some(custom_path) = profile.exe_path {
        if !custom_path.is_empty() {
            custom_path
        } else {
            get_edge_path(&profile.channel)
                .ok_or_else(|| "不支持的操作系统".to_string())?
        }
    } else {
        get_edge_path(&profile.channel)
            .ok_or_else(|| "不支持的操作系统".to_string())?
    };

    // 检查可执行文件是否存在
    if !Path::new(&exe_path).exists() {
        return Err(format!("找不到Edge浏览器: {}", exe_path));
    }
    
    let mut command = Command::new(&exe_path);
    
    // 添加数据目录参数
    if !profile.app_dir.is_empty() {
        command.arg(format!("--user-data-dir={}", profile.app_dir));
    }
    
    // 添加禁用的特性
    if let Some(features) = profile.disabled_features {
        if !features.is_empty() {
            command.arg(format!("--disable-features={}", features));
        }
    }
    
    // 添加启用的特性
    if let Some(features) = profile.enabled_features {
        if !features.is_empty() {
            command.arg(format!("--enable-features={}", features));
        }
    }
    
    // 添加额外参数
    if !profile.extra_params.is_empty() {
        for param in profile.extra_params.split_whitespace() {
            command.arg(param);
        }
    }
    
    match command.spawn() {
        Ok(_) => Ok(format!("已成功启动Edge浏览器: {}", profile.name)),
        Err(e) => Err(format!("启动Edge浏览器失败: {}", e))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![launch_edge])
        .run(tauri::generate_context!())
        .expect("运行应用程序时出错");
}
