source /usr/share/cachyos-fish-config/cachyos-config.fish

set -gx EDITOR nano
set -gx VISUAL nano

fish_add_path ~/.local/bin

alias zed zeditor
alias btop "btop --force-utf"

# overwrite greeting
# potentially disabling fastfetch
#function fish_greeting
#    # smth smth
#end

# vencord installer
alias vencord 'sh -c "$(curl -sS https://vencord.dev/install.sh)"'

# opencode
fish_add_path /home/laghab/.opencode/bin
alias oc opencode
