let model = {
    events: [],
    display_date: "",
    offset: 0
};

window.addEventListener('load', function() {
    let next = document.getElementById('next_day');
    next.addEventListener('click', function() {
        console.log("next\n");
        model.offset++;
        requestEvents();
    });

    let prev = document.getElementById('prev_day');
    prev.addEventListener('click', function() {
        console.log("prev\n");
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
            model.events = eventObj.events;
            model.display_date = eventObj.display_date;
            console.log(eventObj, model.offset);
            renderEvents();
        }
    };

    ajax.open('GET', '/api/v1/user/events?offset=' + model.offset);
    ajax.send();
}

function renderEvents() {
    let events = model.events;

    document.getElementById("display_date").innerText = model.display_date;
    if (events.length > 0) {
        let template = document.getElementById("list-template").innerHTML;
        let renderedHTML = Mustache.render(template, { list: events});
        document.getElementById("event_list").innerHTML = renderedHTML;
    } else {
        document.getElementById("event_list").innerText = "You`ve got nothing planned for this date";
    }
}