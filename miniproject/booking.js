const params = new URLSearchParams(window.location.search);
const movie = params.get('movie');
const theater = params.get('theater');
const date = params.get('date');
const time = params.get('time');
const totalSeats = parseInt(params.get('total'));
const remainingSeats = parseInt(params.get('remaining'));
const occupiedCount = totalSeats - remainingSeats;
console.log(remainingSeats + ': ' + occupiedCount + ':' + totalSeats);
const rows = 10;
const cols = 15;

document.getElementById('booking-info').textContent =
    `${movie} | ${theater} | ${date.slice(4,6)} 월 ${date.slice(6)}일 | ${time}`;

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
                const maxPeople = parseInt(document.getElementById('peoplecnt').value);
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
    const maxPeople = parseInt(document.getElementById('peoplecnt').value);
    if(selectedSeats.size === 0){
        alert('좌석을 선택해주세요.');
        return;
    }
    const selectedSeatList = [...selectedSeats].map(id => {
        const [r, c] = id.split('-');
        return String.fromCharCode(65 + parseInt(r)) + (parseInt(c) + 1);
      }).join(',');
    
      const params = new URLSearchParams(window.location.search);
      const url = `bookingInfo.html?movie=${params.get('movie')}&theater=${params.get('theater')}&date=${params.get('date')}&time=${params.get('time')}&seats=${selectedSeatList}&people=${maxPeople}`;
    
      window.location.href = url;
})