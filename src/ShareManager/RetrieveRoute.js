import { loadSpecificUserRoutesFiles } from 'RouteManager/ListSpecificUserRoutes';

const auth = require("solid-auth-client");
const FC = require("solid-file-client");
const fc = new FC(auth);



/**
 * Method that retrieves all the routes from the shared files
 * and lists them.
 * 
 * @param {String} routesURL url where the user
 * has the shared routes stored
 * for example "https://testingclrmrnd.inrupt.net/viade/shared/"
 */
export async function sharedRoutesList(routesURL) {
  const sharedPath = routesURL;
  const url = await retrieveSharedRoutes(sharedPath);

  let routes = [];
  for (let i = 0; i < url.length; i++) {
    //now, retrieving the specific route from the different urls
    let urlRoute = url[i];
    
    routes.push(loadSpecificUserRoutesFiles(urlRoute));
  }
  console.log(routes);
}


/**
 * Method that retrieves the file of the shared routes
 * from the folder shared of the user autenticated
 * 
 * Example: "https://testingclrmrnd.inrupt.net/viade/shared/"
 * @param {String} sharedPath 
 */

export async function retrieveSharedRoutes(sharedPath) {
  
  let routesJSONS = [];

  let content = await fc.readFolder(sharedPath);
  let files = content.files;

  for (let i = 0; i < files.length; i++) {
    let fileContent = await fc.readFile(files[i].url);
    routesJSONS.push(fileContent);
  }
  const url = jsonURLRetrieve(toJson(routesJSONS));
  return url;
}

/**
 * Method that retrieves the urls
 * of the file sharedroutes.js
 * @param {} routes 
 */
function jsonURLRetrieve(routes) {
  let routesShared = [];
  let routesURL = [];

  for (let i = 0; i < routes.length; i++) {
    try {
      let routesRetrieved = routes[i].routes;
      for (let i = 0; i < routesRetrieved.length; i++) {
        const routeURL = routesRetrieved[i]['@id'];
        routesURL.push(routeURL);
      }

      routesShared.push(routes[i].routes);
      return routesURL;

    } catch (e) {
      // console.log(
      //  "Route " + i + " couldn't be parsed because the format is wrong"
      //);
      // console.log(e);
    }
  }

  //return { routes: entRoutes, files: entFiles };
}

function toJson(routes) {
  console.log('Inside toJson')
  let jsonRoutes = [];
  for (let i = 0; i < routes.length; i++) {
    try {
      console.log(routes);
      let route = JSON.parse(routes[i]);
      jsonRoutes.push(route);
    } catch (e) {
      //console.log(
      //  "Route " +
      //    i +
      //    " couldn't be transformed to json because the format is wrong"
      //);
    }
  }
  return jsonRoutes;
}