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
                '<div class="speaker-bio">{bio}</div>',
                '<table><tbody>',
                    '<tr><th>Position</th><td>{position}</td></tr>',
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
