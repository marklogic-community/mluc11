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

Ext.ns("mluc", "mluc.widgets", "mluc.views");

Ext.define("mluc.RawJsonWriter", {
    extend: "Ext.data.Writer",
    alias: "writer.rawjson",
    writeRecords: function(request, data) {
        for(var i = 0; i < data.length; i += 1) {
            var record = data[i];
            for(var j = 0; j < this.ignoreKeys.length; j += 1) {
                delete record[this.ignoreKeys[j]];
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

Ext.regModel("Speaker", {
    fields: [
        {name: "id", type: "string"},
        {name: "name", type: "string"},
        {name: "email", type: "string"},
        {name: "position", type: "string"},
        {name: "affiliation", type: "string"},
        {name: "bio", type: "string"}
    ]
});

Ext.regModel("Session", {
    fields: [
        {name: "id", type: "string"},
        {name: "title", type: "string"},
        {name: "plenary", type: "boolean"},
        {name: "speakerIds", mapping: "speakers"},
        {name: "startTime", type: "date", dateFormat: "c"},
        {name: "endTime", type: "date", dateFormat: "c"},
        {name: "location", type: "string"},
        {name: "track", type: "string"},
        {name: "type", type: "string"},
        {name: "sponsor", type: "string"},
        {name: "abstract", type: "string"}
    ]
});

Ext.regModel("Attendee", {
    fields: [
        {name: "id", type: "string"},
        {name: "sessionId", type: "string"},
        {name: "username", type: "string"},
        {name: "realname", type: "string"},
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
        }
    }
});

Ext.regModel("Sponsor", {
    fields: [
        {name: "id", type: "string"},
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
            property : "name",
            direction: "ASC"
        }
    ],
    getGroupString: function(record) {
        var name = record.get("name");
        var bits = name.split(" ");
        var last = bits[bits.length - 1];
        return last[0];
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
            property : "startTime",
            direction: "ASC"
        },
        {
            property : "track",
            direction: "ASC"
        }
    ],
    getGroupString: function(record) {
        return record.get("startTime").format("g:ia") + " &ndash; " + record.get("endTime").format("g:ia");
    }
});

Ext.regStore("SessionSearchStore", {
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
            property : "startTime",
            direction: "ASC"
        },
        {
            property : "track",
            direction: "ASC"
        }
    ]
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
            sorterFn: function(mySession1, mySession2) {
                var sessionStore = Ext.getStore("SessionStore");
                var session1 = sessionStore.getById(mySession1.get("sessionId"));
                var session2 = sessionStore.getById(mySession2.get("sessionId"));

                return session1 > session2 ? 1 : (session1 < session2 ? -1 : 0);
            }
        }
    ],
    getGroupString: function(record) {
        var sessionStore = Ext.getStore("SessionStore");
        var session = sessionStore.getById(record.get("sessionId"));

        return session.get("startTime").format("g:ia") + " &ndash; " + session.get("endTime").format("g:ia");
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
            company: "Avalon Consulting, LLC",
            tagline: "We're super awesome",
            level: "Platinum",
            imageURL: "http://www.avalonconsult.com/themes/avalonconsult/images/header_logo.gif",
            websiteFull: "http://www.avalonconsult.com/",
            websitePretty: "avalonconsult.com",
            email: "us@avalonconsult.com",
            phone: "123-456-7890"
        },
        {
            id: "2",
            company: "Cognizant Technology Solutions",
            tagline: "We're also awesome",
            level: "Gold",
            imageURL: "http://www.cognizant.com/CognizantDotcomImages/cts-logo.jpg",
            websiteFull: "http://www.cognizant.com/",
            websitePretty: "cognizant.com",
            email: "us@cognizant.com",
            phone: "123-456-7890"
        },
        {
            id: "3",
            company: "Flatirons Solutions",
            tagline: "Don't forget about us!",
            level: "Gold",
            imageURL: "http://flatironssolutions.com/styleresources/images/logo.png",
            websiteFull: "http://flatironssolutions.com",
            websitePretty: "flatironssolutions.com",
            email: "us@flatironssolutions.com",
            phone: "123-456-7890"
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
    document.cookie = name + "=" + value + expires + "; path=/; domain=" + document.domain + ";";
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
    window.location = "/oauth2/login.xqy";
};

mluc.logout = function() {
    mluc.eraseCookie("MLUC-SESSION");
    mluc.eraseCookie("MLUC-USERNAME");
    mluc.eraseCookie("MLUC-NAME");
}

mluc.isLoggedIn = function() {
    var username = mluc.readCookie("MLUC-USERNAME");
    return username && username.length > 0;
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
