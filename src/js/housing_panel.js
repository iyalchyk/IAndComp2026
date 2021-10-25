import {
    World, Shop, Player, home_button_handler
} from "./global.js"

function housing_button_handler() {
    $(".switchable").hide();
    $("#housing_panel").show();
    $("#home_button").show();
}

function buy_apartment_button_handler() {
    let next_apartment_id = Player.housing.apartment["id"] + 1;
    let next_apartment = Shop["apartments"][next_apartment_id];
    if (Player.money < next_apartment["price"]) {
        alert("No money")
        return
    }
    Player.money -= next_apartment["price"];
    Player.housing.apartment = next_apartment;
    $("#apartment").text(next_apartment["description"]);
    $("#money").text(Player.money);
    if (next_apartment_id + 1 == Shop["apartments"].length) {
        // no more apartments
        $("#buy_apartment_button").prop('disabled', true);
    }
    home_button_handler()
}

function buy_apartment_button_mouseenter_handler() {
    console.log("!!!")
    let next_apartment_id = Player.housing.apartment["id"] + 1;
    let next_apartment = Shop["apartments"][next_apartment_id];
    if (next_apartment) {
        $("#housing_panel_price_label").text(next_apartment["price"]);
    }
    else {
        $("#housing_panel_price_label").text("-");
    }

}

export {
    housing_button_handler,
    buy_apartment_button_handler,
    buy_apartment_button_mouseenter_handler
}