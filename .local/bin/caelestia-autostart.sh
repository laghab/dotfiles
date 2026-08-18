#!/bin/bash
export QML2_IMPORT_PATH="$HOME/.local/lib/qt6/qml"
export CAELESTIA_LIB_DIR="$HOME/.local/lib/caelestia"
export QS_NO_RELOAD_POPUP=1
export QS_DROP_EXPENSIVE_FONTS=1
export QS_DISABLE_CRASH_HANDLER=1
export QSG_RENDER_LOOP=threaded
export QT_QUICK_FLICKABLE_WHEEL_DECELERATION=10000
# stdbuf forces line-buffered stdout/stderr; without it, glibc fully-buffers
# output when it isn't attached to a TTY (e.g. when captured by journald via
# systemd), so qDebug/qWarning messages can sit unflushed indefinitely.
exec stdbuf -oL -eL "/usr/bin/quickshell" -d -n -p "$HOME/.config/quickshell/caelestia/shell.qml"
