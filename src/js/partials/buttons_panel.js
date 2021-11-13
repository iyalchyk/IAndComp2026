const BUTTON_TO_PANEL_ID_MAP = {
    housing_button: "housing_panel",
    shop_button: "shop_panel",
    entertainment_button: "entertainment_panel",
    hobby_button: "hobby_panel",
    education_button: "education_panel"
};

function panel_button_handler() {
    let panel_str = BUTTON_TO_PANEL_ID_MAP[this.id]
    let panel_id = `#${panel_str}`
    $(".switchable").hide();
    $(panel_id).show();
    $("#home_button").show();
}

function buttons_panel_setup() {
    $("#housing_button, #shop_button, #entertainment_button, #hobby_button, #education_button").on({
        click: panel_button_handler
    });
}

export {
    buttons_panel_setup
}
