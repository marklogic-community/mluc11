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

Ext.define('mluc.AdminSessionDetails', {
    extend: 'Ext.form.FormPanel',
    alias: 'widget.adminsessiondetails',
    
    initComponent: function(){
        this.record = {};
        this.record.data = {};

        Ext.apply(this, {
            title: 'Session Details',
            autoScroll: "true",
            width: 350,
            bodyPadding: 5,
            fieldDefaults: {
                msgTarget: 'side',
                labelWidth: 75
            },
            defaults: {
                width: 300
            },
            defaultType: 'textfield',
            items: this.createView(),
            buttons: [{
                text: 'Save',
                scope: this,
                handler: function() {
                    var form = this.getForm();
                    form.updateRecord(this.record);

                    var data = this.record.data;
                    data.featured = form.findField("featured").getValue();
                    data.plenary = form.findField("plenary").getValue();
                    data.giveSurvey = form.findField("giveSurvey").getValue();
                    data.startTime = this.combineDateAndTime(form.findField("sessionDate").getValue(), form.findField("startTime").getValue());
                    data.endTime = this.combineDateAndTime(form.findField("sessionDate").getValue(), form.findField("endTime").getValue());

                    this.setLoading(true);
                    var me = this;

                    Ext.Ajax.request({
                        url: "/data/jsonstore.xqy",
                        method: "PUT",
                        success: function() {
                            me.setLoading(false);
                        },
                        params: {uri: "/session/" + this.record.data.id + ".json"},
                        jsonData: data
                    });
                }
            }]
        });

        this.callParent(arguments);
    },

    editSession: function(record) {
        this.record = record;
        this.getForm().loadRecord(record);
    },

    setSpeakers: function(speakers) {
        var ids = [];
        for(var i = 0; i < speakers.length; i += 1) {
            ids.push(speakers[i].get('id'));
        }
        this.record.set("speakerIds", ids);
    },

    createView: function() {
        return [
            {
                fieldLabel: 'Title',
                name: 'title',
                allowBlank: false,
            },
            {
                fieldLabel: 'Plenary',
                name: "plenary",
                xtype: "checkbox",
            },
            {
                fieldLabel: 'Survey',
                name: "giveSurvey",
                xtype: "checkbox",
            },
            {
                fieldLabel: 'Featured',
                name: "featured",
                xtype: "checkbox",
            },
            {
                fieldLabel: 'Date',
                name: "sessionDate",
                xtype: "datefield",
                allowBlank: false,
                showToday: false,
            },
            {
                fieldLabel: 'Start Time',
                name: 'startTime',
                xtype: "timefield",
                increment: 5,
                minValue: '7:00am',
                maxValue: '10:00pm',
                allowBlank: false,
            },
            {
                fieldLabel: 'End Time',
                name: 'endTime',
                xtype: "timefield",
                increment: 5,
                minValue: '7:00am',
                maxValue: '10:00pm',
                allowBlank: false,
            },
            {
                fieldLabel: 'Location',
                name: "location",
            },
            {
                fieldLabel: 'Track',
                name: "track",
            },
            {
                fieldLabel:'Abstract',
                name: "abstract",
                xtype:'textareafield',
                width: 600,
                height: 200,
            }
        ];
    },

    combineDateAndTime: function(dateTime, time) {
        dateTime.setHours(time.getHours());
        dateTime.setMinutes(time.getMinutes());
        return dateTime;
    }

});
