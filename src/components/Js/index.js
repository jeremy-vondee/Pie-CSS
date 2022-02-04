// Shows and hides the accordion when clicked on
let accordion = document.getElementsByClassName('accordion')
let i

for (i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener('click', function() {
        this.classList.toggle('accordion-active')
        let accordionContent = this.nextElementSibling
        if(accordionContent.style.maxHeight) {
            accordionContent.style.maxHeight = null
        } else {
            accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px'
        }
    })
}

// Shows and hides the navbar only on small screen when clicked on
const navSlide = () => {
    const burger = document.querySelector('.burger')
    const menu = document.querySelector('.nav-menu')
    const menuLinks = document.querySelectorAll('.nav-menu')

    burger.addEventListener('click', () => {
        menu.classList.toggle('nav-active')
        burger.classList.toggle('toggle')
            menuLinks.forEach ((link, index) => {
                if (link.style.animation) {
                    link.style.animation = ''
                } else {
                    link.style.animation = `navLinkFade 0.3s ease forwards ${index/7 + 0.3}s`
                }
            })
    })
}

navSlide()

// Dispalys the scroll up button after a height of 500
const scrollup = document.getElementById('back-home')
window.onscroll = scrollFunction

function scrollFunction() {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        scrollup.style.display = 'inline-block'
    } else {
        scrollup.style.display = 'none'
    }
}
// Scrolls the page back to the beginning of the page  
function scrollUp() {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
}