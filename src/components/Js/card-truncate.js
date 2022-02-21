let cardTurncate = document.getElementsByClassName("read-more");
let b;

for (b = 0; b < cardTurncate.length; b++) {
  cardTurncate[b].addEventListener("click", function () {
    let cardContent = this.parentElement;
    cardContent.classList.toggle("fullHeight");
  });
}
