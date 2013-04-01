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


var sessionSurvey = Ext.extend(Ext.form.FormPanel, {
    constructor: function(config) {
        var me = this;

        this.ids = {};
        this.ids.title = Ext.id();
        this.ids.speakerQuality = Ext.id();
        this.ids.sessionQuality = Ext.id();
        this.ids.comments = Ext.id();
        this.ids.parentBackId = config.backButtonId;
        this.ids.parentOpenId = config.openButtonId;
        this.ids.id = Ext.id();

        config.id = this.ids.id;
        var buttons = [
            {text: 'Poor',  data: {value: 1}},
            {text: 'Fair', data: {value: 2}},
            {text: 'Average',  data: {value: 3}},
            {text: 'Good',  data: {value: 4}},
            {text: 'Great',  data: {value: 5}}
        ]
        config.items = [
            {
                xtype: "panel",
                cls: "survey-session-title",
                id: this.ids.title,
                tpl: new Ext.XTemplate(
                    '<h2>{title}</h2>'
                )
            },
            {
                xtype: "segmentedbutton",
                id: this.ids.speakerQuality,
                html: '<div class="seglabel">Effectiveness of speaker</div>',
                items: buttons
            },
            {
                xtype: "segmentedbutton",
                id: this.ids.sessionQuality,
                html: '<div class="seglabel">Quality of content</div>',
                items: buttons
            },
            {
                xtype: "textareafield",
                id: this.ids.comments,
                label: "Comments"
            }
        ];

        sessionSurvey.superclass.constructor.call(this, config);
    },
    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
            });
        }
    },

    viewSurvey: function(session, layoutManager) {
        this.session = session
        this.layoutManager = layoutManager;
        this.parentToolbar = this.layoutManager.dockedItems.items[0];
        this.getComponent(this.ids.title).update(session.data);
        this.getComponent(this.ids.speakerQuality).setPressed(this.getComponent(this.ids.speakerQuality).getPressed(), false, true);
        this.getComponent(this.ids.sessionQuality).setPressed(this.getComponent(this.ids.sessionQuality).getPressed(), false, true);
        this.getComponent(this.ids.comments).setValue("");
        this.lastActiveItem = layoutManager.getActiveItem();

        if(this.parentToolbar !== undefined) {
            this.lastTitle = this.parentToolbar.title;
            this.parentToolbar.setTitle("Survey");
            this.parentToolbar.getComponent(this.ids.parentBackId).hide();
            this.parentToolbar.getComponent(this.ids.parentOpenId).hide();
            this.ids.cancelId = Ext.id();
            this.ids.submitId = Ext.id();
            this.parentToolbar.insert(0, {
                id: this.ids.cancelId,
                text: 'Cancel',
                xtype: 'button',
                scope: this,
                handler: this.close
            });
            this.parentToolbar.add({
                id: this.ids.submitId,
                text: 'Submit',
                xtype: 'button',
                scope: this,
                handler: this.submit
            });
            this.parentToolbar.doLayout();
        }
        this.layoutManager.setActiveItem(this.ids.id, {
            type: "slide",
            direction: "up"
        });
    },

    submit: function() {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        if(username) {
            var speakerQ = this.getComponent(this.ids.speakerQuality).getPressed().data.value;
            var sessionQ = this.getComponent(this.ids.sessionQuality).getPressed().data.value;
            var comments = this.getComponent(this.ids.comments).getValue();
            var survey = Ext.ModelMgr.create({id: id, forSession: this.session.getId(), userId: username, speakerQuality: speakerQ, sessionQuality: sessionQ, sessionComments: comments, dateAdded: new Date()}, 'Survey');
            me.setLoading(true);
            survey.save({
                success: function() {
                    me.setLoading(false);
                    me.close()
                }
            });
        }
    },

    close: function() {
        if(this.parentToolbar !== undefined) {
            this.parentToolbar.getComponent(this.ids.parentBackId).show();
            this.parentToolbar.getComponent(this.ids.parentOpenId).show();
            this.parentToolbar.remove(this.ids.cancelId);
            this.parentToolbar.remove(this.ids.submitId);
            this.parentToolbar.setTitle(this.lastTitle);
        }
        if(this.lastActiveItem !== undefined) {
            this.layoutManager.setActiveItem(this.lastActiveItem, {
                type: "slide",
                direction: "down"
            });
        }
    }
});

