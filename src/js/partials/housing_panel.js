import {
    World, Player, Interface
} from "../global.js"

Interface.housing = {
    update_view_apartment: function () {
        let property = Player.housing["apartment"];
        let label = property ? property["short_desc"] : World["interface"]["no_property"];
        $("#apartment").text(label);
    },
    update_view_furniture: function () {
        let property = Player.housing["furniture"];
        let label = property ? property["short_desc"] : World["interface"]["no_property"];
        $("#furniture").text(label);
    },
    update_view_kitchen: function () {
        let property = Player.housing["kitchen"];
        let label = property ? property["short_desc"] : World["interface"]["no_property"];
        $("#kitchen").text(label);
    },
    update_view_bathroom: function () {
        let apartment = Player.housing["bathroom"];
        let label = apartment ? apartment["short_desc"] : World["interface"]["no_property"];
        $("#bathroom").text(label);
    },
    update_all: function () {
        this.update_view_apartment();
        this.update_view_furniture();
        this.update_view_kitchen();
        this.update_view_bathroom();
    },
    disable_button: function (button_id) {
        $(button_id).prop('disabled', true);
    },
    update_price_label: function (property_type) {
        let property_obj = Player.housing[property_type];
        let next_property_obj = property_obj ? property_obj.next : World["housing"][property_type][0];
        let price_label = next_property_obj ? next_property_obj["price"] : World["interface"]["no_price"];
        $("#housing_panel_price_label").text(price_label);
    },
    reset_price_label: function () {
        $("#housing_panel_price_label").text(World["interface"]["no_price"]);
    },
    show_preview: function (property_type) {
        let property_obj = Player.housing[property_type];
        let next_property_obj = property_obj ? property_obj.next : World["housing"][property_type][0];
        if (next_property_obj) {
            $("#housing_preview_desc").text(next_property_obj["long_desc"]);
            if (next_property_obj["image"]) {
                $("#housing_preview_image").attr("src", next_property_obj["image"]);
            }
        }
    },
    reset_preview: function () {
        $("#housing_preview_image").attr("src", "assets/images/housing/store.svg");
        $("#housing_preview_desc").text("Покупайте и обустраивайте вашу квартиру");
    }
};

Player.housing = {
    get_attributes: function () {
        return ["apartment", "furniture", "kitchen", "bathroom"];
    },
    set_apartment: function (apartment_obj) {
        this.apartment = apartment_obj;
        Interface.housing.update_view_apartment();
    },
    set_furniture: function (furniture_obj) {
        this.furniture = furniture_obj;
        Interface.housing.update_view_furniture();
    },
    set_kitchen: function (kitchen_obj) {
        this.kitchen = kitchen_obj;
        Interface.housing.update_view_kitchen();
    },
    set_bathroom: function (bathroom_obj) {
        this.bathroom = bathroom_obj;
        Interface.housing.update_view_bathroom();
    },
    set_property: function (property_type, property_obj) {
        let property_setter_fn_name = `set_${property_type}`;
        this[property_setter_fn_name](property_obj);
    },
    buy_property: function (property_type, button_id) {
        let cur_property_obj = Player.housing[property_type];
        let next_property_obj = cur_property_obj ? cur_property_obj.next : World["housing"][property_type][0];
        let next_property_price = next_property_obj["price"];
        if (Player["status"].money < next_property_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(next_property_price);
        Player.housing.set_property(property_type, next_property_obj);
        Interface.housing.update_price_label(property_type);
        Interface.housing.show_preview(property_type);
        if (!Player.housing[property_type].next) {
            Interface.housing.disable_button(button_id);
            Interface.housing.reset_preview();
        }
    }
};

function buy_housing_button_click_handler(event) {
    Player.housing.buy_property(this.name, event.target);
}

function buy_housing_button_mouseenter_handler() {
    Interface.housing.update_price_label(this.name);
    Interface.housing.show_preview(this.name);
}

function buy_housing_button_mouseleave_handler() {
    Interface.housing.reset_price_label();
    Interface.housing.reset_preview();
}

function housing_panel_setup() {
    $("#buy_apartment_button, #buy_furniture_button, #buy_kitchen_button, #buy_bathroom_button").on({
        click: buy_housing_button_click_handler,
        mouseenter: buy_housing_button_mouseenter_handler,
        mouseleave: buy_housing_button_mouseleave_handler
    });
    Player.housing.set_apartment(World["housing"]["apartment"][0]);
    Interface.housing.update_all();
}

export {
    housing_panel_setup
}
