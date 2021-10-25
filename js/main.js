const World = {
    time: 0
};

let Shop = null

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

$(function (events, handler) {
    const TIME_QUANT = 1500;
    const HOURS_IN_DAY = 6;
    const MOOD_DEDUCTION_FREQ = 3;
    const SATIETY_DEDUCTION_FREQ = 3;

    function update_world_state() {
        const time_label = time_counter_to_time(World.time);
        $("#time").text(time_label);
        $("#money").text(Player.money);
        $("#mood").text(Player.mood);
        $("#satiety").text(Player.satiety);
    }

    function time_counter_to_time(time_counter) {
        const hours = time_counter % HOURS_IN_DAY
        const hours_str = hours.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })
        return hours_str + ":00"
    }

    function next_hour_handler() {
        World.time++;
        if (World.time === HOURS_IN_DAY) {
            World.time = 0
            Player.money += Player.salary;
        }
        if (World.time % MOOD_DEDUCTION_FREQ === 0) {
            Player.mood -= 2
        }
        if (World.time % SATIETY_DEDUCTION_FREQ === 0) {
            Player.satiety -= 2
        }
        update_world_state()
    }

    function housing_button_handler() {
        $(".switchable").hide();
        $("#housing_panel").show();
        $("#home_button").show();
    }

    function buy_apartment_button_handler() {
        let next_apartment_id = Player.housing.apartment["id"] + 1;
        let next_apartment = Shop["apartments"][next_apartment_id];
        if (Player.money < next_apartment["price"]) {
            alert("No money")
            return
        }
        Player.money -= next_apartment["price"];
        Player.housing.apartment = next_apartment;
        $("#apartment").text(next_apartment["description"]);
        $("#money").text(Player.money);
        if (next_apartment_id + 1 == Shop["apartments"].length) {
            // no more apartments
            $("#buy_apartment_button").prop('disabled', true);
        }
        home_button_handler()
    }

    function buy_apartment_button_mouseenter_handler() {
        console.log("!!!")
        let next_apartment_id = Player.housing.apartment["id"] + 1;
        let next_apartment = Shop["apartments"][next_apartment_id];
        if (next_apartment) {
            $("#housing_panel_price_label").text(next_apartment["price"]);
        }
        else {
            $("#housing_panel_price_label").text("-");
        }

    }

    function home_button_handler() {
        $(".switchable").hide();
        $("#status_panel").show();
        $("#home_button").hide();
    }

    $.getJSON("js/assortment.json", function(data) {
        Shop = data;
        Player.housing.apartment = Shop["apartments"][0];
        Player.housing.furniture = Shop["furniture"][0];
        Player.housing.kitchen = Shop["kitchens"][0];
        Player.housing.bathroom = Shop["bathrooms"][0];
        console.log(Player);
        }).fail(function(e, e2) {
            console.log("An error has occurred.", e, e2);
        });

    $("#housing_button").on("click", housing_button_handler)
    $("#buy_apartment_button").on("click", buy_apartment_button_handler)
    $("#home_button").on("click", home_button_handler)

    $("#buy_apartment_button").on("mouseenter", buy_apartment_button_mouseenter_handler)
    $("#buy_apartment_button").on("mouseleave", function() {
        $("#housing_panel_price_label").text("-");
    })
    home_button_handler()

    update_world_state();
    setInterval(next_hour_handler, TIME_QUANT);
});
