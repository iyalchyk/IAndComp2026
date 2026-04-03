import {
    World, Player, Interface
} from "../global.js"
import { t } from "../i18n.js";

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
    update_clothes_desc: function() {
        let cur = Player.shop["clothes"];
        let next = cur ? cur.next : World["shop"]["clothes"][0];
        let desc = next ? next["long_desc"] : t("js.shop.all_bought");
        $("#shop_clothes_desc_label").text(desc);
    },
    update_car_labels: function() {
        let cur = Player.shop["car"];
        let next = cur ? cur.next : World["shop"]["car"][0];
        let brand = next ? next["long_desc"] : t("js.shop.all_bought");
        let current_car = cur ? cur["long_desc"] : "";
        let current_label = current_car || t("js.shop.no_car");
        $("#shop_car_brand_label").text(brand);
        $("#shop_car_current_label").text(current_label);
        this.update_car_image(next);
    },
    update_car_image: function(next_car) {
        let level = next_car ? next_car["level"] : null;
        let src = level ? `assets/images/shop/car_${level}.png` : "assets/images/shop/car_placeholder.png";
        $("#shop_car_image").attr("src", src);
    },
    update_current_satiety: function() {
        $("#shop_current_satiety_label").text(Player["status"].satiety);
    },
    update_all: function() {
        this.update_view_clothes();
        this.update_view_car();
        this.update_clothes_desc();
        this.update_car_labels();
        this.update_current_satiety();
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
    update_food_satiety_label: function(food_type) {
        let food_obj = World["shop"][food_type];
        let satiety_label = food_obj ? food_obj["satiety"] : "-";
        $("#shop_food_satiety_label").text(satiety_label);
    },
    reset_price_label: function () {
        $("#shop_panel_price_label").text(World["interface"]["no_price"]);
    },
    reset_food_satiety_label: function() {
        $("#shop_food_satiety_label").text("-");
    }
};

Player.shop = {
    get_attributes: function() {
        return ["clothes", "car"];
    },
    set_clothes: function(clothes_obj) {
        this.clothes = clothes_obj;
        Interface.shop.update_view_clothes();
        Interface.shop.update_clothes_desc();
    },
    set_car: function(car_obj) {
        this.car = car_obj;
        Interface.shop.update_view_car();
        Interface.shop.update_car_labels();
    },
    set_property: function(property_type, property_obj) {
        let property_setter_fn_name = `set_${property_type}`;
        this[property_setter_fn_name](property_obj);
    },
    buy_food: function(food_type) {
        let food_obj = World["shop"][food_type];
        let food_price = food_obj["price"];
        let food_satiety = food_obj["satiety"];
        if (Player["status"].satiety > 100) {
            Interface.show_dialog(t("js.shop.full_title"), t("js.shop.full_text"));
            return;
        }
        if (Player["status"].money < food_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(food_price);
        Player["status"].add_satiety(food_satiety);
        Interface.shop.update_current_satiety();
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
    Interface.shop.update_food_satiety_label(this.name);
}

function buy_food_button_mouseleave_handler() {
    Interface.shop.reset_price_label();
    Interface.shop.reset_food_satiety_label();
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
        mouseleave: buy_food_button_mouseleave_handler
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
