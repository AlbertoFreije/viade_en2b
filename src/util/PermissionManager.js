const SolidAclUtils = require('solid-acl-utils');
const auth = require('solid-auth-client');
// You could also use SolidAclUtils.Permissions.READ instead of following
// This is just more convenient
const { AclApi, AclDoc, AclParser, AclRule, Permissions, Agents } = SolidAclUtils;
const { READ, WRITE, APPEND, CONTROL } = Permissions;


/**
 * Method that sets a permission for an
 * specific url for a specific user
 * @param {*} permission, string as "READ", "WRITE", "APPEND", "CONTROL" that represent the permission
 * @param {*} urlToShare url of the resource to be shared.
 * @param {*} webIdFriend id of the person to share the resource with.
 */
export async function setPermissionsTo(permission, urlToShare, webIdFriend){
    console.log('IN SETPERMISSIONS')
    const mode = getMode(permission);

    const fetch = auth.fetch.bind(auth);
    const utils = new AclApi(fetch, { autoSave: true });
    const acl = await utils.loadFromFileUrl(urlToShare);

    //Setting permissions
    let permissions = new Permissions();
    permissions.add(mode);

    //Setting person to grant access to.
    let agents = new Agents();
    agents.addWebId(webIdFriend);

    await acl.addRule(permissions, agents);
    console.log('PERMISSION ADDED');

}

/**
 * Method that deletes a permission for an
 * specific url for a specific user
 * @param {*} permission, string as "READ", "WRITE", "APPEND", "CONTROL" that represent the permission to be deleted
 * @param {*} urlToShare url of the resource that was shared.
 * @param {*} webIdFriend id of the person that the resource was shared with.
 */
export async function deletePermissions(permission, urlToShare, webIdFriend){

    const mode = getMode(permission);

    const fetch = auth.fetch.bind(auth);
    const utils = new AclApi(fetch, { autoSave: true });
    const acl = await utils.loadFromFileUrl(urlToShare);

    // Revoke permissions
    await acl.deleteRule(mode, webIdFriend);
    console.log("Done!"); 
}

/**
 * Checks whether a user has a permission over an specific 
 * file or not.
 * @param {*} permission 
 * @param {*} webId 
 * @param {*} filePath 
 */
export async function checkPermissions(permission, webId, filePath){
    const fetch = auth.fetch.bind(auth);
    const utils = new AclApi(fetch, { autoSave: true });
    const acl = await utils.loadFromFileUrl(filePath);

    
    let mode = getMode(permission);
    const permissions = acl.getPermissionsFor(webId);
    const value = permissions.permissions;
    return value.has(mode);
}

export async function getUsersForResource(webId, filePath){
    //get files that you can read from.??

    const fetch = auth.fetch.bind(auth);
    const utils = new AclApi(fetch, { autoSave: true });
    const acl = await utils.loadFromFileUrl(filePath);


    // Check if someone else has writing access
    const agents = acl.getAgentsWith(WRITE)
    console.log([...agents.webIds]) // array containing all webIds which have write access
    console.log([...agents.groups])
    console.log(agents.hasPublic())
    console.log(agents.hasAuthenticated()) // Authenticated means everyone who is logged in


}
/**
 * Auxiliar method that given a string representing
 * the permission, returns the specific permission.
 * 
 * @param {} permission 
 */
export function getMode(permission){
    switch(permission){
        case("READ"):
            return READ;

        case("WRITE"):
            return WRITE;

        case("APPEND"):
            return APPEND;

        case("CONTROL"):
            return CONTROL;
    }
}
