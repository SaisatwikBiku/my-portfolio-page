// typing animation using Typed.js
var typed = new Typed(".typing-text", {
    strings: ["Web Developer", "AI/ ML Enthusiast", "Python Developer"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

// Smooth scroll for navbar links
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Smooth scroll for logo links
document.querySelectorAll('.logo').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// EmailJS contact form handler
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('j_PeRhatSYVxAj1Gw'); 

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            emailjs.sendForm('service_a0t4i5e', 'template_gb64xgq', form)
                .then(function() {
                    form.reset();
                    form.innerHTML = "<p style='color:#007bff;font-size:1.2em;'>Thank you for your message!</p>";
                }, function(error) {
                    form.innerHTML = "<p style='color:red;'>Oops! There was a problem. Please try again.</p>";
                });
        });
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbar.classList.remove('active');
        });
    });
});

