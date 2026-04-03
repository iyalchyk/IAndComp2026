import {
    World, Player, Interface
} from "../global.js"
import { build_requirements_html } from "./job_panel.js"
import { t } from "../i18n.js";

let taxi_accident_occurred = false;
let taxi_event = {
    state: null,       // "court_pending" | "verdict_pending"
    trigger_time: 0,
    day_count: 0
};

function open_panel(panel_selector) {
    $(".switchable").hide();
    $("#buttons_panel").hide();
    $(panel_selector).show();
    $("#home_button").show();
}

function get_last_list_item(items) {
    return items && items.length ? items[items.length - 1] : null;
}

function get_max_level_software(category) {
    let max_level_software = null;
    for (const software_name in World["software"][category]) {
        let software_obj = World["software"][category][software_name];
        if (!max_level_software || software_obj.level > max_level_software.level) {
            max_level_software = software_obj;
        }
    }
    return max_level_software;
}

function grant_all_housing() {
    for (const property_type of Player.housing.get_attributes()) {
        let max_property = get_last_list_item(World["housing"][property_type]);
        Player.housing.set_property(property_type, max_property);
        Interface.housing.disable_button(`#buy_${property_type}_button`);
    }
    Interface.housing.update_all();
    Interface.housing.reset_price_label();
    Interface.housing.reset_preview();
    Interface.housing.reset_desc();
}

function grant_all_shop() {
    for (const property_type of Player.shop.get_attributes()) {
        let max_property = get_last_list_item(World["shop"][property_type]);
        Player.shop.set_property(property_type, max_property);
        Interface.shop.disable_button(`#buy_${property_type}_button`);
    }
    Interface.shop.update_all();
    Interface.shop.reset_price_label();
    Interface.shop.reset_food_satiety_label();
}

function grant_all_hardware() {
    for (const hardware_type of Player.hardware.get_attributes()) {
        let max_property = get_last_list_item(World["hardware"][hardware_type]);
        Player.hardware.set_hardware(hardware_type, max_property);
        Interface.hardware.disable_button(`#buy_${hardware_type}_button`);
    }
    Interface.hardware.update_all();
    Interface.hardware.reset_price_label();
    Interface.hardware.reset_current_label();
    Interface.hardware.reset_desc();
    Interface.hardware.reset_image();
}

function grant_all_software() {
    for (const category of Player.software.get_attributes()) {
        let max_software = get_max_level_software(category);
        Player.software.set_software(category, max_software);
        Interface.software.disable_prev_software(category);
    }
    Interface.software.update_all();
    Interface.software.reset_price_label();
    Interface.software.reset_requirements();
}

function grant_all_education() {
    Player.education.set_all_max_levels();
    Interface.education.reset_price_label();
    Interface.education.reset_brief_label();
    Interface.education.reset_desc();
}

function grant_bonus_fish() {
    Player.hobby.set_fish(Math.max(Player.hobby.fish.level, 100));
}

function panel_button_click_handler() {
    open_panel(this.name);
}

function hack_button_click_handler() {
    let requirements = World["hacking"]["requirements"];
    for (const key in requirements) {
        if (!Player.check_requirement(key, requirements[key])) {
            let html = t("js.buttons.hacking_requirements_html") +
                build_requirements_html(requirements);
            Interface.show_dialog_html(t("common.requirements_not_met"), html);
            return;
        }
    }
    open_panel("#hacking_panel");
}

function bank_button_click_handler() {
    if (Player.shop.car && Player.shop.car.level > 0) {
        open_panel("#bank_panel");
    } else {
        $("#bank_taxi_dialog").show();
    }
}

function buy_all_button_click_handler() {
    grant_all_housing();
    grant_all_shop();
    grant_all_hardware();
    grant_all_software();
    grant_all_education();
    grant_bonus_fish();
    Interface.show_dialog(t("js.buttons.buy_all_done_title"), t("js.buttons.buy_all_done_text"));
}

function new_game_click_handler() {
    window.location.reload();
}

function show_about_game_dialog() {
    Interface.show_dialog(
        t("dom.index.about_game_button"),
        t("js.buttons.about_game")
    );
}

function about_game_click_handler() {
    show_about_game_dialog();
}

function try_taxi_accident() {
    if (taxi_accident_occurred) return false;
    if (Math.random() > 0.2) return false;
    taxi_accident_occurred = true;
    Interface.show_dialog(":-(((",
        t("js.buttons.taxi_accident"),
        function() {
            Player["status"].subtract_money(30);
            taxi_event.state = "court_pending";
            taxi_event.day_count = 0;
        }
    );
    return true;
}

function show_court_offer() {
    $("#taxi_court_dialog").show();
}

function show_verdict() {
    let roll = Math.floor(Math.random() * 3);
    if (roll === 0) {
        Player["status"].add_money(25);
        Interface.show_dialog(t("js.buttons.court_title"), t("js.buttons.court_win"));
    } else if (roll === 1) {
        Player["status"].subtract_money(15);
        Interface.show_dialog(t("js.buttons.court_title"), t("js.buttons.court_loss"));
    } else {
        Player["status"].add_money(10);
        Interface.show_dialog(t("js.buttons.court_title"), t("js.buttons.court_draw"));
    }
}

function update_taxi_event() {
    if (!taxi_event.state) return;
    if (!Player["time"].is_new_day()) return;

    taxi_event.day_count++;
    if (taxi_event.state === "court_pending" && taxi_event.day_count >= 1) {
        taxi_event.state = null;
        show_court_offer();
    } else if (taxi_event.state === "verdict_pending" && taxi_event.day_count >= 1) {
        taxi_event.state = null;
        show_verdict();
    }
}

function buttons_panel_setup() {
    $(
        "#housing_button, " +
        "#shop_button, " +
        "#entertainment_button, " +
        "#hobby_button, " +
        "#education_button, " +
        "#job_button, " +
        "#hardware_button, " +
        "#software_button, " +
        "#internet_button"
    ).on({
        click: panel_button_click_handler
    });
    $("#bank_button").on({
        click: bank_button_click_handler
    });
    $("#hack_button").on({
        click: hack_button_click_handler
    });
    $("#buy_all_button").on({
        click: buy_all_button_click_handler
    });
    $("#new_game_button").on({
        click: new_game_click_handler
    });
    $("#about_game_button").on({
        click: about_game_click_handler
    });
    $("#bank_taxi_yes").on("click", function() {
        $("#bank_taxi_dialog").hide();
        if (Player["status"].money < 10) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(10);
        if (!try_taxi_accident()) {
            open_panel("#bank_panel");
        }
    });
    $("#bank_taxi_no").on("click", function() {
        $("#bank_taxi_dialog").hide();
    });
    $("#taxi_court_yes").on("click", function() {
        $("#taxi_court_dialog").hide();
        taxi_event.state = "verdict_pending";
        taxi_event.day_count = 0;
    });
    $("#taxi_court_no").on("click", function() {
        $("#taxi_court_dialog").hide();
    });
}

export {
    buttons_panel_setup, show_about_game_dialog, update_taxi_event
}
