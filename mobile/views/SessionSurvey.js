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

        this.ids = {};
        this.ids.title = Ext.id();
        this.ids.speakerQuality = Ext.id();
        this.ids.sessionQuality = Ext.id();
        this.ids.comments = Ext.id();
        this.ids.parentBackId = config.backButtonId;
        this.ids.parentOpenId = config.openButtonId;
        this.ids.id = Ext.id();

        config.id = this.ids.id;
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
                id: this.ids.title,
                tpl: new Ext.XTemplate(
                    '<h2>{title}</h2>'
                )
            },
            {
                xtype: "selectfield",
                id: this.ids.speakerQuality,
                label: "Effectiveness of speaker",
                options: options
            },
            {
                xtype: "selectfield",
                id: this.ids.sessionQuality,
                label: "Quality of content",
                options: options
            },
            {
                xtype: "textareafield",
                id: this.ids.comments,
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

    viewSurvey: function(session, layoutManager) {
        this.session = session
        this.layoutManager = layoutManager;
        this.parentToolbar = this.layoutManager.dockedItems.items[0];
        this.getComponent(this.ids.title).update(session.data);
        this.getComponent(this.ids.speakerQuality).setValue(0);
        this.getComponent(this.ids.sessionQuality).setValue(0);
        this.getComponent(this.ids.comments).setValue("");
        this.lastActiveItem = layoutManager.getActiveItem();

        if(this.parentToolbar !== undefined) {
            this.lastTitle = this.parentToolbar.title;
            this.parentToolbar.setTitle("Survey");
            this.parentToolbar.getComponent(this.ids.parentBackId).hide();
            this.parentToolbar.getComponent(this.ids.parentOpenId).hide();
            this.ids.cancelId = Ext.id();
            this.ids.submitId = Ext.id();
            this.parentToolbar.insert(0, {
                id: this.ids.cancelId,
                text: 'Cancel',
                xtype: 'button',
                scope: this,
                handler: this.close
            });
            this.parentToolbar.add({
                id: this.ids.submitId,
                text: 'Submit',
                xtype: 'button',
                scope: this,
                handler: this.submit
            });
            this.parentToolbar.doLayout();
        }
        this.layoutManager.setActiveItem(this.ids.id, {
            type: "slide",
            direction: "up"
        });
    },

    submit: function() {
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);
        var username = mluc.readCookie("MLUC-USERNAME");
        if(username) {
            var speakerQ = this.getComponent(this.ids.speakerQuality).getValue();
            var sessionQ = this.getComponent(this.ids.sessionQuality).getValue();
            var comments = this.getComponent(this.ids.comments).getValue();
            var survey = Ext.ModelMgr.create({id: id, forSession: this.session.getId(), userId: username, speakerQuality: speakerQ, sessionQuality: sessionQ, sessionComments: comments, dateAdded: new Date()}, 'Survey');
            me.setLoading(true);
            survey.save({
                success: function() {
                    me.setLoading(false);
                    me.close()
                }
            });
        }
    },

    close: function() {
        if(this.parentToolbar !== undefined) {
            this.parentToolbar.getComponent(this.ids.parentBackId).show();
            this.parentToolbar.getComponent(this.ids.parentOpenId).show();
            this.parentToolbar.remove(this.ids.cancelId);
            this.parentToolbar.remove(this.ids.submitId);
            this.parentToolbar.setTitle(this.lastTitle);
        }
        if(this.lastActiveItem !== undefined) {
            this.layoutManager.setActiveItem(this.lastActiveItem, {
                type: "slide",
                direction: "down"
            });
        }
    }
});

Ext.reg('sessionsurvey', sessionSurvey);
