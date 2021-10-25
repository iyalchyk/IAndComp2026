import {
    World, Shop, Player, home_button_handler
} from "./global.js"

import {
        housing_button_handler,
        buy_apartment_button_handler,
        buy_apartment_button_mouseenter_handler
} from './housing_panel.js';

$(function (events, handler) {
    const TIME_QUANT = 1500;
    const HOURS_IN_DAY = 6;
    const MOOD_DEDUCTION_FREQ = 3;
    const SATIETY_DEDUCTION_FREQ = 3;

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



    // $('#housing_panel').load('housing_panel.html');

    $("#housing_button").on("click", housing_button_handler)
    $("#buy_apartment_button").on("click", buy_apartment_button_handler)
    $("#home_button").on("click", home_button_handler)

    $("#buy_apartment_button").on("mouseenter", buy_apartment_button_mouseenter_handler)
    $("#buy_apartment_button").on("mouseleave", function() {
        $("#housing_panel_price_label").text("-");
    })
    home_button_handler()

    update_world_state();
    setInterval(next_hour_handler, TIME_QUANT);
});
