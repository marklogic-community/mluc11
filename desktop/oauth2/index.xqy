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

import module namespace cookies = "http://parthcomp.com/cookies" at "/lib/cookies.xqy";

let $set := xdmp:set-response-content-type("text/html")
let $sessionID := cookies:get-cookie("MLUC-SESSION")[1]
let $user := /user[sessionID = $sessionID]
return
    if(empty($user))
    then xdmp:redirect-response("/oauth2/login.xqy")
    else
<html>
    <head>
        <style>
            <![CDATA[
            a { text-decoration:none; color:#C00831; }
            body { margin:auto; width:350px; padding:20px; }
            #login-action { text-align:center; font-size:20px; font-family:Helvetica; font-weight:bold; }
            #login-action span { font-size:14px; }
            #profile { background-color:#EFEFEF; height:50px; padding:5px; margin:10px; }
            #profile img { float:left; height:50px;}
            #profile div { float:left;padding: 14px 0 0 10px; }
            #profile span { font-size:0.8em; color:gray;}
            ]]>
        </style>
    </head>
    <body>
        <div id="profile">
            <img src="{ $user/provider-data/picture }"/>
            <div>
                <a href="{ string($user/provider-data/link) }">{ string($user/provider-data/name) }</a><br/>
                <span>via { string($user/provider-data/@name) }</span>
            </div>
        </div>
        <div id="login-action">
            <a href="logout.xqy">Logout</a>
        </div>
    </body>
</html>
