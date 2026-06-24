import { World } from "./global.js";
import { Player } from "./global.js";
import { Interface } from "./global.js";
import { apply_world_data, load_world_data } from "./data.js";
import { apply_translations, load_label_sets, set_locale } from "./i18n.js";
import { time_panel_setup, update_time_state } from './partials/time_panel.js';
import { buttons_panel_setup, show_startup_language_dialog, update_taxi_event } from './partials/buttons_panel.js';
import { housing_panel_setup } from './partials/housing_panel.js';
import { shop_panel_setup } from './partials/shop_panel.js';
import { entertainment_panel_setup } from './partials/entertainment_panel.js';
import { hobby_panel_setup } from "./partials/hobby_panel.js";
import { education_panel_setup, update_education_state } from "./partials/education_panel.js";
import { job_panel_setup } from "./partials/job_panel.js";
import { bank_panel_setup, update_bank_state } from "./partials/bank_panel.js";
import { hardware_panel_setup } from "./partials/hardware_panel.js";
import { software_panel_setup } from "./partials/software_panel.js";
import { internet_panel_setup, update_internet_state } from "./partials/internet_panel.js";
import { hacking_panel_setup } from "./partials/hacking_panel.js";
import { status_panel_setup, update_status_state } from "./partials/status_panel.js";

$(function () {
    let is_game_started = false;

    function next_hour_handler() {
        if (Player.is_paused) {
            return;
        }

        update_time_state();
        update_status_state();
        update_education_state();
        update_bank_state();
        update_internet_state();
        update_taxi_event();
    }

    function activate_ui() {
        $("#app").css("visibility", "visible");
    }

    function set_pause_state(is_paused) {
        Player.is_paused = is_paused;
        $("#app").toggleClass("game_paused", is_paused);
        $("#pause_overlay").css("display", is_paused ? "flex" : "none");
    }

    function toggle_pause_state() {
        set_pause_state(!Player.is_paused);
    }

    function pause_keydown_handler(event) {
        if (!is_game_started || event.repeat || event.code !== "Space") {
            return;
        }

        event.preventDefault();
        toggle_pause_state();
    }

    function pause_keyup_handler(event) {
        if (!is_game_started || event.code !== "Space") {
            return;
        }

        event.preventDefault();
    }

    function pause_panel_setup() {
        $("#pause_overlay").hide();
        $(document).on("keydown.pause", pause_keydown_handler);
        $(document).on("keyup.pause", pause_keyup_handler);
    }

    function init_game(world_data, locale) {
        if (is_game_started) {
            return;
        }

        is_game_started = true;
        set_locale(locale);
        apply_world_data(world_data);
        apply_translations();
        time_panel_setup();
        status_panel_setup();
        buttons_panel_setup();
        housing_panel_setup();
        shop_panel_setup();
        entertainment_panel_setup();
        hobby_panel_setup();
        education_panel_setup();
        job_panel_setup();
        bank_panel_setup();
        hardware_panel_setup();
        software_panel_setup();
        internet_panel_setup();
        hacking_panel_setup();
        pause_panel_setup();

        next_hour_handler();
        activate_ui();
        setInterval(next_hour_handler, World["constants"]["TIME_QUANT"]);
    }

    function show_startup_dialog(world_data) {
        set_locale("ru");
        apply_translations();
        activate_ui();
        show_startup_language_dialog(function(locale) {
            init_game(world_data, locale);
        });
    }

    Interface.initialize_dialog();

    $.when(
        load_world_data("assets/data/world.json"),
        load_label_sets({
            ru: "assets/data/labels_ru.json",
            en: "assets/data/labels_en.json"
        })
    )
        .done(function(worldResponse) {
            show_startup_dialog(worldResponse[0]);
        })
        .fail(function(e, e2) {
            console.log("An error has occurred.", e, e2);
        });
});
