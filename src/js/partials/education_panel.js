import {
    Shop, Player, activate_status_panel, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    go_to_school_button: "school",
    go_to_english_course_button: "english_course",
    go_to_computer_course_button: "computer_course"
};

const BUTTON_ID_STATE_LABELS_MAP = {
    go_to_school_button_true: "Пойти в вечернюю школу",
    go_to_school_button_false: "Закончить ходить в вечернюю школу",
    go_to_english_course_button_true: "Пойти на курсы английского",
    go_to_english_course_button_false: "Закончить ходить на курсы английского",
    go_to_computer_course_button_true: "Пойти на компьютерные курсы",
    go_to_computer_course_button_false: "Закончить ходить на компьютерные курсы"
};

const SCHOOL_LEVEL_DESCRIPTION_MAP = {

};

const ENGLISH_COURSE_DESCRIPTION_MAP = {

};

const COMPUTER_COURSE_DESCRIPTION_MAP = {

};

function go_education_handler(event) {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id];
    let button_label_key = `${this.id}_${Player.activities[assortment_str]}`;
    let button_label = BUTTON_ID_STATE_LABELS_MAP[button_label_key];
    if (Player.activities[assortment_str]) {
        Player.activities[assortment_str] = false;
        $(`#${assortment_str}_status`).text("Не хожу");
    }
    else {
        Player.activities[assortment_str] = true;
        Player.money -= Shop[assortment_str]["price"];
        $(`#${assortment_str}_status`).text("Посещаю");
    }
    $(event.target).text(button_label);
    update_player_view();
}

function set_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (assortment_obj) {
        $("#education_panel_price_label").text(assortment_obj["price"]);
    }
    else {
        $("#education_panel_price_label").text("-");
    }
}

function reset_price_label_handler() {
    $("#education_panel_price_label").text("-");
}

function education_panel_setup() {
    $("#go_to_school_button, #go_to_english_course_button, #go_to_computer_course_button").on({
        click: go_education_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

function update_education_state() {
    const HOURS_IN_DAY = 12;
    for (const activity_str in Player.activities) {
        // school, english_course, computer_course
        let cur_level = Player.levels[activity_str];
        if (!Player.activities[activity_str]) {
            continue;
        }
        Player.experience[activity_str] += 1;
        if (Player.experience[activity_str] >= Shop[activity_str]["durations"][cur_level]) {
            Player.levels[activity_str] += 1;
            Player.experience[activity_str] = 0;
            Player.money -= Shop[activity_str]["price"];
            $(`#${activity_str}_level`).text(Player.levels[activity_str]);
            if (Player.levels[activity_str] == Shop[activity_str]["durations"].length) {
                alert("You reached maximum level in " + activity_str);
                $(`#go_to_${activity_str}_button`).prop('disabled', true);
                $(`#${activity_str}_status`).text("Закончил");
                reset_price_label_handler();
            }
            else {
                alert("You got a new level in " + activity_str);
            }
            $(`#${activity_str}_level`).text("" + Player.levels[activity_str]);
        }
        else if (Player.experience[activity_str] % HOURS_IN_DAY === 0) {
            Player.money -= Shop[activity_str]["price"];
        }
    }
}

export {
    education_panel_setup, update_education_state
}
