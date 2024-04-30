document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    document.querySelectorAll('.animate-on-scroll-zoom').forEach(element => {
        observer.observe(element);
    });
});
