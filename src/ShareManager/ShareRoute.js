import { toast } from "react-toastify";
import { setPermissionsTo, checkPermissions, setPermissionsForEditor } from "util/PermissionManager";
import {
  createNotificationSummary,
  postNotification,
  createNotificationContent,
} from "NotificationManager/NotificationManager";
import { v4 as uuidv4 } from "uuid";
import { loadSpecificUserRoutesFiles } from "RouteManager/ListSpecificUserRoutes";
import {
  createContentAcl,
  createContentAclMedia,
  createContentAclComments
} from "data-access/FileManager/AclCreator";


/**
 * Function that allows a user to share a route with a friend.
 * Provides READ permissions to the friend over the route of the user autenticated,
 * and sends a notification to the inbox of the friend, containing the url of that
 * route.
 *
 * Example: ShareWith( "https://x.inrupt.net/viade/routes/Rusia.json", "https://x.inrupt.net/profile/card#me", "https://x.inrupt.net/profile/card#me")
 *
 * @param {String} route path to the route the user wants to share.
 * @param {String} profileFriend represents profile card of the friend.
 * @param {String} profileAuthor represents the profile card of the user autenticated.
 */
export async function ShareWith(route, profileFriend, profileAuthor) {
  //Sharing the route with the friend (it must be the profile of the friend).

  let webIdAuthor = profileAuthor.substring(0, profileAuthor.length - 16);
  webIdAuthor = webIdAuthor + "/";

  let webIdFriend = profileFriend.substring(0, profileFriend.length - 16);
  webIdFriend = webIdFriend + "/";

  const routeAtt = route.split("/");
  const routeName = routeAtt[routeAtt.length - 1];


  //creating an acl if necessary;
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAA');
  checkAclOrCreate(route, routeName);

  //check if it's already shared (you have to check and set permissions to the /profile/card#me)
  const shared = await checkPermissions("READ", profileFriend, route);
  if (!shared) {

    //set permissions to read in the route
    setPermissionsTo("READ", route, profileFriend);

    //retrieving media of the route
    const routeEntity = await loadSpecificUserRoutesFiles(route);

    if (routeEntity !== null && routeEntity !== undefined) {
      if (routeEntity.files !== null && routeEntity.files !== undefined) {
        if (
          routeEntity.files[0] !== null &&
          routeEntity.files[0] !== undefined
        ) {
          let media = routeEntity.files[0].files;

          if (media != undefined && media != null) {
            for (let i = 0; i < media.length; i++) {
              const element = media[i].filePath;
              //checking if it has acl
              let nameResource = element.split("/");
              let name = nameResource[nameResource.length - 1];

              checkAclOrCreateMedia(element, name);
              setPermissionsTo("READ", element, profileFriend);
            }
          }
        }
      }
    }
    

    //retrieving url of the comments
    const urlComments = webIdAuthor + 'viade/comments/' + routeName;

    // trying with normal name
    // just try to add the permission
    try {


      //trying with name of the route formatted nameRouteComments.jsonld

      const nameFormatComments = routeName.split('.');
      var nameFormatted = nameFormatComments[nameFormatComments.length - 2] + 'Comments.' + nameFormatComments[nameFormatComments.length - 1];
      const urlF = webIdAuthor + 'viade/comments/' + nameFormatted;      
      checkAclOrCreateAclComments(urlF, nameFormatted);
      setPermissionsForEditor(urlF, profileFriend);

    } catch (error) {
      console.log('The other user has not the file for the comments or not the specific format that this app uses');
    }

    //send notification to other user inbox
    const summary = createNotificationSummary(
      webIdAuthor,
      route,
      webIdFriend,
      new Date()
    );

    const uuid = uuidv4();
    const contenido = createNotificationContent(
      "Announce",
      "ROUTE",
      webIdFriend,
      summary.toString(),
      new Date(),
      uuid
    );

    try {
      postNotification(webIdFriend, contenido, uuid)
        .then()
        .catch((error) =>


          toast.error(
            "The user " + webIdFriend + " do not have an inbox with the correct specifications",
            {
              draggable: true,
              position: toast.POSITION.TOP_CENTER,
            }
          )


        );

      return true;
    } catch (e) {

      toast.error(
        "We could not post the notification in the other user's inbox",
        {
          draggable: true,
          position: toast.POSITION.TOP_CENTER,
        }
      )

      return false;
    }
  } else {
    toast.warn(
      "This route was already shared",
      {
        draggable: true,
        position: toast.POSITION.TOP_CENTER,
      }
    )
    return false;
  }
}

function checkAclOrCreate(url, routeName) {
  const auth = require("solid-auth-client");
  const FC = require("solid-file-client");
  const fc = new FC(auth);

  if (
    !fc
      .itemExists(url)
      .then()
      .catch((error) => {
        return;
      })
  ) {
    createContentAcl(url, routeName);
  }
}

function checkAclOrCreateMedia(url, mediaName) {
  const auth = require("solid-auth-client");
  const FC = require("solid-file-client");
  const fc = new FC(auth);

  if (
    !fc
      .itemExists(url)
      .then()
      .catch((error) => {
        return;
      })
  ) {
    createContentAclMedia(url, mediaName);
  }
}

//createContentAclComments


function checkAclOrCreateAclComments(url, name) {
  const auth = require("solid-auth-client");
  const FC = require("solid-file-client");
  const fc = new FC(auth);

  if (
    !fc
      .itemExists(url)
      .then()
      .catch((error) => {
        return;
      })
  ) {
    createContentAclComments(url, name);
  }
}
