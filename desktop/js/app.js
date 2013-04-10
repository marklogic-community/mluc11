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
    mluc.views.Sponsors = Ext.create('mluc.widgets.Sponsors', {});
    mluc.views.Twitter = Ext.create('mluc.widgets.Twitter', {});

    mluc.loginLogoutButton = new Ext.button.Button({
        xtype: "button",
        text: mluc.isLoggedIn() ? "Logout" : "Login via Facebook",
        handler: function(button) {
            if(mluc.isLoggedIn()) {
                mluc.logout();
                button.setText("Login via Facebook");
            }
            else {
                mluc.login();
                button.setText("Logout");
            }
        },
        style: {
            position: "absolute",
            top: "10px",
            right: "10px"
        },
        listeners: {
            render: function(t, e) {
                confSurvey = new Ext.button.Button({
                    xtype: "button",
                    text: "<b>Conference Survey</b>",
                    width: 150,
                    renderTo: "conf-survey-holder",
                    handler: function() {
                        window.location.href = 'https://www.surveymonkey.com/s/8HR89XD';
                    }
                });
            }
        }
    });


    Ext.create('Ext.Viewport', {
        layout: {
            type: 'border'
        },
        defaults: {
        },
        items: [
            {
                region: 'north',
                height: 105,
                html: '<div id="header"><a href="http://www.marklogic.com/events/marklogic-world-2013/"><img alt="mlw13" width="1150" height="90" src="/images/mlw-web-app.jpg"/></a><br/><div id="conf-survey-holder" style="display: table; margin: 0 auto; padding-top: 5px; margin-top: -19px;"></div></div>',
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
                        items: [mluc.views.Schedule, mluc.views.Speakers, mluc.views.Sponsors]
                    },
                    mluc.views.Twitter
                ]
            },
            {
                region: 'south',
                border: false,
                height: 40,
                html: '<div id="footer"><ul>' +
                        '<li class="none"><a href="http://www.marklogic.com/privacy-policy/">Privacy Policy</a></li>' +
                        '<li><a href="http://www.marklogic.com/terms-of-use/">Terms of Use </a></li>' +
                        '<li>&copy; 2013 MarkLogic. All rights reserved.</li>' +
                    '</ul><br class="clear" /></div>'
            }
        ]
    });
});
