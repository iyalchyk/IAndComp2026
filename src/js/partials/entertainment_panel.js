import {
    Shop, Player, activate_status_panel, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    go_party_button: "party",
    go_disco_button: "disco"
}

function go_entertainment_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (Player.money < assortment_obj["price"]) {
        alert("No money")
        return
    }
    Player.money -= assortment_obj["price"];
    Player.mood += assortment_obj["mood"];
    update_player_view();
}

function set_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (assortment_obj) {
        $("#entertainment_panel_price_label").text(assortment_obj["price"]);
        $("#entertainment_panel_mood_change_label").text(assortment_obj["mood"]);
    }
    else {
        $("#entertainment_panel_price_label").text("-");
    }
}

function reset_price_label_handler() {
    $("#entertainment_panel_price_label").text("-");
}

function entertainment_panel_setup() {
    $("#go_party_button, #go_disco_button").on({
        click: go_entertainment_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

export {
    entertainment_panel_setup
}
