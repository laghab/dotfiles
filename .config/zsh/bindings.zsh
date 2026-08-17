# =========================================================
# Keybindings
# =========================================================

# Cursor shape per vi mode
ZVM_INSERT_MODE_CURSOR=$ZVM_CURSOR_BEAM
ZVM_NORMAL_MODE_CURSOR=$ZVM_CURSOR_BLOCK
ZVM_VISUAL_MODE_CURSOR=$ZVM_CURSOR_BLOCK

# Disable command mode line highlight
ZVM_VI_HIGHLIGHT_BACKGROUND=none
ZVM_VI_HIGHLIGHT_FOREGROUND=none
ZVM_VI_HIGHLIGHT_EXTRASTYLE=none

# Plain Backspace -> delete single char (^H / ^?)
bindkey '^H' backward-delete-char
bindkey '^?' backward-delete-char

# Ctrl+Backspace -> delete whole word across various terminal escape sequences
bindkey '^W' backward-kill-word
bindkey '^[[127;5u' backward-kill-word
bindkey '^[^?' backward-kill-word
bindkey '^[^H' backward-kill-word

# Esc Esc -> toggle "sudo " at the start of the current/previous command
# (cherry-picked from Oh My Zsh's sudo plugin)
sudo-command-line() {
  [[ -z $BUFFER ]] && zle up-history
  if [[ $BUFFER == sudo\ * ]]; then
    LBUFFER="${LBUFFER#sudo }"
  else
    LBUFFER="sudo $LBUFFER"
  fi
}
zle -N sudo-command-line

# zsh-vi-mode resets all bindings on init, so custom bindings
# must be registered via this hook to survive.
zvm_after_init() {
  # Ctrl+Right -> move forward one word (^[[1;5C is the terminal escape code)
  bindkey '^[[1;5C' forward-word

  # Ctrl+Left -> move backward one word (^[[1;5D is the terminal escape code)
  bindkey '^[[1;5D' backward-word

  # Plain Backspace -> delete single char (^H / ^?)
  bindkey '^H' vi-backward-delete-char
  bindkey '^?' vi-backward-delete-char

  # Ctrl+Backspace -> delete whole word across various terminal escape sequences
  bindkey '^W' vi-backward-kill-word
  bindkey '^[[127;5u' vi-backward-kill-word
  bindkey '^[^?' vi-backward-kill-word
  bindkey '^[^H' vi-backward-kill-word

  # Ctrl+F -> fzf file picker (no hidden files)
  bindkey '^F' _fzf_file_no_hidden

  # Ctrl+\ -> toggle autosuggestions (useful for screen recordings)
  bindkey '^\' autosuggest-toggle

  # Up/Down -> history search by substring (^[[A/^[[B are up/down arrow escape codes)
  bindkey '^[[A' history-substring-search-up
  bindkey '^[[B' history-substring-search-down

  # Esc Esc -> toggle "sudo " at the start of the current/previous command
  bindkey '\e\e' sudo-command-line
}
