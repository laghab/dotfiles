function fish_prompt
    set -l last $status
    # line 1: path + how long the last command took
    set -l took ''
    if test $CMD_DURATION -ge 1000
        set took (set_color yellow)' '(math -s1 $CMD_DURATION / 1000)'s'
    else if test $CMD_DURATION -gt 0
        set took (set_color brblack)' '$CMD_DURATION'ms'
    end
    echo
    echo (set_color blue)(prompt_pwd --full-length-dirs 3)$took(set_color normal)
    # line 2: classic arrow, red if the last command failed
    if test $last -eq 0
        set_color green
    else
        set_color red
    end
    echo -n '❯ '
    set_color normal
end
