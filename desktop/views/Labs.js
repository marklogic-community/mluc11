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

Ext.define('mluc.widgets.Labs', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sponsors',

    initComponent: function() {
        Ext.apply(this, {
            xtype: "container",
            title: "Developer Labs & Lounge",
            autoScroll: true,
            defaults: {bodyStyle:"padding:5px"},
            html: '\
                <table class="labs"><tbody> \
                    <tr> \
                        <td colspan="3" rowspan="1"><strong>WEDNESDAY, April 27</strong></td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">10:00AM-11:00AM</td> \
                        <td rowspan="1" colspan="1">Query Performance: Tips from the Trenches</td> \
                        <td rowspan="1" colspan="1">Paul Rooney, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1">11:00AM-11:30AM</td> \
                        <td rowspan="1" colspan="1">Optimization: Instrumentation &amp; Query Avoidance</td> \
                        <td rowspan="1" colspan="1">Dave Steiner, LDS</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:00PM-2:20PM</td> \
                        <td rowspan="1" colspan="1">Want to Know How We Test MarkLogic Server?</td> \
                        <td rowspan="1" colspan="1">Raghu Polasani and Larry Ratcliff, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:20PM-2:40PM</td> \
                        <td rowspan="1" colspan="1">Easy Page Composition with XML Style Tags: Work in Progress</td> \
                        <td rowspan="1" colspan="1">Erik Hennum, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:40PM-3:00PM</td> \
                        <td rowspan="1" colspan="1">Lightweight Binding of HTML Forms to XML</td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 3:00PM-3:20PM</td> \
                        <td rowspan="1" colspan="1">Mary\'s Crazy Hour: SQL</td> \
                        <td rowspan="1" colspan="1">Mary Holstege, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 3:20PM-3:40PM</td> \
                        <td rowspan="1" colspan="1">Mary\'s Crazy Hour: XCC</td> \
                        <td rowspan="1" colspan="1">Sam Neth, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 3:40PM-4:00PM</td> \
                        <td rowspan="1" colspan="1">Mary\'s Crazy Hour: Server Plugins</td> \
                        <td rowspan="1" colspan="1">Micah Dubinko, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 4:00PM-4:20PM</td> \
                        <td rowspan="1" colspan="1">TBA</td> \
                        <td rowspan="1" colspan="1"> </td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 4:20PM-4:45PM</td> \
                        <td rowspan="1" colspan="1">Tips for Diagnosing Server Behavior</td> \
                        <td rowspan="1" colspan="1">Ronnen Miller, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td colspan="3" rowspan="1"><br /> <strong>THURSDAY, April 28</strong></td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">10:20AM-10:40AM</td> \
                        <td rowspan="1" colspan="1">MarkLogic in a Nut-shell </td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1">10:40AM-11:00AM</td> \
                        <td rowspan="1" colspan="1">Build an App in 15 minutes with App Builder</td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">11:00AM-11:30AM</td> \
                        <td rowspan="1" colspan="1">XQuery Web Applications for Java Developers</td> \
                        <td rowspan="1" colspan="1">Ryan Semerau, LDS</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1">11:30AM-12:00PM</td> \
                        <td rowspan="1" colspan="1">Object-oriented vs. Functional Programming</td> \
                        <td rowspan="1" colspan="1">Ryan Semerau, LDS</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">12:00PM-12:30PM</td> \
                        <td rowspan="1" colspan="1">Tips for Diagnosing Server Behavior</td> \
                        <td rowspan="1" colspan="1">Ronnen Miller, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 1:45PM-2:05PM</td> \
                        <td rowspan="1" colspan="1">MarkLogic in a Nut-shell </td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:05PM-2:25PM</td> \
                        <td rowspan="1" colspan="1">Build an App in 15 minutes with App Builder</td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:25PM-2:45PM</td> \
                        <td rowspan="1" colspan="1">Open Source Hour: mluc11 app and mljson</td> \
                        <td rowspan="1" colspan="1">Ryan Grimm and Eric Bloch, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 2:45PM-3:05PM</td> \
                        <td rowspan="1" colspan="1">Open Source Hour: URL rewrite library</td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1"> 3:05PM-3:25PM</td> \
                        <td rowspan="1" colspan="1">Open Source Hour: Marker CMS Toolkit</td> \
                        <td rowspan="1" colspan="1">Eric Bloch, MarkLogic and Chad Chatfield, Avalon Consulting</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1"> 3:45PM-4:15PM</td> \
                        <td rowspan="1" colspan="1">Ask the Chief Architect</td> \
                        <td rowspan="1" colspan="1">Christopher Lindblad, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td colspan="3" rowspan="1"><br /> <strong>FRIDAY, April 29</strong></td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">10:00AM-10:20AM</td> \
                        <td rowspan="1" colspan="1">Monitoring MarkLogic with Nagios</td> \
                        <td rowspan="1" colspan="1">Wolfgang Krause, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1">10:20AM-10:40AM</td> \
                        <td rowspan="1" colspan="1">A Peek at Searchable Documentation</td> \
                        <td rowspan="1" colspan="1">Danny Sokolsky, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">10:40AM-11:00AM</td> \
                        <td rowspan="1" colspan="1">XSLT Web Sites</td> \
                        <td rowspan="1" colspan="1">Evan Lenz, MarkLogic</td> \
                    </tr> \
                    <tr> \
                        <td class="sched-time" rowspan="1" colspan="1">11:00AM-11:20AM</td> \
                        <td rowspan="1" colspan="1">Templating with Mustache</td> \
                        <td rowspan="1" colspan="1">Nuno Job, MarkLogic</td> \
                    </tr> \
                    <tr class="alt"> \
                        <td class="sched-time" rowspan="1" colspan="1">11:20AM-12:00PM</td> \
                        <td rowspan="1" colspan="1">Semantic Q&amp;A</td> \
                        <td rowspan="1" colspan="1">Professor Jim Hendler and Li Ding, RPI</td> \
                    </tr> \
                </tbody></table>'
        });
        this.callParent(arguments);
    }
});
