import {
    World, Player, Interface
} from "../global.js"

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Interface.hobby = {
    update_view_fish: function() {
        $("#hobby_panel_fish_amount_label").text(Player.hobby.fish.level);
    },
    update_view_groundbight: function() {
        $("#hobby_panel_groundbait_amount_label").text(Player.hobby.groundbait);
    },
    update_view_fishing_rod: function() {
        $("#buy_fishing_rod_button").prop('disabled', Player.hobby.fishing_rod);
    },
    update_view_fishing_tackle: function() {
        $("#buy_fishing_tackle_button").prop('disabled', Player.hobby.fishing_tackle);
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
    alert_no_fishing_rod: function() {
        alert("No fishing rod");
    },
    alert_no_fishing_tackle: function() {
        alert("No fishing tackle");
    },
    alert_fish_amount: function(fish_amount) {
        alert("Amount of fish: " + fish_amount);
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
        let fish_amount = getRandomInt(0, 10);
        if (Player.hobby.groundbait) {
            Player.hobby.subtract_groundbight();
            fish_amount *= 2;
        }
        Player.hobby.add_fish(fish_amount);
        Player["status"].add_mood(fish_amount % 5);
        Player["status"].add_satiety(fish_amount % 6);
        Interface.hobby.alert_fish_amount(fish_amount);
    }
};

function buy_groundbait_button_click_handler() {
    Player.hobby.buy_groundbait();
}

function buy_equipment_button_click_handler() {
    Player.hobby.buy_fishing_equipment(this.name);
}

function hobby_button_mouseenter_handler() {
    Interface.hobby.update_price_label(this.name);
}

function hobby_button_mouseleave_handler() {
    Interface.hobby.reset_price_label();
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
    Interface.hobby.update_all();
}

export {
    hobby_panel_setup
}
