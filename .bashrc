# Sample .bashrc for SUSE Linux
# Copyright (c) SUSE Software Solutions Germany GmbH

# There are 3 different types of shells in bash: the login shell, normal shell
# and interactive shell. Login shells read ~/.profile and interactive shells
# read ~/.bashrc; in our setup, /etc/profile sources ~/.bashrc - thus all
# settings made here will also take effect in a login shell.
#
# NOTE: It is recommended to make language settings in ~/.profile rather than
# here, since multilingual X sessions would not work properly if LANG is over-
# ridden in every subshell.

test -s ~/.alias && . ~/.alias || true

# --- restored from Fedora backup ---
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:$HOME/.bun/bin:$HOME/.local/share/pnpm/bin:$PATH"
[[ -f ~/.config/yadm/aliases.sh ]] && source ~/.config/yadm/aliases.sh
[[ -f ~/.local/bin/env ]] && . ~/.local/bin/env
export QML2_IMPORT_PATH="$HOME/.local/lib/qt6/qml"
export EDITOR=nvim VISUAL=nvim
command -v starship >/dev/null && eval "$(starship init bash)"
command -v zoxide   >/dev/null && eval "$(zoxide init bash)"
command -v atuin    >/dev/null && eval "$(atuin init bash)"
command -v eza      >/dev/null && alias ls='eza --icons' ll='eza -la --icons --git'
