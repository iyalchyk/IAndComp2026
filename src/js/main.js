import {
    World, Player, activate_status_panel
} from "./global.js";

import { buttons_panel_setup } from './partials/buttons_panel.js';
import { housing_panel_setup } from './partials/housing_panel.js';
import { shop_panel_setup } from './partials/shop_panel.js';
import { status_panel_setup } from "./partials/status_panel.js";

$(function () {
    const TIME_QUANT = 1500;
    const HOURS_IN_DAY = 6;
    const MOOD_DEDUCTION_FREQ = 3;
    const SATIETY_DEDUCTION_FREQ = 3;

    const PANEL_SETUP_FUNCS = [
        buttons_panel_setup, housing_panel_setup, shop_panel_setup, status_panel_setup
    ]

    function update_world_state() {
        const time_label = time_counter_to_time(World.time);
        $("#time").text(time_label);
        $("#money").text(Player.money);
        $("#mood").text(Player.mood);
        $("#satiety").text(Player.satiety);
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
            World.time = 0
            Player.money += Player.salary;
        }
        if (World.time % MOOD_DEDUCTION_FREQ === 0) {
            Player.mood -= 2
        }
        if (World.time % SATIETY_DEDUCTION_FREQ === 0) {
            Player.satiety -= 2
        }
        update_world_state()
    }

    for (const panel_setup_fn of PANEL_SETUP_FUNCS) {
        panel_setup_fn()
    }
    activate_status_panel()
    update_world_state();
    setInterval(next_hour_handler, TIME_QUANT);
});
