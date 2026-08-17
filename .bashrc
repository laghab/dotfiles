#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'
PS1='[\u@\h \W]\$ '

export PATH="$HOME/.npm-global/bin:$PATH"

export OMNIROUTE_API_KEY=sk-29fec26575384a21-c11850-80b370e9

[[ -f ~/.config/yadm/aliases.sh ]] && source ~/.config/yadm/aliases.sh


# Added by Antigravity CLI installer
export PATH="/home/laghab/.local/bin:$PATH"

. "$HOME/.local/share/../bin/env"
