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

(function() {
    var sessionDetailsPanel = undefined;
    var backButtonId = Ext.id();
    var loginButtonId = Ext.id();
    var openSurveyId = Ext.id()

    var loginLogoutUser = function() {
        if(mluc.readCookie("MLUC-SESSION")) {
            mluc.eraseCookie("MLUC-SESSION");
            mluc.eraseCookie("MLUC-USERNAME");
            mluc.eraseCookie("MLUC-NAME");
            updatePage();
        }
        else {
            mluc.login();
        }
    };
    
    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Favorites",
        items: [
            {
                id: backButtonId,
                xtype: "button",
                ui: "back",
                hidden: true,
                text: "Favorites",
                handler: function() {
                    mluc.favoritesView.goBack();
                }
            },
            {xtype: 'spacer'},
            {
                id: loginButtonId,
                xtype: 'button',
                handler: loginLogoutUser
            },
            {
                id: openSurveyId,
                xtype: 'button',
                text: 'Survey',
                hidden: true,
                handler: function() {
                    surveyPanel.viewSurvey(mluc.favoritesView.viewingSession, mluc.favoritesView);
                }
            }
        ]
    });

    var surveyPanel = Ext.create({
        xtype: "sessionsurvey",
        scroll: "vertical",
        backButtonId: backButtonId,
        openButtonId: openSurveyId
    });

    var updatePage = function() {
        var mySessionStore = Ext.getStore("MySessionsStore");
        var button = toolBar.getComponent(loginButtonId);
        var username = mluc.readCookie("MLUC-USERNAME");
        if(mluc.readCookie("MLUC-SESSION") && username) {
            button.setText("Logout");

            mySessionStore.proxy.extraParams = {q: Ext.util.JSON.encode({key: "username", value: username})};
            mySessionStore.load(function() {});
        }
        else {
            button.setText("Login");
            mySessionStore.remove(mySessionStore.getRange());
        }
    };

    mluc.views.Favorites = Ext.extend(Ext.Panel, {
        title: "Favorites",
        cls: "favorites-panel",
        iconCls: "favorites",
        layout: "card",
        dockedItems: [toolBar],
        items:[
            {
                scroll: "vertical",
                xtype: "list",
                grouped: true,
                html: "Loading...",
                emptyText: "Either you haven't marked yourself as attending any sessions or you need to login first.",
                itemTpl: '<tpl if="track"><span class="session-track">{track}</span><br></tpl><span class="session-title">{title}</span><br><span class="session-room">{location}</span>',
                cls: "session-list",
                multiSelect: false,
                singleSelect: true,
                store: "MySessionsStore",
                listeners: {
                    itemtap: function(scheduleList, index, elementItem, eventObject) {
                        var mySession = scheduleList.store.getAt(index);
                        mluc.favoritesView.viewSession(mySession);
                    }
                }
            },
            surveyPanel
        ],
        listeners: {
            beforeactivate: updatePage
        },

        viewSession: function(mySession) {
            if(typeof mySession == "string") {
                mySession = Ext.getStore("MySessionsStore").getById(mySession);
            }
            var session = Ext.getStore("SessionStore").getById(mySession.get("sessionId"));

            Ext.History.add("favorite:" + mySession.getId());
            toolBar.getComponent(backButtonId).show();
            toolBar.getComponent(loginButtonId).hide();
            if(session.get("giveSurvey")) {
                toolBar.getComponent(openSurveyId).show();
            }

            sessionDetailsPanel = new Ext.create({
                xtype: "sessionviewer",
                scroll: "vertical",
                parentClass: "favorites-panel"
            });
            mluc.favoritesView.add(sessionDetailsPanel);

            mluc.favoritesView.setActiveItem(sessionDetailsPanel, {
                type: "slide",
                direction: "left"
            });

            toolBar.setTitle("Info");

            this.viewingSession = session;
            sessionDetailsPanel.viewSession(session);
        },

        goBack: function() {
            toolBar.getComponent(openSurveyId).hide();
            toolBar.getComponent(loginButtonId).show();
            var button = toolBar.getComponent(backButtonId);
            if(button.isHidden()) {
                return;
            }

            Ext.History.add("");
            mluc.favoritesView.setActiveItem(0, {
                type: "slide",
                direction: "right"
            });

            toolBar.setTitle(button.text);
            button.hide();

            mluc.favoritesView.remove(sessionDetailsPanel);
            sessionDetailsPanel = undefined;
        }
    });
})();
