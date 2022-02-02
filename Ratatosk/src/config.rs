use std::{env, fs};
use std::path::Path;

#[derive(Deserialize, Debug)]
pub(crate) struct Settings {
  pub(crate) server_token: String,
  pub(crate) listen_port: u32,
}

pub(crate) fn get_config() -> Settings {
  let current_path = env::current_exe().unwrap().canonicalize().unwrap();
  let path_ancestors = current_path.ancestors();
  let mut settings_str: String = String::new();
  for path in path_ancestors {
    let p = Path::new(path).join("ratatosk_cfg.json");
    if p.exists() {
      match fs::read_to_string(p) {
        Ok(str) => {
          settings_str = str;
          break;
        },
        Err(_) => {}
      }
    }
  }

  if settings_str.is_empty() {
    println!("Settings file ratatosk_cfg.json was not found in paths from current dir to root");
    panic!("Failed to start ratatosk");
  }

  let settings: Settings;
  let settings_result: Result<Settings, _> = serde_json::from_str(settings_str.as_str());
  match settings_result {
    Ok(result) => {
      settings = result;
      if cfg!(debug_assertions) {
        println!("Started ratatosk with config: {:?}", settings);
      }
    },
    Err(e) => {
      println!("Can't parse settings file. {:?}", e);
      panic!("Failed to start ratatosk");
    }
  }

  settings
}
