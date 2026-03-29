import {
    Player, Interface
} from "../global.js"

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

function panel_button_click_handler() {
    open_panel(this.name);
}

function bank_button_click_handler() {
    if (Player.shop.car && Player.shop.car.level > 0) {
        open_panel("#bank_panel");
    } else {
        $("#bank_taxi_dialog").show();
    }
}

function try_taxi_accident() {
    if (taxi_accident_occurred) return false;
    if (Math.random() > 0.2) return false;
    taxi_accident_occurred = true;
    Interface.show_dialog(":-(((",
        "Случилось несчастье. Таксист попал в аварию, и вы сильно пострадали. На лечение пришлось потратить большие деньги: 30$",
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
        Interface.show_dialog("Суд", "Поздравляю! Вы выиграли дело и получили компенсацию 25$.");
    } else if (roll === 1) {
        Player["status"].subtract_money(15);
        Interface.show_dialog("Суд", "К сожалению, вы проиграли и вам пришлось заплатить штраф 15$ за беспокойство суда.");
    } else {
        Player["status"].add_money(10);
        Interface.show_dialog("Суд", "Вам не удалось ничего доказать, но и таксист ничего не доказал. Вам выплатили небольшую компенсацию 10$.");
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
        "#intrenet_button, " +
        "#hacking_button"
    ).on({
        click: panel_button_click_handler
    });
    $("#bank_button").on({
        click: bank_button_click_handler
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
    buttons_panel_setup, update_taxi_event
}
