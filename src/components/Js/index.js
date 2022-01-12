let accordion = document.getElementsByClassName('accordion')
let i

for (i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener('click', function() {
        this.classList.toggle('active')
        let accordionContent = this.nextElementSibling
        if(accordionContent.style.maxHeight) {
            accordionContent.style.maxHeight = null
        } else {
            accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px'
        }
    })
}

const navSlide = () => {
    const burger = document.querySelector('.burger')
    const menu = document.querySelector('.nav-menu')
    const menuLinks = document.querySelectorAll('.nav-menu')

    burger.addEventListener('click', () => {
        menu.classList.toggle('active')
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