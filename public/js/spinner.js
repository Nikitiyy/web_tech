export function showSpinner() {
    const spinner = document.querySelector('.spinner-default');
    const slider = document.querySelector('.slider');
    
    if (spinner) spinner.style.display = 'block';
    if (slider) {
        slider.dataset.originalDisplay = slider.style.display || 'flex';
        slider.style.display = 'none';
    }
}

export function hideSpinner() {
    const spinner = document.querySelector('.spinner-default');
    const slider = document.querySelector('.slider');
    
    if (spinner) spinner.style.display = 'none';
    if (slider) {
        slider.style.display = slider.dataset.originalDisplay || 'flex';
    }
}