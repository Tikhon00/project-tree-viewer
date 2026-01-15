#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileNode>>,
}

#[tauri::command]
fn scan_directory(path: String) -> Result<FileNode, String> {
    let dir_path = PathBuf::from(&path);
    if !dir_path.exists() {
        return Err("Path does not exist".to_string());
    }
    build_tree(&dir_path).map_err(|e| e.to_string())
}

fn build_tree(path: &PathBuf) -> Result<FileNode, std::io::Error> {
    let metadata = fs::metadata(path)?;
    let name = path.file_name().unwrap().to_string_lossy().to_string();
    
    if metadata.is_dir() {
        let mut children = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child = build_tree(&entry.path())?;
            children.push(child);
        }
        children.sort_by(|a, b| {
            match (a.is_dir, b.is_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });
        Ok(FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir: true,
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir: false,
            children: None,
        })
    }
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![scan_directory, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
