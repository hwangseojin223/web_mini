const params = new URLSearchParams(window.location.search);
const movie = params.get('movie');
const theater = params.get('theater');
const date = params.get('date');
const time = params.get('time');
const totalSeats = parseInt(params.get('total'));
const remainingSeats = parseInt(params.get('remaining'));
const occupiedCount = totalSeats - remainingSeats;
// console.log(remainingSeats + ': ' + occupiedCount + ':' + totalSeats);
const rows = 10;
const cols = 10;

document.getElementById('booking-info').innerHTML =
  `<span class="movie"> ${movie}</span> | 
   <span class="theater">${theater}</span> | 
   <span class="seatInfo"> 남은좌석 ${remainingSeats}/${totalSeats}</span> |
   <span class="date">${date.slice(4,6)}월 ${date.slice(6)}일</span> | 
   <span class="time">${time}</span>`;

 let selectedCount = 1;
 // 버튼에서 인원 수 선택하기
const peopleButtons = document.querySelectorAll('#people-selector button');
peopleButtons.forEach(button => {
    button.addEventListener('click', () => {
        peopleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        selectedCount = parseInt(button.dataset.count);
        console.log(`선택한 인원 수: ${selectedCount}`);

        // 좌석 재선택 리셋 (선택된 좌석 초기화)
        selectedSeats.clear();
        document.querySelectorAll('.seat.selected').forEach(seat => {
            seat.classList.remove('selected');
        });
    });
});
peopleButtons[0].classList.add('active');


// 이미 예약된 좌석 랜덤 생성
const seats = document.getElementById('seat');
const occupiedSeats = new Set();

while(occupiedSeats.size < occupiedCount){
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    occupiedSeats.add(`${r}-${c}`);
}

// 좌석 생성 및 표시
const selectedSeats = new Set();

for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
        const seat = document.createElement('div');
        const seatId = `${r}-${c}`;
        seat.className = 'seat';
        seat.textContent = String.fromCharCode(65 + r) + (c + 1);

        if(occupiedSeats.has(seatId)){
            seat.classList.add('occupied');
        }else {
            seat.addEventListener('click', () => {
                const maxPeople = selectedCount;
                if(seat.classList.contains('selected')){
                    seat.classList.remove('selected');
                    selectedSeats.delete(seatId);
                }else {
                    if (selectedSeats.size >= maxPeople) {
                        alert(`${maxPeople}명까지만 선택할 수 있어요.`);
                        return;
                    }
                    seat.classList.add('selected');
                    selectedSeats.add(seatId);
                }
            })
        }
        seats.append(seat);
    }
}

document.getElementById('seat-btn').addEventListener('click', ()=>{
    const maxPeople = selectedCount;
    if(selectedSeats.size === 0){
        alert('좌석을 선택해주세요.');
        return;
    }
    const selectedSeatList = [...selectedSeats].map(id => {
        const [r, c] = id.split('-');
        return String.fromCharCode(65 + parseInt(r)) + (parseInt(c) + 1);
      }).join(',');
    
      const params = new URLSearchParams(window.location.search);
      const url = `payment.html?movie=${params.get('movie')}&theater=${params.get('theater')}&date=${params.get('date')}&time=${params.get('time')}&seats=${selectedSeatList}&people=${maxPeople}`;
      window.location.href = url;

    
      window.location.href = url;
})