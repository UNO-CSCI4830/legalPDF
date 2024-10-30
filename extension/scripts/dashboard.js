const frame = document.getElementById('frame');

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const url = this.getAttribute('href');
        frame.src = url;
    });
});

frame.style.width = '100%';
frame.style.height = '100vh';
