import {
    World, Player, Interface
} from "../global.js"

const educationDescriptions = {
    school: "Вечерняя школа — получите образование от начального до высшего. Это откроет вам путь к лучшим работам.",
    english_course: "Курсы английского языка — повышайте свой уровень владения английским. Необходимо для продвижения по карьерной лестнице.",
    computer_course: "Компьютерные курсы — изучайте компьютер от чайника до сверхпрофессионала. Обязательно для работы с компьютером."
};

const defaultDescription = "Вы уже получаете в школе начальное образование. Также вы можете записаться на курсы английского языка и компьютерные курсы.";

Interface.education = {
    update_view_activity_status: function(activity_id) {
        let finish_flag = Player.education[activity_id].is_finished;
        let attendance_flag = Player.education[activity_id].is_attending;
        let activity_label = finish_flag ? World["education"]["finished_true"] : World["education"][`attending_${attendance_flag}`];
        let button_label = World["education"][activity_id][`button_${attendance_flag}`];
        let education_button_jq = $(`#go_to_${activity_id}_button`);
        $(`#${activity_id}_status`).text(activity_label);
        education_button_jq.text(button_label);
        if (finish_flag) {
            education_button_jq.prop('disabled', true);
        }
    },
    update_view_activity_level: function(activity_id) {
        let level_labels = World["education"][activity_id]["descriptions"];
        let cur_level_label = level_labels[Player.education[activity_id].level];
        $(`#${activity_id}_level`).text(cur_level_label);
    },
    update_all: function() {
        for (const activity_id of Player.education.get_attributes()) {
            this.update_view_activity_status(activity_id);
            this.update_view_activity_level(activity_id);
        }
    },
    update_price_label: function(activity_id) {
        let acitivity_obj = World["education"][activity_id];
        let price_label = acitivity_obj ? acitivity_obj["price"] : World["interface"]["no_price"];
        $("#education_panel_price_label").text(price_label);
    },
    reset_price_label: function () {
        $("#education_panel_price_label").text(World["interface"]["no_price"]);
    },
    update_brief_label: function(activity_id) {
        let level_labels = World["education"][activity_id]["descriptions"];
        let cur_level = level_labels[Player.education[activity_id].level];
        let attendance = Player.education[activity_id].is_attending;
        let finished = Player.education[activity_id].is_finished;
        let brief;
        if (finished) {
            brief = "Вы закончили обучение. Уровень: " + cur_level;
        } else if (attendance) {
            brief = "Вы сейчас посещаете. Уровень: " + cur_level;
        } else {
            brief = "Не посещаете. Уровень: " + cur_level;
        }
        $("#education_panel_brief_label").text(brief);
    },
    reset_brief_label: function() {
        $("#education_panel_brief_label").text("-");
    },
    update_desc: function(activity_id) {
        let desc = educationDescriptions[activity_id] || defaultDescription;
        $("#education_desc_label").text(desc);
    },
    reset_desc: function() {
        $("#education_desc_label").text(defaultDescription);
    },
    alert_max_level: function(activity_id) {
        alert("You reached maximum level in " + activity_id);
    },
    alert_new_level: function(activity_id) {
        alert("You got a new level in " + activity_id);
    }
};

Player.education = {
    school: {
        experience: 0,
        level: 0,
        is_attending: false,
        is_finished: false
    },
    english_course: {
        experience: 0,
        level: 0,
        is_attending: false,
        is_finished: false
    },
    computer_course: {
        experience: 0,
        level: 0,
        is_attending: false,
        is_finished: false
    },
    get_attributes: function() {
        return ["school", "english_course", "computer_course"];
    },
    toggle_activity: function(activity_id, attendance_flag) {
        this[activity_id].is_attending = attendance_flag;
        Interface.education.update_view_activity_status(activity_id);
    },
    incr_activity_experience: function(activity_id) {
        this[activity_id].experience += 1;
    },
    incr_activity_level: function(activity_id) {
        this[activity_id].level += 1;
        this[activity_id].experience = 0;
        let cur_level = this[activity_id].level;
        let max_level = World["education"][activity_id]["durations"].length;
        if (cur_level === max_level) {
            this[activity_id].is_finished = true;
            Interface.education.alert_max_level(activity_id);
            Interface.education.update_view_activity_status(activity_id);
        }
        else {
            Interface.education.alert_new_level(activity_id);
        }
        Interface.education.update_view_activity_level(activity_id);
    },
    go_education: function(activity_id) {
        let is_attending = Player.education[activity_id].is_attending;
        if (is_attending) {
            Player.education.toggle_activity(activity_id, false);
        }
        else {
            let price = World["education"][activity_id]["price"];
            Player["status"].subtract_money(price);
            Player.education.toggle_activity(activity_id, true);
        }
    },
    update_all_activities_state: function() {
        for (const activity_id of this.get_attributes()) {
            this.update_one_activity_state(activity_id);
        }
    },
    update_one_activity_state: function(activity_id) {
        let activity_obj = this[activity_id];
        let shop_obj = World["education"][activity_id];
        if (!activity_obj.is_attending || activity_obj.is_finished) {
            return;
        }
        let price = shop_obj["price"];
        let needed_experience = shop_obj["durations"][activity_obj.level];
        Player.education.incr_activity_experience(activity_id);
        if (activity_obj.experience % World["constants"]["HOURS_IN_DAY"] === 0) {
            Player["status"].subtract_money(price);
        }
        if (activity_obj.experience >= needed_experience) {
            Player.education.incr_activity_level(activity_id);
        }
    }
};

function go_education_button_click_handler() {
    Player.education.go_education(this.name);
}

function go_education_button_mouseenter_handler() {
    Interface.education.update_price_label(this.name);
    Interface.education.update_desc(this.name);
    Interface.education.update_brief_label(this.name);
}

function go_education_button_mouseleave_handler() {
    Interface.education.reset_price_label();
    Interface.education.reset_desc();
    Interface.education.reset_brief_label();
}

function education_panel_setup() {
    $("#go_to_school_button, #go_to_english_course_button, #go_to_computer_course_button").on({
        click: go_education_button_click_handler,
        mouseenter: go_education_button_mouseenter_handler,
        mouseleave: go_education_button_mouseleave_handler
    });
    Interface.education.update_all();
}

function update_education_state() {
    Player.education.update_all_activities_state();
}

export {
    education_panel_setup, update_education_state
}
