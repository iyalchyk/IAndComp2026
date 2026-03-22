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

// Arcanoid
var arcanoid = {
    running: false,
    animFrame: null,
    gameTimer: null,
    timeLeft: 30,
    ballRadius: 8,
    ballX: 150,
    ballY: 100,
    ballDX: 0,
    ballDY: 0,
    paddleX: 130,
    paddleWidth: 48,  // 3 * ball diameter (16) = 48
    paddleHeight: 10,
    canvasW: 300,
    canvasH: 200,
    paddleColor: null,
    ballColor: null,
    leftPressed: false,
    rightPressed: false,
    paddleSpeed: 4,
    lost: false
};

var paddleGradients = [
    ["#ff00ff", "#00ffff", "#ff00ff"],
    ["#00cc00", "#ffff00", "#00cc00"],
    ["#ff4444", "#ff8800", "#ff4444"]
];

function arcanoid_draw() {
    var canvas = document.getElementById("arcanoid_canvas");
    var ctx = canvas.getContext("2d");
    var a = arcanoid;

    ctx.clearRect(0, 0, a.canvasW, a.canvasH);

    // Draw ball
    ctx.beginPath();
    ctx.arc(a.ballX, a.ballY, a.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = a.ballColor;
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    var grad = ctx.createLinearGradient(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleX, a.canvasH - 2);
    grad.addColorStop(0, a.paddleColor[0]);
    grad.addColorStop(0.5, a.paddleColor[1]);
    grad.addColorStop(1, a.paddleColor[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleWidth, a.paddleHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleWidth, a.paddleHeight);
}

function arcanoid_update() {
    var a = arcanoid;
    if (!a.running) return;

    // Move paddle
    if (a.leftPressed && a.paddleX > 0) {
        a.paddleX -= a.paddleSpeed;
        if (a.paddleX < 0) a.paddleX = 0;
    }
    if (a.rightPressed && a.paddleX + a.paddleWidth < a.canvasW) {
        a.paddleX += a.paddleSpeed;
        if (a.paddleX + a.paddleWidth > a.canvasW) a.paddleX = a.canvasW - a.paddleWidth;
    }

    // Move ball
    a.ballX += a.ballDX;
    a.ballY += a.ballDY;

    // Wall bounce (left/right)
    if (a.ballX - a.ballRadius <= 0) {
        a.ballX = a.ballRadius;
        a.ballDX = -a.ballDX;
    }
    if (a.ballX + a.ballRadius >= a.canvasW) {
        a.ballX = a.canvasW - a.ballRadius;
        a.ballDX = -a.ballDX;
    }

    // Ceiling bounce
    if (a.ballY - a.ballRadius <= 0) {
        a.ballY = a.ballRadius;
        a.ballDY = -a.ballDY;
    }

    // Floor check
    if (a.ballY + a.ballRadius >= a.canvasH) {
        // Check paddle collision
        var paddleTop = a.canvasH - a.paddleHeight - 2;
        if (a.ballY + a.ballRadius >= paddleTop &&
            a.ballX >= a.paddleX && a.ballX <= a.paddleX + a.paddleWidth) {
            a.ballY = paddleTop - a.ballRadius;
            a.ballDY = -a.ballDY;
        } else {
            // Ball hit the floor - lose
            a.running = false;
            a.lost = true;
            arcanoid_end(false);
            return;
        }
    }

    // Paddle collision (from above, while ball is falling)
    var paddleTop = a.canvasH - a.paddleHeight - 2;
    if (a.ballDY > 0 &&
        a.ballY + a.ballRadius >= paddleTop &&
        a.ballY + a.ballRadius <= paddleTop + a.paddleHeight &&
        a.ballX >= a.paddleX && a.ballX <= a.paddleX + a.paddleWidth) {
        a.ballY = paddleTop - a.ballRadius;
        a.ballDY = -a.ballDY;
    }

    arcanoid_draw();
    a.animFrame = requestAnimationFrame(arcanoid_update);
}

function arcanoid_end(won) {
    var a = arcanoid;
    a.running = false;
    if (a.animFrame) {
        cancelAnimationFrame(a.animFrame);
        a.animFrame = null;
    }
    if (a.gameTimer) {
        clearInterval(a.gameTimer);
        a.gameTimer = null;
    }

    $(document).off("keydown.arcanoid keyup.arcanoid");

    arcanoid_draw();

    if (won) {
        Player["status"].add_money(35);
        Player["status"].add_mood(20);
        alert("Вы продержались! Вы получаете 35$ и настроение улучшилось!");
    } else {
        Player["status"].subtract_money(20);
        Player["status"].add_mood(-8);
        alert("Мяч коснулся пола! Вы теряете 20$ и настроение ухудшилось.");
    }

    $("#arcanoid_start_button").prop("disabled", false);
    $("#arcanoid_left_button, #arcanoid_right_button").prop("disabled", true);
    $("input[name='arcanoid_paddle'], input[name='arcanoid_ball']").prop("disabled", false);
}

function arcanoid_tick() {
    var a = arcanoid;
    a.timeLeft--;
    $("#arcanoid_time_label").text(a.timeLeft);

    // Shrink paddle over time: from 48px (3 balls) to 8px (0.5 ball) over 30 seconds
    var progress = (30 - a.timeLeft) / 30;
    a.paddleWidth = 48 - progress * 40;  // 48 -> 8

    if (a.timeLeft <= 0) {
        arcanoid_end(true);
    }
}

function start_arcanoid() {
    var a = arcanoid;

    // Read options
    var paddleIdx = parseInt($("input[name='arcanoid_paddle']:checked").val());
    a.paddleColor = paddleGradients[paddleIdx];
    a.ballColor = $("input[name='arcanoid_ball']:checked").val();

    // Init state
    a.paddleWidth = 48;
    a.paddleX = (a.canvasW - a.paddleWidth) / 2;
    a.ballX = a.canvasW / 2;
    a.ballY = a.canvasH / 3;
    a.timeLeft = 30;
    a.lost = false;
    a.leftPressed = false;
    a.rightPressed = false;

    // Ball speed: ~50px/sec for a ~4 second bounce across 200px height
    // At 60fps: ~0.83 px/frame. Use angled launch.
    var speed = 0.9;
    var angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    a.ballDX = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    a.ballDY = speed * Math.sin(angle);

    $("#arcanoid_time_label").text(a.timeLeft);
    $("#arcanoid_start_button").prop("disabled", true);
    $("#arcanoid_left_button, #arcanoid_right_button").prop("disabled", false);
    $("input[name='arcanoid_paddle'], input[name='arcanoid_ball']").prop("disabled", true);

    // Keyboard controls
    $(document).on("keydown.arcanoid", function(e) {
        if (e.key === "ArrowLeft") a.leftPressed = true;
        if (e.key === "ArrowRight") a.rightPressed = true;
    });
    $(document).on("keyup.arcanoid", function(e) {
        if (e.key === "ArrowLeft") a.leftPressed = false;
        if (e.key === "ArrowRight") a.rightPressed = false;
    });

    a.running = true;
    a.gameTimer = setInterval(arcanoid_tick, 1000);
    a.animFrame = requestAnimationFrame(arcanoid_update);
}

function arcanoid_update_highlights() {
    $("input[name='arcanoid_paddle']").each(function() {
        $(this).parent().toggleClass("selected", this.checked);
    });
    $("input[name='arcanoid_ball']").each(function() {
        $(this).parent().toggleClass("selected", this.checked);
    });
}

function arcanoid_apply_options() {
    var a = arcanoid;
    var paddleIdx = parseInt($("input[name='arcanoid_paddle']:checked").val());
    a.paddleColor = paddleGradients[paddleIdx];
    a.ballColor = $("input[name='arcanoid_ball']:checked").val();
    arcanoid_update_highlights();
    if (!a.running) {
        arcanoid_draw();
    }
}

function open_arcanoid() {
    $("#entertainment_panel > .buttons_box, #entertainment_panel > .info_box, #entertainment_panel > .price_box").hide();
    $("#arcanoid_popup").show();
    arcanoid.timeLeft = 25;
    $("#arcanoid_time_label").text("30");
    $("#arcanoid_start_button").prop("disabled", false);
    $("#arcanoid_left_button, #arcanoid_right_button").prop("disabled", true);
    $("input[name='arcanoid_paddle'], input[name='arcanoid_ball']").prop("disabled", false);

    // Reset radio selections to defaults
    $("input[name='arcanoid_paddle'][value='0']").prop("checked", true);
    $("input[name='arcanoid_ball'][value='#ff6600']").prop("checked", true);

    // Draw initial state
    var a = arcanoid;
    a.paddleColor = paddleGradients[0];
    a.ballColor = "#ff6600";
    a.paddleWidth = 48;
    a.paddleX = (a.canvasW - a.paddleWidth) / 2;
    a.ballX = a.canvasW / 2;
    a.ballY = a.canvasH / 3;
    arcanoid_draw();
    arcanoid_update_highlights();
}

function close_arcanoid() {
    var a = arcanoid;
    if (a.running) {
        a.running = false;
        if (a.animFrame) {
            cancelAnimationFrame(a.animFrame);
            a.animFrame = null;
        }
        if (a.gameTimer) {
            clearInterval(a.gameTimer);
            a.gameTimer = null;
        }
        $(document).off("keydown.arcanoid keyup.arcanoid");
    }
    $("#arcanoid_popup").hide();
    $("#entertainment_panel > .buttons_box, #entertainment_panel > .info_box, #entertainment_panel > .price_box").show();
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

    $("#go_arcanoid_button").on("click", open_arcanoid);
    $("#arcanoid_start_button").on("click", start_arcanoid);
    $("#arcanoid_home_button").on("click", close_arcanoid);

    $("input[name='arcanoid_paddle'], input[name='arcanoid_ball']").on("change", arcanoid_apply_options);

    // On-screen arrow buttons for arcanoid
    $("#arcanoid_left_button").on("mousedown touchstart", function() { arcanoid.leftPressed = true; });
    $("#arcanoid_left_button").on("mouseup mouseleave touchend", function() { arcanoid.leftPressed = false; });
    $("#arcanoid_right_button").on("mousedown touchstart", function() { arcanoid.rightPressed = true; });
    $("#arcanoid_right_button").on("mouseup mouseleave touchend", function() { arcanoid.rightPressed = false; });
}

export {
    entertainment_panel_setup
}
