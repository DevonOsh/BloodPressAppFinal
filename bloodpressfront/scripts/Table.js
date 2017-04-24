// Removes all record data from sessionStorage 
$("#btnClearHistory").click(function () {
  sessionStorage.removeItem("tbRecords");
  listRecords();
  alert("All records have been deleted.");
});

/* The value of the Submit Record button is used
 * to determine which operation should be
 * performed
 */
$("#btnAddRecord").click(function () {
  /*.button("refresh") function forces jQuery Mobile to refresh the text on the button*/
  $("#btnSubmitRecord").val("Add").button("refresh");
});

$("#btnSubmitRecord").click(function () {
  alert("Button clicked."); //FIXME remove
  var formOperation = $("#btnSubmitRecord").val();

  if (formOperation == "Add Record") {
    alert("Adding record"); //FIXME remove
    addRecord();
    $.mobile.changePage("#pageRecords");
  } 
  else if (formOperation == "Edit") {
    editRecord($("#btnSubmitRecord").attr("indexToEdit"));
    $.mobile.changePage("#pageRecords");
    $("#btnSubmitRecord").removeAttr("indexToEdit");
  }

  /*Must return false, or else submitting form
   * results in reloading the page
   */
  return false;
});

$("#pageNewRecordForm").on("pageshow", function () {
  //We need to know if we are editing or adding a record everytime we show this page
  //If we are adding a record we show the form with blank inputs
  var formOperation = $("#btnSubmitRecord").val();

  if (formOperation == "Add") {
    clearRecordForm();
  } else if (formOperation == "Edit") {
    //If we are editing a record we load the stored data in the form
    showRecordForm($("#btnSubmitRecord").attr("indexToEdit"));
  }
});

function loadUserInformation() {
  var user = JSON.parse(sessionStorage.user);
  
  if (user != null) {
    $("#divUserSection").empty();

    $("#divUserSection").append("User's Name:" +
      user.firstName + " " + user.lastName +
      "<br>Health Card Number: " + user.insCardNum );
    $("#divUserSection").append(
      "<br><a href='#pageUserInfo' data-mini='true' data-role='button' data-icon='edit' data-iconpos='left' data-inline='true' >Edit Profile</a>"
    );
    $('#divUserSection [data-role="button"]').button(); // 'Refresh' the button
  }
}

function clearRecordForm() {
  $('#examDate').val("");
  $('#txtTSH').val("");
  $('#txtThyroglobulin').val("");
  $('#txtSynthroidDose').val("");
  return true;
}

function compareDates(a, b) {
  var x = new Date(a.Date);
  var y = new Date(b.Date);
  if (x > y) {
    return 1;
  } else {
    return -1;
  }
}

function listRecords() {
  var tbRecords;
  if (sessionStorage.tbRecords) {
    tbRecords = JSON.parse(sessionStorage.tbRecords);
  }
  //Load previous records, if they exist
  if (tbRecords != null) {

    //Initializing the table
    $("#tblRecords").html(
      "<thead>" +
      "   <tr>" +
      "     <th>Date</th>" +
      "     <th><abbr title='Systolic Pressure'>Systolic Press.</abbr></th>" +
      "     <th><abbr title='Diastolic Pressure'>Diastolic Press.</abbr></th>" +
      "     <th>Edit / Delete</th>" +
      "   </tr>" +
      "</thead>" +
      "<tbody>" +
      "</tbody>"
    );

    //Loop to insert the each record in the table
    for (var i = 0; i < tbRecords.length; i++) {
      var rec = tbRecords[i];
      $("#tblRecords tbody").append("<tr>" +
        "  <td>" + rec.Date +
        "</td>" + // Remove time portion of string
        "  <td>" + rec.upper + "</td>" +
        "  <td>" + rec.lower + "</td>" +
        "</td>" +
        "  <td><a data-inline='true'  data-mini='true' data-role='button' href='#pageNewRecordForm' onclick='callEdit(" +
        i +
        ")' data-icon='edit' data-iconpos='notext'></a>" +
        "  <a data-inline='true'  data-mini='true' data-role='button' href='#' onclick='callDelete(" +
        i +
        ")' data-icon='delete' data-iconpos='notext'></a></td>" +
        "</tr>");
    }

    $('#tblRecords [data-role="button"]').button(); // 'Refresh' the buttons. Without this the delete/edit buttons wont appear
  } else {
    tbRecords = []; //If there is no data,set an empty array
    $("#tblRecords").html("");
  }
  return true;
}

function showRecordForm(index) {
  var tbRecords = JSON.parse(sessionStorage.tbRecords);
  var rec = tbRecords[index];

  $('#examDate')[0].valueAsDate = new Date(rec.Date);
  $('#upper').val(rec.upper);
  $('#lower').val(rec.lower);
}

/* Checks that users have entered all valid info
 * and that the date they have entered is not in
 * the future
 */
function checkRecordForm() {
  //for finding current date 
  var d = new Date();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var currentDate = d.getFullYear() + '/' +
    (('' + month).length < 2 ? '0' : '') +
    month + '/' +
    (('' + date).length < 2 ? '0' : '') + date;

  if (($("#upper").val() != "") && (parseInt($("#upper").val()) <= 180) &&
    ($("#lower").val() != "") && (parseInt($("#lower").val()) <= 110) &&
    ($("#examDate").val() != "")) {
    return true;
  } 
  else {
    return false;
  }
}

function callEdit(index) {
  $("#btnSubmitRecord").attr("indexToEdit", index);
  $("#btnSubmitRecord").val("Edit");
}

// Delete the given index and re-display the table
function callDelete(index) {
  deleteRecord(index);
  listRecords();
}

function addRecord() {
  if (checkRecordForm()) {
    alert("In adding record function"); //FIXME remove
    var record = {
      "Date": $('#examDate').val(),
      "upper": $('#upper').val(),
      "lower": $('#lower').val()
    };
    console.log("Record:"); //FIXME remove
    console.log(record);

    var tbRecords;
    if (sessionStorage.tbRecords) {
      tbRecords = JSON.parse(sessionStorage.tbRecords);
    }
    if (tbRecords == null) {
      tbRecords = [];
    }
    tbRecords.push(record);
    sessionStorage.tbRecords = JSON.stringify(tbRecords);
    alert("Saving Information");
    clearRecordForm();
    listRecords();
  } 
  else {
    alert("Please complete the form properly.");
  }

  return true;
}

function deleteRecord(index) {
  var tbRecords = JSON.parse(sessionStorage.tbRecords);

  tbRecords.splice(index, 1);

  if (tbRecords.length == 0) {
    /* No items left in records, remove entire 
     * array from sessionStorage
     */
    sessionStorage.removeItem("tbRecords");
  } else {
    sessionStorage.tbRecords = JSON.stringify(tbRecords);
  }
}

function editRecord(index) {
  if (checkRecordForm()) {
    var tbRecords = JSON.parse(sessionStorage.tbRecords);
    tbRecords[index] = {
      "Date": $('#examDate').val(),
      "upper": $('#upper').val(),
      "lower": $('#lower').val()
    }; //Alter the selected item in the array
    sessionStorage.tbRecords = JSON.stringify(tbRecords); //Saving array to local storage
    alert("Saving Information");
    clearRecordForm();
    listRecords();
  } else {
    alert("Please complete the form properly.");
  }
}
