if (window.location.host == "blog.appsignal.com") {
  var tracker_src =
    "https://appsignal.com/ident.gif?page=" +
    encodeURI("blog: " + window.location.pathname) +
    "&" +
    window.location.search.slice(1, window.location.search.length);
  var img = document.createElement("img");
  img.src = tracker_src;
  img.height = "1";
  img.width = "1";
  img.style = "display:none;";
  document.body.appendChild(img);
}
