const bindings = [
    ["moveWindowAndSwitchToDesktop1", "Move Window and Switch to Desktop 1", "Meta+1"],
    ["moveWindowAndSwitchToDesktop2", "Move Window and Switch to Desktop 2", "Meta+2"],
    ["moveWindowAndSwitchToDesktop3", "Move Window and Switch to Desktop 3", "Meta+3"],
    ["moveWindowAndSwitchToDesktop4", "Move Window and Switch to Desktop 4", "Meta+4"],
    ["moveWindowAndSwitchToDesktop5", "Move Window and Switch to Desktop 5", "Meta+5"],
];

bindings.forEach(([id, text, key], index) => {
    registerShortcut(id, text, key, () => {
        const desktop = workspace.desktops[index];
        if (!desktop) {
            return;
        }
        const window = workspace.activeWindow;
        if (window) {
            window.desktops = [desktop];
        }
        workspace.currentDesktop = desktop;
    });
});
