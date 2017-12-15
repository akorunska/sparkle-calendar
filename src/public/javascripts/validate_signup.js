function validate() {
    let value = document.getElementById('pass_input').value;
    if (value.length < 6) {
        return false;
    }
}

function validate_pass(pass) {
    let value = document.getElementById('pass_input').value;
    let error = document.getElementById('pass_error');
    if (value.length < 6) {
        error.style.visibility = 'visible';
        error.innerText = 'Password must be at least 6 symbols long'
    } else {
        error.style.visibility = 'hidden';
    }
}