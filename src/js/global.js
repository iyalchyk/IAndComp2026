const ASSORTMENT_URL = "assets/data/assortment.json"

let World = {
    time: 0
};

let Player = {
    salary: 10,
    money: 1600,
    mood: 30,
    satiety: 30,
    groundbait: 0,
    fish: 0,
    property: {
        apartment: null,
        furniture: null,
        kitchen: null,
        bathroom: null,
        clothes: null,
        car: null
    }
};

function preprocess_shop_assortment(data) {
    let processed_data = {}
    for (const category_str in data) {
        let category_arr = data[category_str]
        if (category_arr instanceof Array) {
            for (let i = 0; i < category_arr.length - 1; ++i) {
                category_arr[i].next = category_arr[i+1]
                category_arr[i+1].prev = category_arr[i]
            }
            category_arr[0].prev = null
            category_arr[category_arr.length - 1].next = null
        }
        processed_data[category_str] = category_arr
    }
    return processed_data
}

function init_player() {
    Player.property.apartment = Shop["apartment"][0];
    Player.property.furniture = Shop["furniture"][0];
    Player.property.kitchen = Shop["kitchen"][0];
    Player.property.bathroom = Shop["bathroom"][0];
}

let Shop = null
$.getJSON(ASSORTMENT_URL, function(data) {
    Shop = preprocess_shop_assortment(data);
    console.log(Shop)
    init_player()
    }).fail(function(e, e2) {
        console.log("An error has occurred.", e, e2);
    });

function activate_status_panel() {
    $(".switchable").hide();
    $("#status_panel").show();
    $("#home_button").hide();
}

function update_player_view() {
    $("#money").text(Player.money);
    $("#mood").text(Player.mood);
    $("#entertainment_panel_mood_value_label").text(Player.mood);
    $("#satiety").text(Player.satiety);
    $("#hobby_panel_groundbait_amount_label").text(Player.groundbait);
    $("#hobby_panel_fish_amount_label").text(Player.fish);
}

function reverse(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => (acc[value] = key, acc), {})
}

export {
    World,
    Shop,
    Player,
    activate_status_panel,
    update_player_view
}
