const apiKey = '21e386e0d770c1af30c85902f8078bd9';
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() - 1);
const formattedDate = targetDate.toISOString().slice(0, 10).replace(/-/g, '');

let selectedMovie = null;
let selectedTheater = null;
let selectedDate = formattedDate;
let selectedTime = null;
let allTimes = [];

function generateRandomTimes() {
  const times = [];
  const screens = ['1관', '2관', '3관'];
  const formats = ['2D', '3D'];

  for (let h = 9; h <= 23; h++) {
    if (Math.random() > 0.4) {
      const startHour = h;
      const endHour = h + 2;
      const screen = screens[Math.floor(Math.random() * screens.length)];
      const format = formats[Math.floor(Math.random() * formats.length)];
      const totalSeats = 100;
      const remaining = Math.floor(Math.random() * totalSeats);

      times.push({
        start: `${startHour}:00`,
        end: `${endHour}:15`,
        screen,
        format,
        remaining,
        total: totalSeats
      });
    }
  }
  return times;
}

function updateSelectionSummary() {
  const summary = document.getElementById('selection-summary');
  if (selectedMovie && selectedTheater && selectedDate && selectedTime) {
    summary.textContent = `🎬 ${selectedMovie} | 📍 ${selectedTheater} | 📅 ${selectedDate.slice(4, 6)}월 ${selectedDate.slice(6)}일 | ⏰ ${selectedTime}`;
  } else {
    summary.textContent = '날짜, 영화, 극장, 시간을 선택하면 여기에 표시됩니다.';
  }
}

function updateBookButton() {
  const bookNow = document.getElementById('book-now');
  bookNow.disabled = !(selectedMovie && selectedTheater && selectedDate && selectedTime);
}

function generateTimeSlots(times) {
  const grid = document.getElementById('time-grid');
  grid.innerHTML = ''; // 기존 타임슬롯 비우기

  times.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'time-slot';
    div.innerHTML = `
      <div><strong>${t.start} ~ ${t.end}</strong></div>
      <div>${t.screen} · ${t.format}</div>
      <div>잔여석 ${t.remaining}/${t.total}</div>
    `;
    div.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      div.classList.add('selected');
      selectedTime = t.start;
      updateSelectionSummary();
      updateBookButton();
    });
    grid.appendChild(div);
  });
}

function updateTimeSection() {
  const section = document.getElementById('time-section');
  if (selectedMovie && selectedTheater) {
    allTimes = generateRandomTimes();
    section.classList.remove('text-muted');

    const hourButtons = Array.from({ length: 15 }, (_, i) => i + 9).map(h =>
      `<button class="hour-btn" data-hour="${h}">${h}</button>`
    ).join('');

    section.innerHTML = `
      <div class="time-hour-selector">${hourButtons}</div>
      <div class="time-grid" id="time-grid" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
      </div>
    `;

    generateTimeSlots(allTimes); // 초기에는 전체 시간 보여줌

    document.querySelectorAll('.hour-btn').forEach(button => {
      button.addEventListener('click', () => {
        const selectedHour = parseInt(button.dataset.hour);
        const filteredTimes = allTimes.filter(t => {
          const hour = parseInt(t.start.split(':')[0]);
          return hour >= selectedHour;
        });
        generateTimeSlots(filteredTimes);
      });
    });

  } else {
    section.innerHTML = '영화와 극장을 선택하시면<br>상영시간표를 비교하여 볼 수 있습니다.';
    section.classList.add('text-muted');
  }

  updateSelectionSummary();
  updateBookButton();
}

document.querySelectorAll('.date-selector button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.date-selector button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    const label = button.textContent.split(' - ')[0];
    const [month, day] = label.split('/').map(Number);
    const now = new Date();
    const newDate = new Date(now.getFullYear(), month - 1, day);
    selectedDate = newDate.toISOString().slice(0, 10).replace(/-/g, '');

    updateTimeSection();
  });
});

document.getElementById('book-now').addEventListener('click', () => {
  if (selectedMovie && selectedTheater && selectedDate && selectedTime) {
    const selectedSlot = allTimes.find(t => t.start === selectedTime);
    const query = `movie=${encodeURIComponent(selectedMovie)}&theater=${encodeURIComponent(selectedTheater)}&date=${selectedDate}&time=${selectedTime}&remaining=${selectedSlot.remaining}&total=${selectedSlot.total}`;
    window.location.href = `booking.html?${query}`;
  }
});

fetch(`https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${formattedDate}`)
  .then(res => res.json())
  .then(data => {
    const movieList = data.boxOfficeResult.dailyBoxOfficeList;
    const listEl = document.getElementById('movie-list');

    movieList.forEach(movie => {
      const div = document.createElement('div');
      div.className = 'movie-item';
      div.textContent = movie.movieNm;
      div.addEventListener('click', () => {
        document.querySelectorAll('.movie-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        selectedMovie = movie.movieNm;
        updateTimeSection();
      });
      listEl.appendChild(div);
    });
  })
  .catch(err => console.error('영화 목록 불러오기 실패:', err));

const theaterData = {
  '서울': ['강남', '신촌', '홍대'],
  '경기': ['수원', '성남', '고양'],
  '인천': ['인천터미널', '부평'],
  '대전/충청/세종': ['대전', '청주', '세종'],
  '부산/대구/경상': ['부산센텀', '대구동성로', '울산'],
  '광주/전라': ['광주상무', '전주'],
  '강원': ['춘천', '원주'],
  '제주': ['제주']
};

document.querySelectorAll('.region-item').forEach(region => {
  region.addEventListener('click', () => {
    document.querySelectorAll('.region-item').forEach(el => el.classList.remove('selected'));
    region.classList.add('selected');

    const regionName = region.getAttribute('data-region');
    const theaters = theaterData[regionName] || [];
    const listEl = document.getElementById('theater-list');
    listEl.innerHTML = '';
    theaters.forEach(name => {
      const div = document.createElement('div');
      div.className = 'theater-item';
      div.textContent = name;
      div.addEventListener('click', () => {
        document.querySelectorAll('.theater-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        selectedTheater = name;
        updateTimeSection();
      });
      listEl.appendChild(div);
    });
  });
});
