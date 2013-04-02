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

Ext.ns("mluc", "mluc.views");

mluc.RawJsonWriter = Ext.extend(Ext.data.Writer, {

    writeRecords: function(request, data) {
        for(var i = 0; i < data.length; i += 1) {
            var record = data[i];
            if(this.ignoreKeys) {
                for(var j = 0; j < this.ignoreKeys.length; j += 1) {
                    delete record[this.ignoreKeys[j]];
                }
            }
        }

        if(data.length == 1) {
            request.jsonData = data[0];
        }
        else {
            request.jsonData = data;
        }
        return request;
    }
});
Ext.data.WriterMgr.registerType('rawjson', mluc.RawJsonWriter);

mluc.EmptyReader = Ext.extend(Ext.data.JsonReader, {
    extractData: function(root, returnRecords) {
        return [{}];
    }
});
Ext.data.ReaderMgr.registerType('emptyjson', mluc.EmptyReader);

Ext.regModel("Speaker", {
    fields: [
        {name: "id", type: "string"},
        {name: "name", type: "string"},
        {name: "email", type: "string"},
        {name: "position", type: "string"},
        {name: "affiliation", type: "string"},
        {name: "bio", type: "string"},

        {name: "lastName", convert: function(value, record) {
            var name = record.get("name");
            var bits = name.split(" ");
            var last = bits[bits.length - 1];
            if(last === "PhD") {
                last = bits[bits.length - 2];
            }
            return last;
        }}
    ],
});

Ext.regModel("Session", {
    fields: [
        {name: "id", type: "string"},
        {name: "title", type: "string"},
        {name: "plenary", type: "boolean"},
        {name: "featured", type: "boolean", defaultValue: false},
        {name: "giveSurvey", type: "boolean"},
        {name: "speakerIds"},
        {name: "startTime", type: "date", dateFormat: "c"},
        {name: "endTime", type: "date", dateFormat: "c"},
        {name: "location", type: "string"},
        {name: "track", type: "string"},
        {name: "type", type: "string"},
        {name: "sponsor", type: "string"},
        {name: "abstract", type: "string"}
    ],
});

Ext.regModel("Attendee", {
    fields: [
        {name: "id", type: "string"},
        {name: "sessionId", type: "string"},
        {name: "username", type: "string"},
        {name: "realname", type: "string"},
        {name: "reason", type: "string"},
        {name: "dateAdded", type: "date", dateFormat: "c"},
        // Pull in the session info
        {name: "title", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("title") : undefined; }},
        {name: "speakerIds", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("speakerIds") : undefined; }},
        {name: "startTime", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("startTime") : undefined; }},
        {name: "endTime", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("endTime") : undefined; }},
        {name: "location", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("location") : undefined; }},
        {name: "track", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("track") : undefined; }},
        {name: "type", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("type") : undefined; }},
        {name: "sponsor", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("sponsor") : undefined; }},
        {name: "abstract", convert: function(value, record) { var sesh = Ext.getStore("SessionStore").getById(record.get("sessionId")); return sesh ? sesh.get("abstract") : undefined; }},
    ],
    proxy: {
        type: "rest",
        url: "/data/jsonstore.xqy",
        appendId: false,
        buildUrl: function(request) {
            var records = request.operation.records || [];
            var record = records[0];
            var username = mluc.readCookie("MLUC-USERNAME");

            if(record) {
                request.params = {uri: "/attendee/" + username + "/" + record.get("sessionId") + ".json"};
            }

            return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);
        },
        writer: {
            type: "rawjson",
            ignoreKeys: ["title", "speakerIds", "startTime", "endTime", "location", "track", "type", "sponsor", "abstract"]
        },
        reader: {
            type: "emptyjson"
        }
    },
});

Ext.regModel("Sponsor", {
    fields: [
        {name: "id", type: "number"},
        {name: "company", type: "string"},
        {name: "tagline", type: "string"},
        {name: "level", type: "string"},
        {name: "imageURL", type: "string"},
        {name: "websiteFull", type: "string"},
        {name: "websitePretty", type: "string"},
        {name: "email", type: "string"},
        {name: "phone", type: "string"}
    ]
});

