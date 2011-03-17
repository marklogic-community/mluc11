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
        <title>Mark Logic User Conference 2011</title>
        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
        <link href="/sencha-touch/resources/css/sencha-touch.css" rel="stylesheet" type="text/css" />
        <link href="/css/app.css" rel="stylesheet" type="text/css" />
    </head> 
    <body><!-- --></body> 
    <script src="/sencha-touch/sencha-touch-debug.js" type="text/javascript"><!-- --></script>
    <script src="/js/app.js" type="text/javascript"><!-- --></script>
    <script src="/views/SessionViewer.js" type="text/javascript"><!-- --></script>
    <script src="/views/Schedule.js" type="text/javascript"><!-- --></script>
    <script src="/views/Speakers.js" type="text/javascript"><!-- --></script>
    <script src="/views/Twitter.js" type="text/javascript"><!-- --></script>
    <script src="/views/Sponsors.js" type="text/javascript"><!-- --></script>
    <script src="/views/Favorites.js" type="text/javascript"><!-- --></script>
</html>
