const params = new URLSearchParams(window.location.search);
const movie = params.get('movie');
const theater = params.get('theater');
const date = params.get('date');
const time = params.get('time');
const totalSeats = parseInt(params.get('total'));
const remainingSeats = parseInt(params.get('remaining'));
const occupiedCount = totalSeats - remainingSeats;

const rows = 8;
const cols = 12;

let selectedCount = 1;
const selectedSeats = new Set();
const occupiedSeats = new Set();

// 🎬 영화 정보 출력
document.getElementById('movie-title').textContent = movie;
document.getElementById('movie-time').textContent = `${theater} | ${date.slice(4, 6)}월 ${date.slice(6)}일 | ${time}`;
document.getElementById('remaining').textContent = `${remainingSeats}/${totalSeats}석`;

// 👥 인원 선택
const peopleButtons = document.querySelectorAll('#people-selector button');
peopleButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    peopleButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCount = parseInt(btn.dataset.count);
    selectedSeats.clear();
    document.querySelectorAll('.seat.selected').forEach((seat) => seat.classList.remove('selected'));
    updateSummary();
  });
});
peopleButtons[0].classList.add('active');

// 🎲 랜덤으로 이미 예약된 좌석 지정
while (occupiedSeats.size < occupiedCount) {
  const r = Math.floor(Math.random() * rows);
  const c = Math.floor(Math.random() * cols);
  occupiedSeats.add(`${r}-${c}`);
}

// 💺 좌석 생성
const seatContainer = document.getElementById('seat-map');
for (let r = 0; r < rows; r++) {
  const row = document.createElement('div');
  row.className = 'seat-row';
  for (let c = 0; c < cols; c++) {
    const seatId = `${r}-${c}`;
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.textContent = String.fromCharCode(65 + r) + (c + 1);

    if (occupiedSeats.has(seatId)) {
      seat.classList.add('occupied');
    } else {
      seat.addEventListener('click', () => {
        if (seat.classList.contains('selected')) {
          seat.classList.remove('selected');
          selectedSeats.delete(seatId);
        } else {
          if (selectedSeats.size >= selectedCount) {
            alert(`${selectedCount}명까지만 선택할 수 있어요.`);
            return;
          }
          seat.classList.add('selected');
          selectedSeats.add(seatId);
        }
        updateSummary();
      });
    }
    row.appendChild(seat);
  }
  seatContainer.appendChild(row);
}

// 🧾 요약 카드 업데이트
function updateSummary() {
  const summarySeatList = [...selectedSeats].map(id => {
    const [r, c] = id.split('-');
    return String.fromCharCode(65 + parseInt(r)) + (parseInt(c) + 1);
  });
  document.getElementById('selected-seats').textContent = summarySeatList.join(', ') || '없음';
  document.getElementById('total-price').textContent = `${summarySeatList.length * 13000}원`;
  document.getElementById('total-people').textContent = `${selectedCount}명`;

}

// ✅ 다음 버튼 클릭 시 결제 페이지 이동
document.getElementById('next-btn').addEventListener('click', () => {
  if (selectedSeats.size === 0) {
    alert('좌석을 선택해주세요.');
    return;
  }

  const seatList = [...selectedSeats].map(id => {
    const [r, c] = id.split('-');
    return String.fromCharCode(65 + parseInt(r)) + (parseInt(c) + 1);
  }).join(',');

  const url = `payment.html?movie=${movie}&theater=${theater}&date=${date}&time=${time}&seats=${seatList}&people=${selectedCount}`;
  window.location.href = url;
});

// 🎨 TMDB 포스터 로딩
function fetchPoster(title, callback) {
    $.ajax({
      url: 'https://api.themoviedb.org/3/search/movie',
      type: 'GET',
      data: {
        api_key: '234ef78df71e08e515ca2d691678e0f1',
        query: title,
        language: 'ko'
      },
      success: function (res) {
        const posterPath = res.results[0]?.poster_path;
        callback(posterPath ? `https://image.tmdb.org/t/p/w200${posterPath}` : null);
      },
      error: function () {
        callback(null);
      }
    });
  }
  
  // DOM이 로드된 후 실행
  document.addEventListener('DOMContentLoaded', () => {
    if (movie) {
      fetchPoster(movie, function (posterUrl) {
        if (posterUrl) {
          const posterImg = document.getElementById('movie-poster');
          if (posterImg) {
            posterImg.src = posterUrl;
          }
        }
      });
    }
  });
  