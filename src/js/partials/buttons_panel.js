function panel_button_click_handler() {
    $(".switchable").hide();
    $(this.name).show();
    $("#home_button").show();
}

function buttons_panel_setup() {
    $(
        "#housing_button, " +
        "#shop_button, " +
        "#entertainment_button, " +
        "#hobby_button, " +
        "#education_button, " +
        "#job_button, " +
        "#bank_button, " +
        "#hardware_button, " +
        "#software_button, " +
        "#intrenet_button, " +
        "#hacking_button"
    ).on({
        click: panel_button_click_handler
    });
}

export {
    buttons_panel_setup
}
