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
            {xtype: 'spacer'},
            {
                id: 'loginbutton',
                xtype: 'button',
                handler: loginLogoutUser
            }
        ]
    });

    var viewDetails = function(scheduleList, index, elementItem, eventObject) {
        toolBar.insert(0, {
            id: "backbutton",
            xtype: "button",
            ui: "back",
            text: toolBar.title,
            handler: goBack
        });
        toolBar.doLayout();

        sessionDetailsPanel = new Ext.create({
            xtype: "sessionviewer",
            scroll: "vertical"
        });
        mluc.favoritesView.add(sessionDetailsPanel);

        mluc.favoritesView.setActiveItem(sessionDetailsPanel, {
            type: "slide",
            direction: "left"
        });

        toolBar.setTitle("Info");
        var mySession = scheduleList.store.getAt(index);
        var session = Ext.getStore("SessionStore").getById(mySession.get("sessionId"));

        sessionDetailsPanel.viewSession(session);
    };

    var goBack = function() {
        mluc.favoritesView.setActiveItem(0, {
            type: "slide",
            direction: "right"
        });
        var button = toolBar.getComponent(0);
        toolBar.setTitle(button.text);
        toolBar.remove(0);

        mluc.speakersView.remove(sessionDetailsPanel);
        sessionDetailsPanel = undefined;
    };

    var updatePage = function() {
        var mySessionStore = Ext.getStore("MySessionsStore");
        var button = toolBar.getComponent("loginbutton");
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
                itemTpl: "<span class='session-track'>{track}</span><br><span class='session-title'>{title}</span><br><span class='session-room'>{location}</span>",
                cls: "session-list",
                multiSelect: false,
                singleSelect: true,
                store: "MySessionsStore",
                listeners: {
                    itemtap: viewDetails
                }
            },
        ],
        listeners: {
            beforeactivate: updatePage
        }
    });
})();
