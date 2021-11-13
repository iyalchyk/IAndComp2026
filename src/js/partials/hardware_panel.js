import {
    Shop, Player, activate_status_panel, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    buy_CPU_button: "CPU",
    buy_monitor_button: "monitor",
    buy_printer_button: "printer",
    buy_scanner_button: "scanner",
    buy_modem_button: "modem",
    buy_HDD_button: "HDD",
    buy_CDROM_button: "CDROM",
    buy_RAM_button: "RAM",
    buy_sound_card_button: "sound_card",
    buy_video_card_button: "video_card"
}

function update_hardware_view(hardware_str) {
    let hardware_description = Player.property[hardware_str]["description"];
    $(`#${hardware_str}`).text(hardware_description);
}

function buy_hardware_handler(event) {
    let assortment_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id]
    let cur_item = Player.property[assortment_str]
    let next_item = cur_item ? cur_item.next : Shop[assortment_str][0];
    if (Player.money < next_item["price"]) {
        alert("No money")
        return
    }
    Player.money -= next_item["price"];
    Player.property[assortment_str] = next_item;
    if (!next_item.next) {
        $(event.target).prop('disabled', true);
        reset_price_label_handler();
    }
    update_hardware_view(assortment_str);
    update_player_view();
    //activate_status_panel();
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

function hardware_panel_setup() {
    $("#buy_CPU_button, #buy_monitor_button, #buy_printer_button, #buy_scanner_button, " +
        "#buy_modem_button, #buy_HDD_button, #buy_CDROM_button, #buy_RAM_button, #buy_sound_card_button, " +
        "#buy_video_card_button").on({
        click: buy_hardware_handler,
        mouseenter: set_property_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

export {
    hardware_panel_setup
}
