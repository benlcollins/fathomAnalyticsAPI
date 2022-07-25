/********************************************************************************************
 * SETUP FUNCTIONS
********************************************************************************************/

/**
 * Global variables
 */
const API_KEY = getApiKey();
const SITE_ID = getSiteID(); // initially get from sites endpoint https://usefathom.com/api#list-sites
const SITE_LIMIT = 1000;

/**
 * function to get my Fathom API Key from properties service
 */
function getApiKey() {
  return PropertiesService.getScriptProperties().getProperty('fathomKey');
}

/**
 * function to get my Fathom API site ID from properties service
 */
function getSiteID() {
  return PropertiesService.getScriptProperties().getProperty('siteID');
}

/**
 * test script properties
 */
function test(){
  console.log(API_KEY);
  console.log(SITE_ID);
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

/********************************************************************************************
 * SHEET FUNCTIONS
********************************************************************************************/

/**
 * function to paste list size metric into google sheets
 * setup trigger to run once a day
 */
function pasteFathomDataToSheet() {
  
  // set up sheet
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Data');

  // create dates - need 60 days ago, 30 days ago, yesterday
  const yesterday = getDateBefore(1);
  const thirtyBefore = getDateBefore(31);
  const sixtyBefore = getDateBefore(61);

  // get last 30 days data
  const thirtyData = getFathomData(thirtyBefore,yesterday);
  //console.log(thirtyData);

  // get previous 30 days data
  const sixtyData = getFathomData(sixtyBefore,thirtyBefore);
  //console.log(sixtyData);

  // paste data into Sheets
  sheet.getRange(2,1,thirtyData.length,2).setValues(thirtyData);
  
  // wrap sixty day with IF for first 30 days when no data in this range
  if (sixtyData.length > 0) {
    // paste data to 4th and 5th columns
    sheet.getRange(2,4,sixtyData.length,2).setValues(sixtyData);
  }

}



/********************************************************************************************
 * API CALLS
********************************************************************************************/

/**
 * function to retrieve fathom data
 */
function getFathomData(startDate, endDate) {
  
  // URL and params for the Fathom API
  const root = 'https://api.usefathom.com/v1/aggregations';
  const query = `?entity=pageview&entity_id=${SITE_ID}&aggregates=pageviews&field_grouping=pathname&sort_by=pageviews:desc&date_from=${startDate}&date_to=${endDate}&limit=${SITE_LIMIT}`;

  console.log('Query:');
  console.log(query);
  
  const params = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'Bearer ' + API_KEY
    }
  };
  
  // call the Fathom API
  const response = UrlFetchApp.fetch(root + query, params);
  const data = response.getContentText();
  const jsonData = JSON.parse(data);
  
  // convert the objects into arrays for eventual pasting into Sheets  
  const dataArray = [];
  
  jsonData.forEach(function(row) {
    dataArray.push([
      row.pathname,
      row.pageviews
    ]);
  });

  // Return the data
  return dataArray;

}


/********************************************************************************************
 * HELPER FUNCTIONS
********************************************************************************************/

/**
 * get yesterday's date in correct format
 */
function getDateBefore(daysBefore) {

  // get yesterday's date
  const today = new Date();
  const newDate = new Date(today);
  newDate.setDate(newDate.getDate() - daysBefore);
  const formatNewDate = formatDate(newDate);
  
  // return formatted yesterday date YYYY-MM-DD
  return formatNewDate;

}

/**
 * format date to YYYY-MM-DD
 */
function formatDate(date) {

  // create new date object
  const d = new Date(date);

  // get component parts
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  // add 0 to single digit days or months
  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  // return new date string
  return [year, month, day].join('-');
}