Ext.regModel("Survey", {
    fields: [
        {name: "id", type: "number"},
        {name: "forSession", type: "string"},
        {name: "userId", type: "string"},
        {name: "speakerQuality", type: "number"},
        {name: "sessionQuality", type: "number"},
        {name: "sessionComments", type: "string"},
        {name: "dateAdded", type: "date", dateFormat: "c"}
    ],
    proxy: {
        type: "rest",
        url: "/data/jsonstore.xqy",
        appendId: false,
        buildUrl: function(request) {
            var records = request.operation.records || [];
            var record = records[0];
            var username = mluc.readCookie("MLUC-USERNAME");

            if(record) {
                request.params = {uri: "/survey/" + username + "/" + record.get("forSession") + ".json"};
            }

            return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);
        },
        writer: {
            type: "rawjson"
        },
        reader: {
            type: "emptyjson"
        }
    },
});


Ext.regStore("SpeakerStore", {
    model: "Speaker",
    proxy: {
        type: "ajax",
        url: "/data/jsonquery.xqy",
        extraParams:{q: '{key:"name"}'},
        reader: {
            type: "json",
            root: "results",
            totalProperty: "count",
        }
    },
    sorters: [
        {
            property: "lastName",
            direction: "ASC"
        }
    ],
    getGroupString: function(record) {
        return record.get("lastName")[0];
    }
});

Ext.regStore("SessionStore", {
    model: "Session",
    proxy: {
        type: "ajax",
        url: "/data/jsonquery.xqy",
        extraParams:{q: '{key:"title"}'},
        reader: {
            type: "json",
            root: "results",
            totalProperty: "count",
        }
    },
    sorters: [
        {
            property: "startTime",
            direction: "ASC"
        },
        {
            property: "track",
            direction: "ASC"
        }
    ],
    getGroups: function() {
        var headers = [];
        var sessions = this.getRange();
        var sessionsAtTime = [];
        for(var i = 0; i < sessions.length; i += 1) {
            var timeHeader = sessions[i].get("startTime").format("l") + ", " +  sessions[i].get("startTime").format("g:ia") + " &ndash; " + sessions[i].get("endTime").format("g:ia");
            var nextTimeHeader = undefined;
            if(sessions[i + 1]) {
                nextTimeHeader = sessions[i].get("startTime").format("l") + ", " + sessions[i + 1].get("startTime").format("g:ia") + " &ndash; " + sessions[i + 1].get("endTime").format("g:ia");
            }

            sessionsAtTime.push(sessions[i]);

            // If the current time header isn't equal to the next one, that
            // means that it's the last one in the list and that we should push
            // it onto the headers array
            if(timeHeader !== nextTimeHeader) {
                headers.push({name: timeHeader, children: sessionsAtTime});
                sessionsAtTime = [];
            }
        }

        return headers;
    }
});

Ext.regStore("SpeakersSessionStore", {
    model: "Session",
    sorters: [
        {
            property: "startTime",
            direction: "ASC"
        },
        {
            property: "track",
            direction: "ASC"
        }
    ],
    data: [],
});

Ext.regStore("MySessionsStore", {
    model: "Attendee",
    proxy: {
        type: "ajax",
        url: "/data/jsonquery.xqy",
        extraParams:{q: '{key:"sessionId"}'},
        reader: {
            type: "json",
            root: "results",
            totalProperty: "count",
        }
    },
    sorters: [
        {
            property: "startTime",
            direction: "ASC"
        }
    ],
    getGroupString: function(record) {
        var sessionStore = Ext.getStore("SessionStore");
        var session = sessionStore.getById(record.get("sessionId"));

        return session.get("startTime").format("l, g:ia") + " &ndash; " + session.get("endTime").format("g:ia");
    }
});

