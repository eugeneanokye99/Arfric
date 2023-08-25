//added a preloader to the website
const load = document.querySelector(".loader");

window.addEventListener("load", function(){
    load.style.display = "none" 
})

//Redirect to another page
  var button = document.getElementById('button');

  button.addEventListener('click', function() {
    window.location.href = 'C:\\Users\\georg\\Desktop\\Arfric\\home page\\home.html';
  })

  