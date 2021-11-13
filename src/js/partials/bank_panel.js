import {
    Player, update_player_view, World
} from "../global.js"

function update_bank_view() {
    $("#bank_money_label").text(Player.bank.money);
    $("#bank_profit_label").text(Player.bank.money / 20);
    $("#bank_put_money_input").val("");
    $("#bank_get_money_input").val("");
}

function update_bank_state() {
    const HOURS_IN_DAY = 3;
    if (Player.bank.money && World.time % HOURS_IN_DAY === 0) {
        Player.money += Player.bank.money / 20;
    }
}

function bank_put_money_handler() {
    let money_transfer_str = $("#bank_put_money_input").val();
    let money_transfer = parseInt(money_transfer_str);
    Player.money -= money_transfer;
    Player.bank.money += money_transfer;
    update_bank_view();
    update_player_view();
}

function bank_get_money_handler() {
    let money_transfer_str = $("#bank_get_money_input").val();
    let money_transfer = parseInt(money_transfer_str);
    Player.money += money_transfer;
    Player.bank.money -= money_transfer;
    update_bank_view();
    update_player_view();
}

function bank_panel_setup() {
    $("#bank_put_money_button").on({
        click: bank_put_money_handler
    });
    $("#bank_get_money_button").on({
        click: bank_get_money_handler
    });
}

export {
    bank_panel_setup, update_bank_state
}
