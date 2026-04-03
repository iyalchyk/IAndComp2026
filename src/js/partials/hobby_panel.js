import {
    World, Player, Interface
} from "../global.js"
import { t } from "../i18n.js";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fishing mini-game state
let fishingGame = {
    timer: null,
    fishTimer: null,
    timeLeft: 30,
    caught: 0,
    useGroundbait: false
};

Interface.hobby = {
    update_view_fish: function() {
        $("#hobby_panel_fish_amount_label").text(Player.hobby.fish.level);
    },
    update_view_groundbight: function() {
        $("#hobby_panel_groundbait_amount_label").text(Player.hobby.groundbait);
    },
    update_view_fishing_rod: function() {
        let has = Player.hobby.fishing_rod;
        $("#buy_fishing_rod_button").prop('disabled', has);
        $("#hobby_panel_fishing_rod_label").text(has ? t("common.yes") : t("common.no"));
    },
    update_view_fishing_tackle: function() {
        let has = Player.hobby.fishing_tackle;
        $("#buy_fishing_tackle_button").prop('disabled', has);
        $("#hobby_panel_fishing_tackle_label").text(has ? t("common.yes") : t("common.no"));
    },
    update_all: function() {
        this.update_view_fish();
        this.update_view_groundbight();
        this.update_view_fishing_rod();
        this.update_view_fishing_tackle();
    },
    update_price_label: function(property_type) {
        let property_obj = Player.hobby[property_type];
        let assortment_obj = World["hobby"][property_type];
        let price_label = assortment_obj && !property_obj ? assortment_obj["price"] : World["interface"]["no_price"];
        $("#hobby_panel_price_label").text(price_label);
    },
    reset_price_label: function () {
        $("#hobby_panel_price_label").text(World["interface"]["no_price"]);
    },
    update_desc: function(hobby_type) {
        let desc = t(`js.hobby.descriptions.${hobby_type}`, {}, t("dom.hobby.default_description"));
        $("#hobby_desc_label").text(desc);
    },
    reset_desc: function() {
        $("#hobby_desc_label").text(t("dom.hobby.default_description"));
    },
    alert_no_fishing_rod: function() {
        Interface.show_dialog(t("common.attention"), t("js.hobby.no_fishing_rod"));
    },
    alert_no_fishing_tackle: function() {
        Interface.show_dialog(t("common.attention"), t("js.hobby.no_fishing_tackle"));
    }
};

