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

    var prevTitleStack = [];

    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Speakers"
    });

    var viewSpeaker = function(speakerList, index, elementItem, eventObject) {
        toolBar.add({
            xtype: "button",
            ui: "back",
            text: toolBar.title,
            handler: goBack
        });
        toolBar.doLayout();

        var speakerData = speakerList.store.getAt(index);
        var speakersSessionStore = Ext.getStore("SpeakersSessionStore");
        speakersSessionStore.each(function(record) {
            speakersSessionStore.remove(record);
        });
        var sessionStore = Ext.getStore("SessionStore");
        sessionStore.each(function(record) {
            var speakerIds = record.get("speakerIds");
            for(var i = 0; i < speakerIds.length; i += 1) {
                if(speakerIds[i] == speakerData.data.id) {
                    speakersSessionStore.add(record.data);
                }
            }
        });

        mluc.speakersView.setActiveItem(1, {
            type: "slide",
            direction: "left"
        });

        prevTitleStack.push(toolBar.title);

        toolBar.setTitle("Details");

        mluc.speakersView.getComponent(1).getComponent(0).update(speakerData.data);
    };

    var viewSessionDetails = function(sessionList, index, elementItem, eventObject) {
        mluc.speakersView.setActiveItem(2, {
            type: "slide",
            direction: "left"
        });

        prevTitleStack.push(toolBar.title);

        var sessionData = sessionList.store.getAt(index);

        var button = toolBar.getComponent(0);
        button.setText(toolBar.title);
        toolBar.setTitle("Info");

        mluc.speakersView.getComponent(2).viewSession(sessionData);
    };
    
    var goBack = function() {
        mluc.speakersView.setActiveItem(prevTitleStack.length - 1, {
            type: "slide",
            direction: "right"
        });
        
        var lastTitle = prevTitleStack.pop();

        var button = toolBar.getComponent(0);
        toolBar.setTitle(lastTitle);

        var list;
        if(prevTitleStack.length == 0) {
            toolBar.remove(0);
            list = mluc.speakersView.getComponent(0).getComponent(1);
        }
        else {
            button.setText(prevTitleStack[prevTitleStack.length - 1]);
            list = mluc.speakersView.getComponent(1).getComponent(1);
        }

        window.setTimeout(function() {
            list.deselect(list.getSelectedRecords());
        }, 500);
    };

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

    var searchSpeakers =  function(searchInput, eventObject) {
        var store = Ext.getStore("SpeakerStore");
        var userQuery = searchInput.getValue();
        var query = {key: "name"};
        if(userQuery.length !== 0) {
            var words = userQuery.split(" ");
            var keywords = [];
            for(var i = 0; i < words.length; i += 1) {
                keywords.push({
                    "or": [
                        {"contains": {"key": "name", "string": words[i], "weight": 3, "caseSensitive": false}},
                        {"contains": {"key": "bio", "string": words[i], "weight": 2, "caseSensitive": false}},
                        {"contains": {"key": "email", "string": words[i], "weight": 1, "caseSensitive": false}},
                        {"contains": {"key": "affiliation", "string": words[i], "weight": 1, "caseSensitive": false}}
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
    };

    mluc.views.Speakers = Ext.extend(Ext.Panel, {
        title: "Speakers",
        iconCls: "speakers",
        scroll: "vertical",
        layout: "card",
        scroll: false,
        dockedItems: [toolBar],
        items: [
            {
                xtype: "panel",
                scroll: "vertical",
                items:[
                    {
                        xtype: "searchfield",
                        cls: "search-box",
                        placeHolder: "Filter speakers",
                        listeners: {
                            action: searchSpeakers
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
                            itemtap: viewSpeaker
                        },
                    }
                ]
            },
            {
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
                            itemtap: viewSessionDetails
                        }
                    },
                ]
            },
            {
                xtype: "sessionviewer",
            }
        ]
    });
})();
