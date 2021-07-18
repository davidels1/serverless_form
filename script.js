//This script should be pasted in your google sheet script editor.

function doPost(e) {
    return handleResponse(e);
}

//  Enter sheet name where data is to be written below
var SHEET_NAME = "Contact-form-demo";

var SCRIPT_PROP = PropertiesService.getScriptProperties();

function handleResponse(e) {

    var lock = LockService.getPublicLock();
    lock.waitLock(30000);

    try {

        // select the sheet name where we write the data
        var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
        var sheet = doc.getSheetByName(SHEET_NAME);

        // Take row_1 as the header
        var headRow = e.parameter.header_row || 1;
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var nextRow = sheet.getLastRow() + 1; // get next row
        var row = [];

        // loop through the header columns
        for (i in headers) {
            if (headers[i] == "Timestamp") {
                row.push(new Date());
            } else if (headers[i] == "sn") {
                row.push(sheet.getLastRow());
            } else {
                row.push(e.parameter[headers[i]]);
            }
        }
        // more efficient to set values as [][] array than individually
        sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

        //send email
        sendEmail(e.parameter);

        // return json success results
        return ContentService
            .createTextOutput(JSON.stringify({
                "result": "success"
            }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (e) {
        // if error return this
        return ContentService
            .createTextOutput(JSON.stringify({
                "result": "error",
                "error": e
            }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally { //release lock
        lock.releaseLock();
    }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}

function sendEmail(data) {

    var body = '';
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            body = body + `<b>${key}</b> : ${data[key]}<br/>`;
        }
    }

    GmailApp.sendEmail('your-email-address', 'Contact form message', '', {
        'name': 'Contact Form',
        'htmlBody': 'You have received a new contact message. <br/><br/>' + body
    });
}