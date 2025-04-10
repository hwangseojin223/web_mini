const params = new URLSearchParams(window.location.search);
const movie = params.get('movie');
const theater = params.get('theater');
const date = params.get('date');
const time = params.get('time');

document.getElementById('booking-info').textContent =
    `${movie} | ${theater} | ${date.slice(4,6)} 월 ${date.slice(6)}일 | ${time}`;

const seat = document.getElementById('seat');
const selectedInfo = document.getElementById('selected-info');
const seatbtn = document.getElementById('seat-btn');


