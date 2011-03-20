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
                        text: 'Tuesday, April 26th'
                    },
                    {
                        id: "2",
                        text: 'Wednesday, April 27th'
                    },
                    {
                        id: "3",
                        text: 'Thursday, April 28th'
                    },
                    {
                        id: "4",
                        text: 'Friday, April 29th'
                    }
                ]
            }
        });

        this.myScheduleButton = new Ext.button.Button({
            text: "Highlight My Schedule",
            cls: "visiblebutton",
            enableToggle: true,
            scope: this,
            handler: this.viewMySchedule
        });

        this.searchInput = new Ext.form.Text({
            width: 300,
            emptyText: 'Search schedule',
        });

        Ext.getStore("SessionStore").addListener("load", this.renderSchedule, this);
        var speakerStore = Ext.getStore("SpeakerStore");
        speakerStore.addListener("load", this.loadSchedule);
        speakerStore.load();

        Ext.apply(this, {
            xtype: "container",
            region: 'center',
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
                    "-",
                    this.myScheduleButton,
                    "->",
                    this.searchInput,
                    " ",
                    {
                        text: "Search",
                        cls: "visiblebutton",
                        scope: this,
                        handler: this.searchSchedule
                    },
                    " "
                ]
            }]
        });
        this.callParent(arguments);
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                var container = undefined;
                if(element.hasCls("session-summary")) {
                    container = element;
                }
                else if(element.child("div.session-summary")) {
                    container = Ext.get(element.child("div.session-summary"));
                }
                else if(element.parent("div.session-summary")) {
                    container = Ext.get(element.parent("div.session-summary"));
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
        this.renderSchedule(Ext.getStore("SessionStore"));
    },

    viewMySchedule: function() {
        var username = mluc.readCookie("MLUC-USERNAME");
        if(this.myScheduleButton.pressed && username && username.length > 0) {
            this.setLoading(true);
            var mySessionStore = Ext.getStore("MySessionsStore");
            mySessionStore.addListener("load", function() {
                this.setLoading(false);
                this.renderSchedule(Ext.getStore("SessionStore"));
            }, this);
            mySessionStore.proxy.extraParams = {q: Ext.JSON.encode({key: "username", value: username})};
            mySessionStore.load(function() {});
        }
        else {
            this.renderSchedule(Ext.getStore("SessionStore"));
        }
    },

    searchSchedule: function() {
        this.setLoading(true);
        var store = Ext.getStore("SessionSearchStore");
        store.remove(store.getRange());
        var userQuery = this.searchInput.getValue();
        var query = {key: "title"};
        if(userQuery.length !== 0) {
            var words = userQuery.split(" ");
            var keywords = [];
            for(var i = 0; i < words.length; i += 1) {
                keywords.push({
                    "or": [
                        {"contains": {"key": "title", "string": words[i], "weight": 3, "caseSensitive": false}},
                        {"contains": {"key": "abstract", "string": words[i], "weight": 2, "caseSensitive": false}},
                        {"contains": {"key": "track", "string": words[i], "weight": 1, "caseSensitive": false}},
                        {"contains": {"key": "location", "string": words[i], "weight": 1, "caseSensitive": false}}
                    ]
                });
            }

            query = {
                "fulltext": {
                    "and": keywords
                }
            }
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
        if(viaSearch === true) {
            this.dateSelector.setActiveItem(0);
            if(this.myScheduleButton.pressed) {
                this.myScheduleButton.toggle();
            }
        }

        var indexToDateRange = [];
        indexToDateRange[0] = {
            start: new Date("April 26, 2011 00:00:00"),
            end: new Date("April 29, 2011 23:59:59")
        }
        indexToDateRange[1] = {
            start: new Date("April 26, 2011 00:00:00"),
            end: new Date("April 26, 2011 23:59:59")
        }
        indexToDateRange[2] = {
            start: new Date("April 27, 2011 00:00:00"),
            end: new Date("April 27, 2011 23:59:59")
        }
        indexToDateRange[3] = {
            start: new Date("April 28, 2011 00:00:00"),
            end: new Date("April 28, 2011 23:59:59")
        }
        indexToDateRange[4] = {
            start: new Date("April 29, 2011 00:00:00"),
            end: new Date("April 29, 2011 23:59:59")
        }

        var dateIndex = this.dateSelector.getActiveItem().getId();
        var dateRange = indexToDateRange[dateIndex];
        var sessions = sessionStore.getRange();

        var panel = mluc.views.Schedule;
        panel.removeAll();

        var mySessionStore = Ext.getStore("MySessionsStore");
        var searchResultStore = Ext.getStore("SessionSearchStore");
        var lastHeaderString = "";
        var numColumnOutput = 0;
        for(var i = 0; i < sessions.length; i += 1) {
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

            if(sessions[i].get("plenary")) {
                colspan = 5;
                className += " plenary";
                height = Math.pow(numberOf15MinBlocks, .25) * 20;

                addTimeslot = true;
            }
            else {
                if(numColumnOutput === 0) {
                    addTimeslot = true;
                }
                numColumnOutput += 1;
                if(numColumnOutput === 5) {
                    numColumnOutput = 0;
                }

                var speakerIds = sessions[i].get("speakerIds");
                var speakerStore = Ext.getStore("SpeakerStore");
                for(var j = 0; j < speakerIds.length; j += 1) {
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
                            var affiliation = " - <span class='affiliation'>" + affiliation + "</span>";
                            speakers += affiliation;
                        }

                        if(j !== speakerIds.length - 1) {
                            speakers += ", "
                        }
                    }
                }
            }

            if(addTimeslot) {
                panel.add({
                    xtype: "container",
                    html: Ext.Date.format(sessions[i].get("startTime"), "g:ia") + " - " + Ext.Date.format(sessions[i].get("endTime"), "g:ia"),
                    height: height,
                    cls: className + " timeslot"
                });
            }

            var content = "<span class='title x-unselectable'>" + sessions[i].get("title") + "</span><br>" + speakers;
            if(sessions[i].get("plenary") === false) {
                content = '<div style="height: 100%; cursor: pointer;" class="x-unselectable session-summary" id="seshsum-' + sessions[i].get("id") + '">' + content + '</div>';
            }

            if(this.myScheduleButton.pressed === true && sessions[i].get("plenary") === false) {
                if(mySessionStore.find("sessionId", sessions[i].getId()) == -1) {
                    className += " notattending";
                }
            }

            if(viaSearch === true && sessions[i].get("plenary") === false && searchResultStore.find("id", sessions[i].getId()) === -1) {
                className += " notsearchresult";
            }

            panel.add({
                xtype: "container",
                html: content,
                height: height,
                colspan: colspan,
                cls: className
            });
        }

        panel.doLayout();
    }
});
