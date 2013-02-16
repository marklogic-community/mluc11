xquery version "1.0-ml";

(:~
 : MarkLogic Redirect To/From Mobile
 :
 : Copyright 2011 MarkLogic Corporation
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
 :
 : @author Ryan Grimm (grimm@xqdev.com)
 : @version 0.1
 :
 :)

module namespace redirect = "http://marklogic.com/commons/mobile-redirect";
declare default function namespace "http://www.w3.org/2005/xpath-functions";


(:~
 : Tests to see if the user should be redirected to the appropriate site for
 : their device and performs the redirect as well. If the user is on a mobile
 : browser but the request was made to the desktop version of the app, redirect
 : the user, likewise if the user is on a desktop browser but viewing the mobile
 : site.
 :
 : Note: This library operates under the assumption that the desktop and mobile
 : versions of the site operate under two different HTTP ports.
 :
 : @param $desktopPort The server port that the desktop version of the app is running on
 : @param $mobilePort The server port that the mobile version of the app is running on
 : @param $desktopHost The host that the desktop version of the site is viewed at, for example: google.com
 : @param $mobileHost The host that the mobile version of the site is viewed at, for example: m.google.com
 :
 : @return Returns true if a redirect was issued, false otherwise.
 :)
declare function redirect:testAndPerformRedirect(
    $desktopPort as xs:integer,
    $mobilePort as xs:integer,
    $desktopHost as xs:string,
    $mobileHost as xs:string,
    $sticky as xs:string
) as xs:boolean
{
    let $newUrl := redirect:testForRedirect($desktopPort, $mobilePort, $desktopHost, $mobileHost, $sticky)
    return
        if(exists($newUrl))
        then (true(), xdmp:redirect-response($newUrl))
        else false()
};

(:~
 : Tests to see if the user should be redirected to the appropriate site for their device.
 : If the user is on a mobile browser but the request was made to the desktop
 : version of the app, redirect the user, likewise if the user is on a desktop
 : browser but viewing the mobile site.
 :
 : Note: This library operates under the assumption that the desktop and mobile
 : versions of the site operate under two different HTTP ports.
 :
 : @param $desktopPort The server port that the desktop version of the app is running on
 : @param $mobilePort The server port that the mobile version of the app is running on
 : @param $desktopHost The host that the desktop version of the site is viewed at, for example: google.com
 : @param $mobileHost The host that the mobile version of the site is viewed at, for example: m.google.com
 :
 : @return If a redirect is needed, the url to redirect to is returned. If no
 : redirect is needed, the empty sequence is returned.
 :)
declare function redirect:testForRedirect(
    $desktopPort as xs:integer,
    $mobilePort as xs:integer,
    $desktopHost as xs:string,
    $mobileHost as xs:string,
    $sticky as xs:string
) as xs:string?
{
    let $userAgent := xdmp:get-request-header("User-Agent")
    let $isMobile := matches($userAgent, "Android|iPhone|iPad|iPod")

    let $protocol := xdmp:get-request-protocol()
    let $emptyPort := if($protocol = "http") then 80 else 443
    let $existingPort := xs:integer((tokenize(xdmp:get-request-header("Host"), ":")[2], $emptyPort)[1])

    let $redirectToMobile := $isMobile = true() and $existingPort = $desktopPort
    let $redirectToDesktop := $isMobile = false() and $existingPort = $mobilePort

    where empty(xdmp:get-request-field($sticky))
    return
        if($redirectToMobile)
        then concat($protocol, "://", $mobileHost, xdmp:get-request-url())
        else if($redirectToDesktop)
        then concat($protocol, "://", $desktopHost, xdmp:get-request-url())
        else ()
};
