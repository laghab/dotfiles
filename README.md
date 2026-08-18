# dotfiles

Personal dotfiles, managed with [yadm](https://yadm.io/). Covers shell (zsh/fish), terminal apps (kitty, lazygit, superfile, micro), editor (zed), KDE Plasma (kwin, appletsrc, klassy, global shortcuts), GTK theming, and the Quickshell/Caelestia shell layered on top of Plasma.

## Restore on a new machine

```
yadm clone https://github.com/laghab/dotfiles.git
yadm decrypt   # only if any encrypted files are ever added
```

Then follow the app-specific notes below for anything that needs more than just the config file in place.

## Quickshell / Caelestia shell

A [caelestia-dots](https://github.com/caelestia-dots/shell) Quickshell config layered on top of KDE Plasma (Wayland). The shell source itself (`~/.config/quickshell/caelestia/`, ~84MB) is **not** tracked here — it's managed by caelestia's own installer/updater. Only the pinned version markers and personal overrides are tracked.

Tracked files:
- `.config/caelestia/` — settings overrides (`shell.json`, `keybinds.json`, stolen KDE shortcuts/edges, status icon order, dino high score, per-monitor overrides)
- `.config/quickshell/caelestia/.current_commit` / `.update_branch` — exact upstream commit + branch this was last synced to
- `.local/bin/caelestia`, `.local/bin/caelestia-autostart.sh` — installer-generated CLI/autostart wrappers
- `.config/autostart/caelestiashell.desktop` — autostarts the shell under Plasma
- `.local/state/caelestia/scheme.json`, `.local/state/caelestia/wallpaper/path.txt` — active colour scheme + wallpaper

### Restore steps

1. Install caelestia-dots via its official installer (see upstream repo), then check out the pinned commit:
   ```
   cat ~/.config/quickshell/caelestia/.current_commit
   git -C ~/.config/quickshell/caelestia checkout "$(cat ~/.config/quickshell/caelestia/.current_commit)"
   ```
2. `yadm pull` to lay down the config overrides, CLI wrappers, and autostart entry above.
3. `chmod +x ~/.local/bin/caelestia ~/.local/bin/caelestia-autostart.sh` (yadm preserves the executable bit, but double check).
4. `systemctl --user daemon-reload` and log back in (or `systemctl --user restart app-caelestiashell@autostart.service`) to pick up the autostart entry.
