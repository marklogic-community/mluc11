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

(function() {
    
    var toolBar = new Ext.Toolbar({
        dock: "top",
        title: "Schedule"
    });

    var viewDetails = function(scheduleList, index, elementItem, eventObject) {
        toolBar.add({
            xtype: "button",
            ui: "back",
            text: toolBar.title,
            handler: goBack
        });
        toolBar.doLayout();


        mluc.scheduleView.setActiveItem(1, {
            type: "slide",
            direction: "left"
        });

        var session = scheduleList.store.getAt(index);
        // scheduleList.deselect([session]);
        toolBar.setTitle("Info");

        mluc.scheduleView.getComponent(1).viewSession(session);
    };
    
    var goBack = function() {
        mluc.scheduleView.setActiveItem(0, {
            type: "slide",
            direction: "right"
        });
        var button = toolBar.getComponent(0);
        toolBar.setTitle(button.text);
        toolBar.remove(0);

        window.setTimeout(function() {
            var scheduleList = mluc.scheduleView.getComponent(0).getComponent(1);
            scheduleList.deselect(scheduleList.getSelectedRecords());
        }, 500);
    };

    var searchSchedule =  function(searchInput, eventObject) {
        var store = Ext.getStore("SessionStore");
        var userQuery = searchInput.getValue();
        var query = {key: "title"};
        if(userQuery.length !== 0) {
            var words = userQuery.split(" ");
            var keywords = [];
            for(var i = 0; i < words.length; i += 1) {
                var wildcarded = false;
                if(i === words.length - 1) {
                    wildcarded = true;
                    words[i] += "*";
                }
                keywords.push({
                    "or": [
                        {"contains": {"key": "title", "string": words[i], "weight": 3, "caseSensitive": false, "wildcarded": wildcarded}},
                        {"contains": {"key": "abstract", "string": words[i], "weight": 2, "caseSensitive": false, "wildcarded": wildcarded}},
                        {"contains": {"key": "track", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}},
                        {"contains": {"key": "location", "string": words[i], "weight": 1, "caseSensitive": false, "wildcarded": wildcarded}}
                    ]
                });
            }

            query = {
                "fulltext": {
                    "and": keywords
                }
            }
        }
        store.proxy.extraParams = {q: Ext.util.JSON.encode(query)};
        store.load(function() {});
    };

    mluc.views.Schedule = Ext.extend(Ext.Panel, {
        title: "Schedule",
        iconCls: "schedule",
        layout: "card",
        scroll: false,
        dockedItems: [toolBar],
        items: [
            {
                xtype: "panel",
                scroll: "vertical",
                items:[
                    {
                        scroll: false,
                        xtype: "searchfield",
                        cls: "search-box",
                        placeHolder: "Search sessions",
                        listeners: {
                            keyup: searchSchedule
                        }
                    },
                    {
                        xtype: "list",
                        scroll: false,
                        grouped: true,
                        html: "Loading...",
                        emptyText: "No Sessions",
                        itemTpl: "<span class='session-track'>{track}</span><br><span class='session-title'>{title}</span><br><span class='session-room'>{location}</span>",
                        cls: "session-list",
                        multiSelect: false,
                        singleSelect: true,
                        store: "SessionStore",
                        listeners: {
                            itemtap: viewDetails
                        }
                    }
                ]
            },
            {
                xtype: "sessionviewer",
            }
        ],
    });
})();
