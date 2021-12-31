import {
    activate_status_panel
} from "../global.js";

function status_panel_setup() {
    $("#home_button").on({
        click: activate_status_panel
    })
}

export {
    status_panel_setup
}
