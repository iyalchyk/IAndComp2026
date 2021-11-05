import {
    Shop, Player, activate_status_panel, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    buy_breakfast_button: "breakfast",
    buy_lunch_button: "lunch",
    buy_dinner_button: "dinner",
    buy_clothes_button: "clothes",
    buy_car_button: "car"
}

function buy_food_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (Player.money < assortment_obj["price"]) {
        alert("No money")
        return
    }
    Player.money -= assortment_obj["price"];
    Player.satiety += assortment_obj["satiety"];
    update_player_view();
}

function buy_property_handler(event) {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let cur_item = Player.property[assortment_str]
    let next_item = cur_item ? cur_item.next : Shop[assortment_str][0];
    if (Player.money < next_item["price"]) {
        alert("No money")
        return
    }
    Player.money -= next_item["price"];
    Player.property[assortment_str] = next_item;
    let assortment_label_id = `#${assortment_str}`
    $(assortment_label_id).text(next_item["description"]);
    if (!next_item.next) {
        $(event.target).prop('disabled', true);
        reset_price_label_handler();
    }
    update_player_view();
    activate_status_panel();
}

function set_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (assortment_obj) {
        $("#shop_panel_price_label").text(assortment_obj["price"]);
    }
    else {
        $("#shop_panel_price_label").text("-");
    }
}

function set_property_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id];
    let assortment_obj = Player.property[assortment_str];
    let next_item_obj = assortment_obj ? assortment_obj.next : Shop[assortment_str][0];
    if (next_item_obj) {
        $("#shop_panel_price_label").text(next_item_obj["price"]);
    }
    else {
        $("#shop_panel_price_label").text("-");
    }
}

function reset_price_label_handler() {
    $("#shop_panel_price_label").text("-");
}

function shop_panel_setup() {
    $("#buy_breakfast_button, #buy_lunch_button, #buy_dinner_button").on({
        click: buy_food_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
    $("#buy_clothes_button, #buy_car_button").on({
        click: buy_property_handler,
        mouseenter: set_property_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

export {
    shop_panel_setup
}
