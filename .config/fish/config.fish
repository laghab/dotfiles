source /usr/share/cachyos-fish-config/cachyos-config.fish

set -gx EDITOR nano
set -gx VISUAL nano

fish_add_path ~/.local/bin

alias zed zeditor
alias btop "btop --force-utf"
alias oc opencode
alias cc claude
alias toipe "toipe -n 10"

# overwrite greeting
# potentially disabling fastfetch
#function fish_greeting
#    # smth smth
#end

# vencord installer
alias vencord 'sh -c "$(curl -sS https://vencord.dev/install.sh)"'

# re-enroll TPM2 LUKS keyslot (e.g. after a firmware/Secure Boot update breaks auto-unlock)
alias bitlocker 'sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+2+7 --wipe-slot=tpm2 /dev/nvme0n1p2'

# opencode (wrapper function in ~/.config/fish/functions/opencode.fish)
fish_add_path /home/laghab/.opencode/bin
fish_add_path /home/laghab/.local/share/pnpm/bin
fish_add_path ~/.npm-global/bin

# OmniRoute gateway API key
set -gx OMNIROUTE_API_KEY sk-29fec26575384a21-c11850-80b370e9

# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH

if test -f ~/.config/yadm/aliases.fish
    source ~/.config/yadm/aliases.fish
end


# Added by Antigravity CLI installer
set -gx PATH "/home/laghab/.local/bin" $PATH
