// Dispalys the scroll up button after a height of 500
const scrollup = document.getElementById("back-home");
window.onscroll = scrollFunction;

function scrollFunction() {
  if (
    document.body.scrollTop > 500 ||
    document.documentElement.scrollTop > 500
  ) {
    scrollup.style.display = "inline-block";
  } else {
    scrollup.style.display = "none";
  }
}
// Scrolls the page back to the beginning of the page
function scrollUp() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
