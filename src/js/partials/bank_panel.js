import {
    Player, Interface
} from "../global.js"

Interface.bank = {
    update_view: function() {
        $("#bank_money_label").text(Player.bank.deposit);
        $("#bank_profit_label").text(Player.bank.deposit / 20);
        $("#bank_put_money_input").val("");
        $("#bank_get_money_input").val("");
    },
    get_bank_put_money_input_val: function() {
        let money_transfer_str = $("#bank_put_money_input").val();
        return parseInt(money_transfer_str);
    },
    get_bank_get_money_input_val: function() {
        let money_transfer_str = $("#bank_get_money_input").val();
        return parseInt(money_transfer_str);
    },
    alert_no_money: function() {
        alert("Not enough money in the bank");
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
        console.log("get", money_transfer)
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
