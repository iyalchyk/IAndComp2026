import {
    Shop, Player, activate_status_panel
} from "./global.js"

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
    if (next_apartment_id + 1 === Shop["apartments"].length) {
        // no more apartments
        $("#buy_apartment_button").prop('disabled', true);
    }
    activate_status_panel()
}

function buy_apartment_button_mouseenter_handler() {
    let next_apartment_id = Player.housing.apartment["id"] + 1;
    let next_apartment = Shop["apartments"][next_apartment_id];
    if (next_apartment) {
        $("#housing_panel_price_label").text(next_apartment["price"]);
    }
    else {
        $("#housing_panel_price_label").text("-");
    }

}

function housing_panel_setup() {
    $("#buy_apartment_button").on({
        click: buy_apartment_button_handler,
        mouseenter: buy_apartment_button_mouseenter_handler,
        mouseleave: function() {
            $("#housing_panel_price_label").text("-");
        }
    })
}

export {
    housing_panel_setup
}
