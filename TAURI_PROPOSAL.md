# Tauri proposal

I am writing this proposal to ask if we can introduce a `specta` feature to the `tauri` crate.

This feature will contain an implementation of [specta::function::FunctionArg](https://docs.rs/specta/2.0.0-rc.9/specta/function/trait.FunctionArg.html) for [`tauri::State`](https://docs.rs/tauri/latest/tauri/struct.State.html), [`tauri::window::Window`](https://docs.rs/tauri/latest/tauri/window/struct.Window.html) and [`tauri::AppHandle`](https://docs.rs/tauri/latest/tauri/struct.AppHandle.html).

This feature would significantly help with supporting [Tauri Specta](https://github.com/oscartbeaumont/tauri-specta).

## What is Tauri Specta?

Tauri Specta is a crate which combines [Specta](https://docs.rs/specta/latest/specta/)'s Typescript, Javascript and JSDoc exporters with your Tauri commands for end-to-end type safety.

To use it you add the [`specta::specta`](https://docs.rs/specta/2.0.0-rc.9/specta/attr.specta.html) macro to your commands like the following:
```rs
#[tauri::command]
#[specta::specta] // < dis bit
fn my_command() {}
```

Then you use the [`tauri_specta::collect_commands`](https://docs.rs/tauri-specta/2.0.0-rc.4/tauri_specta/macro.collect_commands.html) to collect the types and Tauri commands and attach them to the Tauri builder.

The macro's all work exactly the same as the Tauri equivalents but if your still unsure checkout [this example app](https://github.com/oscartbeaumont/tauri-specta/tree/main/examples/app).

## Why not a `tauri` feature on Specta?

Up until the [`2.0.0-rc.9` release of Specta](https://github.com/oscartbeaumont/specta/releases/tag/v2.0.0-rc.9) (release earlier today) we supported Tauri, however, this isn't going to be possible after Specta v2 moves to a stable release.

### You major, we major

If we depend on Tauri every time Tauri releases a major version so would Specta.

This is a big problem when I would like Specta v2 to be the final version.

Similar to Serde, I want Specta to be able to develop an ecosystem of crates that implement its trait and this is only going to be possible if Specta has a semver stable API.

### Just use features?

A common approach in the ecosystem is to use features to work around this.

For example if/when Tauri v3 comes out we could add a `tauri3` feature to Specta.

However this won't work. Tauri depends on C/C++ libraries such as WebKit which link against shared libraries and Cargo isn't smart enough to handle this when features are used.

If `tauri` appears twice in the same *Cargo workspace* you will get the following error:

```
error: failed to select a version for `webkit2gtk-sys`.
    ... required by package `webkit2gtk v2.0.1`
    ... which satisfies dependency `webkit2gtk = "=2.0.1"` of package `tauri v2.0.0-beta.13`
    ... which satisfies dependency `tauri2 = "=2.0.0-beta.13"` of package `testing v0.1.0 (/Users/oscar/Desktop/testing)`
versions that meet the requirements `^2.0.1` are: 2.0.1

the package `webkit2gtk-sys` links to the native library `web_kit2`, but it conflicts with a previous package which links to `web_kit2` as well:
package `webkit2gtk-sys v0.18.0`
    ... which satisfies dependency `ffi = "^0.18"` of package `webkit2gtk v0.18.2`
    ... which satisfies dependency `webkit2gtk = "^0.18.2"` of package `tauri v1.6.1`
    ... which satisfies dependency `tauri = "=1.6.1"` of package `testing v0.1.0 (/Users/oscar/Desktop/testing)`
Only one package in the dependency graph may specify the same links value. This helps ensure that only one copy of a native library is linked in the final binary. Try to adjust your dependencies so that only one package uses the `links = "web_kit2"` value. For more information, see https://doc.rust-lang.org/cargo/reference/resolver.html#links.

failed to select a version for `webkit2gtk-sys` which could resolve this conflict
```

Cargo's resolver seems to account for the `links` property in the `Cargo.toml` without taking into account the enabled features.

<details>
  <summary>Reproduce this issue yourself in 5 easy commands</summary>
  
  ```sh
    cargo new testing
    cd testing/
    echo "tauri = { version = \"=1.6.1\", optional = true }" >> Cargo.toml
    echo "tauri2 = { package = \"tauri\", version = \"=2.0.0-beta.13\", optional = true }" >> Cargo.toml
    cargo run # < We don't provide `--features` so neither is enabled.
  ```

</details>

### Okay so have another crate?

Another common approach in the ecosystem is to use crates for integrations.

For example [`rspc`](https://github.com/oscartbeaumont/rspc) another project of mine is doing exactly this. We have the core [`rspc`](https://docs.rs/tauri) crate and an [`rspc_tauri`](https://docs.rs/rspc-tauri) crate.

Now this runs into the same issues where multiple Tauri versions can't exist in the same Cargo workspace but that can be worked around by having a second GitHub repository as rspc has done for [`rspc_tauri2`](https://github.com/specta-rs/tauri2/tree/main/rspc_tauri2) by putting it's adapter in `specta-rs/tauri2` instead of `oscartbeaumont/rspc`.

Even if we were to break it into another repository this won't work in this specific scenario due to Rust's [Orphan Rule](https://doc.rust-lang.org/reference/items/implementations.html#orphan-rules).

With the orphan rule an implementation for a trait must belong where the trait or the type it's being implemented for is defined which in this case is either  `specta` or `tauri`  and we have discussed above why Specta is not viable.

## What would the implementations look like?

It would be the following code feature gated behind the `specta` feature:

```rs
use specta::{TypeMap, DataType, function::FunctionArg};

impl<'r, T: Send + Sync + 'static> FunctionArg for tauri::State {
    fn to_datatype(type_map: &mut TypeMap) -> Option<DataType> {
        None
    }
}

impl<R: tauri::Runtime> FunctionArg for tauri::AppHandle<R> {
    fn to_datatype(type_map: &mut TypeMap) -> Option<DataType> {
        None
    }
}

impl<R: tauri::Runtime> FunctionArg for tauri::Window {
    fn to_datatype(type_map: &mut TypeMap) -> Option<DataType> {
        None
    }
}
```

## Specta v2 is in beta

Right now Specta v2 is being released under `2.0.0-rc.x` releases. I am not 100% sure that the current API surface will not need breaking changes and as such i'm not going to be doing a full release until i'm dead sure this can be the last major Specta release.

Even though this is the case I think it's still safe for Tauri to implement a Specta feature right now.

## Semver and caret

If Tauri were to depend on Specta version `^2.0.0-rc.9` it will match all future release candidates *and* the final release.

As long as Specta maintains the following guarantees, Tauri will be able to maintain semver:

 - `specta::TypeMap` exists, no restrictions on it's API surface.
 - `specta::DataType` exists, no restrictions on it's API surface.
 - `specta::function::FunctionArg` exists, and must not change it's trait definition.
 - The `function` feature on the `specta` crate must exist.

All these are things I can guarantee.

<details>
  <summary>Sanity check using semver crate</summary>
  
  The following parses with the [`semver`](https://docs.rs/semver) crate which documents itself as using "Cargo’s flavor of Semantic Versioning".

  ```rs
use semver::{Version, VersionReq};

fn main() {
    let req = VersionReq::parse("^2.0.0-rc.9").unwrap();
    assert!(req.matches(&Version::parse("2.0.0-rc.10").unwrap()));
    assert!(req.matches(&Version::parse("2.0.0").unwrap()));
    assert!(req.matches(&Version::parse("2.1.0").unwrap()));
}
  ```
</details>

## Precedence

The Tauri crate currently has features for integrating with the external crates [`tracing`](https://docs.rs/tracing) and [`tray-icon`](https://docs.rs/tray-icon).

Some notes about them:
 - `tray-icon` is owned by Tauri
 - `tracing` is a *massive*ly used crate (2650 times as many installs as Specta, 🥹)

It is probably fair to say Specta doesn't exactly follow this precedence, however, the technical implementation of something to work with another crate is nothing new to Tauri.

## Who will maintain it?

I am happy to pledge my time to maintaining this integration. It's also very little code so I don't foresee a maintenance burden due to it and it's within my best interests to maintain it for Tauri Specta to keep working.

## Follow up

I would be happy to open a PR but I wanted to bring this up for discussion first.

## Does Tauri Specta need to exist?

Even if we add the `specta` feature to Tauri we will still need Tauri Specta to exist.

Tauri Specta takes care of the boilerplate of using Specta functions and also goes further into Tauri events and more.

The functionality of Tauri Specta heavily depends on a specific Tauri version by design, which we can't do in the main `specta` crate due to the semver issues it creates which the proposal aims to avoid.

The Tauri crate must maintain a feature for `specta` as opposed to a `tauri_specta` feature as Specta is what takes care of the heavy lifting for the type exporting that Tauri Specta uses.

I have also discussed with Denjell the possibility of donating Tauri Specta to the Tauri organisation, however, that is something for another time.

## Alternatives

### Figuring out a way to have multiple Tauri versions in one project

If someone could figure out a Cargo hack for this we could potentially use it.

Although even if this was possible i'm not sure it would be great in terms of UX of having `{crate_name}`, `{crate_name}2`, etc for every major version and it would be maintainability nightmare due to having to keep up to date all versions (and then what do we do for beta releases where each release could have major breaking changes).

### Move Specta function-related code into Tauri Specta

We could copy all of the macro and traits related to functions from Specta to within Tauri Specta. This would make the Tauri Specta significantly harder to maintain and would require us maintaining two versions of the same code, or not proving it as an API for other frameworks.

Right now Tauri Specta leaves all the heavy lifting to Specta and just exists to remove the boilerplate.
