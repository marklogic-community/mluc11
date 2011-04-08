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

Ext.define('mluc.widgets.Speakers', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.speakers',

    initComponent: function() {
        var me = this;
        this.detailsWindow = Ext.create('widget.detailswindow', {});

        this.searchInput = new Ext.form.Text({
            width: 300,
            emptyText: 'Filter speakers',
            listeners: {
                specialkey: function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        me.searchSpeakers();
                    }
                }
            }
        });

        Ext.apply(this, {
            xtype: "container",
            title: "Speakers",
            autoScroll: true,
            defaults: {bodyStyle:"padding:5px"},
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    "->",
                    this.searchInput,
                    " ",
                    {
                        text: "Filter",
                        cls: "visiblebutton",
                        scope: this,
                        handler: this.searchSpeakers
                    },
                    " "
                ]
            }]
        });
        this.callParent(arguments);

        // Make sure we've got our data loaded
        var sessionStore = Ext.getStore("SessionStore");
        var speakerStore = Ext.getStore("SpeakerStore");
        if(sessionStore.getCount() === 0) {
            sessionStore.addListener("load", function() {
                if(speakerStore.getCount() === 0) {
                    speakerStore.addListener("load", function() {
                        me.renderSpeakers(speakerStore);
                    });
                }
                else {
                    me.renderSpeakers(speakerStore);
                }
            });
        }
        else if(speakerStore.getCount() === 0) {
            speakerStore.addListener("load", function() {
                me.renderSpeakers(speakerStore);
            });
        }
        else {
            me.renderSpeakers(speakerStore);
        }
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("speaker-header")) {
                    panel.showHideSpeakerDetails(element);
                }
                else if(element.hasCls("session") || element.parent("div.session")) {
                    var container = element.parent("div.session");
                    if(!container) {
                        container = element;
                    }

                    var sessionId = container.id.substring(container.id.indexOf("-") + 1);
                    var session = Ext.getStore("SessionStore").getById(sessionId);
                    panel.detailsWindow.viewSession(session);
                }
            });
        }
    },

    showHideSpeakerDetails: function(clickedOn) {
        var container = Ext.get(clickedOn.findParent("div.speaker-container"));
        if(!container) {
            return;
        }

        var speakerDetails = container.child("div.speaker-details");
        speakerDetails.setVisibilityMode(Ext.core.Element.DISPLAY);
        speakerDetails.setVisible(!speakerDetails.isVisible(), true);
    },

    searchSpeakers: function() {
        var store = Ext.getStore("SpeakerSearchStore");
        store.remove(store.getRange());
        var userQuery = this.searchInput.getValue();
        var query = {key: "title"};
        if(userQuery.length !== 0) {
            this.setLoading(true);
            var words = userQuery.split(" ");
            var keywords = [];
            var i;
            for(i = 0; i < words.length; i += 1) {
                keywords.push({
                    "or": [
                        {"contains": {"key": "name", "string": words[i], "weight": 3, "caseSensitive": false}},
                        {"contains": {"key": "bio", "string": words[i], "weight": 2, "caseSensitive": false}},
                        {"contains": {"key": "affiliation", "string": words[i], "weight": 1, "caseSensitive": false}},
                        {"contains": {"key": "email", "string": words[i], "weight": 1, "caseSensitive": false}}
                    ]
                });
            }

            query = {
                "fulltext": {
                    "and": keywords
                }
            };
            store.proxy.extraParams = {q: Ext.JSON.encode(query)};
            store.load({
                scope: this,
                callback: function() {
                    this.setLoading(false);
                    this.renderSpeakers(Ext.getStore("SpeakerStore"), undefined, undefined, true);
                }
            });
        }
        else {
            this.renderSpeakers(Ext.getStore("SpeakerStore"));
        }
    },

    renderSpeakers: function(speakerStore, records, successful, viaSearch) {
        var speakers;
        if(viaSearch) {
            speakers = Ext.getStore("SpeakerSearchStore").getRange();
        }
        else {
            speakers = speakerStore.getRange();
        }

        var className;
        var panel = mluc.views.Speakers;
        panel.removeAll();

        var sessionStore = Ext.getStore("SessionStore");

        var i;
        for(i = 0; i < speakers.length; i += 1) {
            var speaker = speakers[i];
            if(speaker.get("featured")) {
                className += " featured";
            }

            var extendedInfo = "";
            if(speaker.get("position")) {
                extendedInfo += '<div class="speaker-title">Title: ' + speaker.get("position") + '</div>';
            }
            if(speaker.get("email")) {
                extendedInfo += '<div class="speaker-email">Contact: <a href="mailto:' + speaker.get("email") + '">' + speaker.get("email") + '</a></div>';
            }
            if(speaker.get("bio")) {
                extendedInfo += '<p>' + speaker.get("bio") + '</p>';
            }

            extendedInfo += "<div class='sessions'><h3>Sessions</h3>";
            var sessions = [];
            sessionStore.each(function(record) {
                var speakerIds = record.get("speakerIds");
                var j;
                for(j = 0; j < speakerIds.length; j += 1) {
                    if(speakerIds[j] == speaker.getId()) {
                        sessions.push(record);
                    }
                }
            });

            var j;
            for(j = 0; j < sessions.length; j += 1) {
                extendedInfo += "<div class='session' id='sesh-" + sessions[j].get("id") + "'><span class='track'>" + sessions[j].get("track") + "</span><br><span class='title'>" + sessions[j].get("title") + "</span></div>";
            }
            extendedInfo += "</div>";

            panel.add({
                xtype: "container",
                html: '<div class="speaker-container">' + 
                        '<div class="speaker-header">' + speaker.get("name") + '</div>' + 
                        '<div class="speaker-details" style="display: none">' + extendedInfo + '</div>' +
                    '</div>',
                cls: className
            });
        }
    }
});
