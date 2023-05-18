const animationDuration = 5000;
const animationInterval = 10;
const steps = animationDuration / animationInterval; // add this line
const minPosition = 50;
const maxPositionX = 1750;
const maxPositionY = 1150;

function getRandomPosition(min, max) {
  return Math.random() * (max - min) + min;
}

function animateCircle(circle) {
    const newCx = getRandomPosition(minPosition, maxPositionX);
    const newCy = getRandomPosition(minPosition, maxPositionY);
    const oldCx = parseFloat(circle.getAttribute('cx'));
    const oldCy = parseFloat(circle.getAttribute('cy'));
    const dx = (newCx - oldCx) / steps;
    const dy = (newCy - oldCy) / steps;

    let currentStep = 0;
    function step() {
        if (currentStep >= steps) {
            return;
        }
        const cx = oldCx + dx * currentStep;
        const cy = oldCy + dy * currentStep;
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        currentStep++;
        requestAnimationFrame(step);
    }
    step();
}

function animateCircles() {
  const svgDoc = document.getElementById('bg');
  const circles = svgDoc.querySelectorAll('circle');
  circles.forEach(circle => animateCircle(circle));
}

function loadSVGInline(containerId, svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;
  const container = document.getElementById(containerId);
  container.appendChild(svgElement);
  svgElement.setAttribute('id', 'bg');
  setInterval(animateCircles, animationDuration);
}

const svgString = `
<svg id="visual" viewBox="0 0 900 600" width="1800" height="1200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    <defs>
        <filter id="blur1" x="-10%" y="-10%" width="100%" height="100%">
            <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="161" result="effect1_foregroundBlur"></feGaussianBlur>
        </filter>
    </defs>
    <rect width="1800" height="1200" fill="#3C2F41">
    </rect>
    <g filter="url(#blur1)">
        <circle cx="205" cy="700" fill="#3C2F41" r="600"></circle>
        <circle cx="505" cy="49" fill="#4A225D" r="200"></circle>
        <circle cx="99" cy="292" fill="#66327C" r="200"></circle>
        <circle cx="680" cy="821" fill="#3F2B36" r="200"></circle>
        <circle cx="639" cy="423" fill="#1C1C1C" r="200"></circle>
        <circle cx="874" cy="383" fill="#211E55" r="200"></circle>
        <circle cx="824" cy="53" fill="#6F3381" r="200"></circle>
        <circle cx="140" cy="650" fill="#622954" r="200"></circle>
    </g>
</svg>
`;
loadSVGInline('bg-container', svgString);