Player.hobby = {
    fish: {
        level: 0
    },
    groundbait: 0,
    fishing_rod: false,
    fishing_tackle: false,
    get_attributes: function() {
        return ["fish", "groundbait", "fishing_rod", "fishing_tackle"];
    },
    add_fish: function(fish) {
        this.fish.level += fish;
        Interface.hobby.update_view_fish();
    },
    set_fish: function(fish) {
        this.fish.level = fish;
        Interface.hobby.update_view_fish();
    },
    add_groundbight: function() {
        this.groundbait += 1;
        Interface.hobby.update_view_groundbight();
    },
    subtract_groundbight: function() {
        this.groundbait -= 1;
        Interface.hobby.update_view_groundbight();
    },
    add_fishing_rod: function() {
        this.fishing_rod = true;
        Interface.hobby.update_view_fishing_rod();
    },
    add_fishing_tackle: function() {
        this.fishing_tackle = true;
        Interface.hobby.update_view_fishing_tackle();
    },
    buy_groundbait: function() {
        let groundbait_obj = World["hobby"].groundbait;
        let groundbait_price = groundbait_obj["price"];
        if (Player["status"].money < groundbait_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(groundbait_price);
        Player.hobby.add_groundbight();
    },
    buy_fishing_equipment: function(fishing_equipment_type) {
        let fishing_eqipment_obj = World["hobby"].fishing_rod;
        let fishing_eqipment_price = fishing_eqipment_obj["price"];
        if (Player["status"].money < fishing_eqipment_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(fishing_eqipment_price);
        if (fishing_equipment_type === "fishing_rod") {
            Player.hobby.add_fishing_rod();
        }
        else if (fishing_equipment_type === "fishing_tackle") {
            Player.hobby.add_fishing_tackle();
        }
        Interface.hobby.update_price_label(fishing_equipment_type);
    },
    go_fishing: function() {
        let fishing_obj = World["hobby"].fishing;
        let fishing_price = fishing_obj["price"];
        if (Player["status"].money < fishing_price) {
            Interface.status.alert_no_money();
            return;
        }
        if (!Player.hobby.fishing_rod) {
            Interface.hobby.alert_no_fishing_rod();
            return;
        }
        if (!Player.hobby.fishing_tackle) {
            Interface.hobby.alert_no_fishing_tackle();
            return;
        }
        if (!Player["shop"].car || Player["shop"].car.level === 0) {
            $("#bus_confirm_dialog").show();
            return;
        }
        $("#gas_confirm_dialog").show();
    },
    start_fishing: function(fishing_price) {
        Player["status"].subtract_money(fishing_price);

        fishingGame.useGroundbait = false;
        if (Player.hobby.groundbait > 0) {
            Player.hobby.subtract_groundbight();
            fishingGame.useGroundbait = true;
        }

        $(".switchable").hide();
        $("#fishing_game_panel").show();
        $("#fishing_game_intro").show();
        $("#fishing_game_play").hide();
        $("#fishing_game_results").hide();
        $("#home_button").hide();
        $("#buttons_panel").hide();

        $("#fishing_game_groundbait_label").text(fishingGame.useGroundbait ? t("common.yes") : t("common.no"));
        $("#fishing_game_caught_label").text("0");
        $("#fishing_game_time_label").text("30");
    }
};

function startFishingGame() {
    fishingGame.timeLeft = 30;
    fishingGame.caught = 0;

    $("#fishing_game_intro").hide();
    $("#fishing_game_play").show();
    $("#fishing_game_caught_label").text("0");
    $("#fishing_game_time_label").text("30");

    spawnFish();

    fishingGame.timer = setInterval(function() {
        fishingGame.timeLeft--;
        $("#fishing_game_time_label").text(fishingGame.timeLeft);
        if (fishingGame.timeLeft <= 0) {
            endFishingGame();
        }
    }, 1000);

    fishingGame.fishTimer = setInterval(function() {
        spawnFish();
    }, 600);
}

function spawnFish() {
    const lake = $("#fishing_lake");
    const lakeW = lake.width() - 40;
    const lakeH = lake.height() - 20;

    const x1 = getRandomInt(0, lakeW);
    const y1 = getRandomInt(0, lakeH);
    const fish1 = $("#fishing_fish");
    fish1.css({ left: x1 + "px", top: y1 + "px" });
    fish1.show();

    if (fishingGame.useGroundbait) {
        const x2 = getRandomInt(0, lakeW);
        const y2 = getRandomInt(0, lakeH);
        const fish2 = $("#fishing_fish2");
        fish2.css({ left: x2 + "px", top: y2 + "px" });
        fish2.show();
    }
}

function catchFish(event) {
    fishingGame.caught++;
    $("#fishing_game_caught_label").text(fishingGame.caught);
    $(event.currentTarget).hide();
}

function endFishingGame() {
    clearInterval(fishingGame.timer);
    clearInterval(fishingGame.fishTimer);
    fishingGame.timer = null;
    fishingGame.fishTimer = null;
    $(".fishing_fish").hide();

    const totalCatch = fishingGame.caught;

    const moodBonus = Math.floor(totalCatch / 5);
    const satietyBonus = Math.floor(totalCatch / 6);

    Player.hobby.add_fish(totalCatch);
    Player["status"].add_mood(moodBonus);
    Player["status"].add_satiety(satietyBonus);

    $("#fishing_result_fish").text(totalCatch);
    $("#fishing_result_mood").text(moodBonus);
    $("#fishing_result_satiety").text(satietyBonus);

    $("#fishing_game_play").hide();
    $("#fishing_game_results").show();
}

function goHomeFishing() {
    $("#fishing_game_panel").hide();
    $("#buttons_panel").show();
    $(".switchable").hide();
    $("#status_panel").show();
    $("#home_button").hide();
}

function buy_groundbait_button_click_handler() {
    Player.hobby.buy_groundbait();
}

function buy_equipment_button_click_handler() {
    Player.hobby.buy_fishing_equipment(this.name);
}

function hobby_button_mouseenter_handler() {
    Interface.hobby.update_price_label(this.name);
    Interface.hobby.update_desc(this.name);
    let item = World["hobby"][this.name];
    if (item && item.image) {
        $("#hobby_shop_image").attr("src", "/" + item.image);
    }
}

function hobby_button_mouseleave_handler() {
    Interface.hobby.reset_price_label();
    Interface.hobby.reset_desc();
    $("#hobby_shop_image").attr("src", "/assets/images/hobby/hobby_placeholder.png");
}

function go_fishing_button_click_handler () {
    Player.hobby.go_fishing();
}

function hobby_panel_setup() {
    $("#buy_groundbait_button").on({
        click: buy_groundbait_button_click_handler,
        mouseenter: hobby_button_mouseenter_handler,
        mouseleave: hobby_button_mouseleave_handler
    });
    $("#buy_fishing_rod_button, #buy_fishing_tackle_button").on({
        click: buy_equipment_button_click_handler,
        mouseenter: hobby_button_mouseenter_handler,
        mouseleave: hobby_button_mouseleave_handler
    });
    $("#go_fishing_button").on({
        click: go_fishing_button_click_handler,
        mouseenter: hobby_button_mouseenter_handler,
        mouseleave: hobby_button_mouseleave_handler
    });
    $("#fishing_game_start_button").on("click", startFishingGame);
    $(".fishing_fish").on("click", catchFish);
    $("#fishing_game_home_button").on("click", goHomeFishing);
    $("#bus_confirm_yes").on("click", function() {
        $("#bus_confirm_dialog").hide();
        let fishing_price = World["hobby"].fishing["price"];
        if (Player["status"].money < fishing_price + 10) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(10);
        Player.hobby.start_fishing(fishing_price);
    });
    $("#bus_confirm_no").on("click", function() {
        $("#bus_confirm_dialog").hide();
    });
    $("#gas_confirm_yes").on("click", function() {
        $("#gas_confirm_dialog").hide();
        let fishing_price = World["hobby"].fishing["price"];
        let gas_price = 5;
        if (Player["status"].money < fishing_price + gas_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(gas_price);
        Player.hobby.start_fishing(fishing_price);
    });
    $("#gas_confirm_no").on("click", function() {
        $("#gas_confirm_dialog").hide();
    });
    Interface.hobby.update_all();
}

export {
    hobby_panel_setup
}
