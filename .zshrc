# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
# End of lines configured by zsh-newuser-install

# Minimal prompt
setopt promptsubst
PROMPT='%F{blue}%~%f %F{white}%(!.#.>)%f '

# Auto-trust the cwd for Claude Code so the "trust this folder" dialog never appears.
# Security note: this pre-vets every folder you launch `claude` from, including ones
# you haven't personally reviewed. Remove this function to restore the normal prompt.
claude() {
  python3 - "$PWD" <<'PYEOF' 2>/dev/null
import json, os, sys
path = os.path.expanduser("~/.claude.json")
try:
    with open(path) as f:
        data = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    data = {}
projects = data.setdefault("projects", {})
proj = projects.setdefault(sys.argv[1], {})
proj["hasTrustDialogAccepted"] = True
proj.setdefault("allowedTools", [])
tmp = path + ".tmp"
with open(tmp, "w") as f:
    json.dump(data, f, indent=2)
os.replace(tmp, path)
PYEOF
  command claude "$@"
}
