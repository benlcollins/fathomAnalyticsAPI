/**
 * Global variables
 */
const FATHOM_API_KEY = ScriptProperties.getProperty('fathomKey');
const FATHOM_SITE_ID = ScriptProperties.getProperty('siteID');

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

/**
 * setup menu to run Fathom function from Sheet
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Fathom Analytics Menu')
    .addItem('Get Fathom data', 'pasteFathomDataToSheet')
    .addToUi();

}

/**
 * function to retrieve fathom data
 */
function getFathomData() {
  
  // URL and params for the Fathom API
  const root = 'https://api.usefathom.com/v1/aggregations';
  const query = `?entity=pageview&entity_id=${FATHOM_SITE_ID}&aggregates=pageviews,uniques,visits,avg_duration&date_grouping=month`;
  
  const params = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'Bearer ' + FATHOM_API_KEY
    }
  };
  
  // call the Fathom API
  const response = UrlFetchApp.fetch(root + query, params);
  const data = response.getContentText();
  const jsonData = JSON.parse(data);

  // create empty array to hold data for Sheet
  const unsortedArr = [];

  // loop over data and add to sheet array
  jsonData.forEach(month => {

    const mins = Math.floor(month.avg_duration / 60);
    const seconds = Math.floor(month.avg_duration % 60);
    const avg_duration_time = `${mins} minutes ${seconds} seconds`;

    unsortedArr.push([
      parseInt(month.date.substr(0,4)),
      parseInt(month.date.slice(-2)),
      parseInt(month.pageviews),
      parseInt(month.uniques),
      parseInt(month.visits),
      avg_duration_time
    ])

  })

  // return sorted array, sorted by year then month
  return unsortedArr.sort((a,b) => b[1] - a[1]).sort((a,b) => b[0] - a[0]);
}

/**
 * function to paste list size metric into google sheets
 * setup trigger to run once a day
 */
function pasteFathomDataToSheet() {
  
  // set up sheet
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Sheet1');

  // retrieve site data from Fathom API
  const data = getFathomData();

  // paste to sheet
  sheet.getRange(2,1,data.length,6).setValues(data);

  // format numbers
  sheet.getRange(2,3,data.length,3).setNumberFormat("#,##0")

}