Ext.regStore("SponsorsStore", {
    model: "Sponsor",
    getGroupString: function(record) {
        return record.get("level");
    },
    sorters: [
        {
            property : "id",
            direction: "ASC"
        }
    ],
    data: [
        {
            id: "1",
            company: "Intel",
            level: "Platinum",
            info: "Intel believes that every organization and individual in the world should be able to unlock the transformative potential of all data to enrich our lives through discovery and innovation, new business models, and consumer experiences. Intel is enabling its customers to obtain value from data by delivering robust open platforms that support innovation in analytics, from intelligent devices at the edge to servers, storage, and networks in the cloud.",
            imageURL: "http://www.marklogic.com/images/2013/04/mlw-sponsor-intel.gif",
            websiteFull: "http://hadoop.intel.com/",
            websitePretty: "hadoop.intel.com"
        },
        {
            id: "2",
            company: "SGI",
            level: "Platinum",
            info: "SGI is the trusted leader in technical computing. The company develops, markets and sells a broad line of mid-range and high-end scale-out and scale-up servers, complete data storage solutions and differentiating software. SGI solutions are used by scientific, technical and business communities to find answers to the most challenging and data-intensive problems which require large amounts of computing power and fast, efficient data movement both within the computing system and to and from large-scale data storage installations. Additionally, SGI provides an end-to-end Big Data architecture from data ingest to archive, including the SGI® DataRaptor™ for MarkLogic Database.",
            imageURL: "http://www.marklogic.com/images/2012/11/summit-sponsor-sgi.gif",
            websiteFull: "http://www.sgi.com/",
            websitePretty: "www.sgi.com"
        },
        {
            id: "3",
            company: "Tableau",
            level: "Platinum",
            info: "Tableau Software helps people see and understand data. Used by more than 10,000 organizations worldwide, Tableau’s award-winning software delivers fast analytics and rapid-fire business intelligence. Create visualizations and dashboards in minutes, then share in seconds. The result? You get answers from data quickly, with no programming required.",
            imageURL: "http://www.marklogic.com/images/2013/01/mlw-sponsor-tableau.gif",
            websiteFull: "http://www.tableausoftware.com/",
            websitePretty: "tableausoftware.com"
        },
        {
            id: "4",
            company: "Avalon Consulting, LLC",
            level: "Gold",
            info: "Avalon Consulting, LLC implements enterprise Web, Search, Big Data, and Learning solutions. We are the trusted partner to over one hundred clients, primarily Global 2000 companies, public agencies, and institutions of higher learning. Avalon partners with award-winning vendors and is known for providing a superior customer experience through a combination of business acumen, intellectual curiosity, and a collaborative work style. Avalon’s deep technical expertise mitigates project risk and reduces total cost of ownership for our clients.",
            imageURL: "http://www.marklogic.com/images/2012/11/summit-sponsor-avalon.gif",
            websiteFull: "http://www.avalonconsult.com/",
            websitePretty: "avalonconsult.com"
        },
        {
            id: "5",
            company: "Flatirons Solutions",
            level: "Gold",
            info: "Flatirons Solutions is a system integrator, reseller, and longtime MarkLogic partner specializing in content technology, DAM, and XML publishing solutions for both commercial and government clients. They are a leading provider for the publishing and media industries, focused on dynamic publishing, rich media management, and publishing and production process automation. Established in 2001, Flatirons Solutions is a privately-held company headquartered in Boulder, Colorado, with offices in Washington D.C. and London, England.",
            imageURL: "http://www.marklogic.com/images/2013/03/mlw-sponsor-flatirons.gif",
            websiteFull: "http://www.flatironssolutions.com/",
            websitePretty: "flatironssolutions.com"
        },
        {
            id: "6",
            company: "RSuite CMS",
            level: "Gold",
            info: "RSuite CMS is a content management system used by the world’s leading publishers to create, store, manage, transform, and deliver content. Powered by MarkLogic, RSuite CMS provides powerful workflow and search capabilities tofind, re-use, and create new derivative products. Drive production efficiencies by integrating RSuite CMS into your dynamic publishing environment.",
            imageURL: "http://www.marklogic.com/images/2012/10/summitseries-sponsor-rsi.gif",
            websiteFull: "http://www.rsicms.com/rsuite-cms",
            websitePretty: "rsicms.com"
        },
        {
            id: "7",
            company: "TEMIS",
            level: "Gold",
            info: "TEMIS helps organizations structure and leverage their unstructured information assets. Its flagship platform, Luxid®, identifies and extracts targeted information to semantically enrich content with domain-specific metadata. Luxid® enables professional publishers to efficiently package and deliver relevant information to their audience, and helps enterprises to intelligently analyze, discover and share increasing volumes of information.",
            imageURL: "http://www.marklogic.com/images/2012/10/summit-sponsor-temis.gif",
            websiteFull: "http://www.temis.com/",
            websitePretty: "temis.com"
        },
        {
            id: "8",
            company: "Yuxi Pacific",
            level: "Gold",
            info: "Yuxi Pacific helps companies generate new revenue from existing intellectual property, leveraging cutting edge technology to optimize content workflows, enrich content with metadata, and quickly create new product offerings. As early-adopters and trusted partners of MarkLogic, our firm has been conducting implementations since 2005 and has deep experience with XQuery, content management systems and semantic enrichment technology.",
            imageURL: "http://www.marklogic.com/images/2013/01/mlw-sponsor-yuxi.gif",
            websiteFull: "http://www.yuxipacific.com/",
            websitePretty: "yuxipacific.com"
        },
        {
            id: "9",
            company: "Esgisoft",
            level: "Silver",
            info: "Esgisoft is an IT consulting firm specialized in Enterprise Search / Information Retrieval / eDiscovery Solutions for customers across geographies. We deliver mobile search & high end ‘Enterprise Search Solutions’ to suit customer needs and meet their challenges. We have enabled clients to understand uniqueness of their innovative search aspirations and identify associated business risks.",
            imageURL: "http://www.marklogic.com/images/2013/02/mlw-sponsor-esgisoft.gif",
            websiteFull: "http://www.esgisoft.com/",
            websitePretty: "esgisoft.com"
        },
        {
            id: "10",
            company: "Innodata",
            level: "Silver",
            info: "Innodata is a leading provider of business process, technology, and consulting services. Our role in the digital revolution is that of an enabler. We help our clients by building and enhancing information products, creating smarter workflows, and empowering their e-book content.",
            imageURL: "http://www.marklogic.com/images/2013/01/mlw-sponsor-innodata.gif",
            websiteFull: "http://www.innodata.com/",
            websitePretty: "innodata.com"
        },
        {
            id: "11",
            company: "Smartlogic",
            level: "Silver",
            info: "At Smartlogic we focus our energy on creating value from unstructured content. We bring context to Big Data. We capture the semantics and language of your business and apply this to automatically analyze unstructured information in order to surface its value to your enterprise – something we call Content Intelligence.",
            imageURL: "http://www.marklogic.com/images/2013/04/mlw-sponsor-smartlogic.gif",
            websiteFull: "http://www.smartlogic.com/",
            websitePretty: "smartlogic.com"
        },
        {
            id: "12",
            company: "NetOwl",
            level: "Silver",
            info: "NetOwl® is the industry’s leading Text and Entity Analytics product suite for Big Data Analysis. NetOwl offers state-of-the-art entity extraction, link and event extraction, as well as geotagging, multicultural name matching, and identity resolution. NetOwl analyzes data in multiple languages and has demonstrated unparalleled accuracy and scalability in mission-critical environments.",
            imageURL: "http://www.marklogic.com/images/2013/04/mlw-sponsor-smartlogic.gif",
            websiteFull: "http://www.sra.com/",
            websitePretty: "sra.com"
        },
        {
            id: "16",
            company: "MarkLogic Developer Community",
            level: "Conference App Sponsor",
            info: "This application is powered by MarkLogic and sponsored the MarkLogic by Developer Community.  Its source code is available at <a href='https://github.com/marklogic/mluc11/tree/mlw13'>GitHub</a>",
            imageURL: "http://developer.marklogic.com/media/marklogic-community-badge.png",
            websiteFull: "http://developer.marklogic.com",
            websitePretty: "developer.marklogic.com"
        }
    ]
});

