import {
    Player, Interface
} from "../global.js"

let $money_label;
let $profit_label;
let $put_input;
let $get_input;

Interface.bank = {
    update_view: function() {
        $money_label.text(Player.bank.deposit);
        $profit_label.text(Player.bank.deposit / 20);
        $put_input.val("");
        $get_input.val("");
    },
    get_bank_put_money_input_val: function() {
        return parseInt($put_input.val());
    },
    get_bank_get_money_input_val: function() {
        return parseInt($get_input.val());
    },
    alert_no_money: function() {
        Interface.show_dialog("Внимание", "У вас не хватает денег на счету");
    }
};

Player.bank = {
    deposit: 0,
    get_attributes: function () {
        return ["deposit"];
    },
    put_money: function (money_transfer) {
        if (Player["status"].money < money_transfer) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(money_transfer);
        Player.bank.deposit += money_transfer;
        Interface.bank.update_view();
    },
    get_money: function (money_transfer) {
        if (this.deposit < money_transfer) {
            Interface.bank.alert_no_money();
            return;
        }
        Player["status"].add_money(money_transfer);
        Player.bank.deposit -= money_transfer;
        Interface.bank.update_view();
    },
    update_state: function () {
        if (this.deposit && Player["time"].is_new_day()) {
            this.deposit += this.deposit / 20;
            Interface.bank.update_view();
        }
    }
};

function update_bank_state() {
    Player.bank.update_state();
}

function bank_put_money_button_click_handler() {
    Player.bank.put_money(Interface.bank.get_bank_put_money_input_val());
}

function bank_get_money_button_click_handler() {
    Player.bank.get_money(Interface.bank.get_bank_get_money_input_val());
}

function bank_panel_setup() {
    $money_label = $("#bank_money_label");
    $profit_label = $("#bank_profit_label");
    $put_input = $("#bank_put_money_input");
    $get_input = $("#bank_get_money_input");

    $("#bank_put_money_button").on({
        click: bank_put_money_button_click_handler
    });
    $("#bank_get_money_button").on({
        click: bank_get_money_button_click_handler
    });
    Interface.bank.update_view();
}

export {
    bank_panel_setup, update_bank_state
}
