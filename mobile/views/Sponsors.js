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
        title: "Sponsors"
    });

    var sponsorDetailTemplate = new Ext.XTemplate(
        '<div class="sponsor-details grouped-container">',
            '<h2 class="group-name">{level} Sponsor</h2>',
            '<div class="sponsor-information section kv-layout">',
                '<div class="sponsor-image"><img src="{imageURL}"/></div>',
                '<table><tbody>',
                    '<tr><th>Company</th><td>{company}</td></tr>',
                    '<tr><th>Website</th><td><a href="{websiteFull}" target="_new">{websitePretty}</a></td></tr>',
                    '<tpl if="email"><tr><th>Email</th><td><a href="mailto:{email}">{email}</a></td></tr></tpl>',
                    '<tpl if="phone"><tr><th>Phone</th><td><a href="tel:{phone}">{phone}</a></td></tr></tpl>',
                    '<tr><td colspan="2" class="about">{info}</td></tr>',
                '</tbody></table>',
            '</div>',
        '</div>'
    );

    mluc.views.Sponsors = Ext.extend(Ext.Panel, {
        title: "Sponsors",
        iconCls: "sponsors",
        scroll: "vertical",
        layout: "card",
        dockedItems: [toolBar],
        items: [
            {
                xtype: "list",
                grouped: true,
                html: "Loading...",
                emptyText: "No Sponsors",
                itemTpl: "<span class='sponsor-name'>{company}</span>",
                cls: "sponsor-list",
                multiSelect: false,
                singleSelect: true,
                store: "SponsorsStore",
                listeners: {
                    itemtap: function(sponsorList, index, elementItem, eventObject) {
                        var sponsor = sponsorList.store.getAt(index);
                        mluc.sponsorView.viewSponsor(sponsor);
                    }
                }
            },
            {
                xtype: "panel",
                tpl: sponsorDetailTemplate,
                scroll: "vertical",
            }
        ],

        viewSponsor: function(sponsor) {
            if(typeof sponsor == "string") {
                sponsor = Ext.getStore("SponsorsStore").getById(parseInt(sponsor));
            }

            Ext.History.add("sponsor:" + sponsor.getId());
            toolBar.add({
                xtype: "button",
                ui: "back",
                text: toolBar.title,
                handler: this.goBack
            });
            toolBar.doLayout();

            mluc.sponsorView.setActiveItem(1, {
                type: "slide",
                direction: "left"
            });

            toolBar.setTitle("Info");

            mluc.sponsorView.getComponent(1).update(sponsor.data);
        },
    
        goBack: function() {
            var button = toolBar.getComponent(0);
            if(!button) {
                return;
            }

            Ext.History.add("");
            mluc.sponsorView.setActiveItem(0, {
                type: "slide",
                direction: "right"
            });
            toolBar.setTitle(button.text);
            toolBar.remove(0);
        }
    });
})();
