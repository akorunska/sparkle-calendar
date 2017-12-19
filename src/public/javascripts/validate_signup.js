function validate() {
    // let pass1 = document.getElementById('pass_input').value;
    // let pass2 = document.getElementById('pass_input2').value;
    // let email = document.getElementById('email_input').value;
    // let telegram = document.getElementById('telegram_input').value;
    // let username = document.getElementById('username_input').value;
    //
    // if (pass1.length < 6) {
    //     return false;
    // } else if (pass1 !== pass2) {
    //     return false;
    // } else if (!/^((.+)@(.+)\.(.+))$/.test(email.trim())) {
    //    return false;
    // }
    //
    // let email_ajax = new XMLHttpRequest();
    // let telegram_ajax = new XMLHttpRequest();
    // let username_ajax = new XMLHttpRequest();
    //
    // email_ajax.onreadystatechange = function() {
    //     if(email_ajax.readyState === 4 && email_ajax.status === 200) {
    //         let resObj = JSON.parse(email_ajax.response);
    //         if (resObj.res === true) {
    //             return false;
    //         }
    //     }
    // };
    //
    // telegram_ajax.onreadystatechange = function() {
    //     if(telegram_ajax.readyState === 4 && telegram_ajax.status === 200) {
    //         let resObj = JSON.parse(telegram_ajax.response);
    //         if (resObj.res === true) {
    //             return false;
    //         }
    //     }
    // };
    //
    // username_ajax.onreadystatechange = function() {
    //     if(username_ajax.readyState === 4 && username_ajax.status === 200) {
    //         let resObj = JSON.parse(username_ajax.response);
    //         if (resObj.res === true) {
    //             return false;
    //         }
    //     }
    // };
    //
    // email_ajax.open('GET', '/api/v1/taken?email=' + email);
    // telegram_ajax.open('GET', '/api/v1/taken?telegram=' + telegram);
    // username_ajax.open('GET', '/api/v1/taken?username=' + username);
    //
    // email_ajax.send();
    // telegram_ajax.send();
    // username_ajax.send();
    let errors = document.getElementsByClassName('error');
    for (let err of errors) {
        if (err.style.visibility === 'visible')
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
    let value = document.getElementById('email_input').value;
    let error = document.getElementById('email_error');
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        console.log(ajax.readyState, ajax.response, ajax.status);
        if(ajax.readyState === 4 && ajax.status === 200) {
            let resObj = JSON.parse(ajax.response);
            if (resObj.res === true) {
                error.style.visibility = 'visible';
                error.innerText = 'User with this telegram username is already registered.'
            } else if (!/^((.+)@(.+)\.(.+))$/.test(value.trim())) {
                error.style.visibility = 'visible';
                error.innerText = 'Please, enter valid email.'
            } else {
                error.style.visibility = 'hidden';
            }
        }
    };
    ajax.open('GET', '/api/v1/taken?email=' + value);
    ajax.send();
}

function validate_telegram() {
    let ajax = new XMLHttpRequest();
    let value = document.getElementById('telegram_input').value;
    let error = document.getElementById('telegram_error');

    ajax.onreadystatechange = function() {
        console.log(ajax.readyState, ajax.response, ajax.status);
        if(ajax.readyState === 4 && ajax.status === 200) {
            let resObj = JSON.parse(ajax.response);
            if (resObj.res === true) {
                error.style.visibility = 'visible';
                error.innerText = 'User with this telegram username is already registered.'
            } else {
                error.style.visibility = 'hidden';
            }
        }
    };

    ajax.open('GET', '/api/v1/taken?telegram=' + value);
    ajax.send();
}

function validate_username() {
    let ajax = new XMLHttpRequest();
    let value = document.getElementById('username_input').value;
    let error = document.getElementById('username_error');

    ajax.onreadystatechange = function () {
        console.log(ajax.readyState, ajax.response, ajax.status);
        if (ajax.readyState === 4 && ajax.status === 200) {
            let resObj = JSON.parse(ajax.response);
            if (resObj.res === true) {
                error.style.visibility = 'visible';
                error.innerText = 'This username is already taken.'
            } else {
                error.style.visibility = 'hidden';
            }
        }
    };

    ajax.open('GET', '/api/v1/taken?username=' + value);
    ajax.send();
}