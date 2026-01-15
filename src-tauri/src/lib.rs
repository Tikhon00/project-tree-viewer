use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<FileNode>>,
}

#[tauri::command]
fn scan_directory(path: String) -> Result<FileNode, String> {
    let p = Path::new(&path);
    
    if !p.exists() {
        return Err("Path does not exist".to_string());
    }
    
    scan_dir_recursive(p)
}

fn scan_dir_recursive(path: &Path) -> Result<FileNode, String> {
    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();
    
    let path_str = path.to_string_lossy().to_string();
    
    if path.is_dir() {
        let mut children = Vec::new();
        
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(node) = scan_dir_recursive(&entry.path()) {
                    children.push(node);
                }
            }
        }
        
        // Сортировка: папки первыми, затем файлы
        children.sort_by(|a, b| {
            match (a.is_dir, b.is_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
            }
        });
        
        Ok(FileNode {
            name,
            path: path_str,
            is_dir: true,
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            path: path_str,
            is_dir: false,
            children: None,
        })
    }
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn save_image(path: String, data: String) -> Result<(), String> {
    let decoded = general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    fs::write(&path, decoded)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            read_file,
            save_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
