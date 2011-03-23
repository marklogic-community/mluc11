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
        title: "Twitter"
    });

    var tweetTemplate = new Ext.XTemplate(
        '<div class="tweets">',
            '<tpl for=".">',
                '<div class="tweet">',
                    '<a href="http://twitter.com/{from_user}" target="_blank"><img src="{profile_image_url}"/></a>',
                    '<div class="text"><span class="username"><a href="http://twitter.com/{from_user}" target="_blank">{from_user}</a></span><br>',
                    '{[this.linkifyText(values.text)]}<br><span class="date">{[mluc.friendlyDateSince(values.created_at_date)]}</span></div>',
                '</div>',
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
    );

    var fetchTweets = function(twitterPanel) {
        twitterPanel.update('');
        twitterPanel.setLoading(true, true);

        Ext.util.JSONP.request({
            url: "http://search.twitter.com/search.json",
            callbackKey: "callback",
            params: {                    
                q: "#marklogic",
                rpp: 100
            },

            callback: function(result) {
                if(result.results !== undefined) {
                    for(var i = 0; i < result.results.length; i += 1) {
                        var curResult = result.results[i];
                        curResult.created_at_date = Date.parseDate(curResult.created_at, "D, d M Y G:i:s O");
                    }

                    twitterPanel.getComponent(0).update(result.results);
                    // panel.scroller.scrollTo({x: 0, y: 0});                     
                }
                else {
                    alert("There was an error fetching the latest Tweets");
                }

                twitterPanel.setLoading(false);
            }
        });
    };

    mluc.views.Twitter = Ext.extend(Ext.Panel, {
        title: "Twitter",
        iconCls: "twitter",
        // scroll: "vertical",
        layout: "card",
        dockedItems: [toolBar],
        items: [
            {
                xtype: "panel",
                tpl: tweetTemplate,
                scroll: "vertical",
            }
        ],
        listeners: {
            show: fetchTweets
        }
    });
})();
