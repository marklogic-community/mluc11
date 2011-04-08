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
                    '{id:this.renderTopRightLinks}',
                    '<h2 class="title">{title}</h2>',
                    '<div class="meta"><span class="time">{[ Ext.Date.format(values.startTime, "g:ia") + " &ndash; " + Ext.Date.format(values.endTime, "g:ia") ]}</span>',
                    '<span class="location">&nbsp;in {location}</span></div>',
                    '<p class="abstract">{abstract}</h2>',
                    '<div class="speakers">{speakerIds:this.renderSpeakers}</div>',
                '</div>',
                '<div class="attendance">',
                    '{id:this.renderAttendies}',
                '</div>',
                {
                    renderTopRightLinks: function() {
                        var containerId = Ext.id();
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

                        var content = '<div class="topright"><div id="{0}"></div>';
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

