import { World } from "./global.js";
import { load_assets } from "./data.js";
import { time_panel_setup, update_time_state } from './partials/time_panel.js';
import { buttons_panel_setup } from './partials/buttons_panel.js';
import { housing_panel_setup } from './partials/housing_panel.js';
import { shop_panel_setup } from './partials/shop_panel.js';
import { entertainment_panel_setup } from './partials/entertainment_panel.js';
import { hobby_panel_setup } from "./partials/hobby_panel.js";
import { education_panel_setup, update_education_state } from "./partials/education_panel.js";
import { job_panel_setup } from "./partials/job_panel.js";
import { bank_panel_setup, update_bank_state } from "./partials/bank_panel.js";
import { hardware_panel_setup } from "./partials/hardware_panel.js";
import { software_panel_setup } from "./partials/software_panel.js";
import { status_panel_setup, update_status_state } from "./partials/status_panel.js";

$(function () {

    function next_hour_handler() {
        update_time_state();
        update_status_state();
        update_education_state();
        update_bank_state();
    }

    function activate_ui() {
        $("#app").css("visibility", "visible");
    }

    function init_game() {
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

        next_hour_handler();
        activate_ui();
        setInterval(next_hour_handler, World["constants"]["TIME_QUANT"]);
    }

    load_assets("assets/data/world.json", init_game);
});
