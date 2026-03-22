import {
    World, Player, Interface
} from "../global.js"

Interface.entertainment = {
    update_price_mood_labels: function(entertainment_type) {
        let entertainment_obj = World["entertainment"][entertainment_type];
        let price_label = entertainment_obj ? entertainment_obj["price"] : World["interface"]["no_price"];
        let mood_change_label = entertainment_obj ? entertainment_obj["mood"] : World["interface"]["no_price"];
        $("#entertainment_panel_price_label").text(price_label);
        $("#entertainment_panel_mood_change_label").text(mood_change_label);
    },
    reset_price_mood_labels: function () {
        $("#entertainment_panel_price_label").text(World["interface"]["no_price"]);
        $("#entertainment_panel_mood_change_label").text(World["interface"]["no_price"]);
    }
};

Player.entertainment = {
    get_attributes: function() {
        return [];
    },
    go_entertainment: function(entertainment_type) {
        let entertainment_obj = World["entertainment"][entertainment_type];
        let entertainment_price = entertainment_obj["price"];
        let entertainment_mood = entertainment_obj["mood"];
        if (Player["status"].money < entertainment_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(entertainment_price);
        Player["status"].add_mood(entertainment_mood);
    }
};

function go_entertainment_button_click_handler() {
    Player.entertainment.go_entertainment(this.name);
}

function go_entertainment_button_mouseenter_handler() {
    Interface.entertainment.update_price_mood_labels(this.name);
}

function go_entertainment_button_mouseleave_handler() {
    Interface.entertainment.reset_price_mood_labels();
}

var rouletteAnimTimer = null;

function open_roulette() {
    $("#roulette_popup").show();
    $("#roulette_display").text("00");
    $("#roulette_your_number_box").text("-");
    $("#roulette_casino_number_box").text("-");
    $("#roulette_winnings_label").text("0");
    $("#roulette_number_input").val("0");
    $("#roulette_bet_input").val("1");
    $("#roulette_start_button").prop("disabled", false);
}

function close_roulette() {
    if (rouletteAnimTimer) {
        clearInterval(rouletteAnimTimer);
        rouletteAnimTimer = null;
    }
    $("#roulette_popup").hide();
}

function start_roulette() {
    let playerNumber = parseInt($("#roulette_number_input").val());
    let bet = parseInt($("#roulette_bet_input").val());

    if (isNaN(playerNumber) || playerNumber < 0 || playerNumber > 13) {
        alert("Введите число от 0 до 13!");
        return;
    }
    if (isNaN(bet) || bet < 1) {
        alert("Введите ставку!");
        return;
    }
    if (Player["status"].money < bet) {
        Interface.status.alert_no_money();
        return;
    }

    $("#roulette_start_button").prop("disabled", true);

    let casinoNumber = Math.floor(Math.random() * 14);
    let ticks = 0;
    let totalTicks = 15 + Math.floor(Math.random() * 10);

    rouletteAnimTimer = setInterval(function() {
        let displayNum = Math.floor(Math.random() * 14);
        $("#roulette_display").text(displayNum < 10 ? "0" + displayNum : "" + displayNum);
        ticks++;

        if (ticks >= totalTicks) {
            clearInterval(rouletteAnimTimer);
            rouletteAnimTimer = null;

            let displayStr = casinoNumber < 10 ? "0" + casinoNumber : "" + casinoNumber;
            $("#roulette_display").text(displayStr);
            $("#roulette_your_number_box").text(playerNumber);
            $("#roulette_casino_number_box").text(casinoNumber);

            if (playerNumber === casinoNumber) {
                let winnings = bet * 3;
                Player["status"].add_money(winnings);
                Player["status"].add_mood(25);
                $("#roulette_winnings_label").text("+" + winnings);
            } else {
                Player["status"].subtract_money(bet);
                Player["status"].add_mood(-2);
                $("#roulette_winnings_label").text("-" + bet);
            }

            $("#roulette_start_button").prop("disabled", false);
        }
    }, 100);
}

// Slot machine
var slotSymbols = ["🍎", "🍇", "🍔"];
var slotSpinsLeft = 0;
var slotAnimTimer = null;

var slotPaytable = [
    { combo: ["🍎", "🍎", "🍇"], payout: 1 },
    { combo: ["🍔", "🍔", "🍇"], payout: 2 },
    { combo: ["🍇", "🍇", "🍎"], payout: 3 },
    { combo: ["🍔", "🍔", "🍎"], payout: 4 },
    { combo: ["🍇", "🍇", "🍔"], payout: 5 },
    { combo: ["🍎", "🍎", "🍔"], payout: 6 },
    { combo: ["🍇", "🍇", "🍇"], payout: 10 },
    { combo: ["🍎", "🍎", "🍎"], payout: 15 },
    { combo: ["🍔", "🍔", "🍔"], payout: 20 }
];

function get_slot_payout(r1, r2, r3) {
    for (var i = 0; i < slotPaytable.length; i++) {
        var c = slotPaytable[i].combo;
        if (r1 === c[0] && r2 === c[1] && r3 === c[2]) {
            return slotPaytable[i].payout;
        }
    }
    return 0;
}

function update_slot_ui() {
    $("#slot_spins_left").text(slotSpinsLeft);
    $("#slot_money_label").text(Player["status"].money);
    $("#slot_spin_button").prop("disabled", slotSpinsLeft <= 0);
}

function open_slot_machine() {
    slotSpinsLeft = 0;
    $("#slot_reel_1, #slot_reel_2, #slot_reel_3").text("?");
    $("#entertainment_panel > .buttons_box, #entertainment_panel > .info_box, #entertainment_panel > .price_box").hide();
    $("#slot_machine_popup").show();
    update_slot_ui();
}

function close_slot_machine() {
    if (slotAnimTimer) {
        clearInterval(slotAnimTimer);
        slotAnimTimer = null;
    }
    $("#slot_machine_popup").hide();
    $("#entertainment_panel > .buttons_box, #entertainment_panel > .info_box, #entertainment_panel > .price_box").show();
}

function buy_slot_spins() {
    if (Player["status"].money < 10) {
        Interface.status.alert_no_money();
        return;
    }
    Player["status"].subtract_money(10);
    slotSpinsLeft += 5;
    update_slot_ui();
}

function spin_slot_machine() {
    if (slotSpinsLeft <= 0) return;

    slotSpinsLeft--;
    $("#slot_spin_button").prop("disabled", true);
    $("#slot_buy_button").prop("disabled", true);

    var finalReels = [
        slotSymbols[Math.floor(Math.random() * 3)],
        slotSymbols[Math.floor(Math.random() * 3)],
        slotSymbols[Math.floor(Math.random() * 3)]
    ];

    var ticks = 0;
    var totalTicks = 12 + Math.floor(Math.random() * 6);

    slotAnimTimer = setInterval(function() {
        $("#slot_reel_1").text(slotSymbols[Math.floor(Math.random() * 3)]);
        $("#slot_reel_2").text(slotSymbols[Math.floor(Math.random() * 3)]);
        $("#slot_reel_3").text(slotSymbols[Math.floor(Math.random() * 3)]);
        ticks++;

        if (ticks >= totalTicks) {
            clearInterval(slotAnimTimer);
            slotAnimTimer = null;

            $("#slot_reel_1").text(finalReels[0]);
            $("#slot_reel_2").text(finalReels[1]);
            $("#slot_reel_3").text(finalReels[2]);

            var payout = get_slot_payout(finalReels[0], finalReels[1], finalReels[2]);
            if (payout > 0) {
                Player["status"].add_money(payout);
                alert("Вы выиграли " + payout + "$!");
            }

            $("#slot_buy_button").prop("disabled", false);
            update_slot_ui();
        }
    }, 80);
}

function entertainment_panel_setup() {
    $("#go_party_button, #go_disco_button").on({
        click: go_entertainment_button_click_handler,
        mouseenter: go_entertainment_button_mouseenter_handler,
        mouseleave: go_entertainment_button_mouseleave_handler
    });

    $("#go_roulette_button").on("click", open_roulette);
    $("#roulette_start_button").on("click", start_roulette);
    $("#roulette_home_button").on("click", close_roulette);

    $("#go_slot_machine_button").on("click", open_slot_machine);
    $("#slot_spin_button").on("click", spin_slot_machine);
    $("#slot_buy_button").on("click", buy_slot_spins);
    $("#slot_home_button").on("click", close_slot_machine);
}

export {
    entertainment_panel_setup
}
