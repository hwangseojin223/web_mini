const checkboxes = document.querySelectorAll('.agreement-check');
const payBtn = document.getElementById('payBtn');
const radioButtons = document.querySelectorAll('input[name="pay"]');

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
  
