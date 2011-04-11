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

Ext.define('mluc.AdminSessionList', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.adminsessionlist',
    
    initComponent: function(){
        Ext.apply(this, {
            layout: 'fit',
            title: 'Sessions',
            autoScroll: "true",
            items: this.createView(),
            dockedItems: this.createToolbar()
        });
        this.addEvents(
            'sessionselect'
        );
        
        this.callParent(arguments);
    },

    createView: function(){
        this.view = Ext.create('widget.dataview', {
            store: "SessionStore",
            selModel: {
                mode: 'SINGLE',
                listeners: {
                    scope: this,
                    selectionchange: this.onSelectionChange 
                }
            },
            trackOver: true,
            cls: 'session-list',
            tpl: '<tpl for="."><div class="session-list-item">{title}</div></tpl>',
            itemSelector: '.session-list-item',
        });
        return this.view;
    },
    
    createToolbar: function(){
        this.addAction = Ext.create('Ext.Action', {
            scope: this,
            handler: this.onAddSessionClick,
            text: 'Add session'
        });

        this.toolbar = Ext.create('widget.toolbar', {
            items: [this.addAction]
        });
        return this.toolbar;
    },

    onSelectionChange: function(){
        var selected = this.getSelectedItem();
        if(selected) {
            this.fireEvent('sessionselect', this, selected);
        }
    },

    getSelectedItem: function(){
        return this.view.getSelectionModel().getSelection()[0] || false;    
    },

    onAddSessionClick: function(){
        var me = this;
        var id = Math.ceil(Math.random() * 100000000000000000);

        var data = {id: id, title:"AAAA New Session"}
        me.setLoading(true);
        Ext.Ajax.request({
            url: "/data/jsonstore.xqy",
            method: "PUT",
            success: function() {
                me.setLoading(false);
            },
            params: {uri: "/session/" + id + ".json"},
            jsonData: data
        });
    }
});
