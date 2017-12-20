let model = {
    weekly: [],
    display_dates: "",
    offset: 0
};

window.addEventListener('load', function() {
    let next = document.getElementById('next_week');
    next.addEventListener('click', function() {
        // console.log("next\n");
        model.offset++;
        requestEvents();
    });

    let prev = document.getElementById('prev_week');
    prev.addEventListener('click', function() {
        // console.log("prev\n");
        model.offset--;
        requestEvents();
    });

    requestEvents();
});


function requestEvents() {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        if(ajax.readyState === 4 && ajax.status === 200) {
            let eventObj = JSON.parse(ajax.response);
            model.weekly = eventObj.days;
            model.display_dates = eventObj.start_date + " - " + eventObj.end_date;
            renderEvents();
        }
    };

    ajax.open('GET', '/api/v1/user/weekly?offset=' + model.offset);
    ajax.send();
}

function renderEvents() {
    let weekly = model.weekly;

    document.getElementById("week_dates").innerText = model.display_dates;
    for (let i = 0; i < 7; i++) {
        let events = weekly[i].event_list;
        document.getElementById("display_date_" + i).innerText = weekly[i].display_date;
        if (events.length > 0) {
            let template = document.getElementById("list-template").innerHTML;
            let renderedHTML = Mustache.render(template, { list: events});
            document.getElementById("event_list_" + i).innerHTML = renderedHTML;
        } else {
            document.getElementById("event_list_" + i).innerText = "You`ve got nothing planned for this date";
        }
    }
}