mluc.createCookie = function(name, value, days) {
    if(days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/; domain=mlw13.marklogic.com;";
};

mluc.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i += 1) {
        var c = ca[i];
        while(c.charAt(0)==' ') {
            c = c.substring(1, c.length);
        }
        if(c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
};

mluc.eraseCookie = function(name) {
    mluc.createCookie(name, "", -1);
};

mluc.login = function() {
    try { _gaq.push(['_trackEvent', 'click', 'login']); } catch (err) {}
    window.location = "/oauth2/login.xqy";
};

mluc.friendlyDateSince = function(time) {
    var currentTime = new Date();
    var sinceMin = Math.round((currentTime - time) / 60000);
    var since = '';
    if(sinceMin == 0) {
        var sinceSec = Math.round((currentTime - time) / 1000);
        if(sinceSec < 10)
            since = 'less than 10 seconds ago';
        else if(sinceSec < 20)
            since = 'less than 20 seconds ago';
        else
            since = 'half a minute ago';
    }
    else if(sinceMin == 1) {
        var sinceSec = Math.round((currentTime - time) / 1000);
        if(sinceSec == 30)
            since = 'half a minute ago';
        else if(sinceSec < 60)
            since = 'less than a minute ago';
        else
            since = '1 minute ago';
    }   
    else if(sinceMin < 45)
        since = sinceMin + ' minutes ago';
    else if(sinceMin > 44 && sinceMin < 60)
        since = 'about 1 hour ago';
    else if(sinceMin < 1440) {
        sinceHr = Math.round(sinceMin / 60);
        if(sinceHr == 1)
            since = 'about 1 hour ago';
        else
            since = 'about ' + sinceHr + ' hours ago';
    }
    else if(sinceMin > 1439 && sinceMin < 2880)
        since = '1 day ago';
    else {
        var sinceDay = Math.round(sinceMin / 1440);
        since = sinceDay + ' days ago';
    } 

    return since;
}

Ext.getStore("SessionStore").on("load", function() {
    var viewing = mluc.readCookie("MLUC-VIEWING");
    if(viewing) {
        mluc.eraseCookie("MLUC-VIEWING");
        viewing = Ext.util.JSON.decode(viewing);
        if(viewing.session) {
            var session = Ext.getStore("SessionStore").getById(viewing.session);
            if(session) {
                mluc.scheduleView.viewSession(session);
            }
        }
    }
});

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: '/images/mluc11-icon.png',
    glossOnIcon: false,

    onReady: function() {
        Ext.History.init();

        Ext.History.on("change", function(fragment) {
            if(Ext.is.Android) {
                window.scrollTo(0, window.innerHeight);
            }

            var type = fragment.substring(0, fragment.indexOf(":"));
            var id = fragment.substring(fragment.indexOf(":") + 1);
            var activeItem = mluc.tabPanel.getActiveItem();
            if(type === "session" && activeItem === mluc.scheduleView) {
                activeItem.viewSession(id);
            }
            else if(type === "speaker" && activeItem === mluc.speakersView) {
                activeItem.viewSpeaker(id);
            }
            else if(type === "speakersession" && activeItem === mluc.speakersView) {
                activeItem.viewSession(id);
            }
            else if(type === "favorite" && activeItem === mluc.favoritesView) {
                activeItem.viewSession(id);
            }
            else if(type === "sponsor" && activeItem === mluc.sponsorView) {
                activeItem.viewSponsor(id);
            }
            else if(typeof activeItem.goBack == "function") {
                activeItem.goBack();
            }
        });

        mluc.scheduleView = new mluc.views.Schedule();
        mluc.speakersView = new mluc.views.Speakers();
        mluc.twiterView = new mluc.views.Twitter();
        mluc.sponsorView = new mluc.views.Sponsors();
        mluc.favoritesView = new mluc.views.Favorites();

        mluc.tabPanel = new Ext.TabPanel({
            fullscreen: true,
            tabBar: {
                dock: 'bottom',
                ui: 'dark',
                layout: {pack: 'center'}
            },
            cardSwitchAnimation: false,
            layout: 'hbox',
            items: [mluc.scheduleView, mluc.speakersView, mluc.twiterView, mluc.sponsorView, mluc.favoritesView],
            listeners: {
                afterrender: function(panel) {
                    Ext.getStore("SpeakerStore").load(function() {
                        Ext.getStore("SessionStore").load(function() { });
                    });
                }
            }
        });
    }
});

mluc.closeSurvey = function() {
    mluc.mainPanel.setActiveItem(0, {
        type: "slide",
        direction: "down"
    });
}
