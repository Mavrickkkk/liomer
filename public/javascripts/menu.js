document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.getElementById('menuToggle');
    var menu = document.getElementById('menu');

    menuToggle.onclick = function () {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
            setTimeout(function () {
                menu.style.display = 'none';
            }, 500);
        } else {
            menu.style.display = 'flex';
            menu.classList.add('show');
        }
    };
});