Ext.reg('sessionsurvey', sessionSurvey);
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

    mluc.views.loginLink = function() {
        if(mluc.readCookie("MLUC-USERNAME") && mluc.readCookie("MLUC-SESSION")) {
            alert("You're already logged in");
        }
        else {
            mluc.login();
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
                emptyText: "<div class='emptyfavorites'>Either you haven't marked yourself as attending any sessions or you need to <a href='#' onclick='mluc.views.loginLink(); return false'>login</a> first.</div>",
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
            mluc.favoritesView.doLayout();
        },

        goBack: function() {
            toolBar.getComponent(openSurveyId).hide();
            toolBar.getComponent(loginButtonId).show();
            var button = toolBar.getComponent(backButtonId);
            if(button.isHidden()) {
                return;
            }

            Ext.History.add("");
            if(Ext.is.Android) {
                window.scrollTo(0, window.innerHeight);
            } 
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
    var openSurveyId = Ext.id()
    
    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Schedule",
        items: [
            {
                id: backButtonId,
                xtype: "button",
                ui: "back",
                text: "Schedule",
                hidden: true,
                handler: function() {
                    mluc.scheduleView.goBack();
                }
            },
            {xtype: 'spacer'},
            {
                id: openSurveyId,
                xtype: 'button',
                text: 'Survey',
                hidden: true,
                handler: function() {
                    surveyPanel.viewSurvey(mluc.scheduleView.viewingSession, mluc.scheduleView);
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

    var searchTimmer = undefined;
    var searchSchedule =  function(searchInput, eventObject) {
        if(searchTimmer !== undefined) {
            clearTimeout(searchTimmer);
        }
        searchTimmer = setTimeout(function() {
            var store = Ext.getStore("SessionStore");
            var userQuery = searchInput.getValue();
            var query = {key: "title"};
            if(userQuery.length !== 0) {
                var words = userQuery.split(" ");
                var keywords = [];
                for(var i = 0; i < words.length; i += 1) {
                    var wildcarded = false;
                    if(i === words.length - 1) {
                        wildcarded = true;
                        words[i] += "*";
                    }
                    keywords.push({
                        "or": [
                            {"contains": {"key": "title", "string": words[i], "weight": 3, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "abstract", "string": words[i], "weight": 2, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "speakers_string", "string": words[i], "weight": 2, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "track", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "location", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}}
                        ]
                    });
                }

                query = {
                    "fulltext": {
                        "and": keywords
                    }
                }
            }
            store.proxy.extraParams = {q: Ext.util.JSON.encode(query)};
            store.load(function() {});
        }, 1000);
    };

    mluc.views.Schedule = Ext.extend(Ext.Panel, {
        title: "Schedule",
        iconCls: "schedule",
        cls: "schedule-panel",
        layout: "card",
        scroll: false,
        dockedItems: [toolBar],
        items: [
            {
                xtype: "panel",
                scroll: "vertical",
                items:[
                    {
                        scroll: false,
                        xtype: "searchfield",
                        cls: "search-box",
                        placeHolder: "Filter sessions",
                        listeners: {
                            keyup: searchSchedule
                        }
                    },
                    {
                        xtype: "list",
                        scroll: false,
                        grouped: true,
                        html: "Loading...",
                        emptyText: "No Sessions",
                        itemTpl: '<tpl if="featured"><span class="featured"></span></tpl><tpl if="track"><span class="session-track">{track}</span><br></tpl><span class="session-title">{title}</span><br><span class="session-room">{location}</span>',
                        cls: "session-list",
                        multiSelect: false,
                        singleSelect: false,
                        store: "SessionStore",
                        listeners: {
                            itemtap: function(scheduleList, index) {
                                var session = scheduleList.store.getAt(index);
                                mluc.scheduleView.viewSession(session);
                            },
                            render: function(sessionList) {
                                window.setTimeout(function() {
                                    var featured = sessionList.el.query("span.featured");
                                    for(var i = 0; i < featured.length; i += 1) {
                                        var cell = Ext.get(featured[i]).parent("div.x-list-item");
                                        if(!cell.hasCls("featured")) {
                                            cell.addCls("featured");
                                        }
                                    }
                                }, 1000);
                            }
                        }
                    },
                ]
            },
            surveyPanel
        ],
        viewSession: function(session) {
            if(typeof session == "string") {
                session = Ext.getStore("SessionStore").getById(session);
            }
            this.viewingSession = session;

            Ext.History.add("session:" + session.getId());
            toolBar.getComponent(backButtonId).show();
            if(session.get("giveSurvey")) {
                toolBar.getComponent(openSurveyId).show();
            }

            sessionDetailsPanel = new Ext.create({
                xtype: "sessionviewer",
                scroll: "vertical",
                parentClass: "schedule-panel"
            });
            mluc.scheduleView.add(sessionDetailsPanel);

            mluc.scheduleView.setActiveItem(sessionDetailsPanel, {
                type: "slide",
                direction: "left"
            });

            toolBar.setTitle("Info");

            sessionDetailsPanel.viewSession(session);
            mluc.scheduleView.doLayout();
        },
    
        goBack: function() {
            toolBar.getComponent(openSurveyId).hide();
            var button = toolBar.getComponent(backButtonId);
            if(button.isHidden()) {
                return;
            }

            Ext.History.add("");
            if(Ext.is.Android) {
                window.scrollTo(0, window.innerHeight);
            } 
            mluc.scheduleView.setActiveItem(0, {
                type: "slide",
                direction: "right"
            });

            toolBar.setTitle(button.text);
            button.hide();

            window.setTimeout(function() {
                var scheduleList = mluc.scheduleView.getComponent(0).getComponent(1);
                scheduleList.deselect(scheduleList.getSelectedRecords());
                if(sessionDetailsPanel !== undefined) {
                    mluc.scheduleView.remove(sessionDetailsPanel);
                    sessionDetailsPanel = undefined;
                }
            }, 500);
        }
    });
})();
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


var sessionViewer = Ext.extend(Ext.Panel, {
    constructor: function(config) {
        var me = this;
        this.store = new Ext.data.Store({
            model: "Attendee",
            proxy: {
                type: "ajax",
                url: "/data/jsonquery.xqy",
                reader: {
                    type: "json",
                    root: "results",
                    totalProperty: "count",
                }
            },
            sorters: [
                {
                    property: "dateAdded",
                    direction: "DESC"
                }
            ]
        });

        config.items = [
            {
                xtype: "panel",
                cls: "session-details grouped-container",
                tpl: new Ext.XTemplate(
                    '<h2 class="group-name">Session Information</h2>',
                    '<div class="session-information section kv-layout">',
                        '<div class="session-title">{title}</div>',
                        '<table><tbody>',
                            '<tr><th>Day</th><td>{startTime:date("l")}</td></tr>',
                            '<tr><th>Time</th><td>{startTime:date("g:ia")} &ndash; {endTime:date("g:ia")}</td></tr>',
                            '<tpl if="location.length &gt; 0"><tr><th>Room</th><td>{location}</td></tr></tpl>',
                            '<tpl if="track.length &gt; 0"><tr><th>Track</th><td>{track}</td></tr></tpl>',
                        '</tbody></table>',
                    '</div>',
                    '<tpl if="abstract.length &gt; 0">',
                        '<h2 class="group-name">Abstract</h2>',
                        '<div class="session-abstract section">{abstract}</div>',
                    '</tpl>',
                    '{[this.getSpeakers(values.speakerIds)]}',
                    {
                        getSpeakers: function(speakerIds) {
                            var speakers = "";
                            var speakerStore = Ext.getStore("SpeakerStore");
                            
                            if(speakerIds.length === 0) {
                                return "";
                            }

                            for(var i = 0; i < speakerIds.length; i += 1) {
                                var speaker = speakerStore.getById(speakerIds[i] + "").data;
                                var className = "session-presenter";
                                if(i < speakerIds.length - 1) {
                                    className += " bordered";
                                }
                                speakers += '<div class="' + className + '"><span class="presenter-name">' + speaker.name + '</span><br><span class="presenter-affiliation">' + speaker.affiliation + '</span></div>';
                            }

                            return '<h2 class="group-name">Presenter</h2><div class="session-presenters section">' + speakers + '</div>';
                        }
                    }
                )
            },
            {
                xtype: "panel",
                cls: "attend-login grouped-container",
                tpl: new Ext.XTemplate(
                    '<tpl if="this.isLoggedIn() == true">',
                        '<tpl if="this.isAttending() == true"><table class="attending"></tpl>',
                        '<tpl if="this.isAttending() == false"><table class="attending" style="display: none"></tpl>',
                        '<tbody><tr>',
                            '<td class="icon"><img src="http://graph.facebook.com/{[ this.getFBIdFromUsername() ]}/picture"/></td>',
                            '<td>',
                                '<span class="header">This session is in your favorites.</span>',
                                '<div class="inputs"><span class="session-dont-attend x-button x-button-normal"><span class="x-button-label">Remove from favorites</span></span></div></div>',
                            '</td>',
                        '</tr></tbody></table>',

                        '<tpl if="this.isAttending() == false"><table class="notattending"></tpl>',
                        '<tpl if="this.isAttending() == true"><table class="notattending" style="display: none"></tpl>',
                        '<tbody><tr>',
                            '<td class="icon"><img src="http://graph.facebook.com/{[ this.getFBIdFromUsername() ]}/picture"/></td>',
                            '<td>',
                                '<span class="header">Look like an interesting session?</span> Optionally tell everyone why:',
                                '<div class="inputs"><input type="text" class="favorite-reason"/><span class="session-attend x-button x-button-normal"><span class="x-button-label">Add to favorites</span></span></div>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                    '<tpl if="this.isLoggedIn() == false">',
                        '<table><tbody><tr>',
                        '<td class="icon"><img src="/images/unknown.gif"/></td>',
                        '<td><span class="header">Look like an interesting session?</span><div class="inputs"><span class="session-login x-button x-button-normal"><em><span class="x-button-label">Login to add to favorites</span></em></span></div></td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                    {
                        isLoggedIn: function() {
                            if(mluc.readCookie("MLUC-USERNAME") && mluc.readCookie("MLUC-SESSION")) {
                                return true;
                            }
                            return false;
                        },
                        isAttending: function() {
                            var username = mluc.readCookie("MLUC-USERNAME");
                            var attending = false;
                            if(me.store.findExact("username", username) >= 0) {
                                attending = true;
                            }
                            return attending;
                        },
                        getFBIdFromUsername: function() {
                            var username = mluc.readCookie("MLUC-USERNAME");
                            return username.substring(username.indexOf("_") + 1);
                        }
                    }
                )
            },
            {
                xtype: "dataview",
                store: this.store,
                scroll: false,
                tpl: new Ext.XTemplate(
                    '<div class="grouped-container"><h2 class="group-name">Attendance</h2>',
                    '<div class="attendance-list section"><tpl for=".">',
                        '<tpl if="xindex &lt; 51">',
                            '<table class="person"><tbody><tr>',
                                '<td><a href="http://www.facebook.com/profile.php?id={[ this.getFBIdFromUsername(values.username) ]}" target="_blank">',
                                    '<img src="http://graph.facebook.com/{[ this.getFBIdFromUsername(values.username) ]}/picture"/>',
                                '</a></td>',
                                '<td>',
                                    '<a href="http://www.facebook.com/profile.php?id={[ this.getFBIdFromUsername(values.username) ]}" target="_blank">{realname}</a>',
                                    '<p class="reason">{reason}</p>',
                                '</td>',
                            '</tr></tbody></table>',
                        '</tpl>',
                        '<tpl if="xindex == 10 && xcount &gt; 10">',
                            '<div class="showall"><span class="showall-button x-button x-button-normal"><em>',
                                '<tpl if="xcount &gt; 50"><span class="x-button-label">See the latest 50 attendees</span></tpl>',
                                '<tpl if="xcount &lt; 51"><span class="x-button-label">See all {[xcount]} attendees</span></tpl>',
                            '<div class="fulllist">',
                        '</tpl>',
                        '<tpl if="xindex == xcount && xcount &gt; 10">',
                            '</div>',
                        '</tpl>',
                    '</tpl></div></div>',
                    {
                        getFBIdFromUsername: function(username) {
                            return username.substring(username.indexOf("_") + 1);
                        }
                    }
                ),
                autoHeight:true,
                multiSelect: false,
                overItmClass:'x-view-over',
                itemSelector:'table.person',
                emptyText: ''
            }
        ];

        sessionViewer.superclass.constructor.call(this, config);
    },
    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("session-dont-attend") || element.parent(".session-dont-attend")) {
                    panel.unattend();
                }
                else if(element.hasCls("session-attend") || element.parent(".session-attend")) {
                    var inputs = element.parent("div.inputs");
                    var reason = inputs.child("input.favorite-reason");
                    panel.attend(reason.dom.value);
                }
                else if(element.hasCls("session-login") || element.parent(".session-login")) {
                    mluc.createCookie("MLUC-VIEWING", Ext.util.JSON.encode({session: panel.session.get("id")}), 1);
                    mluc.login();
                }
                else if(element.hasCls("showall-button") || element.parent(".showall-button")) {
                    var showallContainer = Ext.get(element.parent("div.showall"));
                    showallContainer.setVisible(Element.DISPLAY);
                    showallContainer.hide(true);
                    showallContainer.next("div.fulllist").dom.style.display = "block";
                }
            });
        }
    },

    viewSession: function(session) {
        var me = this;
        if(session !== undefined) {
            this.session = session
            this.store.proxy.extraParams = {q: Ext.util.JSON.encode({key: "sessionId", value: this.session.getId()})};
            this.store.load(function(records) {
                me.getComponent(0).update(me.session.data);
                me.getComponent(1).update(me.session.data);
            });
        }
        else {
            me.getComponent(0).update(me.session.data);
            me.getComponent(1).update(me.session.data);
        }
    },

    attend: function(reason) {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        var realname = mluc.readCookie("MLUC-NAME").replace("+", " ");
        if(username) {
            var mySession = Ext.ModelMgr.create({id: id, sessionId: this.session.getId(), username: username, realname: realname, reason: reason, dateAdded: new Date()}, 'Attendee');
            this.store.insert(0, [mySession]);
            me.setLoading(true);
            mySession.save({
                success: function() {
                    me.setLoading(false);
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.attending").style.display = "block";
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.notattending").style.display = "none";
                }
            });
        }
    },

    unattend: function() {
        var me = this;
        var username = mluc.readCookie("MLUC-USERNAME");
        var index = this.store.findExact("username", username);

        if(username && index >= 0) {
            var record = this.store.getAt(index);

            var mySessionStore = Ext.getStore("MySessionsStore");
            var mySessionIndex = mySessionStore.findExact("sessionId", this.session.getId());
            mySessionStore.removeAt(mySessionIndex);

            this.store.remove(record);

            var operation = new Ext.data.Operation({records: [record], action: "destroy"});
        
            var callback = function(operation) {
                if(operation.wasSuccessful()) {
                    me.setLoading(false);
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.attending").style.display = "none";
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.notattending").style.display = "block";
                }
            };
        
            me.setLoading(true);
            record.getProxy().destroy(operation, callback, record);
        }
    }
});

