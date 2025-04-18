
document.addEventListener('DOMContentLoaded', function() {
    // Get the static value from the p tag
    const turbidityElement = document.querySelector('.alert-item p');
    const turbidityText = turbidityElement.textContent;
    // Extract just the number from "100 °C"
    const turbidityValue = parseFloat(turbidityText);
    
    const statusAlert = document.getElementById('status-alert');
    const dangerModal = document.getElementById('danger-modal');

    // Automatically set status based on the static value
    if (turbidityValue <= 100) {
        statusAlert.textContent = 'Water Quality: Very Clean';
        statusAlert.style.backgroundColor = '#d4edda';
        statusAlert.style.color = '#155724';
        dangerModal.style.display = 'none';
    } else if (turbidityValue <= 200) {
        statusAlert.textContent = 'Water Quality: Normal';
        statusAlert.style.backgroundColor = '#fff3cd';
        statusAlert.style.color = '#856404';
        dangerModal.style.display = 'none';
    } else {
        statusAlert.textContent = '⚠️ WARNING: Water is Dirty!';
        statusAlert.style.backgroundColor = '#f8d7da';
        statusAlert.style.color = '#721c24';
        dangerModal.style.display = 'flex';
    }
});

// Just keep the modal close function
function closeDangerModal() {
    document.getElementById('danger-modal').style.display = 'none';
}

    const modeButton = document.getElementById('mode-button');
const pumpButton = document.getElementById('pump-button');
let isAutomatic = false;

modeButton.addEventListener('click', () => {
  isAutomatic = !isAutomatic;
  if (isAutomatic) {
    modeButton.textContent = 'Switch to manual mode';
    modeButton.classList.add('blue');
    pumpButton.textContent = 'Turn off pump';
    pumpButton.classList.add('red');
  } else {
    modeButton.textContent = 'Switch to automatic mode';
    modeButton.classList.add('blue');
    pumpButton.textContent = 'Turn on pump';
    pumpButton.classList.remove('red');
  }
});

pumpButton.addEventListener('click', () => {
  if (pumpButton.textContent === 'Turn on pump') {
    pumpButton.textContent = 'Turn off pump';
    pumpButton.classList.add('red');
  } else {
    pumpButton.textContent = 'Turn on pump';
    pumpButton.classList.remove('red');
  }
});


///////////////
document.querySelectorAll('.pump-control').forEach(button => {
  button.addEventListener('click', function () {
      if (this.textContent.includes('Turn on')) {
          this.textContent = this.textContent.replace('Turn on', 'Turn off');
          this.style.backgroundColor = 'red';
      } else {
          this.textContent = this.textContent.replace('Turn off', 'Turn on');
          this.style.backgroundColor = 'rgb(25, 125, 213)';
      }
  });
});
