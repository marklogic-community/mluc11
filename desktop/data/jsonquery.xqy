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

import module namespace jsonquery="http://marklogic.com/json-query" at "lib/json-query.xqy";
import module namespace json="http://marklogic.com/json" at "lib/json.xqy";

let $requestMethod := xdmp:get-request-method()
let $query := string(xdmp:get-request-field("q", "{}")[1])
let $rawOutut := exists(xdmp:get-request-field("raw")[1])
let $query :=
    if(string-length(normalize-space($query)) = 0)
    then "{}"
    else $query

return
    if($requestMethod = ("GET", "POST"))
    then
        if($rawOutut)
        then <response>{
                let $docs := jsonquery:execute($query)
                return (<count>{ count($docs) }</count>, <results>{ $docs }</results>)
            }</response>
        else
            let $docs := jsonquery:execute($query)
            let $jsonDocs := for $doc in $docs return json:xmlToJSON($doc)
            return concat("{""count"":", count($jsonDocs) , ", ""results"":[", string-join($jsonDocs, ","), "]}")
    else ()
