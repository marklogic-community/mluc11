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

Ext.define('mluc.AdminSessionSpeakerList', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.adminsessionspeakerlist',
    
    initComponent: function(){
        Ext.apply(this, {
            layout: 'fit',
            title: 'Speakers',
            autoScroll: "true",
            items: this.createView()
        });
        this.addEvents(
            'sessionspeakerschanged'
        );
        
        this.callParent(arguments);
    },

    createView: function(){
        this.view = Ext.create('widget.dataview', {
            store: "SpeakerStore",
            selModel: {
                mode: 'MULTI',
                listeners: {
                    scope: this,
                    selectionchange: this.onSelectionChange 
                }
            },
            trackOver: true,
            cls: 'speaker-list',
            tpl: '<tpl for="."><div class="speaker-list-item">{name}</div></tpl>',
            itemSelector: '.speaker-list-item',
        });
        return this.view;
    },

    onSelectionChange: function(){
        var selected = this.view.getSelectedRecords();
        if(selected) {
            this.fireEvent('sessionspeakerschanged', this, selected);
        }
    },

    getSelectedItem: function(){
        return this.view.getSelectionModel().getSelection()[0] || false;    
    },

    setSelectedSpeakers: function(speakers) {
        this.view.getSelectionModel().select(speakers, false, true);
    },
});
