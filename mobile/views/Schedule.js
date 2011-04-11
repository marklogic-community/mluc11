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
