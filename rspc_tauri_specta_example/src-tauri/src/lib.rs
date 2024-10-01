use std::path::PathBuf;

use rspc::Config;

pub fn run() {
    let router = <rspc::Router>::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
        .query("greet", |t| t(|_, name: String| format!("Hello, {name}!")))
        .build()
        .arced();

    tauri::Builder::default()
        .plugin(rspc_tauri2::plugin(router, |_| ()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}