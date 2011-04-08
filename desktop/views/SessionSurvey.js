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
