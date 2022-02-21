// Shows and hides the navbar only on small screen when clicked on
const navSlide = () => {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".nav-menu");
  const menuLinks = document.querySelectorAll(".nav-menu");

  burger.addEventListener("click", () => {
    menu.classList.toggle("nav-active");
    burger.classList.toggle("toggle");
  });
};

navSlide();
