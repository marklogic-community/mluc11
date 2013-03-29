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

Ext.define('mluc.widgets.Schedule', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.schedule',

    initComponent: function() {
        var me = this;
        this.detailsWindow = Ext.create('widget.detailswindow', {});

        this.dateSelector = new Ext.button.Cycle({
            width: 210,
            prependText: 'Schedule for: ',
            showText: true,
            cls: "visiblebutton",
            scope: this,
            changeHandler: this.changeScheduleDate,
            menu: {
                id: 'reading-menu',
                items: [
                    {
                        id: "0",
                        text: 'All Days',
                        checked: true
                    },
                    {
                        id: "1",
                        text: 'Tuesday, April 9th'
                    },
                    {
                        id: "2",
                        text: 'Wednesday, April 10th'
                    },
                    {
                        id: "3",
                        text: 'Thursday, April 11th'
                    }
                ]
            }
        });

        this.myScheduleButton = new Ext.button.Button({
            text: "Highlight My Favorites",
            cls: "visiblebutton",
            enableToggle: true,
            scope: this,
            handler: this.viewMySchedule
        });

        this.searchInput = new Ext.form.Text({
            width: 300,
            emptyText: 'Filter schedule',
            listeners: {
                specialkey: function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        me.searchSchedule();
                    }
                }
            }
        });

        Ext.apply(this, {
            xtype: "container",
            title: "Schedule",
            autoScroll: true,
            defaults: {bodyStyle:"padding:5px"},
            layout: {
                type: 'table',
                columns: 6,
                tableAttrs: {
                    style: {
                        width: '100%'
                    }
                }
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    this.dateSelector,
                    " ",
                    " ",
                    this.myScheduleButton,
                    "->",
                    this.searchInput,
                    " ",
                    {
                        text: "Filter",
                        cls: "visiblebutton",
                        scope: this,
                        handler: this.searchSchedule
                    },
                    " "
                ]
            }],
            listeners: {
                render: function() {
                    var me = this;
                    window.setTimeout(function() {
                        Ext.getStore("SessionStore").addListener("load", me.renderSchedule, me);
                        var speakerStore = Ext.getStore("SpeakerStore");
                        speakerStore.addListener("load", me.loadSchedule);
                        me.setLoading(true);
                        speakerStore.load();
                    }, 1);
                },
                afterlayout: function(panel) {
                    var sessions = panel.body.query("div.breakoutsession");
                    var cell;
                    var i;
                    for(i = 0; i < sessions.length; i += 1) {
                        cell = Ext.get(sessions[i]).parent("td");
                        if(!cell.hasCls("breakoutsession")) {
                            cell.addCls("breakoutsession");
                        }
                    }

                    var featured = panel.body.query("div.featured");
                    for(i = 0; i < featured.length; i += 1) {
                        cell = Ext.get(featured[i]).parent("td");
                        if(!cell.hasCls("featured")) {
                            cell.addCls("featured");
                        }
                    }
                }
            }
        });
        this.callParent(arguments);
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                var container;
                if(element.hasCls("breakoutsession") && element.hasCls("session")) {
                    container = element;
                }
                else if(element.child("div.breakoutsession")) {
                    container = Ext.get(element.child("div.breakoutsession"));
                }
                else if(element.parent("div.breakoutsession")) {
                    container = Ext.get(element.parent("div.breakoutsession"));
                }

                if(container) {
                    var sessionId = container.id.substring(container.id.indexOf("-") + 1);
                    var session = Ext.getStore("SessionStore").getById(sessionId);
                    panel.detailsWindow.viewSession(session);
                }
            });
        }
    },

    loadSchedule: function(speakerStore, records, successful) {
        Ext.getStore("SessionStore").load();
    },

    changeScheduleDate: function(button, dateItem) {
        this.searchInput.setValue("");
        this.renderSchedule(Ext.getStore("SessionStore"));
    },

    viewMySchedule: function() {
        if(!mluc.isLoggedIn()) {
            mluc.login();
        }
        else if(this.myScheduleButton.pressed) {
            this.setLoading(true);
            var mySessionStore = Ext.getStore("MySessionsStore");
            mySessionStore.addListener("load", function() {
                this.setLoading(false);
                this.renderSchedule(Ext.getStore("SessionStore"));
            }, this);
            var username = mluc.readCookie("MLUC-USERNAME");
            mySessionStore.proxy.extraParams = {q: Ext.JSON.encode({key: "username", value: username})};
            mySessionStore.load(function() {});
        }
        else {
            this.renderSchedule(Ext.getStore("SessionStore"));
        }
    },

    searchSchedule: function() {
        var store = Ext.getStore("SessionSearchStore");
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
                        {"contains": {"key": "title", "string": words[i], "weight": 3, "caseSensitive": false}},
                        {"contains": {"key": "abstract", "string": words[i], "weight": 2, "caseSensitive": false}},
                        {"contains": {"key": "speakers_string", "string": words[i], "weight": 2, "caseSensitive": false}},
                        {"contains": {"key": "track", "string": words[i], "weight": 1, "caseSensitive": false}},
                        {"contains": {"key": "location", "string": words[i], "weight": 1, "caseSensitive": false}}
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
                    this.renderSchedule(Ext.getStore("SessionStore"), undefined, undefined, true);
                }
            });
        }
        else {
            this.renderSchedule(Ext.getStore("SessionStore"));
        }
    },

    renderSchedule: function(sessionStore, records, successful, viaSearch) {
        this.setLoading(false);
        if(viaSearch === true) {
            this.dateSelector.setActiveItem(0, true);
            if(this.myScheduleButton.pressed) {
                this.myScheduleButton.toggle();
            }
        }

        var indexToDateRange = [];
        indexToDateRange[0] = {
            start: new Date("April 9, 2013 00:00:00"),
            end: new Date("April 11, 2013 23:59:59")
        };
        indexToDateRange[1] = {
            start: new Date("April 9, 2013 00:00:00"),
            end: new Date("April 9, 2013 23:59:59")
        };
        indexToDateRange[2] = {
            start: new Date("April 10, 2013 00:00:00"),
            end: new Date("April 10, 2013 23:59:59")
        };
        indexToDateRange[3] = {
            start: new Date("April 11, 2013 00:00:00"),
            end: new Date("April 11, 2013 23:59:59")
        };

        var dateIndex = this.dateSelector.getActiveItem().getId();
        var dateRange = indexToDateRange[dateIndex];
        var sessions = sessionStore.getRange();

        var panel = mluc.views.Schedule;
        panel.removeAll();

        var mySessionStore = Ext.getStore("MySessionsStore");
        var searchResultStore = Ext.getStore("SessionSearchStore");
        var lastHeaderString = "";
        var numColumnOutput = 0;
        var i;
        for(i = 0; i < sessions.length; i += 1) {
            if(!(sessions[i].get("startTime") >= dateRange.start && sessions[i].get("endTime") <= dateRange.end)) {
                continue;
            }

            var headerString = Ext.Date.format(sessions[i].get("startTime"), "l, F j");
            if(dateIndex == 0 && headerString !== lastHeaderString) {
                panel.add({
                    xtype: "container",
                    html: headerString,
                    padding: 5,
                    colspan: 6,
                    cls: "header"
                });
            }
            lastHeaderString = headerString;

            var numberOf15MinBlocks = Ext.Date.getElapsed(sessions[i].get("endTime"), sessions[i].get("startTime")) / 1000 / 900;
            var colspan = 1;
            var className = "session";
            var height = undefined;
            var addTimeslot = false;
            var speakers = "";

            if(sessions[i].get("featured")) {
                className += " featured";
            }

            if(sessions[i].get("plenary")) {
                colspan = 5;
                className += " breakoutsession plenary";
                height = Math.pow(numberOf15MinBlocks, .25) * 20;

                addTimeslot = true;
            }
            else {
                className += " breakoutsession";
                if(numColumnOutput === 0) {
                    addTimeslot = true;
                }
                numColumnOutput += 1;
                if(numColumnOutput === 5) {
                    numColumnOutput = 0;
                }

                var speakerIds = sessions[i].get("speakerIds");
                var speakerStore = Ext.getStore("SpeakerStore");
                var j;
                for(j = 0; j < speakerIds.length; j += 1) {
                    var speaker = speakerStore.getById(speakerIds[j] + "");
                    var nextSpeaker = speakerStore.getById(speakerIds[j + 1] + "");
                    var nextSpeakerAffiliation = "";
                    if(nextSpeaker) {
                        nextSpeakerAffiliation = nextSpeaker.get("affiliation");
                    }

                    if(speaker) {
                        var name = "<span class='name'>" + speaker.get("name") + "</span>";
                        var affiliation = speaker.get("affiliation");

                        speakers += name;

                        if(affiliation !== nextSpeakerAffiliation && affiliation.length > 0) {
                            var affiliation = " &ndash; <span class='affiliation'>" + affiliation + "</span>";
                            speakers += affiliation;
                        }

                        if(j !== speakerIds.length - 1) {
                            speakers += ", ";
                        }
                    }
                }
            }

            if(addTimeslot) {
                panel.add({
                    xtype: "container",
                    html: Ext.Date.format(sessions[i].get("startTime"), "g:ia") + " &ndash; " + Ext.Date.format(sessions[i].get("endTime"), "g:ia"),
                    height: height,
                    cls: "session timeslot"
                });
            }

            var content = "<span class='title x-unselectable'>" + sessions[i].get("title") + "</span><br>" + speakers;
            if(sessions[i].get("plenary") === false) {
                content = '<div class="x-unselectable">' + content + '</div>';
            }

            if(this.myScheduleButton.pressed === true) {
                if(mySessionStore.find("sessionId", sessions[i].getId()) == -1) {
                    className += " notattending";
                }
            }

            if(viaSearch === true && searchResultStore.find("id", sessions[i].getId()) === -1) {
                className += " notsearchresult";
            }

            panel.add({
                xtype: "container",
                id: "seshsum-" + sessions[i].get("id"),
                html: content,
                height: height,
                colspan: colspan,
                cls: className
            });
        }

        panel.doLayout();
    }
});
