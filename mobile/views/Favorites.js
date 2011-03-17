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
    
    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Favorites"
    });

    var viewDetails = function(scheduleList, index, elementItem, eventObject) {
        toolBar.add({
            xtype: "button",
            ui: "back",
            text: toolBar.title,
            handler: goBack
        });
        toolBar.doLayout();

        mluc.favoritesView.setActiveItem(1, {
            type: "slide",
            direction: "left"
        });

        toolBar.setTitle("Info");
        var mySession = scheduleList.store.getAt(index);
        var session = Ext.getStore("SessionStore").getById(mySession.get("sessionId"));
        console.log(session);

        mluc.favoritesView.getComponent(1).viewSession(session);
    };

    var goBack = function() {
        mluc.favoritesView.setActiveItem(0, {
            type: "slide",
            direction: "right"
        });
        var button = toolBar.getComponent(0);
        toolBar.setTitle(button.text);
        toolBar.remove(0);
    };

    var loginLogoutUser = function() {
        if(mluc.readCookie("MLUC-SESSION")) {
            mluc.eraseCookie("MLUC-SESSION");
            mluc.eraseCookie("MLUC-USERNAME");
            updatePage();
        }
        else {
            mluc.login();
        }
    };

    var updatePage = function() {
        var button = mluc.favoritesView.getComponent(0).getComponent(0);
        var username = mluc.readCookie("MLUC-USERNAME");
        if(mluc.readCookie("MLUC-SESSION") && username) {
            button.setText("Logout");

            var mySessionStore = Ext.getStore("MySessionsStore");
            mySessionStore.proxy.extraParams = {q: Ext.util.JSON.encode({key: "username", value: username})};
            mySessionStore.load(function() {});
        }
        else {
            button.setText("Login via Facebook");
        }
    };

    mluc.views.Favorites = Ext.extend(Ext.Panel, {
        title: "Favorites",
        iconCls: "favorites",
        layout: "card",
        dockedItems: [toolBar],
        items:[
            {
                xtype: "panel",
                items:[
                    {
                        xtype: "button",
                        listeners: {
                            el: {
                                click: loginLogoutUser
                            }
                        }
                    },
                    {
                        xtype: "list",
                        scroll: false,
                        grouped: true,
                        html: "Loading...",
                        emptyText: "You haven't marked yourself as attending any sessions yet.",
                        itemTpl: "<span class='session-track'>{track}</span><br><span class='session-title'>{title}</span><br><span class='session-room'>{location}</span>",
                        cls: "session-list",
                        multiSelect: false,
                        singleSelect: true,
                        store: "MySessionsStore",
                        listeners: {
                            itemtap: viewDetails
                        }
                    }
                ]
            },
            {
                xtype: "sessionviewer",
            }
        ],
        listeners: {
            beforeactivate: updatePage
            // show: updatePage
        }
    });
})();

