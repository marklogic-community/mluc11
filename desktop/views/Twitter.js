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

Ext.define('mluc.widgets.Twitter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.twitter',

    initComponent: function() {
        Ext.apply(this, {
            title: "Twitter",
            collapsible: true,
            region: 'east',
            split: true,
            width: 250,
            autoScroll: true,
            tpl: new Ext.XTemplate(
                '<div class="tweets">',
                    '<tpl for=".">',
                        '<table class="tweet"><tbody><tr>',
                            '<td class="icon"><a href="http://twitter.com/{[values.get("from_user")]}" target="_blank"><img src="{[values.get("profile_image_url")]}"/></a></td>',
                            '<td class="text">',
                                '<span class="username"><a href="http://twitter.com/{[values.get("from_user")]}" target="_blank">{[values.get("from_user")]}</a></span><br>',
                                '{[this.linkifyText(values.get("text"))]}<br>',
                                '<span class="date">{[values.get("date_formatted")]}</span>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</tpl>',
                '</div>',
                {
                    linkifyText: function(text) {
                        var urlRegex = /(http\:\/\/|https\:\/\/)+(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;
                        text = text.replace(urlRegex, function(value) {
                            return '<a href="' + value + '" target="_blank">' + value + '</a>';
                        });

                        var hashRegex = /( |^)(#|@)\w+/g;
                        text = text.replace(hashRegex, function(value) {
                            if(value.substring(0, 1) === " ") {
                                value = value.substring(1);
                            }

                            if(value.substring(0, 1) === "#") {
                                return ' <a class="hashref" href="http://twitter.com/search?q=%23' + value.substring(1) + '" target="_blank">' + value + '</a>';
                            }
                            else {
                                return ' <a class="userref" href="http://twitter.com/' + value.substring(1) + '" target="_blank">' + value + '</a>';
                            }
                        });

                        return text;
                    }
                }
            )
        });

        Ext.regModel('Tweet', {
            fields: [
                {name: "id", mapping: "id_str", type: "string"},
                {name: "from_user", type: "string"},
                {name: "text", type: "string"},
                {name: "profile_image_url", type: "string"},
                {name: "created_at", type: "string"},
                {name: "created_at_date", convert: function(value, record) { return Ext.Date.parseDate(record.get("created_at"), "D, d M Y G:i:s O"); }},
                {name: "date_formatted", convert: function(value, record) { return mluc.friendlyDateSince(record.get("created_at_date")); }}
            ]
        });

        Ext.regStore("TweetStore", {
            model: 'Tweet',
            proxy: {
                type: 'scripttag',
                url : 'http://search.twitter.com/search.json',
                extraParams: {
                    q: "marklogic OR mluc11",
                    rpp: 100
                },
                reader: {
                    root: "results"
                }
            },
            listeners: {
                load: this.renderTweets
            },
            autoLoad: true
        });

        this.callParent(arguments);
    },

    renderTweets: function(tweetStore, records, successful) {
        mluc.views.Twitter.update(records);
    }
});
