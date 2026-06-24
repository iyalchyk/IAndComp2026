import {
    World, Player, Interface
} from "../global.js"
import { t } from "../i18n.js";

Interface.entertainment = {
    update_price_mood_labels: function(entertainment_type) {
        let entertainment_obj = World["entertainment"][entertainment_type];
        let price_label = entertainment_obj ? entertainment_obj["price"] : World["interface"]["no_price"];
        let mood_change_label = entertainment_obj ? entertainment_obj["mood"] : World["interface"]["no_price"];
        $entertainmentPriceLabel.text(price_label);
        $entertainmentMoodLabel.text(mood_change_label);
    },
    reset_price_mood_labels: function () {
        $entertainmentPriceLabel.text(World["interface"]["no_price"]);
        $entertainmentMoodLabel.text(World["interface"]["no_price"]);
    },
    update_desc: function(entertainment_type) {
        let desc = t(`js.entertainment.descriptions.${entertainment_type}`, {}, t("js.entertainment.default_description"));
        $entertainmentDescLabel.text(desc);
    },
    reset_desc: function() {
        $entertainmentDescLabel.text(t("js.entertainment.default_description"));
    },
    update_current_mood: function() {
        $entertainmentMoodValueLabel.text(Player["status"].mood);
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
        if (Player["status"].mood > 150) {
            Interface.show_dialog(t("js.entertainment.too_happy_title"), t("js.entertainment.too_happy_text"));
            return;
        }
        if (Player["status"].money < entertainment_price) {
            Interface.status.alert_no_money();
            return;
        }
        Player["status"].subtract_money(entertainment_price);
        Player["status"].add_mood(entertainment_mood);
        Interface.entertainment.update_current_mood();
    }
};

function go_entertainment_button_click_handler() {
    Player.entertainment.go_entertainment(this.name);
}

function go_entertainment_button_mouseenter_handler() {
    Interface.entertainment.update_price_mood_labels(this.name);
    Interface.entertainment.update_desc(this.name);
}

function go_entertainment_button_mouseleave_handler() {
    Interface.entertainment.reset_price_mood_labels();
    Interface.entertainment.reset_desc();
}

function go_casino_button_mouseenter_handler() {
    Interface.entertainment.update_desc(this.name);
}

function go_casino_button_mouseleave_handler() {
    Interface.entertainment.reset_desc();
}

let rouletteAnimTimer = null;

// Cached jQuery selectors (initialized in entertainment_panel_setup)
let $entertainmentPriceLabel, $entertainmentMoodLabel, $entertainmentMoodValueLabel;
let $entertainmentDescLabel;
let $roulettePopup, $rouletteDisplay, $rouletteYourNumber, $rouletteCasinoNumber;
let $rouletteWinnings, $rouletteNumberInput, $rouletteBetInput, $rouletteStartButton;
let $slotReel1, $slotReel2, $slotReel3, $slotMachinePopup;
let $slotSpinButton, $slotBuyButton, $slotSpinsLeftLabel, $slotMoneyLabel;
let $entertainmentMainSection;
let $arcanoidPopup, $arcanoidTimeLabel, $arcanoidStartButton;
let $arcanoidArrowButtons, $arcanoidPaddleBallInputs;
let $arcanoidPaddleInputs, $arcanoidBallInputs;
let $arcanoidLeftButton, $arcanoidRightButton;

function open_roulette() {
    $roulettePopup.show();
    $rouletteDisplay.text("00");
    $rouletteYourNumber.text("-");
    $rouletteCasinoNumber.text("-");
    $rouletteWinnings.text("0");
    $rouletteNumberInput.val("0");
    $rouletteBetInput.val("1");
    $rouletteStartButton.prop("disabled", false);
}

function close_roulette() {
    if (rouletteAnimTimer) {
        clearInterval(rouletteAnimTimer);
        rouletteAnimTimer = null;
    }
    $roulettePopup.hide();
}

