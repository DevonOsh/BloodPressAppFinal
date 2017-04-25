var SERVER_URL = 'http://127.0.0.1:3011';

$("#btnUserClear").click(function () {
  clearUserForm();
});

$("#btnUserUpdate").click(function () { //Event : submitting the form
  saveUserForm();
  return true;
});

function checkUserForm() { //Check for empty fields in the form
  //for finding current date 
  var d = new Date();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var year = d.getFullYear();
  var currentDate = year + '/' +
    (('' + month).length < 2 ? '0' : '') +
    month + '/' +
    (('' + date).length < 2 ? '0' : '') + date;

  if (($("#email").val() != "") &&
    ($("#userID").val() != "") &&
    ($("#firstName").val() != "") &&
    ($("#lastName").val() != "") &&
    ($("#insCardNum").val() != "") &&
    ($("#password").val() != "") &&
    ($("#birthdate").val() != "") && 
    ($("#birthdate").val() <= currentDate)) {
    return true;
  } 
  else {
    return false;
  }
}

function saveUserForm() {
      var user = {
      "userID": $("#userID").val(),
      "email": $("#email").val(),
      "firstName": $("#firstName").val(),
      "lastName": $("#lastName").val(),
      "insCardNum": $("#insCardNum").val(),
      "password": $("#password").val(),
      "dateOfBirth": $("#birthdate").val()
    };

    console.log("User data at saveUserForm:");
    console.log(user);

  if (checkUserForm()) {

    var user = {
      "userID": $("#userID").val(),
      "email": $("#email").val(),
      "firstName": $("#firstName").val(),
      "lastName": $("#lastName").val(),
      "insCardNum": $("#insCardNum").val(),
      "password": $("#password").val(),
      "dateOfBirth": $("#birthdate").val()
    };

    if ($("#btnUserUpdate").val() == "Create") {

      var userData = { newUser: user }

      $.post(SERVER_URL + '/saveNewUser',userData,function (data) {
            alert("New User Created Successfully!");

            sessionStorage.user = JSON.stringify(user);
            sessionStorage.password = user.password;

            $("#btnUserUpdate").val("Update");
            $.mobile.changePage("#pageMenu");

            window.location.reload();
          }).fail(function (error) {
            alert("Error from server: " + error.responseText); 
      });
    } 
    else {
      user.agreedToLegal = JSON.parse(sessionStorage.user).agreedToLegal;
      user.password = sessionStorage.password;

      $.post(SERVER_URL + '/updateUser', user,function (data) {
          sessionStorage.user = JSON.stringify(user);
          sessionStorage.password = user.password;
          sessionStorage.userID = user.userID;
      }).fail(function (error) {
          alert("Error from server: " + error.responseText); 
      }).done(function () {
        $.mobile.changePage("#pageMenu");
        window.location.reload();
      });
    }
  } 
  else {
    alert("Please complete the form properly.");
  }
}

function clearUserForm() {
  sessionStorage.clear("user");
  alert("The stored data have been removed");
}

function showUserForm() { //Load the stored values in the form
  if (sessionStorage.user != null) {
    $("#btnUserUpdate").val("Update").button("refresh");

    var user = JSON.parse(sessionStorage.user);

    $("#userID").val(user.userID);
    $("#email").val(user.email);
    $("#firstName").val(user.firstName);
    $("#lastName").val(user.lastName);
    $("#insCardNum").val(user.healthCardNumber);
    $("#password").val(user.password);
    $("#birthdate").val(user.dateOfBirth);
  } 
  else {
    $("#btnUserUpdate").val("Create").button("refresh");
  }
}