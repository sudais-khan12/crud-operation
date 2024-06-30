document.getElementById("myForm").addEventListener("submit", function (event) {
  var heading = document.getElementById("heading").value.trim();
  var content = document.getElementById("content").value.trim();

  if (heading === "") {
    document.getElementById("heading").style.borderColor = "red";
    document.getElementById("heading").focus();
    event.preventDefault();
  } else if (content === "") {
    document.getElementById("content").style.borderColor = "red";
    document.getElementById("content").focus();
    event.preventDefault();
  }
});
