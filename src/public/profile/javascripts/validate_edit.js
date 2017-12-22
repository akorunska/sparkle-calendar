function validate() {
    let errors = document.getElementsByClassName('error');
    for (let err of errors) {
        if (err.style.visibility === 'visible')
            return false;
    }
}

function validate_email() {
    let value = document.getElementById('email_input').value;
    let error = document.getElementById('email_error');

    if (!/^((.+)@(.+)\.(.+))$/.test(value.trim())) {
        error.style.visibility = 'visible';
        error.innerText = 'Please, enter valid email.'
    } else {
        error.style.visibility = 'hidden';
    }
}

function validate_telegram() {
    let value = document.getElementById('telegram_input').value;
    let error = document.getElementById('telegram_error');

    if (!/^@(.+)$/.test(value.trim())) {
        error.style.visibility = 'visible';
        error.innerText = 'Please, enter telegram username starting with @ (@username).'
    } else {
        error.style.visibility = 'hidden';
    }
}