const World = {
    time: 0
};

let Shop = {

};

const Player = {
    salary: 10,
    money: 160,
    mood: 30,
    satiety: 30,
    housing: {
        apartment: null,
        furniture: null,
        kitchen: null,
        bathroom: null
    }
};

$.getJSON("js/assortment.json", function(data) {
    Shop = data;
    Player.housing.apartment = Shop["apartments"][0];
    Player.housing.furniture = Shop["furniture"][0];
    Player.housing.kitchen = Shop["kitchens"][0];
    Player.housing.bathroom = Shop["bathrooms"][0];
    //console.log(Player);
    }).fail(function(e, e2) {
        console.log("An error has occurred.", e, e2);
    });

function home_button_handler() {
    $(".switchable").hide();
    $("#status_panel").show();
    $("#home_button").hide();
}

export {
    World,
    Shop,
    Player,
    home_button_handler
}
