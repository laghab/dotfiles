# Better ls
alias ls='eza --icons'

# Detailed listing
alias ll='eza -lh --icons --git'

# Detailed listing including hidden files
alias la='eza -lah --icons --git'

# Tree view
alias tree='eza --tree --icons'

# Reuse ls completions for eza (avoids defining a separate completion function)
compdef eza=ls

# Better cat
alias cat='bat'

# =========================================================
# Core utilities
# =========================================================

alias grep='rg --color=auto'
alias diff='diff --color=auto'
alias df='df -h'

# =========================================================
# Navigation
# =========================================================

alias -- -='cd -'  # -- prevents - being parsed as a flag; cd - jumps to previous directory

lf() { # zsh follow lf navigation
    tmp=$(mktemp)
    command lf -last-dir-path="$tmp" "$@"
    if [ -f "$tmp" ]; then
        dir=$(cat "$tmp")
        rm -f "$tmp"
        [ -d "$dir" ] && [ "$dir" != "$(pwd)" ] && cd "$dir"
    fi
}

# =========================================================
# Editor
# =========================================================

alias vim='nvim'

# =========================================================
# Migrated from fish aliases
# =========================================================

alias zed='zeditor'
alias btop='btop --force-utf'
alias oc='opencode'
alias cc='claude'
alias vencord='sh -c "$(curl -sS https://vencord.dev/install.sh)"'
alias discord='discord --ozone-platform=x11'
alias bitlocker='sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+2+7 --wipe-slot=tpm2 /dev/nvme0n1p2'
alias dotfiles-sync='yadm add -u && yadm commit -m "sync: $(date +%F_%T)" && yadm push'

# =========================================================
# OmniRoute
# =========================================================

alias orctl='node ~/Projects/omniroute/omniroute-ctl/bin/omniroute-ctl.ts'
alias ordash='xdg-open http://localhost:20128'

# =========================================================
# Git
# =========================================================

alias glog='PAGER="less -F -X" git log'                              # -F quit if one screen, -X no clear on exit
alias gadog='PAGER="less -F -X" git log --all --decorate --oneline --graph'
alias dotfiles='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'

# Cherry-picked from Oh My Zsh's git plugin (most-used subset only)
alias gst='git status'
alias gaa='git add --all'
alias gcmsg='git commit -m'
alias gco='git checkout'
alias gcb='git checkout -b'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'
alias gds='git diff --staged'

# =========================================================
# Quality of life (cherry-picked from Oh My Zsh, no framework needed)
# =========================================================

# Colored man pages
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'

# Universal archive extractor: extract foo.tar.gz / foo.zip / foo.rar / ...
extract() {
  if [ ! -f "$1" ]; then
    echo "extract: '$1' is not a valid file"
    return 1
  fi
  case "$1" in
    *.tar.bz2) tar xjf "$1"    ;;
    *.tar.gz)  tar xzf "$1"    ;;
    *.tar.xz)  tar xJf "$1"    ;;
    *.tbz2)    tar xjf "$1"    ;;
    *.tgz)     tar xzf "$1"    ;;
    *.tar)     tar xf "$1"     ;;
    *.bz2)     bunzip2 "$1"    ;;
    *.gz)      gunzip "$1"     ;;
    *.zip)     unzip "$1"      ;;
    *.rar)     unrar x "$1"    ;;
    *.7z)      7z x "$1"       ;;
    *.Z)       uncompress "$1" ;;
    *)         echo "extract: '$1' cannot be extracted" ;;
  esac
}

# mkdir + cd in one go
take() { mkdir -p "$1" && cd "$1"; }

# =========================================================
# Video
# =========================================================

alias stream='mpv av://v4l2:/dev/video4 --fullscreen --demuxer-lavf-o=input_format=mjpeg,framerate=30 --profile=low-latency --untimed'
