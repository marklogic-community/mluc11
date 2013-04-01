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

import module namespace oauth2 = "oauth2" at "/lib/oauth2.xqy";
import module namespace prop = "http://xqdev.com/prop" at "/lib/properties.xqy";
declare namespace xdmphttp="xdmp:http";

let $provider := "facebook"
let $code := xdmp:get-request-field("code")


let $authProvider := /oauth_config/provider[@name eq $provider]
let $clientId := prop:get("oauth_id")
let $clientSecret := prop:get("oauth_secret")
let $redirectUrl := concat("http://", prop:get("redirect_domain"), "/oauth2/login.xqy")

let $scope := if($provider = "github") then "&amp;scope=user" else ""
let $accessTolkenUrl := concat($authProvider/access_token_url,
                                   "?client_id=",$clientId, 
                                   "&amp;redirect_uri=", xdmp:url-encode($redirectUrl),
                                   "&amp;code=", $code,
                                   "&amp;client_secret=", $clientSecret,
                                   $scope)

let $authorizationUrl := concat($authProvider/authorize_url, "?client_id=", $clientId, "&amp;redirect_uri=", xdmp:url-encode($redirectUrl))

return
    if(empty($code))
    then xdmp:redirect-response($authorizationUrl)
    else 
        let $accessTokenResponse := xdmp:http-get($accessTolkenUrl)
        return
            if(string($accessTokenResponse[1]/xdmphttp:code) eq "200")
            then
                let $oauthTokenData := oauth2:parseAccessToken($accessTokenResponse[2])
                let $providerUserData := oauth2:getUserProfileInfo($provider, $oauthTokenData)
                where exists($providerUserData)
                return 
                    let $userId := string($providerUserData/id)
                    let $markLogicUsername := oauth2:getOrCreateUserByProvider($provider, $userId, $providerUserData) 
                    let $authResult := oauth2:loginAsMarkLogicUser($markLogicUsername)
                    let $referer := xdmp:get-request-header("Referer")
                    let $set := xdmp:set-response-content-type("text/html")
                    return 
                        <html><script type="text/javascript"><![CDATA[
                            if(window.opener) {
                                window.opener.location.reload();
                                window.close();
                            }
                            else {
                                window.location = "http://mlw13.marklogic.com";
                            }
                        ]]></script></html>
                        (: the referrer gets lost sometimes from the original site, namely when you need to login iwth your credential
                           at facebook. If you're already logged in then it works fine. So if the referer is from facebook just
                           redirected to the root :)
                        (:
                        if($referer and not(starts-with($referer, "http://www.facebook.com")))
                        then xdmp:redirect-response($referer)
                        else xdmp:redirect-response("/oauth2/")
                        :)
            else
                (: if there's a problem just pass along the error :)
                xdmp:set-response-code(xs:integer($accessTokenResponse[1]/xdmphttp:code), string($accessTokenResponse[1]/xdmphttp:message))
