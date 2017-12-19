function validate() {
    let pass1 = document.getElementById('pass_input').value;
    let pass2 = document.getElementById('pass_input2').value;
    let email = document.getElementById('email_input').value;
    if (pass1.length < 6) {
        return false;
    } else if (pass1 !== pass2) {
        return false;
    } else if (!/^((.+)@(.+)\.(.+))$/.test(email.trim())) {
       return false;
    }
}

function validate_pass() {
    let value = document.getElementById('pass_input').value;
    let error = document.getElementById('pass_error');
    if (value.length < 6) {
        error.style.visibility = 'visible';
        error.innerText = 'Password must be at least 6 symbols long'
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_pass_match() {
    let pass1 = document.getElementById('pass_input').value;
    let pass2 = document.getElementById('pass_input2').value;
    let error = document.getElementById('pass_error2');
    if (pass1 !== pass2) {
        error.style.visibility = 'visible';
        error.innerText = 'Passwords should match'
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_email() {
    let email = document.getElementById('email_input').value;
    let error = document.getElementById('email_error');
    if (!/^((.+)@(.+)\.(.+))$/.test(email.trim())) {
        error.style.visibility = 'visible';
        error.innerText = 'Please, enter valid email.'
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_telegram() {

}