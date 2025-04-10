const checkboxes = document.querySelectorAll('.agreement-check');
const payBtn = document.getElementById('payBtn');
const params = new URLSearchParams(window.location.search);
const radioButtons = document.querySelectorAll('input[name="pay"]');
const movie = params.get('movie');
const theater = params.get('theater');
const date = params.get('date');
const time = params.get('time');
const seats = params.get('seats');
const adult = parseInt(params.get('adult'));
const teen = parseInt(params.get('teen'));
const discount = parseInt(params.get('discount'));
const price = parseInt(params.get('price'));

// 페이지에 정보 표시 (HTML 요소는 적절히 설정해줘야 함)
document.getElementById('movie-title').textContent = movie;
document.getElementById('movie-info').textContent = `${theater} | ${date.slice(4, 6)}월 ${date.slice(6)}일 | ${time}`;
document.getElementById('seat-list').textContent = seats;
document.getElementById('people-info').textContent = 
  `성인 ${adult}명, 청소년 ${teen}명, 우대 ${discount}명`;
document.getElementById('final-price').textContent = `${price.toLocaleString()}원`;

function updatePayButtonState() {
  const allChecked = [...checkboxes].every(cb => cb.checked);
  const selectedPaymentMethod = document.querySelector('.payment-buttons .btn.selected');
  const isSimplePay = selectedPaymentMethod && selectedPaymentMethod.textContent.includes('간편결제');
  const isRadioChecked = !isSimplePay || [...radioButtons].some(r => r.checked);

  payBtn.disabled = !(allChecked && isRadioChecked);
}

// 약관 체크박스 이벤트
checkboxes.forEach(cb => cb.addEventListener('change', updatePayButtonState));

// 라디오 버튼 이벤트
radioButtons.forEach(r => r.addEventListener('change', updatePayButtonState));

// 결제수단 선택 시에도 상태 확인
function selectMethod(button) {
  document.querySelectorAll('.payment-buttons .btn').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');

  const simplePayOptions = document.querySelector('.simple-pay-options');
  const promoBox = document.querySelector('.promotion');

  if (button.textContent.includes('간편결제')) {
    simplePayOptions.style.display = 'block';
    promoBox.style.display = 'block';
  } else {
    simplePayOptions.style.display = 'none';
    promoBox.style.display = 'none';
  }

  updatePayButtonState(); // 선택 바뀔 때 상태 업데이트
}
payBtn.addEventListener('click', () => {
    const selectedPayment = document.querySelector('.payment-buttons .btn.selected').textContent.trim();
    alert(`선택한 결제수단: ${selectedPayment}\n결제가 진행됩니다.`);
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