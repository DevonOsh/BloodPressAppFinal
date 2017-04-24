var SERVER_URL = 'http://127.0.0.1:3011';

if (!sessionStorage) {
  alert(
    'Warning: Your browser does not support features required for this application, please consider upgrading.'
  );
}

/* Adds given text value to the password text 
 * field
 */
function addValueToPassword(button) {
  var currVal = $("#passcode").val();
  if (button == "bksp") {
    $("#passcode").val(currVal.substring(0, currVal.length - 1));
  } else {
    $("#passcode").val(currVal.concat(button));
  }
}

/* On the main page, after password entry, directs
 * user to main page, legal disclaimer if they
 * have not yet agreed to it
 */
$("#btnEnter").click(function () {
  var loginCredentials = {
    userID: $("#loginUserID").val(),
    password: $("#passcode").val()
  }
  
  alert(loginCredentials.userID);
  $.post(SERVER_URL + '/login', loginCredentials, function (data) {
      if (data && data.userID == loginCredentials.userID) {
        sessionStorage.password = $("#passcode").val();
        sessionStorage.user = JSON.stringify(data);

        if (!data.agreedToLegal) {
          return $.mobile.changePage("#legalNotice");
        }
        
        $.post(SERVER_URL + '/getRecords', loginCredentials, function (data) {
            sessionStorage.tbRecords = JSON.stringify(data);
            $.mobile.changePage("#pageMenu");
          }).fail(function (error) {
          alert(error.responseText);
        })
      } else {
        alert('An error occurred logging user in.');
      }
    })
    .fail(function (error) {
      alert(error.responseText);
  });
});

/* Records that the user has agreed to the legal
 * disclaimer on this device/browser
 */
$("#noticeYes").click(function () {
  var user = JSON.parse(sessionStorage.user);
  //user.agreedToLegal = 1; // True
  user.password = sessionStorage.password;

  //$.post(SERVER_URL + '/updateUser', user, function (data) {
  //    sessionStorage.user = JSON.stringify(user);
  //    return $.mobile.changePage("#pageMenu");
  //  }).fail(function (error) {
  //    alert(error.responseText);
  //});
  
  $.mobile.changePage("#pageMenu");
});