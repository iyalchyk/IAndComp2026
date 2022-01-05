import {
    World, Player, Interface
} from "../global.js"

Interface.entertainment = {
    update_price_mood_labels: function(entertainment_type) {
        let entertainment_obj = World["entertainment"][entertainment_type];
        let price_label = entertainment_obj ? entertainment_obj["price"] : World["interface"]["no_price"];
        let mood_change_label = entertainment_obj ? entertainment_obj["mood"] : World["interface"]["no_price"];
        $("#entertainment_panel_price_label").text(price_label);
        $("#entertainment_panel_mood_change_label").text(mood_change_label);
    },
    reset_price_mood_labels: function () {
        $("#entertainment_panel_price_label").text(World["interface"]["no_price"]);
        $("#entertainment_panel_mood_change_label").text(World["interface"]["no_price"]);
    }
};

Player.entertainment = {
    get_attributes: function() {
        return [];
    },
    go_entertainment: function(entertainment_type) {
        let entertainment_obj = World["entertainment"][entertainment_type];
        let entertainment_price = entertainment_obj["price"];
        let entertainment_mood = entertainment_obj["mood"];
        if (Player["status"].money < entertainment_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(entertainment_price);
        Player["status"].add_mood(entertainment_mood);
    }
};

function go_entertainment_button_click_handler() {
    Player.entertainment.go_entertainment(this.name);
}

function go_entertainment_button_mouseenter_handler() {
    Interface.entertainment.update_price_mood_labels(this.name);
}

function go_entertainment_button_mouseleave_handler() {
    Interface.entertainment.reset_price_mood_labels();
}

function entertainment_panel_setup() {
    $("#go_party_button, #go_disco_button").on({
        click: go_entertainment_button_click_handler,
        mouseenter: go_entertainment_button_mouseenter_handler,
        mouseleave: go_entertainment_button_mouseleave_handler
    });
}

export {
    entertainment_panel_setup
}
