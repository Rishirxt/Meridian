#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use mongodb::{Client, options::ClientOptions};
use tauri::{State, Manager};
use tokio::sync::Mutex;

struct DbState {
    client: Mutex<Option<Client>>,
}

#[tauri::command]
async fn ping_db(state: State<'_, DbState>) -> Result<String, String> {
    let client_opt = state.client.lock().await;
    if let Some(client) = &*client_opt {
        match client.list_database_names().await {
            Ok(_) => Ok("Successfully connected to MongoDB!".to_string()),
            Err(e) => Err(format!("Failed to ping MongoDB: {}", e)),
        }
    } else {
        Err("MongoDB client not initialized".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .manage(DbState {
            client: Mutex::new(None),
        })
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                match ClientOptions::parse("mongodb://localhost:27017").await {
                    Ok(mut options) => {
                        options.app_name = Some("Meridian".to_string());
                        if let Ok(client) = Client::with_options(options) {
                            let state: State<DbState> = handle.state();
                            *state.client.lock().await = Some(client);
                            println!("MongoDB connected successfully!");
                        }
                    }
                    Err(e) => eprintln!("MongoDB connection failed: {}", e),
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![ping_db])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
