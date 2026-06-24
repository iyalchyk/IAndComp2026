let World = {
    // data is provided by external json file

    get_modules: function() {
        return [
            "time", "status", "housing", "shop", "entertainment", "hobby", "education",
            "job", "bank", "hardware", "software", "internet"
        ];
    }
};

let Player = {
    // data is provided by partials
    is_paused: false,

    check_requirement: function(requirement_key, requirement_val) {
        let module_attribute_val = null;
        for (const module of World.get_modules()) {
            let module_attributes = this[module].get_attributes();
            if (module_attributes.includes(requirement_key)) {
                let module_attribute_obj = this[module][requirement_key];
                if (module_attribute_obj && typeof module_attribute_obj === "object" && "level" in module_attribute_obj) {
                    module_attribute_val = module_attribute_obj.level;
                } else if (typeof module_attribute_obj === "boolean") {
                    module_attribute_val = module_attribute_obj ? 1 : 0;
                } else {
                    module_attribute_val = module_attribute_obj;
                }
            }
        }
        return module_attribute_val && module_attribute_val >= requirement_val;
    }
};

let Interface = {
    // data is provided by partials

    _dialog_callback: null,
    _dialog_actions: {},
    initialize_dialog: function() {
        $("#global_dialog_ok").on("click", () => {
            let callback = this._dialog_callback;
            this.hide_dialog();
            if (callback) {
                callback();
            }
        });

        $("#global_dialog_language_en").on("click", () => {
            this.run_dialog_action("en");
        });

        $("#global_dialog_language_ru").on("click", () => {
            this.run_dialog_action("ru");
        });
    },
    hide_dialog: function() {
        $("#global_dialog").hide();
        $("#global_dialog").removeClass("global_dialog_language_mode");
        this._dialog_callback = null;
        this._dialog_actions = {};
    },
    reset_dialog_buttons: function() {
        $("#global_dialog_ok").show();
        $("#global_dialog_language_buttons").hide();
        $("#global_dialog").removeClass("global_dialog_language_mode");
    },
    run_dialog_action: function(action_key) {
        let action = this._dialog_actions[action_key] || null;
        this.hide_dialog();
        if (action) {
            action();
        }
    },
    show_dialog: function(title, text, callback) {
        this.reset_dialog_buttons();
        this._dialog_actions = {};
        $("#global_dialog_title").text(title);
        $("#global_dialog_text").text(text);
        this._dialog_callback = callback || null;
        $("#global_dialog").show();
    },
    show_dialog_html: function(title, html, callback) {
        this.reset_dialog_buttons();
        this._dialog_actions = {};
        $("#global_dialog_title").text(title);
        $("#global_dialog_text").html(html);
        this._dialog_callback = callback || null;
        $("#global_dialog").show();
    },
    show_language_dialog: function(title, html, actions) {
        this.reset_dialog_buttons();
        $("#global_dialog").addClass("global_dialog_language_mode");
        $("#global_dialog_title").text(title);
        $("#global_dialog_text").html(html);
        $("#global_dialog_ok").hide();
        $("#global_dialog_language_buttons").show();
        this._dialog_callback = null;
        this._dialog_actions = actions || {};
        $("#global_dialog").show();
    }
};

export {
    World,
    Player,
    Interface
}
