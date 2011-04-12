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

Ext.define('mluc.widgets.Sponsors', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sponsors',

    initComponent: function() {
        Ext.apply(this, {
            xtype: "container",
            title: "Sponsors",
            autoScroll: true,
            defaults: {bodyStyle:"padding:5px"}
        });
        this.callParent(arguments);
        this.renderSponsors(Ext.getStore("SponsorsStore"));
    },

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var element = Ext.get(e.target);
                if(element.hasCls("sponsor-header")) {
                    panel.showHideSponsorDetails(element);
                }
            });
        }
    },

    showHideSponsorDetails: function(clickedOn) {
        var container = Ext.get(clickedOn.findParent("div.sponsor-container"));
        if(!container) {
            return;
        }

        var sponsorDetails = container.child("div.sponsor-details");
        sponsorDetails.setVisibilityMode(Ext.core.Element.DISPLAY);
        sponsorDetails.setVisible(!sponsorDetails.isVisible(), true);
    },

    renderSponsors: function(sponsorsStore) {
        var sponsors = sponsorsStore.getRange();

        var i;
        for(i = 0; i < sponsors.length; i += 1) {
            var sponsor = sponsors[i];

            var extendedInfo = '<div class="sponsor-img"><img src="' + sponsor.get("imageURL") + '"/></div>';
            extendedInfo += '<p>' + sponsor.get("info") + '</p>';
            extendedInfo += '<div class="sponsor-site">Website: <a href="' + sponsor.get("websiteFull") + '" target="_new">' + sponsor.get("websitePretty") + '</a></div>';

            this.add({
                xtype: "container",
                html: '<div class="sponsor-container">' + 
                        '<div class="sponsor-header">' + sponsor.get("company") + ' (' + sponsor.get("level") + ')</div>' + 
                        '<div class="sponsor-details" style="display: none">' + extendedInfo + '</div>' +
                    '</div>'
            });
        }
    }
});