function start_roulette() {
    let playerNumber = parseInt($rouletteNumberInput.val());
    let bet = parseInt($rouletteBetInput.val());

    if (isNaN(playerNumber) || playerNumber < 0 || playerNumber > 13) {
        Interface.show_dialog(t("dom.entertainment.roulette_title"), t("js.entertainment.roulette_number_error"));
        return;
    }
    if (isNaN(bet) || bet < 1) {
        Interface.show_dialog(t("dom.entertainment.roulette_title"), t("js.entertainment.roulette_bet_error"));
        return;
    }
    if (Player["status"].money < bet) {
        Interface.status.alert_no_money();
        return;
    }

    $rouletteStartButton.prop("disabled", true);

    let casinoNumber = Math.floor(Math.random() * 14);
    let ticks = 0;
    let totalTicks = 15 + Math.floor(Math.random() * 10);

    rouletteAnimTimer = setInterval(function() {
        if (Player.is_paused) {
            return;
        }

        let displayNum = Math.floor(Math.random() * 14);
        $rouletteDisplay.text(displayNum < 10 ? "0" + displayNum : "" + displayNum);
        ticks++;

        if (ticks >= totalTicks) {
            clearInterval(rouletteAnimTimer);
            rouletteAnimTimer = null;

            let displayStr = casinoNumber < 10 ? "0" + casinoNumber : "" + casinoNumber;
            $rouletteDisplay.text(displayStr);
            $rouletteYourNumber.text(playerNumber);
            $rouletteCasinoNumber.text(casinoNumber);

            if (playerNumber === casinoNumber) {
                let winnings = bet * 3;
                Player["status"].add_money(winnings);
                Player["status"].add_mood(25);
                $rouletteWinnings.text("+" + winnings);
            } else {
                Player["status"].subtract_money(bet);
                Player["status"].add_mood(-2);
                $rouletteWinnings.text("-" + bet);
            }

            $rouletteStartButton.prop("disabled", false);
        }
    }, 100);
}

// Slot machine
const slotSymbols = ["🍎", "🍇", "🍔"];
let slotSpinsLeft = 0;
let slotAnimTimer = null;

const slotPaytable = [
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
    for (let i = 0; i < slotPaytable.length; i++) {
        let c = slotPaytable[i].combo;
        if (r1 === c[0] && r2 === c[1] && r3 === c[2]) {
            return slotPaytable[i].payout;
        }
    }
    return 0;
}

function update_slot_ui() {
    $slotSpinsLeftLabel.text(slotSpinsLeft);
    $slotMoneyLabel.text(Player["status"].money);
    $slotSpinButton.prop("disabled", slotSpinsLeft <= 0);
}

function open_slot_machine() {
    slotSpinsLeft = 0;
    $slotReel1.text("?");
    $slotReel2.text("?");
    $slotReel3.text("?");
    $entertainmentMainSection.hide();
    $slotMachinePopup.show();
    update_slot_ui();
}

function close_slot_machine() {
    if (slotAnimTimer) {
        clearInterval(slotAnimTimer);
        slotAnimTimer = null;
    }
    $slotMachinePopup.hide();
    $entertainmentMainSection.show();
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
    $slotSpinButton.prop("disabled", true);
    $slotBuyButton.prop("disabled", true);

    let finalReels = [
        slotSymbols[Math.floor(Math.random() * 3)],
        slotSymbols[Math.floor(Math.random() * 3)],
        slotSymbols[Math.floor(Math.random() * 3)]
    ];

    let ticks = 0;
    let totalTicks = 12 + Math.floor(Math.random() * 6);

    slotAnimTimer = setInterval(function() {
        if (Player.is_paused) {
            return;
        }

        $slotReel1.text(slotSymbols[Math.floor(Math.random() * 3)]);
        $slotReel2.text(slotSymbols[Math.floor(Math.random() * 3)]);
        $slotReel3.text(slotSymbols[Math.floor(Math.random() * 3)]);
        ticks++;

        if (ticks >= totalTicks) {
            clearInterval(slotAnimTimer);
            slotAnimTimer = null;

            $slotReel1.text(finalReels[0]);
            $slotReel2.text(finalReels[1]);
            $slotReel3.text(finalReels[2]);

            let payout = get_slot_payout(finalReels[0], finalReels[1], finalReels[2]);
            if (payout > 0) {
                Player["status"].add_money(payout);
                Interface.show_dialog(t("js.entertainment.slot_title"), t("js.entertainment.slot_win", { payout: payout }));
            }

            $slotBuyButton.prop("disabled", false);
            update_slot_ui();
        }
    }, 80);
}

