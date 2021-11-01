import {
    Shop, Player, activate_status_panel
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    buy_apartment_button: "apartment",
    buy_furniture_button: "furniture",
    buy_kitchen_button: "kitchen",
    buy_bathroom_button: "bathroom"
}

function buy_housing_handler(event) {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_label_id = `#${assortment_str}`
    let next_apartment = Player.property[assortment_str].next;
    if (Player.money < next_apartment["price"]) {
        alert("No money")
        return
    }
    Player.money -= next_apartment["price"];
    Player.property[assortment_str] = next_apartment;
    $(assortment_label_id).text(next_apartment["description"]);
    $("#money").text(Player.money);
    if (!next_apartment.next) {
        // no more apartments
        $(event.target).prop('disabled', true);
        reset_price_label_handler();
    }
    activate_status_panel()
}

function set_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let next_assortment_id = Player.property[assortment_str]["id"] + 1; //
    let next_assortment_obj = Shop[assortment_str][next_assortment_id];
    if (next_assortment_obj) {
        $("#housing_panel_price_label").text(next_assortment_obj["price"]);
    }
    else {
        $("#housing_panel_price_label").text("-");
    }
}

function reset_price_label_handler() {
    $("#housing_panel_price_label").text("-");
}

function housing_panel_setup() {
    $("#buy_apartment_button, #buy_furniture_button, #buy_kitchen_button, #buy_bathroom_button").on({
        click: buy_housing_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    })
}

export {
    housing_panel_setup
}
