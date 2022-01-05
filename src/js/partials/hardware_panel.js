import {
    World, Player, Interface
} from "../global.js"

Interface.hardware = {
    update_view_hardware: function(hardware_type) {
        let hardware_obj = Player.hardware[hardware_type];
        let hardware_description = hardware_obj ? hardware_obj["description"] : World["interface"]["no_property"];
        $(`#${hardware_type}`).text(hardware_description);
    },
    update_all: function () {
        for (const hardware_type of Player.hardware.get_attributes()) {
            this.update_view_hardware(hardware_type);
        }
    },
    disable_button: function (button_id) {
        $(button_id).prop('disabled', true);
    },
    update_price_label: function (property_type) {
        let property_obj = Player.hardware[property_type];
        let next_property_obj = property_obj ? property_obj.next : World["hardware"][property_type][0];
        let price_label = next_property_obj ? next_property_obj["price"] : World["interface"]["no_price"];
        $("#hardware_panel_price_label").text(price_label);
    },
    reset_price_label: function () {
        $("#hardware_panel_price_label").text(World["interface"]["no_price"]);
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
        Interface.hardware.update_price_label(property_type);
        if (!Player.hardware[property_type].next) {
            Interface.hardware.disable_button(button_id);
        }
    }
};

function buy_hardware_button_click_handler(event) {
    console.log("good", this.name, event.target)
    Player.hardware.buy_hardware(this.name, event.target);
}

function buy_hardware_button_mouseenter_handler() {
    Interface.hardware.update_price_label(this.name);
}

function buy_hardware_button_mouseleave_handler() {
    Interface.hardware.reset_price_label();
}

function buy_all_button_click_handler() {
    Player["status"].add_money(9999);
    for (const hardware_type of Player.hardware.get_attributes()) {
        for (let step = 0; step < World["hardware"][hardware_type].length; step++) {
            let button = $(`#buy_${hardware_type}_button`).get()[0];
            Player.hardware.buy_hardware(hardware_type, button);
        }
    }
}

function hardware_panel_setup() {
    $(
        "#buy_CPU_button, " +
        "#buy_monitor_button, " +
        "#buy_printer_button, " +
        "#buy_scanner_button, " +
        "#buy_modem_button, " +
        "#buy_HDD_button, " +
        "#buy_CDROM_button, " +
        "#buy_RAM_button, " +
        "#buy_sound_card_button, " +
        "#buy_video_card_button"
    ).on({
        click: buy_hardware_button_click_handler,
        mouseenter: buy_hardware_button_mouseenter_handler,
        mouseleave: buy_hardware_button_mouseleave_handler
    });
    $("#buy_all_button").on({
        click: buy_all_button_click_handler
    });
    Interface.hardware.update_all();

}

export {
    hardware_panel_setup
}
