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

module namespace oauth2 = "oauth2";
declare namespace xdmphttp="xdmp:http";
import module namespace sec="http://marklogic.com/xdmp/security" at "/MarkLogic/security.xqy";
import module namespace security-util = "security-util" at "security-util.xqy";
import module namespace cookies = "http://parthcomp.com/cookies" at "cookies.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

(:~
 : Fetch the user profile info for the given provider, basically a router function
 : @param $provider the provider name corresponding the provider config setup
 : @param $oauth_token_data the oauth2 access_token for the current users session
 : @return the provider-data node() block
 :)
declare function oauth2:getUserProfileInfo(
    $provider as xs:string,
    $oauth_token_data as map:map
) as element(provider-data)?
{
    let $access_token := map:get($oauth_token_data, "access_token")    
    return
        if($provider = "facebook")
        then oauth2:facebookUserProfileInfo($access_token) 
        else oauth2:githubUserProfileInfo($access_token) 
};

(:~
 : Given the user_data map, get the request token and call to Facebook to get profile information
 : populate the profile information in the map (see within for those values
 :) 
declare function oauth2:facebookUserProfileInfo(
    $access_token as xs:string
) as element(provider-data)?
{
    let $profile_response := xdmp:eval(
            "xquery version '1.0-ml';
            declare variable $profile_url as xs:string external;

            xdmp:http-get($profile_url, <options xmlns='xdmp:http-get'><format xmlns='xdmp:document-get'>text</format></options>)
            ",
            (xs:QName("profile_url"), concat("https://graph.facebook.com/me?access_token=", $access_token))
        )
    where string($profile_response[1]/xdmphttp:code) eq "200"
    return
        let $json_response := $profile_response[2]
        let $map_response := xdmp:from-json($profile_response[2])
        return
            <provider-data name="facebook">
                <id>{ map:get($map_response, "id") }</id>
                <name>{ map:get($map_response, "name") }</name>
                <link>{ map:get($map_response, "link") }</link>
                <gender>{ map:get($map_response, "gender") }</gender>
                <picture>http://graph.facebook.com/{ map:get($map_response, "id") }/picture</picture>
            </provider-data>
};

(:~
 : Given the user_data map, get the request token and call to Facebook to get profile information
 : populate the profile information in the map (see within for those values
 :) 
declare function oauth2:githubUserProfileInfo(
    $access_token as xs:string
) as element(provider-data)?
{
    let $profile_response := xdmp:eval(
            "xquery version '1.0-ml';
            declare variable $profile_url as xs:string external;

            xdmp:http-get($profile_url)
            ",
            (xs:QName("profile_url"), concat("https://github.com/api/v2/xml/user/show?access_token=", $access_token))
        )
    where $profile_response[1]/xdmphttp:code/text() eq "200"
    return
        let $xml_response := $profile_response[2]
        return
            <provider-data name="github">
                <id>{ string($xml_response/user/login) }</id>
                <name>{ string($xml_response/user/name) }</name>
                <link>http://github.com/{ string($xml_response/user/login) }</link>
                <picture>http://www.gravatar.com/avatar/{ string($xml_response/user/gravatar-id) }</picture>
            </provider-data>
};

(:~
 : Parse the response text of an outh2 access token request into the token and 
 : expiration date
 : @param $responseText response text of the access token request
 : @return map containing access_token, expires
 :)
declare function oauth2:parseAccessToken(
    $responseText as xs:string
) as map:map
{
    let $params := tokenize($responseText, "&amp;")
    let $access_token := tokenize($params[1], "=")[2]
    let $expires_seconds := if($params[2]) then tokenize($params[2], "=")[2] else ()
    let $expires := if($params[2]) then current-dateTime() + xs:dayTimeDuration(concat("PT", $expires_seconds, "S")) else ()
    let $user_data := map:map()
    let $key := map:put($user_data, "access_token", $access_token)
    let $key := map:put($user_data, "expires", $expires)
    return $user_data
};

(:~
 : Given a provider name and provider user Id, look for a MarkLogic user that's mapped to that provider
 : identity
 :)
declare function oauth2:getOrCreateUserByProvider(
    $providerName as xs:string, 
    $providerUserId as xs:string,
    $providerUserData as element(provider-data)
) as xs:string
{                                                  
    let $userDetails := /user[provider-data/id = $providerUserId][provider-data/@name = $providerName]
    return  
        if($userDetails)
        then string($userDetails/@name)
        else 
            (: if the user could not be found then create it :)
            let $fullName := string($providerUserData/name)
            let $description := concat($providerName, " User ", $fullName, " (", $providerUserId, ")")
            let $username := concat($providerName, "_", $providerUserId)
            let $password := xs:string(xdmp:hash32($username))
            let $newuser := security-util:createNewUser($username, $password, $description, ("oauth-user"), $providerName, $providerUserId)
            let $usermapping := oauth2:mapUserToAuthProvider($username, $providerName, $providerUserData)
            return $username
};

(:~
 : Map a MarkLogic user to an auth provider. Create the provider data block
 : with details about the user from the auth provider
 : @param $markLogicUsername the username of the MarkLogic database user in the security database
 : @param $providerName the provider name corresponding to the provider config
 : @param $providerUserId the unique user id from the provider
 : @param $providerUserData node() block representing the user profile data from the provider
 : 
 :)
declare function oauth2:mapUserToAuthProvider(
    $markLogicUsername as xs:string, 
    $providerName as xs:string, 
    $providerUserData as node()
) as empty-sequence()
{

    xdmp:eval(
        "xquery version '1.0-ml';
        declare variable $markLogicUsername as xs:string external;
        declare variable $providerName as xs:string external;
        declare variable $providerUserData as element(provider-data) external;

        let $userDetail := /user[@name = $markLogicUsername]
        return
            if($userDetail)
            then
                if($userDetail/provider-data[@name = $providerName])
                then xdmp:node-replace($userDetail/provider-data[@name = $providerName], $providerUserData)
                else xdmp:node-insert-child($userDetail, $providerUserData)
            else

                xdmp:document-insert(concat('/users/', $markLogicUsername, '.xml'),
                    <user name='{ $markLogicUsername }'>{ $providerUserData }</user>,
                    (xdmp:permission('oauth-anon', 'read'), xdmp:permission('oauth-admin', 'update'))
                )
        ",
        (xs:QName("markLogicUsername"), $markLogicUsername, xs:QName("providerName"), $providerName, xs:QName("providerUserData"), $providerUserData)
    )

};

declare function oauth2:loginAsMarkLogicUser(
    $username as xs:string
) as empty-sequence()
{
    let $userDoc := /user[@name = $username]
    let $sessionID := string(xdmp:random())
    let $update :=
        xdmp:eval(
            "xquery version '1.0-ml';
            declare variable $username as xs:string external;
            declare variable $sessionID as xs:string external;

            let $userDoc := /user[@name = $username]
            let $log := xdmp:log($userDoc)
            where exists($userDoc)
            return
                if(exists($userDoc/sessionID))
                then xdmp:node-replace($userDoc/sessionID, <sessionID>{ $sessionID }</sessionID>)
                else xdmp:node-insert-child($userDoc, <sessionID>{ $sessionID }</sessionID>)
            ",
            (xs:QName("username"), $username, xs:QName("sessionID"), $sessionID)
        )
    return (
        cookies:add-cookie("MLUC-SESSION", $sessionID, current-dateTime() + xs:dayTimeDuration("P60D"), "localhost", "/", false()),
        cookies:add-cookie("MLUC-USERNAME", $username, current-dateTime() + xs:dayTimeDuration("P60D"), "localhost", "/", false()),
        cookies:add-cookie("MLUC-NAME", string($userDoc/provider-data/name), current-dateTime() + xs:dayTimeDuration("P60D"), "localhost", "/", false())
    )
};

declare function oauth2:logout(
) as empty-sequence()
{
    cookies:delete-cookie("MLUC-SESSION", "localhost", "/")
};
