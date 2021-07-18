<div align="center">
<img src="img/logo.svg" align="center" width="150" alt="Project icon">
</div>


# Serverless Form | Send you HTML form data into Google-sheet without server side coding.

I have included a [form.html](form.html) file. Download it and try out.

## How to use it in you form?

Include jQuery in your HTML page.
```
<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.min.js"></script>
```

 Create a HTML form and and give name to the form.
```
<form id="contactForm" name="serverless-form">
```
Insert the input fields with with name value.
```
<input type="email" name="email" placeholder="Email Address">
```
## Google Sheet Config.
1. Make a Google sheet in your Google Drive.
2. Write the fields in your Google sheets same as you write the name values in input fields.
3. Click on tools in menubar and go to to script editor.
4. Paste the following script in your editor and change your sheet name and mail id.
```
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
```
5. Save the script.
6. Click on Publish and Deploy as web app.
7. Copy the web app link and paste in the script given below in the const scriptURLC field.


Copy the following script after Jquery script in your HTML page.
```
<script>
        var spinner = $('#loader');
        const scriptURLC ='your google sheet script'
        const serverlessForm = document.forms['serverless-form'];

        serverlessForm.addEventListener('submit', e => {
            e.preventDefault();
            spinner.show();


            fetch(scriptURLC, {
                    method: 'POST',
                    body: new FormData(serverlessForm)
                })
                .then(res => {

                    console.log(res);
                    spinner.hide();

                    if (res['status'] == 200) {
                        swal("Your form has been submitted!",
                            "We will get back to you soon. Have a great day!", "success");
                        return true;

                    } else {
                        swal("Something went wrong!", "Please try after some time", "error");

                    }
                    document.getElementById('submitForm').classList.remove('loading');
                })
                .catch(error => {

                    swal("Something went wrong!", "Please try after some time", "error");
                    // todo enable submit button

                })
        });
    </script>
```
Whoa! You are all set.

Need any help? Contact me [here](https://twitter.com/thelovekesh) 

# DONATE
Liked this Project?
Contribute [here](https://www.payumoney.com/paybypayumoney/#/7ED98F40F286DBA4103B5AAF64EAEF55) to appreciate my work.


# LICENSE
MIT LICENSE