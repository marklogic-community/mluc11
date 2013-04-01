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
                    property: "dateAdded",
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
                            '<tr><th>Time</th><td>{startTime:date("g:ia")} &ndash; {endTime:date("g:ia")}</td></tr>',
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
                cls: "attend-login grouped-container",
                tpl: new Ext.XTemplate(
                    '<tpl if="this.isLoggedIn() == true">',
                        '<tpl if="this.isAttending() == true"><table class="attending"></tpl>',
                        '<tpl if="this.isAttending() == false"><table class="attending" style="display: none"></tpl>',
                        '<tbody><tr>',
                            '<td class="icon"><img src="http://graph.facebook.com/{[ this.getFBIdFromUsername() ]}/picture"/></td>',
                            '<td>',
                                '<span class="header">This session is in your favorites.</span>',
                                '<div class="inputs"><span class="session-dont-attend x-button x-button-normal"><span class="x-button-label">Remove from favorites</span></span></div></div>',
                            '</td>',
                        '</tr></tbody></table>',

                        '<tpl if="this.isAttending() == false"><table class="notattending"></tpl>',
                        '<tpl if="this.isAttending() == true"><table class="notattending" style="display: none"></tpl>',
                        '<tbody><tr>',
                            '<td class="icon"><img src="http://graph.facebook.com/{[ this.getFBIdFromUsername() ]}/picture"/></td>',
                            '<td>',
                                '<span class="header">Look like an interesting session?</span> Optionally tell everyone why:',
                                '<div class="inputs"><input type="text" class="favorite-reason"/><span class="session-attend x-button x-button-normal"><span class="x-button-label">Add to favorites</span></span></div>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                    '<tpl if="this.isLoggedIn() == false">',
                        '<table><tbody><tr>',
                        '<td class="icon"><img src="/images/unknown.gif"/></td>',
                        '<td><span class="header">Look like an interesting session?</span><div class="inputs"><span class="session-login x-button x-button-normal"><em><span class="x-button-label">Login to add to favorites</span></em></span></div></td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                    {
                        isLoggedIn: function() {
                            if(mluc.readCookie("MLUC-USERNAME") && mluc.readCookie("MLUC-SESSION")) {
                                return true;
                            }
                            return false;
                        },
                        isAttending: function() {
                            var username = mluc.readCookie("MLUC-USERNAME");
                            var attending = false;
                            if(me.store.findExact("username", username) >= 0) {
                                attending = true;
                            }
                            return attending;
                        },
                        getFBIdFromUsername: function() {
                            var username = mluc.readCookie("MLUC-USERNAME");
                            return username.substring(username.indexOf("_") + 1);
                        }
                    }
                )
            },
            {
                xtype: "dataview",
                store: this.store,
                scroll: false,
                tpl: new Ext.XTemplate(
                    '<div class="grouped-container"><h2 class="group-name">Attendance</h2>',
                    '<div class="attendance-list section"><tpl for=".">',
                        '<tpl if="xindex &lt; 51">',
                            '<table class="person"><tbody><tr>',
                                '<td><a href="http://www.facebook.com/profile.php?id={[ this.getFBIdFromUsername(values.username) ]}" target="_blank">',
                                    '<img src="http://graph.facebook.com/{[ this.getFBIdFromUsername(values.username) ]}/picture"/>',
                                '</a></td>',
                                '<td>',
                                    '<a href="http://www.facebook.com/profile.php?id={[ this.getFBIdFromUsername(values.username) ]}" target="_blank">{realname}</a>',
                                    '<p class="reason">{reason}</p>',
                                '</td>',
                            '</tr></tbody></table>',
                        '</tpl>',
                        '<tpl if="xindex == 10 && xcount &gt; 10">',
                            '<div class="showall"><span class="showall-button x-button x-button-normal"><em>',
                                '<tpl if="xcount &gt; 50"><span class="x-button-label">See the latest 50 attendees</span></tpl>',
                                '<tpl if="xcount &lt; 51"><span class="x-button-label">See all {[xcount]} attendees</span></tpl>',
                            '<div class="fulllist">',
                        '</tpl>',
                        '<tpl if="xindex == xcount && xcount &gt; 10">',
                            '</div>',
                        '</tpl>',
                    '</tpl></div></div>',
                    {
                        getFBIdFromUsername: function(username) {
                            return username.substring(username.indexOf("_") + 1);
                        }
                    }
                ),
                autoHeight:true,
                multiSelect: false,
                overItmClass:'x-view-over',
                itemSelector:'table.person',
                emptyText: ''
            }
        ];

        sessionViewer.superclass.constructor.call(this, config);
    },
    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("session-dont-attend") || element.parent(".session-dont-attend")) {
                    panel.unattend();
                }
                else if(element.hasCls("session-attend") || element.parent(".session-attend")) {
                    var inputs = element.parent("div.inputs");
                    var reason = inputs.child("input.favorite-reason");
                    panel.attend(reason.dom.value);
                }
                else if(element.hasCls("session-login") || element.parent(".session-login")) {
                    mluc.createCookie("MLUC-VIEWING", Ext.util.JSON.encode({session: panel.session.get("id")}), 1);
                    mluc.login();
                }
                else if(element.hasCls("showall-button") || element.parent(".showall-button")) {
                    var showallContainer = Ext.get(element.parent("div.showall"));
                    showallContainer.setVisible(Element.DISPLAY);
                    showallContainer.hide(true);
                    showallContainer.next("div.fulllist").dom.style.display = "block";
                }
            });
        }
    },

    viewSession: function(session) {
        var me = this;
        if(session !== undefined) {
            this.session = session
            this.store.proxy.extraParams = {q: Ext.util.JSON.encode({key: "sessionId", value: this.session.getId()})};
            this.store.load(function(records) {
                me.getComponent(0).update(me.session.data);
                me.getComponent(1).update(me.session.data);
            });
        }
        else {
            me.getComponent(0).update(me.session.data);
            me.getComponent(1).update(me.session.data);
        }
    },

    attend: function(reason) {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        var realname = mluc.readCookie("MLUC-NAME").replace("+", " ");
        if(username) {
            var mySession = Ext.ModelMgr.create({id: id, sessionId: this.session.getId(), username: username, realname: realname, reason: reason, dateAdded: new Date()}, 'Attendee');
            this.store.insert(0, [mySession]);
            me.setLoading(true);
            mySession.save({
                success: function() {
                    me.setLoading(false);
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.attending").style.display = "block";
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.notattending").style.display = "none";
                }
            });
        }
    },

    unattend: function() {
        var me = this;
        var username = mluc.readCookie("MLUC-USERNAME");
        var index = this.store.findExact("username", username);

        if(username && index >= 0) {
            var record = this.store.getAt(index);

            var mySessionStore = Ext.getStore("MySessionsStore");
            var mySessionIndex = mySessionStore.findExact("sessionId", this.session.getId());
            mySessionStore.removeAt(mySessionIndex);

            this.store.remove(record);

            var operation = new Ext.data.Operation({records: [record], action: "destroy"});
        
            var callback = function(operation) {
                if(operation.wasSuccessful()) {
                    me.setLoading(false);
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.attending").style.display = "none";
                    Ext.DomQuery.selectNode("div." + me.parentClass + " table.notattending").style.display = "block";
                }
            };
        
            me.setLoading(true);
            record.getProxy().destroy(operation, callback, record);
        }
    }
});

Ext.reg('sessionviewer', sessionViewer);
