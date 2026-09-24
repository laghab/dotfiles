/*
 *   Copyright 2024 mrmaire <maire.nunez@gmail.com>
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License version 2,
 *   or (at your option) any later version, as published by the Free
 *   Software Foundation
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details
 *
 *   You should have received a copy of the GNU General Public
 *   License along with this program; if not, write to the
 *   Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import QtQuick
import org.kde.kirigami 2 as Kirigami



Image {
    id: root
    source: "images/background.png"

    property int stage
    property var textFont: "Titillium-Regular"
    /*onStageChanged: {
        if (stage == 1) {
            introAnimation.running = true
        }
    }*/
    Image {
        id: factorioLogo
        source: "images/splash-screen-image.png"
        anchors {
            horizontalCenter: parent.horizontalCenter
            top: parent.top
            topMargin: 410
        }
        
        width: 935
        height: 140
    }
    Column{
        anchors {
            horizontalCenter: parent.horizontalCenter
            top: factorioLogo.bottom
            topMargin: 122
        }
        spacing: 4
        width: progressBar.width
        height: progressBar.height + spacing + stats.height
        Image {
            id: progressBar
            source: "images/progressbarEmpty"
            anchors {
                top: parent.top
                left: parent.left
            }
            height: 16
            width: 864
            Image {
                anchors {
                    left: parent.left
                    top: parent.top
                    bottom: parent.bottom
                }
                width: (parent.width / 6) * (stage - 1)
                source: "images/progressbarFull"
                Behavior on width { 
                    PropertyAnimation {
                        duration: 250
                        easing.type: Easing.InOutQuad
                    }
                }
            }
        }
        Item {
            //color: "red"
            id: stats
            anchors {
                bottom: parent.bottom
            }
            width: parent.width
            height: lbl.height
            Text {
                id: lbl
                anchors {
                    top: parent.top
                    left: parent.left
                }
                font {
                    family: textFont
                    bold : true

                }
                text: "Loading system..."
                color: "#ff9e1a"
                style: Text.Outline
                styleColor: "black"
            }
            Text {
                id: percent
                anchors {
                    top: parent.top
                    right: parent.right
                }
                font {
                    family: textFont
                    bold : true

                }
                property int progress: ((stage - 1) / 6) * 100 
                text: progress + "%"
                color: "#ff9e1a"
                style: Text.Outline
                styleColor: "black"
            }
        }
    }
    Image {
        source: "images/wube-logo.png"
        width: 110; height: 110
        anchors {
            bottom: parent.bottom
            bottomMargin: 146
            horizontalCenter: parent.horizontalCenter
        }
    }

    /*SequentialAnimation {
        id: introAnimation
        running: false

        ParallelAnimation {
            PropertyAnimation {
                property: "y"
                target: topRect
                to: root.height / 3
                duration: 1000
                easing.type: Easing.InOutBack
                easing.overshoot: 1.0
            }

            PropertyAnimation {
                property: "y"
                target: bottomRect
                to: 2 * (root.height / 3) - bottomRect.height
                duration: 1000
                easing.type: Easing.InOutBack
                easing.overshoot: 1.0
            }
        }
    }*/
}
