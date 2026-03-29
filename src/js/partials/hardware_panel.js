import {
    World, Player, Interface
} from "../global.js"

let $price_label;
let $current_label;
let $desc_label;
let $shop_image;

Interface.hardware = {
    update_view_hardware: function(hardware_type) {
        let hardware_obj = Player.hardware[hardware_type];
        let hardware_description = hardware_obj ? hardware_obj["short_desc"] : World["interface"]["no_property"];
        $(`#${hardware_type}`).text(hardware_description);
    },
    update_all: function () {
        for (const hardware_type of Player.hardware.get_attributes()) {
            this.update_view_hardware(hardware_type);
            this.update_button_desc(hardware_type);
        }
    },
    disable_button: function (button_id) {
        $(button_id).prop('disabled', true);
    },
    update_button_desc: function (property_type) {
        let cur = Player.hardware[property_type];
        let next = cur ? cur.next : World["hardware"][property_type][0];
        let desc = next ? next["short_desc"] : "—";
        $(`#hw_desc_${property_type}`).text(desc);
    },
    update_price_label: function (property_type) {
        let property_obj = Player.hardware[property_type];
        let next_property_obj = property_obj ? property_obj.next : World["hardware"][property_type][0];
        let price_label = next_property_obj ? next_property_obj["price"] : World["interface"]["no_price"];
        $price_label.text(price_label);
    },
    reset_price_label: function () {
        $price_label.text(World["interface"]["no_price"]);
    },
    update_current_label: function (property_type) {
        let cur = Player.hardware[property_type];
        let current = cur ? cur["short_desc"] : "нет";
        $current_label.text(current);
    },
    reset_current_label: function () {
        $current_label.text("-");
    },
    update_desc: function (property_type) {
        let cur = Player.hardware[property_type];
        let next = cur ? cur.next : World["hardware"][property_type][0];
        if (next && next["long_desc"]) {
            $desc_label.text(next["long_desc"]);
        } else {
            $desc_label.text("");
        }
    },
    reset_desc: function () {
        $desc_label.text("");
    },
    update_image: function (property_type) {
        let cur = Player.hardware[property_type];
        let next = cur ? cur.next : World["hardware"][property_type][0];
        if (next && next["image"]) {
            $shop_image.attr("src", next["image"]);
        } else {
            $shop_image.attr("src", "");
        }
    },
    reset_image: function () {
        $shop_image.attr("src", "");
    }
};

Player.hardware = {
    get_attributes: function() {
        return [
            "CPU", "monitor", "printer", "scanner", "modem", "HDD",
            "CDROM", "RAM", "sound_card", "video_card"
        ];
    },
    set_hardware: function(hardware_type, hardware_obj) {
        this[hardware_type] = hardware_obj;
        Interface.hardware.update_view_hardware(hardware_type);
    },
    buy_hardware: function(property_type, button_id) {
        let cur_property_obj = Player.hardware[property_type];
        let next_property_obj = cur_property_obj ? cur_property_obj.next : World["hardware"][property_type][0];
        if (!next_property_obj) {
            return;
        }
        let next_property_price = next_property_obj["price"];
        if (Player["status"].money < next_property_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(next_property_price);
        Player.hardware.set_hardware(property_type, next_property_obj);
        Interface.hardware.update_button_desc(property_type);
        Interface.hardware.update_price_label(property_type);
        Interface.hardware.update_current_label(property_type);
        Interface.hardware.update_desc(property_type);
        Interface.hardware.update_image(property_type);
        if (!Player.hardware[property_type].next) {
            Interface.hardware.disable_button(button_id);
        }
    }
};

function buy_hardware_button_click_handler(event) {
    Player.hardware.buy_hardware(this.name, event.target);
}

function buy_hardware_button_mouseenter_handler() {
    Interface.hardware.update_price_label(this.name);
    Interface.hardware.update_current_label(this.name);
    Interface.hardware.update_desc(this.name);
    Interface.hardware.update_image(this.name);
}

function buy_hardware_button_mouseleave_handler() {
    Interface.hardware.reset_price_label();
    Interface.hardware.reset_current_label();
    Interface.hardware.reset_desc();
    Interface.hardware.reset_image();
}

function hardware_panel_setup() {
    $price_label = $("#hardware_panel_price_label");
    $current_label = $("#hardware_panel_current_label");
    $desc_label = $("#hardware_desc_label");
    $shop_image = $("#hardware_shop_image");

    $(".hardware_buttons_list button").on({
        click: buy_hardware_button_click_handler,
        mouseenter: buy_hardware_button_mouseenter_handler,
        mouseleave: buy_hardware_button_mouseleave_handler
    });
    Interface.hardware.update_all();
}

export {
    hardware_panel_setup
}
