xquery version "1.0-ml";

(:~
 : MarkLogic User Conference App
 : 
 : Copyright 2011 MarkLogic
 :
 : Licensed under the Apache License, Version 2.0 (the "License");
 : you may not use this file except in compliance with the License.
 : You may obtain a copy of the License at
 :
 :     http://www.apache.org/licenses/LICENSE-2.0
 :
 : Unless required by applicable law or agreed to in writing, software
 : distributed under the License is distributed on an "AS IS" BASIS,
 : WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 : See the License for the specific language governing permissions and
 : limitations under the License.
 :)

import module namespace redirect="http://marklogic.com/commons/mobile-redirect" at "lib/mobile-redirect.xqy";

let $set := xdmp:set-response-content-type("text/html")
where not(redirect:testAndPerformRedirect(8004, 8005, "mluc11.marklogic.com", "m.mluc11.marklogic.com", "sticky"))
return
"<!DOCTYPE html>",
<html> 
    <head> 
        <title>MLUC 2011</title>
        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
        <link href="/sencha-touch/resources/css/sencha-touch.css" rel="stylesheet" type="text/css" />
        <link href="/css/app.css" rel="stylesheet" type="text/css" />
    </head> 
    <body>Loading...</body> 
    <script src="/sencha-touch/sencha-touch.js" type="text/javascript"><!-- --></script>
    <script src="/js/app.js" type="text/javascript"><!-- --></script>
    <script src="/views/AllViews.js" type="text/javascript"><!-- --></script>
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-6638631-10']);
        _gaq.push(['_setDomainName', '.mlw13.marklogic.com']);
        _gaq.push(['_trackPageview']);
        (function() {{
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        }})();
    </script>
</html>
