import {
    World, Player, Interface
} from "../global.js";
import { t } from "../i18n.js";

Interface.status = {
    update_view_money: function() {
        $("#money").text(Player.status.money);
    },
    update_view_mood: function() {
        $("#mood").text(Player.status.mood);
        $("#entertainment_panel_mood_value_label").text(this.mood);
    },
    update_view_satiety: function() {
        $("#satiety").text(Player.status.satiety);
    },
    update_all: function() {
        this.update_view_money();
        this.update_view_mood();
        this.update_view_satiety();
    },
    activate_status_panel: function() {
        $(".switchable").hide();
        $("#status_panel").show();
        $("#buttons_panel").show();
        $("#home_button").hide();
    },
    alert_no_money: function() {
        Interface.show_dialog(t("common.attention"), t("js.status.no_money"));
    }
};

Player.status = {
    money: 16000,
    mood: 30,
    satiety: 30,
    get_attributes: function() {
        return ["money", "mood", "satiety"];
    },
    set_money: function(money) {
        this.money = money;
        Interface.status.update_view_money();
    },
    set_mood: function(mood) {
        this.mood = mood;
        Interface.status.update_view_mood();
        if (this.mood <= -40) {
            Interface.show_dialog(t("common.death_title"), t("js.status.death_mood"), function() { location.reload(); });
        } else if (this.mood <= -30) {
            Interface.show_dialog(t("common.danger_title"), t("js.status.danger_mood"));
        }
    },
    set_satiety: function(satiety) {
        this.satiety = satiety;
        Interface.status.update_view_satiety();
        if (this.satiety <= -30) {
            Interface.show_dialog(t("common.death_title"), t("js.status.death_satiety"), function() { location.reload(); });
        } else if (this.satiety <= -20) {
            Interface.show_dialog(t("common.danger_title"), t("js.status.danger_satiety"));
        }
    },
    add_money: function(money_diff) {
        this.set_money(this.money + money_diff);
    },
    subtract_money: function(money_diff) {
        this.set_money(this.money - money_diff);
    },
    add_mood: function(mood_diff) {
        this.set_mood(this.mood + mood_diff);
    },
    subtract_mood: function(mood_diff) {
        this.set_mood(this.mood - mood_diff);
    },
    add_satiety: function(satiety_diff) {
        this.set_satiety(this.satiety + satiety_diff);
    },
    subtract_satiety: function(satiety_diff) {
        this.set_satiety(this.satiety - satiety_diff);
    }
};

function update_status_state() {
    if (Player["time"].cur_time % World["constants"]["SALARY_ADDITION_FREQ"] === 0) {
        Player.status.add_money(Player["job"].salary);
    }
    if (Player["time"].cur_time % World["constants"]["MOOD_DEDUCTION_FREQ"] === 0) {
        Player.status.subtract_mood(2);
    }
    if (Player["time"].cur_time % World["constants"]["SATIETY_DEDUCTION_FREQ"] === 0) {
        Player.status.subtract_satiety(2);
    }
}

function status_panel_setup() {
    $("#home_button").on({
        click: Interface.status.activate_status_panel
    });
    Interface.status.update_all();
    Interface.status.activate_status_panel();
}

export {
    status_panel_setup, update_status_state
}
