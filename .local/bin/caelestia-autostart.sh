#!/bin/bash
export QML2_IMPORT_PATH="$HOME/.local/lib/qt6/qml"
export CAELESTIA_LIB_DIR="$HOME/.local/lib/caelestia"
export QS_NO_RELOAD_POPUP=1
export QS_DROP_EXPENSIVE_FONTS=1
export QS_DISABLE_CRASH_HANDLER=1
export QSG_RENDER_LOOP=threaded
export QT_QUICK_FLICKABLE_WHEEL_DECELERATION=10000
# Qt6 Multimedia's ffmpeg backend decodes in software unless a hw device type
# is explicitly opted into. This offloads video wallpaper decode (h264/hevc/vp8/vp9)
# to the Intel iGPU's VAAPI decode engine instead of the CPU.
export QT_FFMPEG_DECODING_HW_DEVICE_TYPES=vaapi
# stdbuf forces line-buffered stdout/stderr; without it, glibc fully-buffers
# output when it isn't attached to a TTY (e.g. when captured by journald via
# systemd), so qDebug/qWarning messages can sit unflushed indefinitely.
SHELL_QML="$HOME/.config/quickshell/caelestia/shell.qml"
stdbuf -oL -eL "/usr/bin/quickshell" -d -n -p "$SHELL_QML" &
QS_PID=$!

# Works around a startup race where the shell's own wallpaper-state FileView
# (services/Wallpapers.qml) occasionally fails to load
# ~/.local/share/caelestia/state/wallpaper/path.txt on cold start and falls
# back to the bundled default wallpaper, even though the state file is valid.
# Reconciles the live wallpaper against the persisted state once IPC is up.
(
    STATE_FILE="$HOME/.local/share/caelestia/state/wallpaper/path.txt"
    for _ in $(seq 1 20); do
        sleep 0.5
        [[ -s "$STATE_FILE" ]] || continue
        saved="$(<"$STATE_FILE")"
        current="$(quickshell ipc -p "$SHELL_QML" call wallpaper get 2>/dev/null)"
        [[ -z "$current" ]] && continue
        if [[ -n "$saved" && "$current" != "$saved" ]]; then
            quickshell ipc -p "$SHELL_QML" call wallpaper set "$saved" 2>/dev/null
        fi
        break
    done
) &

wait "$QS_PID"
