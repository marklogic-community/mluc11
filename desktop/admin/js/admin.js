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

Ext.onReady(function() {
    var loginWindow = Ext.create("Ext.window.Window", {
        title: "Login",
        modal: true,
        width: 250,
        closable: false,
        bodyPadding: 10,
        items: [{
            xtype: 'textfield',
            inputType: "password",
            fieldLabel: "Password",
            width: 200,
            listeners: {
                change: function(input, value) {
                    if(value === "boosencha") {
                        loginWindow.hide();
                    }
                }
            }
        }]
    });
    loginWindow.show();

    
    Ext.getStore("SpeakerStore").load(function() {
    Ext.getStore("SessionStore").load(function() {
        var sessionDetails = Ext.create("mluc.AdminSessionDetails", {region: "center"});
        var speakerDetails = Ext.create("mluc.AdminSpeakerDetails", {region: "center"});
        var speakerList = Ext.create("mluc.AdminSessionSpeakerList", {
            region: "east",
            split: true,
            width: "30%",
            listeners: {
                sessionspeakerschanged: function(speakerList, speakers) {
                    sessionDetails.setSpeakers(speakers);
                }
            }
        });

        Ext.create('Ext.Viewport', {
            layout: "border",
            items: [{
                xtype: "tabpanel",
                region: "center",
                activeTab: 0,
                items: [{
                    title: 'Edit Sessions',
                    layout: 'border',
                    xtype: "panel",
                    items: [{
                        region: 'west',
                        title: 'Sessions',
                        split: true,
                        width: '30%',
                        xtype: "adminsessionlist",
                        listeners: {
                            sessionselect: function(sessionList, session) {
                                sessionDetails.editSession(session);
                                var speakers = [];
                                var speakerIds = session.get("speakerIds");
                                var speakerStore = Ext.getStore("SpeakerStore");
                                for(var i = 0; i < speakerIds.length; i += 1) {
                                    speakers.push(speakerStore.getById(speakerIds[i]));
                                }
                                speakerList.setSelectedSpeakers(speakers);
                            }
                        }
                    },
                    sessionDetails,
                    speakerList
                    ]
                },
                {
                    title: 'Edit Speakers',
                    layout: 'border',
                    xtype: "panel",
                    items: [{
                        region: 'west',
                        title: 'Speakers',
                        split: true,
                        width: '30%',
                        xtype: "adminspeakerlist",
                        listeners: {
                            speakerselect: function(speakerList, speaker) {
                                speakerDetails.editSpeaker(speaker);
                            }
                        }
                    },
                    speakerDetails
                    ]
                }]
            }]
        });
    });
    });
});

