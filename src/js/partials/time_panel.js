import {
    World, Player, Interface
} from "../global.js"

Interface.time = {
    update_view: function() {
        const time_label = time_counter_to_time(Player.time.cur_time);
        $("#time").text(time_label);
    }
};

Player.time = {
    cur_time: 0,

    get_attributes: function() {
        return ["cur_time"];
    },
    incr_time: function() {
        this.cur_time++;
        if (this.cur_time === World["constants"]["HOURS_IN_DAY"]) {
            this.cur_time = 0;
        }
        Interface.time.update_view();
    },
    is_new_day: function() {
        return this.cur_time % World["constants"]["HOURS_IN_DAY"] === 0;
    }

};

function time_counter_to_time(time_counter) {
    const hours = time_counter % World["constants"]["HOURS_IN_DAY"];
    const hours_str = hours.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    return hours_str + ":00";
}

function time_panel_setup() {
    update_time_state()
}

function update_time_state() {
    Player.time.incr_time();
}

export {
    time_panel_setup, update_time_state
}