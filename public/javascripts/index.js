const affichesContainer = document.getElementById('affichesContainer');
const affiches = document.querySelectorAll('.flex-column');
const scrollLeft = document.getElementById('scrollLeft');
const scrollRight = document.getElementById('scrollRight');

let currentIndex = 0;

scrollLeft.addEventListener('click', function() {
    currentIndex = Math.max(0, currentIndex - 1);
    smoothScrollToIndex(currentIndex);
});

scrollRight.addEventListener('click', function() {
    currentIndex = Math.min(affiches.length - 1, currentIndex + 1);
    smoothScrollToIndex(currentIndex);
});

function smoothScrollToIndex(index) {
    const targetElement = affiches[index];
    const targetPosition = targetElement.offsetLeft;

    smoothScrollTo(affichesContainer, targetPosition); // Appeler la fonction smoothScrollTo() au lieu de affichesContainer.scrollTo()
}



function smoothScrollTo(element, targetPosition, duration = 1000, easing = 'cubic-bezier(0.42, 0, 0.58, 1)') {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        let progress = timeElapsed / duration;

        if (progress > 1) progress = 1;

        const easingFunction = (t) => --t * t * t + 1; // Cette fonction représente la nouvelle courbe de Bézier, vous pouvez l'ajuster pour obtenir un effet plus doux

        const easedProgress = easingFunction(progress);
        element.scrollLeft = startPosition + distance * easedProgress;

        if (progress < 1) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}

