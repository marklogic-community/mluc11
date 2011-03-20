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

module namespace security-util = "security-util";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

declare function security-util:createNewUser(
    $username as xs:string, 
    $password as xs:string,
    $description as xs:string,
    $role as xs:string,
    $providerName as xs:string, 
    $providerUserId as xs:string,
    $securityDatabaseName as xs:string
) as xs:unsignedLong?
{
    if($username = security-util:getExistingUsers())
    then xdmp:log(concat("User ", $username, " already exists"))
    else
        try {
            xdmp:eval(
                "xquery version '1.0-ml'; 
                import module namespace sec='http://marklogic.com/xdmp/security' at '/MarkLogic/security.xqy';
                declare variable $username as xs:string external;
                declare variable $description as xs:string external;
                declare variable $password as xs:string external;
                declare variable $role as xs:string external;

                sec:create-user($username, $description, $password, $role, (), ())
                ",
                (xs:QName("username"), $username, xs:QName("description"), $description, xs:QName("password"), $password, xs:QName("role"), $role),
                <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
            )
        }
        catch($e) {
            xdmp:log(concat("FAILED TO CREATE USER. Error: ", string($e/*:message[1])))
        } 
};

declare function security-util:createNewUser(
    $username as xs:string, 
    $password as xs:string,
    $description as xs:string,
    $role as xs:string,
    $providerName as xs:string, 
    $providerUserId as xs:string
) as xs:unsignedLong?
{
    security-util:createNewUser($username, $password, $description, $role, $providerName, $providerUserId, "Security")   
};

(:~ 
 : Create a new role in the Security database for the given database
 : @param $roleName 
 : @param $description the role description
 : @param $securityDatabaseName
 :)
declare function security-util:createRole(
    $roleName as xs:string,
    $description as xs:string,
    $securityDatabaseName as xs:string
) as xs:unsignedLong?
{
    if($roleName = security-util:getExistingRoles())
    then xdmp:log(concat("Role ", $roleName, " already exists"))
    else
        xdmp:eval(
            "xquery version '1.0-ml'; 
            import module namespace sec='http://marklogic.com/xdmp/security' at '/MarkLogic/security.xqy';
            declare variable $roleName as xs:string external;
            declare variable $description as xs:string external;

            sec:create-role($roleName, $description, (), (), ())
            ",
            (xs:QName("roleName"), $roleName, xs:QName("description"), $description),
            <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
        )        
};

declare function security-util:createRole(
    $roleName as xs:string,
    $description as xs:string
) as xs:unsignedLong?
{
    security-util:createRole($roleName, $description, "Security") 
};

(:~
 : Return the existing roles in the Security database
 :)
declare function security-util:getExistingRoles(
    $securityDatabaseName as xs:string
)
{
    xdmp:eval(
        "xquery version '1.0-ml'; data(/sec:role/sec:role-name)", (),
        <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
    )
};

declare function security-util:getExistingRoles(
)
{
    security-util:getExistingRoles("Security") 
};

(:~
 : Return the existing users in the Security database
 :)
declare function security-util:getExistingUsers(
    $securityDatabaseName as xs:string
)
{
    xdmp:eval(
        "xquery version '1.0-ml'; data(/sec:user/sec:user-name)", (),
        <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
    )
};

declare function security-util:getExistingUsers(
)
{
    security-util:getExistingUsers("Security")
};

declare function security-util:addRoleToRole(
    $roleName as xs:string,
    $roleToAdd as xs:string,
    $securityDatabaseName as xs:string
) as empty-sequence()
{
    if($roleName = security-util:getRolesOfRole($roleName))
    then xdmp:log(concat("Role ", $roleName, " already has ", $roleToAdd, " role"))
    else
        xdmp:eval(
            "xquery version '1.0-ml'; 
            import module namespace sec='http://marklogic.com/xdmp/security' at '/MarkLogic/security.xqy';
            declare variable $roleName as xs:string external;
            declare variable $roleToAdd as xs:string external;

            sec:role-add-roles($roleName, $roleToAdd)
            ",
            (xs:QName("roleName"), $roleName, xs:QName("roleToAdd"), $roleToAdd),
            <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
        )
};

declare function security-util:addRoleToRole(
    $roleName as xs:string,
    $roleToAdd as xs:string
) as empty-sequence()
{
    security-util:addRoleToRole($roleName, $roleToAdd, "Security") 
};

(:~
 : Return the existing roles in the Security database
 :)
declare function security-util:getRolesOfRole(
    $roleName as xs:string,
    $securityDatabaseName as xs:string
) as xs:string*
{
    try {
        xdmp:eval(
            "xquery version '1.0-ml'; 
            import module namespace sec='http://marklogic.com/xdmp/security' at '/MarkLogic/security.xqy';
            declare variable $roleName as xs:string external;

            sec:role-get-roles($roleName)
            ",
            (xs:QName("roleName"), $roleName),
            <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
        )
    }
    catch($err) {
        xdmp:log(concat("Couldn't getRolesOfRole because Role ", $roleName, " doesn't exist! ", string($err/*:message)))
    }    
};

declare function security-util:getRolesOfRole(
    $roleName as xs:string
) as xs:string*
{
    security-util:getRolesOfRole($roleName, "Security") 
};

(:~ 
 : Add a sequence of privileges to a role
 : @param $role the name of the role
 : @param $privs a sequence of privileges
 :)
declare function security-util:addPrivileges(
    $role as xs:string,
    $privs as xs:string*,
    $securityDatabaseName as xs:string
) as empty-sequence()
{
    for $priv in $privs
    return xdmp:eval(
        "xquery version '1.0-ml'; 
        import module namespace sec='http://marklogic.com/xdmp/security' at '/MarkLogic/security.xqy';
        declare variable $priv as xs:string external;
        declare variable $role as xs:string external;

        sec:privilege-add-roles($priv, 'execute', $role)
        ",
        (xs:QName("priv"), $priv, xs:QName("role"), $role),
        <options xmlns="xdmp:eval"><database>{ xdmp:database($securityDatabaseName) }</database></options>
    )
};

declare function security-util:addPrivileges(
    $role as xs:string,
    $privs as xs:string*
) as empty-sequence()
{
    security-util:addPrivileges($role, $privs, "Security") 
};
