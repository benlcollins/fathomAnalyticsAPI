/**
 * Global variables
 */
const FATHOM_API_KEY = ScriptProperties.getProperty('fathomKey');

/**
 * function to test script properties
 */
function test(){
  console.log(FATHOM_API_KEY);
}

/**
 * function to retrieve list of sites from Fathom API
 */
function getFathomSites() {
  
  // URL for the Fathom API
  const endpoint = 'https://api.usefathom.com/v1/sites';
  
  // set params for API call
  const params = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + FATHOM_API_KEY
    }
  };
  
  // call the Fathom API
  const response = UrlFetchApp.fetch(endpoint, params);
  const data = response.getContentText();
  const jsonData = JSON.parse(data);

  // log data output
  console.log(jsonData);

}
