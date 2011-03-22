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
                    property : "dateAdded",
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
                            '<tr><th>Time</th><td>{startTime:date("g:ia")} - {endTime:date("g:ia")}</td></tr>',
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
                cls: "session-attendance grouped-container",
                tpl: new Ext.XTemplate(
                    '{[this.renderAttendies(values.id)]}',
                    {
                        renderAttendies: function(sessionId) {
                            var username = mluc.readCookie("MLUC-USERNAME");
                            var attending = false;

                            if(me.store.find("username", username) >= 0) {
                                attending = true;
                            }

                            var addLogin;
                            if(mluc.readCookie("MLUC-SESSION")) {
                                if(attending) {
                                    addLogin = '<div class="attend-login session-dont-attend">Unfavorite</div>';
                                }
                                else {
                                    addLogin = '<div class="attend-login session-attend">Favorite</div>';
                                }
                            }
                            else {
                                addLogin = '<div class="attend-login session-login">Click to login via Facebook so you can mark yourself as attending this session.</div>';
                            }

                            var publicAttendance = '<h2 class="group-name">Attendance</h2>';
                            publicAttendance += '<div class="attendance-list section">';

                            var attendees = me.store.getRange();
                            for(var i = 0; i < attendees.length; i += 1) {
                                var username = attendees[i].get("username");
                                var fbId = username.substring(username.indexOf("_") + 1);
                                publicAttendance += '<div class="person"><img src="http://graph.facebook.com/' + fbId + '/picture"/><span class="realname">' + attendees[i].get("realname") + '</span></div>';
                            }
                            publicAttendance += '</div>';

                            if(attendees.length === 0) {
                                publicAttendance = "";
                            }

                            return addLogin + publicAttendance;
                        }
                    }
                )
            }
        ];

        sessionViewer.superclass.constructor.call(this, config);
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
            });
        }
    },

    viewSession: function(session) {
        var me = this;
        if(session !== undefined) {
            this.setLoading(true);
            this.session = session
            this.store.proxy.extraParams = {q: Ext.util.JSON.encode({key: "sessionId", value: this.session.getId()})};
            this.store.load(function(records) {
                me.getComponent(0).update(me.session.data);
                me.getComponent(1).update(me.session.data);
                me.setLoading(false);
            });
        }
        else {
            me.getComponent(0).update(me.session.data);
            me.getComponent(1).update(me.session.data);
        }
    },

    updateAttendance: function() {
        this.getComponent(1).update(this.session.data);
    },

    attend: function() {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        var realname = mluc.readCookie("MLUC-NAME").replace("+", " ");
        if(username) {
            var mySession = Ext.ModelMgr.create({id: id, sessionId: this.session.getId(), username: username, realname: realname, ddateAdded: new Date()}, 'Attendee');
            this.store.insert(this.store.getCount(), [mySession]);
            mySession.save({
                success: function() {
                    me.updateAttendance();
                }
            });
        }
    },

    unattend: function() {
        var me = this;
        var username = mluc.readCookie("MLUC-USERNAME");
        var index = this.store.find("username", username);

        if(username && index >= 0) {
            var record = this.store.getAt(index);

            var mySessionStore = Ext.getStore("MySessionsStore");
            var mySessionIndex = mySessionStore.find("sessionId", this.session.getId());
            mySessionStore.removeAt(mySessionIndex);

            this.store.remove(record);

            var operation = new Ext.data.Operation({records: [record], action: "destroy"});
        
            var callback = function(operation) {
                if(operation.wasSuccessful()) {
                    me.updateAttendance();
                }
            };
        
            record.getProxy().destroy(operation, callback, record);
        }
    }
});

Ext.reg('sessionviewer', sessionViewer);
