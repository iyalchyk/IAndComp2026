import {
    Shop, Player, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    buy_groundbait_button: "groundbait",
    buy_fishing_rod_button: "fishing_rod",
    buy_fishing_tackle_button: "fishing_tackle",
    go_fishing_button: "fishing"
}

function buy_groundbait_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (Player.money < assortment_obj["price"]) {
        alert("No money")
        return
    }
    Player.money -= assortment_obj["price"];
    Player.consumables.groundbait += 1;
    update_player_view();
}

function buy_hobby_equipment_handler(event) {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (Player.money < assortment_obj["price"]) {
        alert("No money")
        return
    }
    Player.money -= assortment_obj["price"];
    Player.property[assortment_str] = true
    $(event.target).prop('disabled', true);
    reset_price_label_handler();
    update_player_view();
}

function set_price_label_handler() {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (assortment_obj) {
        $("#hobby_panel_price_label").text(assortment_obj["price"]);
    }
    else {
        $("#hobby_panel_price_label").text("-");
    }
}

function reset_price_label_handler() {
    $("#hobby_panel_price_label").text("-");
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function go_fishing_button_handler () {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let assortment_obj = Shop[assortment_str]
    if (Player.money < assortment_obj["price"]) {
        alert("No money")
        return
    }
    if (!Player.property.fishing_rod) {
        alert("No fishing rod")
        return
    }
    if (!Player.property.fishing_tackle) {
        alert("No fishing tackle")
        return
    }
    let fish_amount = getRandomInt(0, 10)
    if (Player.consumables.groundbait) {
        Player.consumables.groundbait -= 1
        fish_amount *= 2
    }
    alert("Amount of fish: " + fish_amount)
    Player.experience.fish += fish_amount
    Player.mood += fish_amount % 5
    Player.satiety += fish_amount % 6
    update_player_view();
}

function hobby_panel_setup() {
    $("#buy_groundbait_button").on({
        click: buy_groundbait_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
    $("#buy_fishing_rod_button, #buy_fishing_tackle_button").on({
        click: buy_hobby_equipment_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
    $("#go_fishing_button").on({
        click: go_fishing_button_handler,
        mouseenter: set_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

export {
    hobby_panel_setup
}
