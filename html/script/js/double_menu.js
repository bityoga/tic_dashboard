function openLink(evt, animName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("iframe_holder");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    console.log(tablinks);
    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" w3-blue", " ");
      tablinks[i].className = tablinks[i].className.replace("w3-blue", " ");
    }
    document.getElementById(animName).style.display = "block";
    if(animName!="home") {
      console.log(animName);
      //evt.currentTarget.className += " w3-blue";
    }
  }
  
function myFunction() {
    var x = document.getElementById("demo");
    if (x.className.indexOf("w3-show") == -1) {
      x.className += " w3-show";
    } else { 
      x.className = x.className.replace(" w3-show", "");
    }
  }

function notification_function() {
    var x = document.getElementById("notifications");
    if (x.className.indexOf("w3-show") == -1) {
      x.className += " w3-show";
    } else { 
      x.className = x.className.replace(" w3-show", "");
    }
  }


function openLeftMenu() {
    document.getElementById("leftMenu").style.display = "block";
  }
  
function closeLeftMenu() {
    document.getElementById("leftMenu").style.display = "none";
  }
  
function openRightMenu() {
    document.getElementById("rightMenu").style.display = "block";
  }
  
function closeRightMenu() {
    document.getElementById("rightMenu").style.display = "none";
  }