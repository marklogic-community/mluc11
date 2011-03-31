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


var sessionSurvey = Ext.extend(Ext.form.FormPanel, {
    constructor: function(config) {
        var me = this;
        var toolBar = new Ext.Toolbar({
            dock: "top",
            title: "Survey",
            items: [
                {
                    id: 'cancel',
                    text: 'Cancel',
                    xtype: 'button',
                    handler: mluc.closeSurvey
                },
                {xtype: 'spacer'},
                {
                    id: 'submit',
                    text: 'Submit',
                    xtype: 'button',
                    scope: this,
                    handler: this.submit
                }
            ]
        });

        config.dockedItems = [toolBar],
        var options = [
            {text: 'Select one',  value: '0'},
            {text: 'Poor',  value: '1'},
            {text: 'Fair', value: '2'},
            {text: 'Average',  value: '3'},
            {text: 'Good',  value: '4'},
            {text: 'Great',  value: '5'}
        ]
        config.items = [
            {
                xtype: "panel",
                id: "surveyTitle",
                tpl: new Ext.XTemplate(
                    '<h2>{title}</h2>'
                )
            },
            {
                xtype: "selectfield",
                id: "speakerQuality",
                label: "Effectiveness of speaker",
                options: options
            },
            {
                xtype: "selectfield",
                id: "sessionQuality",
                label: "Quality of content",
                options: options
            },
            {
                xtype: "textareafield",
                id: "sessionComments",
                label: "Comments"
            }
        ];

        sessionSurvey.superclass.constructor.call(this, config);
    },
    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
            });
        }
    },

    viewSurvey: function(session) {
        this.session = session
        this.getComponent("surveyTitle").update(session.data);
        this.getComponent("speakerQuality").setValue(0);
        this.getComponent("sessionQuality").setValue(0);
        this.getComponent("sessionComments").setValue("");
        mluc.mainPanel.setActiveItem(1, {
            type: "slide",
            direction: "up"
        });
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
                    mluc.closeSurvey();
                }
            });
        }
    }
});

Ext.reg('sessionsurvey', sessionSurvey);
