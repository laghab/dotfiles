# Caelestia shell — local overrides

This dotfiles repo does **not** vendor the Caelestia shell source. The base
install always comes from running `setup.sh` against the shell fork; this
repo only carries the state/config that setup.sh doesn't manage, plus a
small number of source-file overrides layered on top of the fresh install.

## Base install

```
git clone https://github.com/ladybug-me/caelestia-dots-kde ~/src/caelestia-dots-kde
cd ~/src/caelestia-dots-kde
./setup.sh
```

`.config/quickshell/caelestia/.current_commit` and `.update_branch` are
tracked in this repo and pin the exact fork commit/branch that was
installed, so re-running setup.sh against that fork reproduces the same
base shell.

## Reapplying overrides after setup.sh / update.sh

`setup.sh` (and the shell's own `update.sh`) redeploy
`~/.config/quickshell/caelestia` from the fork's `shell/` directory, which
overwrites the files below. After installing or updating, restore them from
this repo:

```
yadm checkout -- \
  .config/quickshell/caelestia/modules/notifications/Notification.qml \
  .config/quickshell/caelestia/services/startuptasks/02-krohnkite-setup.sh
```

### `modules/notifications/Notification.qml`
- Added a persistent close (X) button in the top-right corner of every
  notification card, next to the expand chevron. Previously the only close
  button lived inside the expanded action row, so dismissing a notification
  required expanding or swiping it first.
- Fixed click-to-open for notifications that carry a freedesktop.org
  `"default"` action id (this is how Chromium/Brave send web-notification
  click targets, e.g. WhatsApp Web notifications) — clicking the
  notification body now invokes that action directly instead of only
  working when there was exactly one *visible* named action. The `default`
  action is also filtered out of the rendered action-button row so it no
  longer shows up as a blank button.

### `services/startuptasks/02-krohnkite-setup.sh`
- Tiling layout preference: Spiral is the only enabled Krohnkite layout
  (`spiralLayoutOrder=1`, every other `*LayoutOrder` key set to `0`,
  including `binaryTreeLayoutOrder` and `floatingLayoutOrder` which ship
  enabled upstream).

## Config/state (tracked directly, no manual step needed)

These live under `.config/caelestia/` and `.config/` and are restored
automatically by `yadm checkout`/clone — no reapply step required:

- `.config/caelestia/shell.json` — `notifs.defaultExpireTimeout` set to
  `3000` (3s) for a shorter popup lifetime.
- `.config/caelestia/keybinds.json` — workspaces 1-5 rebound to `Alt+N`.
- `.config/khotkeysrc` — the leftover `Print` → `flameshot gui` custom
  shortcut (installed by Flameshot's own package, not by Caelestia) is
  disabled (`Enabled=false`) rather than deleted, since the khotkeys daemon
  isn't active in this session to safely renumber entries.
- `.config/kglobalshortcutsrc` — Flameshot's shortcut entries left as
  `none` (already inert; Caelestia's own screenshot flow is on
  `Meta+Shift+S` via Spectacle, unaffected).

## Manual system step (not a dotfile)

Flameshot was fully removed since Caelestia's screenshot pipeline uses
Spectacle + ImageMagick + swappy, not Flameshot:

```
sudo dnf remove flameshot
rm -f ~/.config/autostart/Flameshot.desktop
```

(`grim` gets pulled in as an orphaned dependency of `flameshot` by dnf's
autoremove — keep it, `swappy.desktop`'s standalone launcher falls back to
`grim`+`slurp` when run with no arguments.)
