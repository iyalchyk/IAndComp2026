import {
    World, Player, activate_status_panel, update_player_view
} from "./global.js";

import { buttons_panel_setup } from './partials/buttons_panel.js';
import { housing_panel_setup } from './partials/housing_panel.js';
import { shop_panel_setup } from './partials/shop_panel.js';
import { entertainment_panel_setup } from './partials/entertainment_panel.js';
import { hobby_panel_setup } from "./partials/hobby_panel.js";
import { education_panel_setup, update_education_state } from "./partials/education_panel.js";
import { status_panel_setup } from "./partials/status_panel.js";

$(function () {
    const TIME_QUANT = 1500;
    const HOURS_IN_DAY = 12;
    const SALARY_ADDITION_FREQ = HOURS_IN_DAY;  // we get salary once a day at midnight
    const MOOD_DEDUCTION_FREQ = 3;
    const SATIETY_DEDUCTION_FREQ = 3;

    const PANEL_SETUP_FUNCS = [
        buttons_panel_setup,
        housing_panel_setup,
        shop_panel_setup,
        entertainment_panel_setup,
        hobby_panel_setup,
        education_panel_setup,
        status_panel_setup
    ]

    function update_time_state() {
        const time_label = time_counter_to_time(World.time);
        $("#time").text(time_label);
    }

    function time_counter_to_time(time_counter) {
        const hours = time_counter % HOURS_IN_DAY
        const hours_str = hours.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })
        return hours_str + ":00"
    }

    function next_hour_handler() {
        World.time++;
        if (World.time === HOURS_IN_DAY) {
            World.time = 0;
        }
        if (World.time % SALARY_ADDITION_FREQ === 0) {
            Player.money += Player.salary;
        }
        if (World.time % MOOD_DEDUCTION_FREQ === 0) {
            Player.mood -= 2;
        }
        if (World.time % SATIETY_DEDUCTION_FREQ === 0) {
            Player.satiety -= 2;
        }
        update_time_state();
        update_education_state();
        update_player_view();
    }

    for (const panel_setup_fn of PANEL_SETUP_FUNCS) {
        panel_setup_fn()
    }
    activate_status_panel();
    update_time_state();
    update_player_view();
    setInterval(next_hour_handler, TIME_QUANT);
});
