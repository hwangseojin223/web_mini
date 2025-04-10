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
const selectedSeats = new Set();
const occupiedSeats = new Set();

const prices = {
  adult: 12000,
  teen: 9000,
  discount: 6000,
};

const counts = {
  adult: 1,
  teen: 0,
  discount: 0,
};

function updatePeopleDisplay() {
    $('#adult-count').text(counts.adult);
    $('#teen-count').text(counts.teen);
    $('#discount-count').text(counts.discount);
  
    const totalPeople = counts.adult + counts.teen + counts.discount;
    $('#total-people').text(`${totalPeople}명`);
  
    const totalPrice =
      counts.adult * prices.adult +
      counts.teen * prices.teen +
      counts.discount * prices.discount;
  
    $('#total-price').text(`${totalPrice.toLocaleString()}원`);
  
    updateSummary();  // 요약 카드도 갱신!
  }
  

$('.increase').click(function () {
  const type = $(this).data('type');
  counts[type]++;
  updatePeopleDisplay();
});

$('.decrease').click(function () {
  const type = $(this).data('type');
  if (counts[type] > 0) counts[type]--;
  updatePeopleDisplay();
});


updatePeopleDisplay(); // 초기 상태 설정



let selectedCount = 1;


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
    // selectedCount는 더 이상 필요 없음
    updateSummary(); // 요약만 다시 업데이트하면 돼
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
        const maxSelectableSeats = counts.adult + counts.teen + counts.discount;

        if (seat.classList.contains('selected')) {
          seat.classList.remove('selected');
          selectedSeats.delete(seatId);
        } else {
          if (selectedSeats.size >= maxSelectableSeats) {
            alert(`${maxSelectableSeats}명까지만 선택할 수 있어요.`);
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
    const totalPeople = counts.adult + counts.teen + counts.discount;
    const summarySeatList = [...selectedSeats].map(id => {
      const [r, c] = id.split('-');
      return String.fromCharCode(65 + parseInt(r)) + (parseInt(c) + 1);
    });
  
    document.getElementById('selected-seats').textContent = summarySeatList.join(', ') || '없음';
  
    // 인원 상세 표시
    let peopleSummary = `총 ${totalPeople}명`;
    const details = [];
    if (counts.adult > 0) details.push(`성인 ${counts.adult}`);
    if (counts.teen > 0) details.push(`청소년 ${counts.teen}`);
    if (counts.discount > 0) details.push(`우대 ${counts.discount}`);
    if (details.length > 0) peopleSummary += ` (${details.join(', ')})`;
  
    document.getElementById('total-people').textContent = peopleSummary;
  
    // ✅ 좌석 순서에 따라 인원 매핑해서 가격 계산
    const seatList = [...selectedSeats];
    let price = 0;
    let temp = {
      adult: counts.adult,
      teen: counts.teen,
      discount: counts.discount,
    };
  
    for (let i = 0; i < seatList.length; i++) {
      if (temp.adult > 0) {
        price += prices.adult;
        temp.adult--;
      } else if (temp.teen > 0) {
        price += prices.teen;
        temp.teen--;
      } else if (temp.discount > 0) {
        price += prices.discount;
        temp.discount--;
      }
    }
  
    document.getElementById('total-price').textContent = `${price.toLocaleString()}원`;
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
  
  document.getElementById('prev-btn').addEventListener('click', () => {
    history.back(); // 또는 window.history.go(-1);
  });
  