Ext.reg('sessionviewer', sessionViewer);
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
    var openSurveyId = Ext.id()

    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Speakers",
        items: [
            {
                id: backButtonId,
                xtype: "button",
                ui: "back",
                hidden: true,
                handler: function() {
                    mluc.speakersView.goBack();
                }
            },
            {xtype: 'spacer'},
            {
                id: openSurveyId,
                xtype: 'button',
                text: 'Survey',
                hidden: true,
                handler: function() {
                    surveyPanel.viewSurvey(mluc.speakersView.viewingSession, mluc.speakersView);
                }
            }
        ]
    });

    var speakerInfoTemplate = new Ext.XTemplate(
        '<div class="speaker-details grouped-container">',
            '<div class="speaker-header">',
                '<span class="speaker-name">{name}</span><br>',
                '<span class="speaker-affiliation">{affiliation}</span>',
            '</div>',
            '<div class="speaker-information section kv-layout">',
                '<tpl if="bio"><div class="speaker-bio">{bio}</div></tpl>',
                '<table><tbody>',
                    '<tr><th>Position</th><td>{position}</td></tr>',
                    '<tr><th>Affiliation</th><td>{affiliation}</td></tr>',
                    '<tr><th>Email</th><td>{email}</td></tr>',
                '</tbody></table>',
            '</div>',
            '<h2 class="group-name">Sessions</h2>',
        '</div>'
    );


    var surveyPanel = Ext.create({
        xtype: "sessionsurvey",
        scroll: "vertical",
        backButtonId: backButtonId,
        openButtonId: openSurveyId
    });

    var searchTimmer = undefined;
    var searchSpeakers =  function(searchInput, eventObject) {
        if(searchTimmer !== undefined) {
            clearTimeout(searchTimmer);
        }
        searchTimmer = setTimeout(function() {
            var store = Ext.getStore("SpeakerStore");
            var userQuery = searchInput.getValue();
            var query = {key: "name"};
            if(userQuery.length !== 0) {
                var words = userQuery.split(" ");
                var keywords = [];
                for(var i = 0; i < words.length; i += 1) {
                    var wildcarded = false;
                    if(i === words.length - 1) {
                        wildcarded = true;
                        words[i] += "*";
                    }
                    keywords.push({
                        "or": [
                            {"contains": {"key": "name", "string": words[i], "weight": 3, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "bio", "string": words[i], "weight": 2, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "email", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}},
                            {"contains": {"key": "affiliation", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}}
                        ]
                    });
                }

                query = {
                    "fulltext": {
                        "and": keywords
                    }
                }
            }
            store.proxy.extraParams = {q: Ext.util.JSON.encode(query)};
            store.load(function() {});
        }, 1000);
    };

    mluc.views.Speakers = Ext.extend(Ext.Panel, {
        title: "Speakers",
        iconCls: "speakers",
        cls: "speakers-panel",
        scroll: "vertical",
        layout: "card",
        scroll: false,
        dockedItems: [toolBar],
        items: [
            {
                id: "speaker-list-panel",
                xtype: "panel",
                scroll: "vertical",
                items:[
                    {
                        xtype: "searchfield",
                        cls: "search-box",
                        placeHolder: "Filter speakers",
                        listeners: {
                            keyup: searchSpeakers
                        }
                    },
                    {
                        xtype: "list",
                        scroll: false,
                        grouped: true,
                        html: "Loading...",
                        emptyText: "No Speakers",
                        itemTpl: "<span class='speaker-name'>{name}</span><br><span class='speaker-affiliation'>{affiliation}</span>",
                        cls: "speaker-list",
                        multiSelect: false,
                        singleSelect: true,
                        store: "SpeakerStore",
                        listeners: {
                            itemtap: function(speakerList, index) {
                                var speaker = speakerList.store.getAt(index);
                                mluc.speakersView.viewSpeaker(speaker);
                            },
                        },
                    }
                ]
            },
            {
                id: "speaker-details-panel",
                xtype: "panel",
                scroll: "vertical",
                items: [
                    {
                        xtype: "panel",
                        scroll: false,
                        tpl: speakerInfoTemplate,
                    },
                    {
                        xtype: "list",
                        scroll: false,
                        emptyText: "No Sessions",
                        itemTpl: "<span class='session-track'>{track}</span><br><span class='session-title'>{title}</span><br><span class='session-room'>{location}</span>",
                        cls: "speaker-session-list",
                        multiSelect: false,
                        singleSelect: true,
                        store: "SpeakersSessionStore",
                        listeners: {
                            itemtap:  function(sessionList, index, elementItem, eventObject) {
                                var session = sessionList.store.getAt(index);
                                mluc.speakersView.viewSession(session);
                            }
                        }
                    },
                ]
            },
            surveyPanel
        ],

        viewSpeaker: function(speaker) {
            if(typeof speaker == "string") {
                speaker = Ext.getStore("SpeakerStore").getById(speaker);
            }
            this.viewingSpeaker = speaker;

            Ext.History.add("speaker:" + speaker.getId());
            toolBar.getComponent(backButtonId).show();
            toolBar.getComponent(backButtonId).setText(toolBar.title);

            var speakersSessionStore = Ext.getStore("SpeakersSessionStore");
            speakersSessionStore.each(function(record) {
                speakersSessionStore.remove(record);
            });
            var sessionStore = Ext.getStore("SessionStore");
            sessionStore.each(function(record) {
                var speakerIds = record.get("speakerIds");
                for(var i = 0; i < speakerIds.length; i += 1) {
                    if(speakerIds[i] == speaker.data.id) {
                        speakersSessionStore.add(record.data);
                    }
                }
            });

            mluc.speakersView.setActiveItem(1, {
                type: "slide",
                direction: "left"
            });

            toolBar.setTitle("Details");

            mluc.speakersView.getComponent(1).getComponent(0).update(speaker.data);
            mluc.speakersView.doLayout();
        },

        viewSession: function(session) {
            if(typeof session == "string") {
                session = Ext.getStore("SessionStore").getById(session);
            }
            this.viewingSession = session;

            if(session.get("giveSurvey")) {
                toolBar.getComponent(openSurveyId).show();
            }

            Ext.History.add("speakersession:" + session.getId());
            sessionDetailsPanel = new Ext.create({
                xtype: "sessionviewer",
                scroll: "vertical",
                parentClass: "speakers-panel"
            });
            mluc.speakersView.add(sessionDetailsPanel);

            mluc.speakersView.setActiveItem(sessionDetailsPanel, {
                type: "slide",
                direction: "left"
            });

            var button = toolBar.getComponent(backButtonId);
            button.setText("Details");
            toolBar.setTitle("Info");

            sessionDetailsPanel.viewSession(session);
            mluc.speakersView.doLayout();
        },
    
        goBack: function() {
            var activePanel = mluc.speakersView.getActiveItem();
            if(activePanel.id === "speaker-list-panel") {
                // Nowhere to go back to so just return
                return;
            }

            var list;
            if(activePanel.id === "speaker-details-panel") {
                Ext.History.add("");
                if(Ext.is.Android) {
                    window.scrollTo(0, window.innerHeight);
                } 
                toolBar.setTitle("Speakers");
                toolBar.getComponent(backButtonId).hide();
                list = mluc.speakersView.getComponent(0).getComponent(1);

                mluc.speakersView.setActiveItem(0, {
                    type: "slide",
                    direction: "right"
                });
            }
            else {
                Ext.History.add("speaker:" + mluc.speakersView.viewingSpeaker.getId());
                toolBar.setTitle("Details");
                toolBar.getComponent(openSurveyId).hide();
                toolBar.getComponent(backButtonId).setText("Speakers");
                list = mluc.speakersView.getComponent(1).getComponent(1);

                mluc.speakersView.setActiveItem(1, {
                    type: "slide",
                    direction: "right"
                });
            }

            window.setTimeout(function() {
                list.deselect(list.getSelectedRecords());
                if(sessionDetailsPanel !== undefined) {
                    mluc.speakersView.remove(sessionDetailsPanel);
                    sessionDetailsPanel = undefined;
                }
            }, 500);
        }
    });
})();
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
        title: "Sponsors"
    });

    var sponsorDetailTemplate = new Ext.XTemplate(
        '<div class="sponsor-details grouped-container">',
            '<h2 class="group-name">{level} Sponsor</h2>',
            '<div class="sponsor-information section kv-layout">',
                '<div class="sponsor-image"><img src="{imageURL}"/></div>',
                '<table><tbody>',
                    '<tr><th>Company</th><td>{company}</td></tr>',
                    '<tr><th>Website</th><td><a href="{websiteFull}" target="_new">{websitePretty}</a></td></tr>',
                    '<tpl if="email"><tr><th>Email</th><td><a href="mailto:{email}">{email}</a></td></tr></tpl>',
                    '<tpl if="phone"><tr><th>Phone</th><td><a href="tel:{phone}">{phone}</a></td></tr></tpl>',
                    '<tr><td colspan="2" class="about">{info}</td></tr>',
                '</tbody></table>',
            '</div>',
        '</div>'
    );

    mluc.views.Sponsors = Ext.extend(Ext.Panel, {
        title: "Sponsors",
        iconCls: "sponsors",
        scroll: "vertical",
        layout: "card",
        dockedItems: [toolBar],
        items: [
            {
                xtype: "list",
                grouped: true,
                html: "Loading...",
                emptyText: "No Sponsors",
                itemTpl: "<span class='sponsor-name'>{company}</span>",
                cls: "sponsor-list",
                multiSelect: false,
                singleSelect: true,
                store: "SponsorsStore",
                listeners: {
                    itemtap: function(sponsorList, index, elementItem, eventObject) {
                        var sponsor = sponsorList.store.getAt(index);
                        mluc.sponsorView.viewSponsor(sponsor);
                    }
                }
            },
            {
                xtype: "panel",
                tpl: sponsorDetailTemplate,
                scroll: "vertical",
            }
        ],

        viewSponsor: function(sponsor) {
            if(typeof sponsor == "string") {
                sponsor = Ext.getStore("SponsorsStore").getById(parseInt(sponsor));
            }

            Ext.History.add("sponsor:" + sponsor.getId());
            toolBar.add({
                xtype: "button",
                ui: "back",
                text: toolBar.title,
                handler: this.goBack
            });
            toolBar.doLayout();

            mluc.sponsorView.setActiveItem(1, {
                type: "slide",
                direction: "left"
            });

            toolBar.setTitle("Info");

            mluc.sponsorView.getComponent(1).update(sponsor.data);
        },
    
        goBack: function() {
            var button = toolBar.getComponent(0);
            if(!button) {
                return;
            }

            Ext.History.add("");
            if(Ext.is.Android) {
                window.scrollTo(0, window.innerHeight);
            } 
            mluc.sponsorView.setActiveItem(0, {
                type: "slide",
                direction: "right"
            });
            toolBar.setTitle(button.text);
            toolBar.remove(0);
        }
    });
})();
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
        title: "Twitter"
    });

    var tweetTemplate = new Ext.XTemplate(
        '<div class="tweets">',
            '<tpl for=".">',
                '<div class="tweet">',
                    '<a href="http://twitter.com/{from_user}" target="_blank"><img src="{profile_image_url}"/></a>',
                    '<div class="text"><span class="username"><a href="http://twitter.com/{from_user}" target="_blank">{from_user}</a></span><br>',
                    '{[this.linkifyText(values.text)]}<br><span class="date">{[mluc.friendlyDateSince(values.created_at_date)]}</span></div>',
                '</div>',
            '</tpl>',
        '</div>',
        {
            linkifyText: function(text) {
                var urlRegex = /(http\:\/\/|https\:\/\/)+(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;
                text = text.replace(urlRegex, function(value) {
                    return '<a href="' + value + '" target="_blank">' + value + '</a>';
                });

                var hashRegex = /( |^)(#|@)\w+/g;
                text = text.replace(hashRegex, function(value) {
                    if(value.substring(0, 1) === " ") {
                        value = value.substring(1);
                    }

                    if(value.substring(0, 1) === "#") {
                        return ' <a class="hashref" href="http://twitter.com/search?q=%23' + value.substring(1) + '" target="_blank">' + value + '</a>';
                    }
                    else {
                        return ' <a class="userref" href="http://twitter.com/' + value.substring(1) + '" target="_blank">' + value + '</a>';
                    }
                });

                return text;
            }
        }
    );

    var fetchTweets = function(twitterPanel) {
        twitterPanel.update('');
        twitterPanel.setLoading(true, true);

        Ext.util.JSONP.request({
            url: "http://search.twitter.com/search.json",
            callbackKey: "callback",
            params: {                    
                q: "marklogic OR mlw13",
                rpp: 100
            },

            callback: function(result) {
                if(result.results !== undefined) {
                    for(var i = 0; i < result.results.length; i += 1) {
                        var curResult = result.results[i];
                        curResult.created_at_date = Date.parseDate(curResult.created_at, "D, d M Y G:i:s O");
                    }

                    twitterPanel.getComponent(0).update(result.results);
                    // panel.scroller.scrollTo({x: 0, y: 0});                     
                }
                else {
                    alert("There was an error fetching the latest Tweets");
                }

                twitterPanel.setLoading(false);
            }
        });
    };

    mluc.views.Twitter = Ext.extend(Ext.Panel, {
        title: "Twitter",
        iconCls: "twitter",
        // scroll: "vertical",
        layout: "card",
        dockedItems: [toolBar],
        items: [
            {
                xtype: "panel",
                tpl: tweetTemplate,
                scroll: "vertical",
            }
        ],
        listeners: {
            show: fetchTweets
        }
    });
})();
