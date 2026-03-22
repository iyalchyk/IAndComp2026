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

function entertainment_panel_setup() {
    $("#go_party_button, #go_disco_button").on({
        click: go_entertainment_button_click_handler,
        mouseenter: go_entertainment_button_mouseenter_handler,
        mouseleave: go_entertainment_button_mouseleave_handler
    });

    $("#go_roulette_button").on("click", open_roulette);
    $("#roulette_start_button").on("click", start_roulette);
    $("#roulette_home_button").on("click", close_roulette);
}

export {
    entertainment_panel_setup
}
