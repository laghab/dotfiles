# PATH
fish_add_path -g ~/.local/bin ~/.npm-global/bin ~/.bun/bin ~/.local/share/pnpm/bin ~/.opencode/bin
set -gx PNPM_HOME ~/.local/share/pnpm
set -gx EDITOR nvim
set -gx VISUAL nvim

if status is-interactive
    set -g fish_greeting

    # aliases
    alias cc claude
    alias oc opencode
    alias dotfiles-sync dotsync
    alias vencord 'sh -c "$(curl -sS https://vencord.dev/install.sh)"'

    command -q zoxide; and zoxide init fish | source
end
