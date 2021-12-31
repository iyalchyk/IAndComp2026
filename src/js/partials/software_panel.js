import {
    Player, Shop
} from "../global.js"

const INSTALL_OS_BUTTONS = [
    "install_norton_commander_button", "install_windows_3_11_button", "install_windows_95_button",
    "install_windows_98_button", "install_windows_2000_button"
];

const INSTALL_COMPILER_BUTTONS = [
    "install_basic_button", "install_pascal_button", "install_visual_basic_button", "install_visual_cpp_button"
];

const INSTALL_GRAPHICS_BUTTONS = [
    "install_corel_xara_button", "install_photoshop_button", "install_3ds_max_2_button", "install_3ds_max_3_button"
];

const INSTALL_INTERNET_BUTTONS = [
    "install_browser_button", "install_dialer_button", "install_downloader_button"
];

const INSTALL_ANTIVIRUS_BUTTONS = [
    "install_kaspersky_button", "install_ivp_button"
];

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    install_browser_button: "browser",
    install_dialer_button: "dialer",
    install_downloader_button: "downloader"
}

function update_software_view(software_str) {
    let software_description = Player.property[software_str]["description"];
    $(`#${software_str}`).text(software_description);
    $(`#software_panel_${software_str}_label`).text(software_description);
}

function find_previous_buttons(software_category, software_level) {
    let buttons_arr = null;
    if (software_category === "OS") {
        buttons_arr = INSTALL_OS_BUTTONS;
    } else if (software_category === "compiler") {
        buttons_arr = INSTALL_COMPILER_BUTTONS;
    } else if (software_category === "graphics") {
        buttons_arr = INSTALL_GRAPHICS_BUTTONS;
    } else if (software_category === "antivirus") {
        buttons_arr = INSTALL_ANTIVIRUS_BUTTONS;
    } else if (software_category === "internet") {
        for (const button_id in BUTTON_ID_TO_ASSORTMENT_MAP) {
            if (software_level === BUTTON_ID_TO_ASSORTMENT_MAP[button_id]) {
                return [button_id];
            }
        }
    }
    return buttons_arr ? buttons_arr.slice(0, software_level + 1) : null;
}

function find_software_category(button_id) {
    let software_category = null;
    let software_level = null;
    if (INSTALL_OS_BUTTONS.includes(button_id)) {
        software_category = "OS";
        software_level = INSTALL_OS_BUTTONS.indexOf(button_id);
    } else if (INSTALL_COMPILER_BUTTONS.includes(button_id)) {
        software_category = "compiler";
        software_level = INSTALL_COMPILER_BUTTONS.indexOf(button_id);
    } else if (INSTALL_GRAPHICS_BUTTONS.includes(button_id)) {
        software_category = "graphics";
        software_level = INSTALL_GRAPHICS_BUTTONS.indexOf(button_id);
    } else if (INSTALL_INTERNET_BUTTONS.includes(button_id)) {
        software_category = "internet";
        software_level = BUTTON_ID_TO_ASSORTMENT_MAP[button_id];
    } else if (INSTALL_ANTIVIRUS_BUTTONS.includes(button_id)) {
        software_category = "antivirus";
        software_level = INSTALL_ANTIVIRUS_BUTTONS.indexOf(button_id);
    }
    return {
        software_category: software_category,
        software_level: software_level
    };
}

function check_software_requirement(software_requirement_key, software_requirement_val) {
    let player_val = Player.property[software_requirement_key] ? Player.property[software_requirement_key]["level"] : null;
    return player_val && player_val >= software_requirement_val;
}

function buy_software_handler() {
    let software_category_level_obj = find_software_category(this.id);
    let assortment_str = software_category_level_obj.software_category;
    let assortment_level = software_category_level_obj.software_level;
    if (assortment_str !== "internet") {
        let next_item = Shop[assortment_str][assortment_level];
        if (Player.money < next_item["price"]) {
            alert("No money")
            return
        }
        let software_requirements = next_item["requirements"];
        for (const software_requirement_key in software_requirements) {
            let software_requirement_val = software_requirements[software_requirement_key];
            let software_requirement_status = check_software_requirement(software_requirement_key, software_requirement_val)
            if (!software_requirement_status) {
                alert(`${software_requirement_key} should be at least ${software_requirement_val}!`);
                return;
            }
        }
        Player.money -= next_item["price"];
        Player.property[assortment_str] = next_item;
        let buttons_arr = find_previous_buttons(assortment_str, assortment_level);
        for (const button_id of buttons_arr) {
            $(`#${button_id}`).prop('disabled', true);
        }
        update_software_view(assortment_str);
        reset_price_label_handler();
    }
}

function set_property_price_label_handler() {
    let software_category_level_obj = find_software_category(this.id);
    let software_category = software_category_level_obj.software_category;
    let software_level = software_category_level_obj.software_level;
    let assortment_obj = Shop[software_category][software_level];
    $("#software_panel_price_label").text(assortment_obj["price"]);
}

function reset_price_label_handler() {
    $("#software_panel_price_label").text("-");
}

function software_panel_setup() {
    $("#install_norton_commander_button, #install_windows_3_11_button, #install_windows_95_button, " +
        "#install_windows_98_button, #install_windows_2000_button, #install_basic_button, #install_pascal_button, " +
        "#install_visual_basic_button, #install_visual_cpp_button, #install_corel_xara_button, " +
        "#install_photoshop_button, #install_3ds_max_2_button, #install_3ds_max_3_button, #install_browser_button, " +
        "#install_dialer_button, #install_downloader_button, #install_kaspersky_button, #install_ivp_button").on({
        click: buy_software_handler,
        mouseenter: set_property_price_label_handler,
        mouseleave: reset_price_label_handler
    });
}

export {
    software_panel_setup
}
