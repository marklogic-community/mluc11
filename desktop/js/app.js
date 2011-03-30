/*
    MarkLogic User Conference App

    Copyright 2011 MarkLogic

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

Ext.onReady(function() {
    if(Ext.isIE6) {
        window.location = "http://www.bringdownie6.com/";
    }

    Ext.getStore("SessionStore").on("load", function() {
        var viewing = mluc.readCookie("MLUC-VIEWING");
        if(viewing) {
            mluc.eraseCookie("MLUC-VIEWING");
            viewing = Ext.JSON.decode(viewing);
            if(viewing.session) {
                var session = Ext.getStore("SessionStore").getById(viewing.session);
                if(session) {
                    mluc.views.Schedule.detailsWindow.viewSession(session);
                }
            }
        }
    });

    mluc.views.Schedule = Ext.create('mluc.widgets.Schedule', {});
    mluc.views.Speakers = Ext.create('mluc.widgets.Speakers', {});
    mluc.views.Twitter = Ext.create('mluc.widgets.Twitter', {});

    mluc.loginLogoutButton = new Ext.button.Button({
        xtype: "button",
        text: mluc.isLoggedIn() ? "Logout" : "Login",
        handler: function(button) {
            if(mluc.isLoggedIn()) {
                mluc.logout();
                button.setText("Login");
            }
            else {
                mluc.login();
                button.setText("Logout");
            }
        },
        style: {
            position: "absolute",
            top: "10px",
            right: "10px",
        }
    });

    Ext.create('Ext.Viewport', {
        layout: {
            type: 'border',
        },
        defaults: {
        },
        items: [
            {
                region: 'north',
                height: 100,
                cls: "header",
                html: '<div id="header"><div id="logo"><a href="?event=content.home">Mark Logic</a></div></div>',
                border: false,
                layout:'absolute',
                items: [mluc.loginLogoutButton]
            },
            {
                region: 'center',
                split: true,
                height: 200,
                border: false,
                layout: {
                    type: 'border',
                    padding: 5
                },
                items: [
                    {
                        xtype: "tabpanel",
                        cls: "tab-panel",
                        region: 'center',
                        items: [mluc.views.Schedule, mluc.views.Speakers]
                    },
                    mluc.views.Twitter
                ]
            },
            {
                region: 'south',
                border: false,
                height: 40,
                html: '<div id="footer"><ul>' +
                        '<li class="none"><a href="http://www.marklogicevents.com/?event=content.privacy">Privacy Policy</a></li>' +
                        '<li><a href="http://www.marklogicevents.com/?event=content.terms">Terms of Use </a></li>' +
                        '<li>&copy; 2011 MarkLogic. All rights reserved.</li>' +
                    '</ul><br class="clear" /></div>',
            }
        ]
    });
});
