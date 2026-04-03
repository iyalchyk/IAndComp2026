import {
    World, Player, Interface
} from "../global.js"
import { t } from "../i18n.js";

function get_requirement_desc(key, level) {
    if (key === "OS") {
        let data = World["software"]["OS"];
        for (const id in data) {
            if (data[id].level === level) {
                return data[id].description;
            }
        }
        return level;
    }
    let data = World["hardware"][key];
    if (Array.isArray(data)) {
        let item = data.find(i => i.level === level);
        return item ? item.short_desc : level;
    }
    return level;
}

let $price_label;
let $requirements_list;

Interface.software = {
    update_view_software: function(software_category) {
        let software_obj = Player.software[software_category];
        let software_description = software_obj ? software_obj["description"] : World["interface"]["no_property"];
        $(`#${software_category}`).text(software_description);
        let $label = $(`#software_panel_${software_category}_label`);
        if ($label.length) {
            $label.text(software_description);
        }
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
        $price_label.text(software_price);
    },
    reset_price_label: function () {
        $price_label.text(World["interface"]["no_price"]);
    },
    build_requirements_html: function(software_category, software_name) {
        let software_obj = World["software"][software_category][software_name];
        let requirements = software_obj["requirements"];
        if (!requirements) {
            return `<div class="field-row"><label>${t("common.no")}</label></div>`;
        }
        let keys = Object.keys(requirements);
        if (keys.length === 0) {
            return `<div class="field-row"><label>${t("common.no")}</label></div>`;
        }
        let html = "";
        for (const key of keys) {
            let req_val = requirements[key];
            let title = t(`common.requirement_titles.${key}`, {}, key);
            let met = Player.check_requirement(key, req_val);
            let mark = met ? "\u2714" : "\u2718";
            let color = met ? "#008000" : "#c00000";
            let desc = get_requirement_desc(key, req_val);
            html += `<div class="field-row" style="color:${color}">${mark} ${title}: ${desc}</div>`;
        }
        return html;
    },
    update_requirements: function(software_category, software_name) {
        $requirements_list.html(this.build_requirements_html(software_category, software_name));
    },
    reset_requirements: function() {
        $requirements_list.empty();
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
                Interface.show_dialog(t("js.software.invalid_config_title"), t("js.software.invalid_config_text"));
                return;
            }
        }
        Player["status"].subtract_money(software_price);
        Player.software.set_software(software_category, software_obj);
        Interface.software.disable_prev_software(software_category);
        Interface.software.update_requirements(software_category, software_name);
    }
};

function install_software_button_click_handler() {
    Player.software.install_software(this.name, this.value);
}

function install_software_button_mouseenter_handler() {
    Interface.software.update_price_label(this.name, this.value);
    Interface.software.update_requirements(this.name, this.value);
}

function install_software_button_mouseleave_handler() {
    Interface.software.reset_price_label();
    Interface.software.reset_requirements();
}

function software_panel_setup() {
    $price_label = $("#software_panel_price_label");
    $requirements_list = $("#software_panel_requirements_list");

    $(".software_section button[name!='check_viruses']").on({
        click: install_software_button_click_handler,
        mouseenter: install_software_button_mouseenter_handler,
        mouseleave: install_software_button_mouseleave_handler
    });
    Interface.software.update_all();
}

export {
    software_panel_setup
}
