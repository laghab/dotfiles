var plasma = getApiVersion(1);

var layout = {
    "desktops": [
        {
            "applets": [
                {
                    "config": {
                        "/": {
                            "UserBackgroundHints": "StandardBackground",
                            "popupHeight": "375",
                            "popupWidth": "525"
                        }
                    },
                    "geometry.height": 0,
                    "geometry.width": 0,
                    "geometry.x": 0,
                    "geometry.y": 0,
                    "plugin": "org.kde.plasma.digitalclock",
                    "title": "Digital Clock"
                }
            ],
            "config": {
                "/": {
                    "ItemGeometries-1920x1080": "Applet-213:1712,0,208,112,0;",
                    "ItemGeometries-640x480": "Applet-213:432,0,208,112,0;",
                    "ItemGeometriesHorizontal": "Applet-213:1712,0,208,112,0;",
                    "formfactor": "0",
                    "immutability": "1",
                    "lastScreen": "0",
                    "wallpaperplugin": "org.kde.image"
                },
                "/ConfigDialog": {
                    "DialogHeight": "630",
                    "DialogWidth": "810"
                },
                "/General": {
                    "changedPositions": "{}",
                    "lastResolution": "1920x1080",
                    "positions": "{\"1920x1080\":[\"1\",\"17\"],\"640x480\":[\"4\",\"5\",\"desktop:/sync-readme.md\",\"1\",\"0\",\"desktop:/opencode-session-chatlog.md\",\"0\",\"0\"]}",
                    "sortMode": "-1"
                },
                "/Wallpaper/org.kde.image/General": {
                    "Image": "/home/laghab/Pictures/Walls/wallhaven-d8w3gj.jpg"
                }
            },
            "wallpaperPlugin": "org.kde.image"
        }
    ],
    "panels": [
        {
            "alignment": "center",
            "applets": [
                {
                    "config": {
                        "/": {
                            "popupHeight": "509",
                            "popupWidth": "647"
                        },
                        "/General": {
                            "favoritesPortedToKAstats": "true"
                        }
                    },
                    "plugin": "org.kde.plasma.kickoff"
                },
                {
                    "config": {
                        "/ConfigDialog": {
                            "DialogHeight": "630",
                            "DialogWidth": "810"
                        },
                        "/General": {
                            "groupingStrategy": "0",
                            "launchers": "applications:anki.desktop,applications:org.kde.dolphin.desktop,applications:brave-browser.desktop",
                            "sortingStrategy": "4"
                        }
                    },
                    "plugin": "org.kde.plasma.icontasks"
                },
                {
                    "config": {
                    },
                    "plugin": "org.kde.plasma.panelspacer"
                },
                {
                    "config": {
                        "/": {
                            "popupHeight": "145",
                            "popupWidth": "360"
                        },
                        "/General": {
                            "savedAt": "2026,5,28,17,35,31.209"
                        }
                    },
                    "plugin": "org.kde.plasma.timer"
                },
                {
                    "config": {
                    },
                    "plugin": "org.kde.plasma.panelspacer"
                },
                {
                    "config": {
                    },
                    "plugin": "org.kde.plasma.systemtray"
                },
                {
                    "config": {
                        "/": {
                            "popupHeight": "451",
                            "popupWidth": "525"
                        }
                    },
                    "plugin": "org.kde.plasma.digitalclock"
                },
                {
                    "config": {
                    },
                    "plugin": "org.kde.plasma.showdesktop"
                }
            ],
            "config": {
                "/": {
                    "formfactor": "2",
                    "immutability": "1",
                    "lastScreen": "0",
                    "wallpaperplugin": "org.kde.image"
                }
            },
            "height": 2.6666666666666665,
            "hiding": "normal",
            "location": "bottom",
            "maximumLength": 106.66666666666667,
            "minimumLength": 106.66666666666667,
            "offset": 0
        }
    ],
    "serializationFormatVersion": "1"
}
;

plasma.loadSerializedLayout(layout);
