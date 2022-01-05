import {
    World, Player, Interface
} from "../global.js"

Interface.shop = {
    update_view_clothes: function() {
        let property = Player.shop["clothes"];
        let label = property ? property["short_desc"] : World["interface"]["no_property"];
        $("#clothes").text(label);
    },
    update_view_car: function() {
        let property = Player.shop["car"];
        let label = property ? property["short_desc"] : World["interface"]["no_property"];
        $("#car").text(label);
    },
    update_all: function() {
        this.update_view_clothes();
        this.update_view_car();
    },
    disable_button: function (button_id) {
        $(button_id).prop('disabled', true);
    },
    update_property_price_label: function(property_type) {
        let property_obj = Player.shop[property_type];
        let next_property_obj = property_obj ? property_obj.next : World["shop"][property_type][0];
        let price_label = next_property_obj ? next_property_obj["price"] : World["interface"]["no_price"];
        $("#shop_panel_price_label").text(price_label);
    },
    update_food_price_label: function(food_type) {
        let food_obj = World["shop"][food_type];
        let price_label = food_obj ? food_obj["price"] : World["interface"]["no_price"];
        $("#shop_panel_price_label").text(price_label);
    },
    reset_price_label: function () {
        $("#shop_panel_price_label").text(World["interface"]["no_price"]);
    }
};

Player.shop = {
    get_attributes: function() {
        return ["clothes", "car"];
    },
    set_clothes: function(clothes_obj) {
        this.clothes = clothes_obj;
        Interface.shop.update_view_clothes();
    },
    set_car: function(car_obj) {
        this.car = car_obj;
        Interface.shop.update_view_car();
    },
    set_property: function(property_type, property_obj) {
        let property_setter_fn_name = `set_${property_type}`;
        this[property_setter_fn_name](property_obj);
    },
    buy_food: function(food_type) {
        let food_obj = World["shop"][food_type];
        let food_price = food_obj["price"];
        let food_satiety = food_obj["satiety"];
        if (Player["status"].money < food_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(food_price);
        Player["status"].add_satiety(food_satiety);
    },
    buy_property: function(property_type, button_id) {
        let cur_property_obj = Player.shop[property_type];
        let next_property_obj = cur_property_obj ? cur_property_obj.next : World["shop"][property_type][0];
        let next_property_price = next_property_obj["price"];
        if (Player["status"].money < next_property_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(next_property_price);
        Player.shop.set_property(property_type, next_property_obj);
        Interface.shop.update_property_price_label(property_type);
        if (!Player.shop[property_type].next) {
            Interface.shop.disable_button(button_id);
        }
    }
};

function buy_food_button_click_handler() {
    Player.shop.buy_food(this.name);
}

function buy_property_button_click_handler(event) {
    Player.shop.buy_property(this.name, event.target);
}

function buy_food_button_mouseenter_handler() {
    Interface.shop.update_food_price_label(this.name);
}

function buy_property_button_mouseenter_handler() {
    Interface.shop.update_property_price_label(this.name);
}

function buy_property_button_mouseleave_handler() {
    Interface.shop.reset_price_label();
}

function shop_panel_setup() {
    $("#buy_breakfast_button, #buy_lunch_button, #buy_dinner_button").on({
        click: buy_food_button_click_handler,
        mouseenter: buy_food_button_mouseenter_handler,
        mouseleave: buy_property_button_mouseleave_handler
    });
    $("#buy_clothes_button, #buy_car_button").on({
        click: buy_property_button_click_handler,
        mouseenter: buy_property_button_mouseenter_handler,
        mouseleave: buy_property_button_mouseleave_handler
    });
    Player.shop.set_clothes(World["shop"]["clothes"][0]);
    Player.shop.set_car(World["shop"]["car"][0]);
    Interface.shop.update_all();
}

export {
    shop_panel_setup
}
