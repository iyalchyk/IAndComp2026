import {
    World, Player, Interface
} from "../global.js"

Interface.software = {
    update_view_software: function(software_category) {
        let software_obj = Player.software[software_category];
        let software_description = software_obj ? software_obj["description"] : World["interface"]["no_property"];
        $(`#${software_category}`).text(software_description);
        $(`#software_panel_${software_category}_label`).text(software_description);
    },
    update_all: function () {
        for (const software_category of Player.software.get_attributes()) {
            this.update_view_software(software_category);
        }
    },
    disable_prev_software: function(software_category) {
        let software_level = Player.software[software_category]["level"];
        let other_software_obj = World["software"][software_category];
        for (const other_software_name in other_software_obj) {
            let other_software_level = other_software_obj[other_software_name]["level"];
            if (software_level >= other_software_level) {
                $(`#install_${other_software_name}_button`).prop('disabled', true);
            }
        }
    },
    update_price_label: function (software_category, software_name) {
        let software_obj = World["software"][software_category][software_name];
        let software_price = software_obj["price"];
        $("#software_panel_price_label").text(software_price);
    },
    reset_price_label: function () {
        $("#software_panel_price_label").text(World["interface"]["no_price"]);
    },
    alert_requirement: function(requirement_key, requirement_val) {
        alert(`${requirement_key} should be at least ${requirement_val}!`);
    }
};

Player.software = {
    get_attributes: function() {
        return ["OS", "compiler", "graphics", "browser", "dialer", "downloader", "antivirus"];
    },
    set_software: function(category, obj) {
        this[category] = obj;
        Interface.software.update_view_software(category);
    },
    install_software: function(software_category, software_name) {
        let software_obj = World["software"][software_category][software_name];
        let software_price = software_obj["price"];
        if (Player["status"].money < software_price) {
            Interface.status.alert_no_money();
            return;
        }
        let software_requirements = software_obj["requirements"];
        for (const requirement_key in software_requirements) {
            let requirement_val = software_requirements[requirement_key];
            let requirement_status = Player.check_requirement(requirement_key, requirement_val);
            if (!requirement_status) {
                Interface.software.alert_requirement(requirement_key, requirement_val);
                return;
            }
        }
        console.log(software_category, software_obj);
        Player["status"].subtract_money(software_price);
        Player.software.set_software(software_category, software_obj);
        Interface.software.disable_prev_software(software_category);
    }
};

function install_software_button_click_handler() {
    Player.software.install_software(this.name, this.value);
}

function install_software_button_mouseenter_handler() {
    Interface.software.update_price_label(this.name, this.value);
}

function install_software_button_mouseleave_handler() {
    Interface.software.reset_price_label();
}

function software_panel_setup() {
    $(
        "#install_norton_commander_button, " +
        "#install_windows_3_11_button, " +
        "#install_windows_95_button, " +
        "#install_windows_98_button, " +
        "#install_windows_2000_button, " +
        "#install_basic_button, " +
        "#install_pascal_button, " +
        "#install_visual_basic_button, " +
        "#install_visual_cpp_button, " +
        "#install_corel_xara_button, " +
        "#install_photoshop_button, " +
        "#install_3ds_max_2_button, " +
        "#install_3ds_max_3_button, " +
        "#install_browser_button, " +
        "#install_dialer_button, " +
        "#install_downloader_button, " +
        "#install_kaspersky_button, " +
        "#install_ivp_button"
    ).on({
        click: install_software_button_click_handler,
        mouseenter: install_software_button_mouseenter_handler,
        mouseleave: install_software_button_mouseleave_handler
    });
    Interface.software.update_all();
}

export {
    software_panel_setup
}
