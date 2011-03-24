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

Ext.define('mluc.AdminSpeakerDetails', {
    extend: 'Ext.form.FormPanel',
    alias: 'widget.adminspeakerdetails',
    
    initComponent: function(){
        this.record = {};
        this.record.data = {};

        Ext.apply(this, {
            title: 'Speaker Details',
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
                    this.setLoading(true);
                    var me = this;

                    Ext.Ajax.request({
                        url: "/data/jsonstore.xqy",
                        method: "PUT",
                        success: function() {
                            me.setLoading(false);
                        },
                        params: {uri: "/speaker/" + data.id + ".json"},
                        jsonData: data
                    });
                }
            }]
        });

        this.callParent(arguments);
    },

    editSpeaker: function(record) {
        this.record = record;
        this.getForm().loadRecord(record);
    },

    createView: function() {
        return [
            {
                fieldLabel: 'Name',
                name: 'name',
                allowBlank: false,
            },
            {
                fieldLabel: 'Email',
                name: 'email',
            },
            {
                fieldLabel: 'Position',
                name: "position",
            },
            {
                fieldLabel: 'Affiliation',
                name: "affiliation",
            },
            {
                fieldLabel:'Bio',
                name: "bio",
                xtype:'textareafield',
                width: 600,
                height: 200,
            }
        ];
    },
});
