 // Get the modal
 var login_modal = document.getElementById('login');
 var register_modal = document.getElementById('register');
 var sell_modal = document.getElementById('sell');
 
 // When the user clicks anywhere outside of the modal, close it
 window.onclick = function(event) {
     if (event.target == login_modal) {
       login_modal.style.display = "none";
     }

     if (event.target == login_modal) {
       register_modal.style.display = "none";
     }

     if (event.target == sell_modal) {
      sell_modal.style.display = "none";
    }
 }