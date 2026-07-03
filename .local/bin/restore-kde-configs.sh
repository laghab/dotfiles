#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="$HOME/.config"

# Unlock files for writing
chmod 640 "$CONFIG_DIR/kglobalshortcutsrc" \
         "$CONFIG_DIR/kcminputrc" \
         "$CONFIG_DIR/kwinoutputconfig.json" 2>/dev/null || true

# =====================
# kglobalshortcutsrc
# =====================

# Unbind Edit Tiles from Meta+T (was colliding with Krohnkite)
kwriteconfig6 --file kglobalshortcutsrc --group kwin \
  --key "Edit Tiles" "none,none,Toggle Tiles Editor"

# Unbind KrohnkiteTileLayout from Meta+T (user doesn't want layout switching on Meta+T)
kwriteconfig6 --file kglobalshortcutsrc --group kwin \
  --key "KrohnkiteTileLayout" "none,none,Krohnkite: Tile Layout"

# Unbind Switch to Last-Used Keyboard Layout from Meta+Alt+L (was colliding with KrohnkiteFocusRight)
kwriteconfig6 --file kglobalshortcutsrc --group "KDE Keyboard Layout Switcher" \
  --key "Switch to Last-Used Keyboard Layout" "none,none,Switch to Last-Used Keyboard Layout"

# Change task manager entries 1-3 to Meta+Ctrl+1/2/3 (was colliding with Window to Desktop)
kwriteconfig6 --file kglobalshortcutsrc --group plasmashell \
  --key "activate task manager entry 1" "none,Meta+Ctrl+1,Activate Task Manager Entry 1"
kwriteconfig6 --file kglobalshortcutsrc --group plasmashell \
  --key "activate task manager entry 2" "none,Meta+Ctrl+2,Activate Task Manager Entry 2"
kwriteconfig6 --file kglobalshortcutsrc --group plasmashell \
  --key "activate task manager entry 3" "none,Meta+Ctrl+3,Activate Task Manager Entry 3"

# Notify KWin of shortcut changes with retry loop
for _ in 1 2 3; do
  if qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure 2>/dev/null; then
    break
  fi
  sleep 0.5
done

# =====================
# kcminputrc
# =====================
python3 -c "
import re
with open('$CONFIG_DIR/kcminputrc') as f:
    lines = f.readlines()
# Remove duplicate lowercase keys that shadow proper-cased ones
cleaned = []
for line in lines:
    if re.match(r'^(enabled|pointeracceleration|pointeraccelerationprofile)=', line):
        continue  # skip lowercase duplicates
    cleaned.append(line)
with open('$CONFIG_DIR/kcminputrc', 'w') as f:
    f.writelines(cleaned)
"

# =====================
# kwinoutputconfig.json
# =====================
python3 -c "
import json

path = '$CONFIG_DIR/kwinoutputconfig.json'
with open(path) as f:
    d = json.load(f)

# 1) Strip NVIDIA ghost output (edid NVD) from outputs list
outputs_block = [x for x in d if x['name'] == 'outputs']
if outputs_block:
    outputs_block[0]['data'] = [
        o for o in outputs_block[0]['data']
        if o.get('edidIdentifier', '') != 'NVD 0 0 0 0 0'
    ]

# 2) Remove any setup referencing the stripped output index
setups_block = [x for x in d if x['name'] == 'setups']
stripped_indices = set()
if outputs_block:
    for o in outputs_block[0]['data']:
        stripped_indices.add(o.get('edidIdentifier', ''))

if setups_block:
    data = setups_block[0]['data']
    # Remove setups that only reference a stripped output
    data[:] = [s for s in data if not (
        len(s['outputs']) == 1
        and s['outputs'][0].get('outputIndex', -1) == 1
    )]

with open(path, 'w') as f:
    json.dump(d, f, indent=4)
    f.write('\n')
"

# =====================
# kwinrc — safeguard floating layer
# =====================
kwriteconfig6 --file kwinrc --group Script-krohnkite \
  --key floatedWindowsLayer 1

# =====================
# Re-lock files
# =====================
chmod 400 "$CONFIG_DIR/kglobalshortcutsrc" \
         "$CONFIG_DIR/kcminputrc" \
         "$CONFIG_DIR/kwinoutputconfig.json"
