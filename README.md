# Tauri 2

This repository contains adapters and documentation around using [Tauri](https://tauri.app) v2 with specta-rs projects ([rspc](http://github.com/oscartbeaumont/rspc), [specta](https://github.com/oscartbeaumont/specta) & [tauri-specta](https://github.com/oscartbeaumont/tauri-specta)).

This repository will be archived and it's changes upstreamed once Tauri v2 is released as stable in the coming months.

This is primarily targetted at early adopters.

## rspc

|            | Tauri v1                          | Tauri v2              |
|------------|-----------------------------------|-----------------------|
| rspc 0.1.x | Use the 'tauri' feature on `rspc` | [Upgrade to rspc 0.2.x](https://github.com/oscartbeaumont/rspc/releases/tag/v0.2.0) |
| rspc 0.2.x | [Use `rspc_tauri` crate](https://www.rspc.dev/integrations/tauri)            | Use `rspc_tauri2`     |

### Using `rspc_tauri2`

To import it add the following to your `Cargo.toml`:
```toml
rspc-tauri2 = { git = "https://github.com/specta-rs/tauri2", rev = "501572c10bd5db001bd091990ac52c1fdbb14a5a" }
```

Then [follow the rspc docs](https://www.rspc.dev/integrations/tauri) but replace `rspc_tauri` with `rspc_tauri2`.

## Specta

Coming soon...

## Tauri Specta

Coming soon...

## Support Matrix

|        | specta1                         | specta2                          | rspc1                         | rspc2                                                             | tauri-specta1 | tauri-specta2 |
|--------|---------------------------------|----------------------------------|-------------------------------|-------------------------------------------------------------------|---------------|---------------|
| tauri1 | via 'tauri' feature on `specta` | Not supported                    | Via 'tauri' feature on `rspc` | Via  `rspc_tauri`  crate                                          | Supported     | tbd           |
| tauri2 | Not supported                   | via 'specta' feature on  `tauri` | Not supported                 | Via  `rspc_tauri2`  crate (until it's released) then `rspc_tauri` | Not supported | Supported     |

## FAQ?

### Why a whole repository for this?

You can't actively have Tauri and Tauri v2 in the same Cargo workspace.

This is due to Tauri depending on C/C++ libraries such as Webkit which link against shared libraries. Cargo flags the potential for the same shared library to be linked twice and bails out.

This would make sense at a crate level but the resolver isn't super smart and bails out at a workspace level.

You will see an error like the following if you hit this:
```
error: failed to select a version for `webkit2gtk-sys`.
    ... required by package `webkit2gtk v2.0.1`
    ... which satisfies dependency `webkit2gtk = "=2.0.1"` of package `tauri v2.0.0-beta.13`
    ... which satisfies dependency `tauri = "=2.0.0-beta.13"` of package `rspc-tauri2 v0.0.1 (/Users/oscar/Desktop/rspc-014/crates/tauri2)`
versions that meet the requirements `^2.0.1` are: 2.0.1

the package `webkit2gtk-sys` links to the native library `web_kit2`, but it conflicts with a previous package which links to `web_kit2` as well:
package `webkit2gtk-sys v0.18.0`
    ... which satisfies dependency `ffi = "^0.18"` of package `webkit2gtk v0.18.2`
    ... which satisfies dependency `webkit2gtk = "^0.18.2"` of package `tauri v1.6.1`
    ... which satisfies dependency `tauri = "=1.6.1"` of package `rspc-tauri v0.0.1 (/Users/oscar/Desktop/rspc-014/crates/tauri)`
Only one package in the dependency graph may specify the same links value. This helps ensure that only one copy of a native library is linked in the final binary. Try to adjust your dependencies so that only one package uses the `links = "web_kit2"` value. For more information, see https://doc.rust-lang.org/cargo/reference/resolver.html#links.

failed to select a version for `webkit2gtk-sys` which could resolve this conflict
```
