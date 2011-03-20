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
                    totalProperty: "count",
                }
            },
            sorters: [
                {
                    property : "dateAdded",
                    direction: "DSC"
                }
            ]
        });

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
            session: undefined,
            items: [
                {
                    xtype: "container",
                    tpl: new Ext.XTemplate(
                        '<div class="sessiondetail">',
                            '<h2 class="title">{title}</h2>',
                            '<span class="time">{[ Ext.Date.format(values.startTime, "g:ia") + " - " + Ext.Date.format(values.endTime, "g:ia") ]}</span>',
                            '<p class="abstract">{abstract}</h2>',
                            '<div class="speakers">{speakerIds:this.renderSpeakers}</div>',
                            '<div class="attendance">',
                                '{id:this.renderAttendies}',
                            '</div>',
                        '</div>',
                        {
                            renderSpeakers: function(speakerIds) {
                                var speakers = "";
                                var speakerStore = Ext.getStore("SpeakerStore");

                                for(var i = 0; i < speakerIds.length; i += 1) {
                                    var speaker = speakerStore.getById(speakerIds[i] + "").data;
                                    var className = "session-presenter";
                                    if(i < speakerIds.length - 1) {
                                        className += " bordered";
                                    }
                                    var extendedInfo = '<div style="display: none" class="speaker-details">';
                                    if(speaker.position) {
                                        extendedInfo += '<div class="speaker-title">Title: ' + speaker.position + '</div>';
                                    }
                                    if(speaker.email) {
                                        extendedInfo += '<div class="speaker-email">Contact: <a href="mailto:' + speaker.email + '">' + speaker.email + '</a></div>';
                                    }
                                    if(speaker.bio) {
                                        extendedInfo += '<p>' + speaker.bio + '</p>';
                                    }
                                    extendedInfo += '</div>';
                                    speakers += '<div class="' + className + '"><span class="presenter-name">' + speaker.name + '</span> - <span class="presenter-affiliation">' + speaker.affiliation + '</span>' + extendedInfo + '</div>';
                                }

                                return speakers;
                            },
                            renderAttendies: function(sessionId) {
                                var username = mluc.readCookie("MLUC-USERNAME");
                                var attending = false;

                                if(me.store.find("username", username) >= 0) {
                                    attending = true;
                                }

                                var addLogin;
                                if(mluc.readCookie("MLUC-SESSION")) {
                                    if(attending) {
                                        addLogin = '<div class="session-dont-attend">No longer interested</div>';
                                    }
                                    else {
                                        addLogin = '<div class="session-attend">Count me in!</div>';
                                    }
                                }
                                else {
                                    addLogin = '<div class="session-login" onclick="mluc.login()">Click to login via Facebook so you can mark yourself as attending this session.</div>';
                                }

                                return '<div class="attend-login">' + addLogin + '</div><h3>Attendees</h3>';
                            }
                        }
                    )
                },
                {
                    xtype: "container",
                    cls: "attendance-list",
                    tpl: new Ext.XTemplate(
                        '<tpl for=".">',
                            '<div class="person"><a href="http://www.facebook.com/profile.php?id={[ this.getIdFromUsername(values.get("username")) ]}" target="_blank">',
                                '<img src="http://graph.facebook.com/{[ this.getIdFromUsername(values.get("username")) ]}/picture"/>',
                                '<span class="realname">{[ values.get("realname") ]}</span>',
                            '</a></div>',
                        '</tpl>',
                        {
                            getIdFromUsername: function(username) {
                                return username.substring(username.indexOf("_") + 1);
                            }
                        }
                    )
                }
            ]
        });

        this.callParent(arguments);
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("session-dont-attend")) {
                    panel.unattend();
                }
                else if(element.hasCls("session-attend")) {
                    panel.attend();
                }
                else if(element.hasCls("session-login")) {
                    mluc.login();
                }
                else if(element.hasCls("session-presenter") || element.findParent("div.session-presenter")) {
                    panel.showHideSpeakerDetails(element);
                }
            });
        }
    },

    attend: function() {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        var realname = mluc.readCookie("MLUC-NAME").replace("+", " ");
        if(username) {
            this.setLoading(true);
            var mySession;
            window.setTimeout(function() {
                mySession = Ext.ModelMgr.create({id: id, sessionId: me.session.getId(), username: username, realname: realname, dateAdded: new Date()}, 'Attendee');
                mySession.save({
                    success: function() {
                        me.setLoading(false);
                        me.viewSession();
                    }
                });
            }, 0);

            this.store.insert(this.store.getCount(), [mySession]);

            // Shove it into the my session store too in case the uesr is currently viewing their session in the background
            var mySessionStore = Ext.getStore("MySessionsStore");
            mySessionStore.insert(mySessionStore.getCount(), [mySession]);

            mluc.views.Schedule.renderSchedule(Ext.getStore("SessionStore"));
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

        this.setLoading(true);
        this.store.proxy.extraParams = {q: Ext.JSON.encode({key: "sessionId", value: this.session.getId()})};
        this.store.load(function(records) {
            me.setLoading(false);
            me.getComponent(0).update(me.session.data);
            me.getComponent(1).update(me.store.getRange());
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
    }
});

