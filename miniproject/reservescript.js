const apiKey = '21e386e0d770c1af30c85902f8078bd9';
const tmdbApiKey = '234ef78df71e08e515ca2d691678e0f1';
const tmdbBaseUrl = 'https://api.themoviedb.org/3';
const tmdbImageBase = 'https://image.tmdb.org/t/p/original';

let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // 일요일로 설정
const today = new Date();
const maxFutureDate = new Date(today);
maxFutureDate.setDate(today.getDate() + 30); // 최대 30일 이후까지만 허용

function fetchPosterUrl(movieName) {
  return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0 && data.results[0].backdrop_path) {
        return `https://image.tmdb.org/t/p/w1280${data.results[0].backdrop_path}`;
      } else {
        return null;
      }
    })
    .catch(err => {
      console.error('TMDB 이미지 불러오기 실패:', err);
      return null;
    });
}


function fetchBackdrop(movieName) {
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const backdropPath = data.results[0].backdrop_path;
        if (backdropPath) {
          const backdropUrl = `https://image.tmdb.org/t/p/w1280${backdropPath}`;
          document.querySelector('.poster-background').style.backgroundImage = `url(${backdropUrl})`;
        }
      }
    })
    .catch(err => console.error('TMDB 백드롭 이미지 불러오기 실패:', err));
}


function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const preselectedMovieCd = getQueryParam('movieCd');

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
        // 기존 active 제거
        document.querySelectorAll('.hour-btn').forEach(btn => btn.classList.remove('active'));
        // 클릭한 버튼에 active 추가
        button.classList.add('active');
    
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
      
        fetchPosterUrl(movie.movieNm).then(posterUrl => {
          if (posterUrl) {
            document.querySelector('.poster-background').style.backgroundImage = `url(${posterUrl})`;
          }
        });
      
        updateTimeSection();
        fetchBackdrop(selectedMovie);
      });
      
      listEl.appendChild(div);
    });
        // movieList.forEach(...) 내부 끝난 직후 추가
        if (preselectedMovieCd) {
          const preMovie = movieList.find(m => m.movieCd === preselectedMovieCd);
          if (preMovie) {
            selectedMovie = preMovie.movieNm;
        
            const items = document.querySelectorAll('.movie-item');
            items.forEach(el => {
              if (el.textContent === selectedMovie) {
                el.classList.add('selected');
              }
            });
        
            fetchPosterUrl(preMovie.movieNm).then(posterUrl => {
              if (posterUrl) {
                document.querySelector('.poster-background').style.backgroundImage = `url(${posterUrl})`;
              }
            });
        
            updateTimeSection();
          }
        }
        
    
  })
  .catch(err => console.error('영화 목록 불러오기 실패:', err));

  function updateMonthYearDisplay() {
    const monthYearEl = document.getElementById('current-month-year');
    const year = currentWeekStart.getFullYear();
    const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    monthYearEl.textContent = `${year}.${month}`;
  }
  
  function generateDateButtons() {
    const container = document.getElementById('date-selector');
    if (!container) {
      console.error('date-selector 요소를 찾을 수 없습니다.');
      return;
    }
    container.innerHTML = '';
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 비교를 위해 오늘 날짜의 시간을 00:00:00으로 설정
  
    // 한국어 요일 배열 (getDay()는 0:일요일, 1:월요일, ..., 6:토요일)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      day: '2-digit',
    });
  
    for (let i = 0; i < 7; i++) { // 7일 표시
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
  
      // 날짜 숫자만 추출
      const day = date.getDate().toString().padStart(2, '0');
      const weekday = weekdays[date.getDay()]; // 요일을 직접 계산
  
      const btn = document.createElement('button');
      btn.className = 'date-btn';
  
      // 요일과 날짜를 세로로 배치
      btn.innerHTML = `
        <span class="day-of-week">${weekday}</span>
        <span class="day">${day}</span>
      `;
  
      // 오늘 날짜 선택
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        btn.classList.add('selected');
        selectedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
      }
  
      // 주말 강조 (일요일: 빨간색, 토요일: 파란색)
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      if (isSunday) btn.classList.add('sunday');
      if (isSaturday) btn.classList.add('saturday');
  
      // 과거 날짜 비활성화
      if (date < today) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        // 클릭 이벤트
        btn.addEventListener('click', () => {
          document.querySelectorAll('#date-selector .date-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
          updateTimeSection();
        });
      }
  
      container.appendChild(btn);
    }
  
    updateMonthYearDisplay();
  }
  
// 좌우 화살표 이벤트 추가
document.addEventListener('DOMContentLoaded', () => {
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');

  if (!prevWeekBtn || !nextWeekBtn) {
    console.error('prev-week 또는 next-week 버튼을 찾을 수 없습니다.');
    return;
  }

  prevWeekBtn.addEventListener('click', () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);

    // 오늘 날짜보다 이전으로 가지 않도록 제한
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // newWeekStart의 마지막 날짜(일주일치 중 마지막 날짜)가 오늘 날짜보다 이전이면 이동 차단
    const lastDayOfNewWeek = new Date(newWeekStart);
    lastDayOfNewWeek.setDate(newWeekStart.getDate() + 6); // 일주일치의 마지막 날짜
    if (lastDayOfNewWeek < today) {
      return; // 일주일치의 마지막 날짜가 오늘보다 이전이면 이동하지 않음
    }

    currentWeekStart = newWeekStart;
    generateDateButtons();
  });

  nextWeekBtn.addEventListener('click', () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);

    // 최대 30일 이후로 가지 않도록 제한
    if (newWeekStart > maxFutureDate) {
      return; // 30일 이후로 이동하지 않음
    }

    currentWeekStart = newWeekStart;
    generateDateButtons();
  });

  // 초기 로드 시 날짜 버튼 생성
  if (!currentWeekStart) {
    currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  }

  // 오늘 날짜보다 이전으로 설정되지 않도록 조정
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (currentWeekStart < today) {
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // 오늘 주의 일요일로 설정
  }

  generateDateButtons();
});
  

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