// Arcanoid
let arcanoid = {
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

const paddleGradients = [
    ["#ff00ff", "#00ffff", "#ff00ff"],
    ["#00cc00", "#ffff00", "#00cc00"],
    ["#ff4444", "#ff8800", "#ff4444"]
];

function arcanoid_draw() {
    const canvas = document.getElementById("arcanoid_canvas");
    const ctx = canvas.getContext("2d");
    const a = arcanoid;

    ctx.clearRect(0, 0, a.canvasW, a.canvasH);

    // Draw ball
    ctx.beginPath();
    ctx.arc(a.ballX, a.ballY, a.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = a.ballColor;
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    const grad = ctx.createLinearGradient(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleX, a.canvasH - 2);
    grad.addColorStop(0, a.paddleColor[0]);
    grad.addColorStop(0.5, a.paddleColor[1]);
    grad.addColorStop(1, a.paddleColor[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleWidth, a.paddleHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(a.paddleX, a.canvasH - a.paddleHeight - 2, a.paddleWidth, a.paddleHeight);
}

function arcanoid_update() {
    const a = arcanoid;
    if (!a.running) return;
    if (Player.is_paused) {
        a.animFrame = requestAnimationFrame(arcanoid_update);
        return;
    }

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
    let paddleTop = a.canvasH - a.paddleHeight - 2;
    if (a.ballY + a.ballRadius >= a.canvasH) {
        // Check paddle collision
        if (a.ballY + a.ballRadius >= paddleTop &&
            a.ballX >= a.paddleX && a.ballX <= a.paddleX + a.paddleWidth) {
            a.ballY = paddleTop - a.ballRadius;
            a.ballDY = -a.ballDY;
        } else {
            // Ball hit the floor - lose
            a.lost = true;
            arcanoid_end(false);
            return;
        }
    }

    // Paddle collision (from above, while ball is falling)
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

function arcanoid_stop() {
    const a = arcanoid;
    if (!a.running) return;
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

function arcanoid_end(won) {
    arcanoid_stop();
    arcanoid_draw();

    if (won) {
        Player["status"].add_money(35);
        Player["status"].add_mood(20);
        Interface.show_dialog(t("dom.entertainment.arcanoid_title"), t("js.entertainment.arcanoid_win"));
    } else {
        Player["status"].subtract_money(20);
        Player["status"].add_mood(-8);
        Interface.show_dialog(t("dom.entertainment.arcanoid_title"), t("js.entertainment.arcanoid_loss"));
    }

    $arcanoidStartButton.prop("disabled", false);
    $arcanoidArrowButtons.prop("disabled", true);
    $arcanoidPaddleBallInputs.prop("disabled", false);
}

function arcanoid_tick() {
    if (Player.is_paused) {
        return;
    }

    const a = arcanoid;
    a.timeLeft--;
    $arcanoidTimeLabel.text(a.timeLeft);

    // Shrink paddle over time: from 48px (3 balls) to 8px (0.5 ball) over 30 seconds
    let progress = (30 - a.timeLeft) / 30;
    a.paddleWidth = 48 - progress * 40;  // 48 -> 8

    if (a.timeLeft <= 0) {
        arcanoid_end(true);
    }
}

function start_arcanoid() {
    const a = arcanoid;

    // Read options
    let paddleIdx = parseInt($arcanoidPaddleInputs.filter(":checked").val());
    a.paddleColor = paddleGradients[paddleIdx];
    a.ballColor = $arcanoidBallInputs.filter(":checked").val();

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
    let speed = 0.9;
    let angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    a.ballDX = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    a.ballDY = speed * Math.sin(angle);

    $arcanoidTimeLabel.text(a.timeLeft);
    $arcanoidStartButton.prop("disabled", true);
    $arcanoidArrowButtons.prop("disabled", false);
    $arcanoidPaddleBallInputs.prop("disabled", true);

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
    $arcanoidPaddleInputs.each(function() {
        $(this).parent().toggleClass("selected", this.checked);
    });
    $arcanoidBallInputs.each(function() {
        $(this).parent().toggleClass("selected", this.checked);
    });
}

function arcanoid_apply_options() {
    const a = arcanoid;
    let paddleIdx = parseInt($arcanoidPaddleInputs.filter(":checked").val());
    a.paddleColor = paddleGradients[paddleIdx];
    a.ballColor = $arcanoidBallInputs.filter(":checked").val();
    arcanoid_update_highlights();
    if (!a.running) {
        arcanoid_draw();
    }
}

function open_arcanoid() {
    $entertainmentMainSection.hide();
    $arcanoidPopup.show();
    arcanoid.timeLeft = 25;
    $arcanoidTimeLabel.text("30");
    $arcanoidStartButton.prop("disabled", false);
    $arcanoidArrowButtons.prop("disabled", true);
    $arcanoidPaddleBallInputs.prop("disabled", false);

    // Reset radio selections to defaults
    $arcanoidPaddleInputs.filter("[value='0']").prop("checked", true);
    $arcanoidBallInputs.filter("[value='#ff6600']").prop("checked", true);

    // Draw initial state
    const a = arcanoid;
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
    arcanoid_stop();
    $arcanoidPopup.hide();
    $entertainmentMainSection.show();
}

function entertainment_panel_setup() {
    // Initialize cached selectors
    $entertainmentPriceLabel = $("#entertainment_panel_price_label");
    $entertainmentMoodLabel = $("#entertainment_panel_mood_change_label");
    $entertainmentMoodValueLabel = $("#entertainment_panel_mood_value_label");
    $entertainmentDescLabel = $("#entertainment_desc_label");
    $roulettePopup = $("#roulette_popup");
    $rouletteDisplay = $("#roulette_display");
    $rouletteYourNumber = $("#roulette_your_number_box");
    $rouletteCasinoNumber = $("#roulette_casino_number_box");
    $rouletteWinnings = $("#roulette_winnings_label");
    $rouletteNumberInput = $("#roulette_number_input");
    $rouletteBetInput = $("#roulette_bet_input");
    $rouletteStartButton = $("#roulette_start_button");
    $slotReel1 = $("#slot_reel_1");
    $slotReel2 = $("#slot_reel_2");
    $slotReel3 = $("#slot_reel_3");
    $slotMachinePopup = $("#slot_machine_popup");
    $slotSpinButton = $("#slot_spin_button");
    $slotBuyButton = $("#slot_buy_button");
    $slotSpinsLeftLabel = $("#slot_spins_left");
    $slotMoneyLabel = $("#slot_money_label");
    $entertainmentMainSection = $(".entertainment_main");
    $arcanoidPopup = $("#arcanoid_popup");
    $arcanoidTimeLabel = $("#arcanoid_time_label");
    $arcanoidStartButton = $("#arcanoid_start_button");
    $arcanoidArrowButtons = $("#arcanoid_left_button, #arcanoid_right_button");
    $arcanoidPaddleBallInputs = $("input[name='arcanoid_paddle'], input[name='arcanoid_ball']");
    $arcanoidPaddleInputs = $("input[name='arcanoid_paddle']");
    $arcanoidBallInputs = $("input[name='arcanoid_ball']");
    $arcanoidLeftButton = $("#arcanoid_left_button");
    $arcanoidRightButton = $("#arcanoid_right_button");

    $("#go_party_button, #go_disco_button").on({
        click: go_entertainment_button_click_handler,
        mouseenter: go_entertainment_button_mouseenter_handler,
        mouseleave: go_entertainment_button_mouseleave_handler
    });

    $("#go_roulette_button").on({
        click: open_roulette,
        mouseenter: go_casino_button_mouseenter_handler,
        mouseleave: go_casino_button_mouseleave_handler
    });
    $rouletteStartButton.on("click", start_roulette);
    $("#roulette_home_button").on("click", close_roulette);

    $("#go_slot_machine_button").on({
        click: open_slot_machine,
        mouseenter: go_casino_button_mouseenter_handler,
        mouseleave: go_casino_button_mouseleave_handler
    });
    $slotSpinButton.on("click", spin_slot_machine);
    $slotBuyButton.on("click", buy_slot_spins);
    $("#slot_home_button").on("click", close_slot_machine);

    $("#go_arcanoid_button").on({
        click: open_arcanoid,
        mouseenter: go_casino_button_mouseenter_handler,
        mouseleave: go_casino_button_mouseleave_handler
    });
    $arcanoidStartButton.on("click", start_arcanoid);
    $("#arcanoid_home_button").on("click", close_arcanoid);

    $arcanoidPaddleBallInputs.on("change", arcanoid_apply_options);

    // On-screen arrow buttons for arcanoid
    $arcanoidLeftButton.on("mousedown touchstart", function() { arcanoid.leftPressed = true; });
    $arcanoidLeftButton.on("mouseup mouseleave touchend", function() { arcanoid.leftPressed = false; });
    $arcanoidRightButton.on("mousedown touchstart", function() { arcanoid.rightPressed = true; });
    $arcanoidRightButton.on("mouseup mouseleave touchend", function() { arcanoid.rightPressed = false; });

    Interface.entertainment.update_current_mood();
}

export {
    entertainment_panel_setup
}
