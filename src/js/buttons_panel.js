function housing_button_handler() {
    $(".switchable").hide();
    $("#housing_panel").show();
    $("#home_button").show();
}

function buttons_panel_setup() {
    $("#housing_button").on({
        click: housing_button_handler
    })
}

export {
    buttons_panel_setup
}
