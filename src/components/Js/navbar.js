// Shows and hides the navmenu only on small screen when clicked on
const navSlide = () => {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".nav-menu");

  burger.addEventListener("click", () => {
    menu.classList.toggle("nav-active");
    burger.classList.toggle("toggle");
  });
};

navSlide();

//Adds a background color to the header on scroll
const sticky = () => {
  const navBar = document.querySelector("header");

  if (window.scrollY > 10) {
    navBar.classList.add("sticky")
    console.log(navBar)
  } else {
    navBar.classList.remove("sticky")
  }
}

window.addEventListener('scroll', sticky)
