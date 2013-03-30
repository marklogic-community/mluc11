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
                columns: 7,
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
                    colspan: 7,
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
                colspan = 6;
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
                if(numColumnOutput === 6) {
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


Ext.define("mluc.views.SessionSurvey", {
    extend: "Ext.form.FormPanel",
    alias: "widget.sessionsurvey",
    initComponent: function() {
        var options = [
            ["0", 'Select one'],
            ["1", 'Poor'],
            ["2", 'Fair'],
            ["3", 'Average'],
            ["4", 'Good'],
            ["5", 'Great']
        ];
        this.id = "sessionsurvey";
        this.border = "none";
        this.bodyBorder = "none";
        this.items = [
            {
                xtype: "container",
                id: "surveyTitle",
                tpl: new Ext.XTemplate(
                    '<h2>{title}</h2>'
                )
            },
            {
                xtype: "combo",
                id: "speakerQuality",
                fieldLabel: "Effectiveness of speaker",
                labelWidth: 150,
                editable: false,
                store: options
            },
            {
                xtype: "combo",
                id: "sessionQuality",
                fieldLabel: "Quality of content",
                labelWidth: 150,
                editable: false,
                store: options
            },
            {
                xtype: "textareafield",
                id: "sessionComments",
                labelWidth: 150,
                height: 350,
                fieldLabel: "Comments"
            }
        ];
        this.buttons = [
            {
                text: 'Cancel',
                scope: this,
                handler: function() {
                    this.layoutManager.setActiveItem(0);
                }
            },
            {
                text: 'Submit',
                scope: this,
                handler: this.submit
            }
        ];

        this.callParent(arguments);
    },

    viewSurvey: function(session, layoutManager) {
        this.session = session;
        this.layoutManager = layoutManager;
        this.getComponent("surveyTitle").update(session.data);
        this.getComponent("speakerQuality").setValue("0");
        this.getComponent("sessionQuality").setValue("0");
        this.getComponent("sessionComments").setValue("");
        this.layoutManager.setActiveItem(1);
    },

    submit: function() {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        if(username) {
            var speakerQ = this.getComponent("speakerQuality").getValue();
            var sessionQ = this.getComponent("sessionQuality").getValue();
            var comments = this.getComponent("sessionComments").getValue();
            var survey = Ext.ModelMgr.create({id: id, forSession: this.session.getId(), userId: username, speakerQuality: speakerQ, sessionQuality: sessionQ, sessionComments: comments, dateAdded: new Date()}, 'Survey');
            me.setLoading(true);
            survey.save({
                success: function() {
                    me.setLoading(false);
                    me.layoutManager.setActiveItem(0);
                }
            });
        }
    }
});
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

Ext.define("mluc.views.DetailsWindow", {
    extend: "Ext.window.Window",
    alias: "widget.detailswindow",
    initComponent: function() {
        var me = this;
        this.store = new Ext.data.Store({
            model: "Attendee",
            proxy: {
                type: "ajax",
                url: "/data/jsonquery.xqy",
                reader: {
                    type: "json",
                    root: "results",
                    totalProperty: "count"
                }
            },
            sorters: [
                {
                    property : "dateAdded",
                    direction: "DESC"
                }
            ]
        });

        var sessionItems = [{
            xtype: "container",
            tpl: new Ext.XTemplate(
                '<div class="sessiondetail">',
                    '{giveSurvey:this.renderTopRightLinks}',
                    '<h2 class="title">{title}</h2>',
                    '<div class="meta"><span class="time">{[ Ext.Date.format(values.startTime, "g:ia") + " &ndash; " + Ext.Date.format(values.endTime, "g:ia") ]}</span>',
                    '<tpl if="location"><span class="location">&nbsp;in {location}</span></tpl></div>',
                    '<p class="abstract">{abstract}</h2>',
                    '<div class="speakers">{speakerIds:this.renderSpeakers}</div>',
                '</div>',
                '<div class="attendance">',
                    '{id:this.renderAttendies}',
                '</div>',
                {
                    renderTopRightLinks: function(giveSurvey) {
                        var containerId = Ext.id();
                        if(giveSurvey) {
                            Ext.defer(function() {
                                var button = new Ext.button.Button({
                                    renderTo: containerId,
                                    text: "Survey",
                                    width: 75,
                                    scope: me,
                                    handler: function() {
                                        me.getComponent(1).viewSurvey(me.session, me.getLayout());
                                    }
                                });
                            }, 50);
                        }

                        var content;
                        if(giveSurvey) {
                            content = '<div class="topright"><div id="{0}"></div>';
                        }
                        else {
                            content = '<div class="topright">';
                        }
                        if(me.store.getCount()) {
                            content += '<div class="numattendees"><span class="num">' + me.store.getCount() + '</span><br>Attending</div>';
                        }
                        content += "</div>";
                        return Ext.String.format(content, containerId);
                    },
                    renderSpeakers: function(speakerIds) {
                        var speakers = "";
                        var speakerStore = Ext.getStore("SpeakerStore");

                        var i;
                        for(i = 0; i < speakerIds.length; i += 1) {
                            var speaker = speakerStore.getById(speakerIds[i] + "").data;
                            var className = "session-presenter";
                            if(i < speakerIds.length - 1) {
                                className += " bordered";
                            }
                            var extendedInfo = '<div style="display: none" class="speaker-details">';
                            if(speaker.position) {
                                extendedInfo += Ext.String.format('<div class="speaker-title">Title: {0}</div>', speaker.position);
                            }
                            if(speaker.email) {
                                extendedInfo += Ext.String.format('<div class="speaker-email">Contact: <a href="mailto:{0}">{0}</a></div>', speaker.email);
                            }
                            if(speaker.bio) {
                                extendedInfo += '<p>' + speaker.bio + '</p>';
                            }
                            extendedInfo += '</div>';
                            speakers += Ext.String.format('<div class="{0}"><span class="presenter-name">{1}</span> &ndash; <span class="presenter-affiliation">{2}</span> <a class="detailslink">speaker details</a>{3}</div>', className, speaker.name, speaker.affiliation, extendedInfo);
                        }

                        return speakers;
                    },
                    renderAttendies: function() {
                        var username = mluc.readCookie("MLUC-USERNAME");
                        var attending = false;

                        if(me.store.find("username", username) >= 0) {
                            attending = true;
                        }

                        var addLogin;
                        var containerId = Ext.id();
                        if(mluc.readCookie("MLUC-SESSION")) {
                            if(attending) {
                                addLogin = "<table><tbody><tr>";
                                addLogin += "<td class='icon'><img src='http://graph.facebook.com/" + username.substring(username.indexOf("_") + 1) + "/picture'/></td>";
                                addLogin += Ext.String.format('<td><span class="header">This session is in your favorites.</span><div id="{0}" class="inputs"></div></td>', containerId);
                                addLogin += "</tr></tbody></table>";

                                Ext.defer(function() {
                                    var button = new Ext.button.Button({
                                        renderTo: containerId,
                                        text: "Remove from favorites",
                                        scope: me,
                                        handler: me.unattend
                                    });
                                }, 50);
                            }
                            else {
                                addLogin = "<table><tbody><tr>";
                                addLogin += "<td class='icon'><img src='http://graph.facebook.com/" + username.substring(username.indexOf("_") + 1) + "/picture'/></td>";
                                addLogin += Ext.String.format('<td><span class="header">Look like an interesting session?</span><div id="{0}" class="inputs"></div></td>', containerId);
                                addLogin += "</tr></tbody></table>";

                                Ext.defer(function() {
                                    var input = new Ext.form.Text({
                                        width: 300,
                                        hideLabel: true,
                                        renderTo: containerId,
                                        emptyText: "Tell everyone why (optional)"
                                    });

                                    var button = new Ext.button.Button({
                                        renderTo: containerId,
                                        text: "Add to favorites",
                                        scope: me,
                                        handler: function() {
                                            this.attend(input.getValue());
                                        }
                                    });
                                }, 50);
                            }
                        }
                        else {
                            addLogin = '<div class="session-login">Click to login via Facebook so you can mark yourself as attending this session.</div>';
                            addLogin = "<table><tbody><tr>";
                            addLogin += "<td class='icon'><img src='/images/unknown.gif'/></td>";
                            addLogin += Ext.String.format('<td><span class="header">Look like an interesting session?</span><div id="{0}" class="inputs"></div></td>', containerId);
                            addLogin += "</tr></tbody></table>";

                            Ext.defer(function() {
                                var button = new Ext.button.Button({
                                    renderTo: containerId,
                                    text: "Login to add to favorites",
                                    cls: "session-login",
                                    handler: function() {
                                        mluc.createCookie("MLUC-VIEWING", Ext.JSON.encode({session: mluc.views.Schedule.detailsWindow.session.get("id")}), 1);
                                        mluc.login();
                                    }
                                });
                            }, 50);
                        }

                        return '<div class="attend-login">' + addLogin + '</div>';
                    }
                }
            )
        },
        {
            xtype: "container",
            cls: "attendance-list",
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<tpl if="xindex == 1"><h3>Attendance</h3></tpl>',
                    '<tpl if="xindex &lt; 51">',
                        '<table class="person"><tbody><tr>',
                            '<td><a href="http://www.facebook.com/profile.php?id={[ this.getIdFromUsername(values.get("username")) ]}" target="_blank"><img src="http://graph.facebook.com/{[ this.getIdFromUsername(values.get("username")) ]}/picture"/></a></td>',
                            '<td>',
                                '<a href="http://www.facebook.com/profile.php?id={[ this.getIdFromUsername(values.get("username")) ]}" target="_blank">{[ values.get("realname") ]}</a>',
                                '<p class="reason">{[ values.get("reason") ]}</p>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                    '<tpl if="xindex == 10 && xcount &gt; 10">',
                        '<div class="showall"><span class="showall-button x-btn x-btn-default x-btn-default-small x-btn-small x-btn-default-small-noicon x-abs-layout-item x-btn-default-small-over"><em>',
                            '<tpl if="xcount &gt; 50"><button>See the latest 50 attendees</button></tpl>',
                            '<tpl if="xcount &lt; 51"><button>See all {[xcount]} attendees</button></tpl>',
                        '</em></span></div><div class="fulllist">',
                    '</tpl>',
                    '<tpl if="xindex == xcount && xcount &gt; 10">',
                        '</div>',
                    '</tpl>',
                '</tpl>',
                {
                    getIdFromUsername: function(username) {
                        return username.substring(username.indexOf("_") + 1);
                    }
                }
            )
        }];

        Ext.apply(this, {
            title: 'Session Details',
            closable: true,
            resizable: false,
            closeAction: "hide",
            width: 600,
            height: 550,
            plain: true,
            autoScroll: true,
            bodyPadding: 10,
            layout: "card",
            session: undefined,
            items: [
                {
                    xtype: "container",
                    items: sessionItems
                },
                {
                    xtype: "sessionsurvey"
                }
            ]
        });

        this.callParent(arguments);
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("detailslink")) {
                    panel.showHideSpeakerDetails(element);
                }
                else if(element.hasCls("numattendees") || element.parent("div.numattendees")) {
                    panel.jumpToAttendance();
                }
                else if(element.hasCls("showall-button") || element.parent(".showall-button")) {
                    // XXX - change to ext button
                    var showallContainer = Ext.get(element.parent("div.showall"));
                    showallContainer.setVisible(Element.DISPLAY);
                    showallContainer.hide(true);
                    showallContainer.next("div.fulllist").dom.style.display = "block";
                }
            });
        }
    },

    attend: function(reason) {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        var realname = mluc.readCookie("MLUC-NAME").replace("+", " ");
        if(username) {
            this.setLoading(true);
            var mySession;
            window.setTimeout(function() {
                mySession = Ext.ModelMgr.create({id: id, sessionId: me.session.getId(), username: username, realname: realname, reason: reason, dateAdded: new Date()}, 'Attendee');
                mySession.save({
                    success: function() {
                        me.setLoading(false);
                        me.viewSession();
                    }
                });

                me.store.insert(me.store.getCount(), [mySession]);

                // Shove it into the my session store too in case the uesr is currently viewing their session in the background
                var mySessionStore = Ext.getStore("MySessionsStore");
                mySessionStore.insert(mySessionStore.getCount(), [mySession]);

                mluc.views.Schedule.renderSchedule(Ext.getStore("SessionStore"));
            }, 0);

        }
    },

    unattend: function() {
        var me = this;
        var username = mluc.readCookie("MLUC-USERNAME");
        var index = this.store.find("username", username);

        if(username && index >= 0) {
            this.setLoading(true);
            window.setTimeout(function() {
                var record = me.store.getAt(index);

                var mySessionStore = Ext.getStore("MySessionsStore");
                var mySession = mySessionStore.find("sessionId", me.session.getId());
                mySessionStore.removeAt(mySession);

                me.store.remove(record);

                var operation = Ext.create('Ext.data.Operation', {records: [record], action: "destroy"});
        
                var callback = function(operation) {
                    if(operation.wasSuccessful()) {
                        me.setLoading(false);
                        me.viewSession();
                    }
                };
                record.getProxy().destroy(operation, callback, record);

                mluc.views.Schedule.renderSchedule(Ext.getStore("SessionStore"));
            }, 0);
        }
    },

    viewSession: function(session) {
        var me = this;
        if(session !== undefined) {
            this.session = session;
        }

        var title = this.session.get("title");
        if(title.length > 75) {
            this.setTitle(title.substring(0, 75) + "...");
        }
        else {
            this.setTitle(title);
        }
        this.show();
        this.getLayout().setActiveItem(0);

        this.setLoading(true);
        this.store.proxy.extraParams = {q: Ext.JSON.encode({key: "sessionId", value: this.session.getId()})};
        this.store.load(function(records) {
            me.setLoading(false);
            me.getComponent(0).getComponent(0).update(me.session.data);
            me.getComponent(0).getComponent(1).update(me.store.getRange());
        });
    },

    showHideSpeakerDetails: function(clickedOn) {
        var container = Ext.get(clickedOn.findParent("div.session-presenter"));
        if(!container) {
            container = clickedOn;
        }

        var speakerDetails = container.child("div.speaker-details");
        speakerDetails.setVisibilityMode(Ext.core.Element.DISPLAY);
        speakerDetails.setVisible(!speakerDetails.isVisible(), true);
    },

    jumpToAttendance: function() {
        var attendBox = Ext.get(Ext.DomQuery.selectNode("div.attendance-list"));
        var container = attendBox.parent("div.x-window-body");
        attendBox.scrollIntoView(container);
    }
});

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
        sessionStore.on("load", function() { me.renderSpeakers() } );
        speakerStore.on("load", function() { me.renderSpeakers() } );

        if(sessionStore.getCount() && speakerStore.getCount()) {
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
        var sessionStore = Ext.getStore("SessionStore");
        var speakerStore = Ext.getStore("SpeakerStore");
        if(sessionStore.isLoading() || speakerStore.isLoading()) {
            return;
        }

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

Ext.define('mluc.widgets.Twitter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.twitter',

    initComponent: function() {
        Ext.apply(this, {
            title: "Twitter",
            collapsible: true,
            region: 'east',
            split: true,
            width: 250,
            autoScroll: true,
            tpl: new Ext.XTemplate(
                '<div class="tweets">',
                    '<tpl for=".">',
                        '<table class="tweet"><tbody><tr>',
                            '<td class="icon"><a href="http://twitter.com/{[values.get("from_user")]}" target="_blank"><img src="{[values.get("profile_image_url")]}"/></a></td>',
                            '<td class="text">',
                                '<span class="username"><a href="http://twitter.com/{[values.get("from_user")]}" target="_blank">{[values.get("from_user")]}</a></span><br>',
                                '{[this.linkifyText(values.get("text"))]}<br>',
                                '<span class="date">{[values.get("date_formatted")]}</span>',
                            '</td>',
                        '</tr></tbody></table>',
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
            )
        });

        Ext.regModel('Tweet', {
            fields: [
                {name: "id", mapping: "id_str", type: "string"},
                {name: "from_user", type: "string"},
                {name: "text", type: "string"},
                {name: "profile_image_url", type: "string"},
                {name: "created_at", type: "string"},
                {name: "created_at_date", convert: function(value, record) { return Ext.Date.parseDate(record.get("created_at"), "D, d M Y G:i:s O"); }},
                {name: "date_formatted", convert: function(value, record) { return mluc.friendlyDateSince(record.get("created_at_date")); }}
            ]
        });

        Ext.regStore("TweetStore", {
            model: 'Tweet',
            proxy: {
                type: 'scripttag',
                url : 'http://search.twitter.com/search.json',
                extraParams: {
                    q: "marklogic OR mlw13",
                    rpp: 100
                },
                reader: {
                    root: "results"
                }
            },
            listeners: {
                load: this.renderTweets
            },
            autoLoad: true
        });

        this.callParent(arguments);
    },

    renderTweets: function(tweetStore, records, successful) {
        mluc.views.Twitter.update(records);
    }
});
