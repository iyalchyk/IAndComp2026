import {
    World, Player, Interface
} from "../global.js";
import { build_requirements_html } from "./job_panel.js";

const disconnectedText = "Добро пожаловать к самому лучшему провайдеру.\nЗдесь вы можете подключиться к интернету за 5$ в час. Мы предлагаем вам самые лучшие страницы мира.\n" +
    "Самая знаменитая страница анекдотов и страница о компьютере. Подключайтесь, не пожалеете. При первом подключении необходимо заплатить 30$.";
const connectedText = "Добро пожаловать к самому лучшему провайдеру.\nВы подключились к интернету. С вас будет сниматься 5$ за каждый час работы до тех пор, пока вы не нажмёте «Отключиться».\n" +
    "Теперь вы можете выйти в интернет и выбрать один из доступных сайтов.";
const anecdoteAssets = {
    random: "assets/data/internet_anecdotes_01.txt",
    day: "assets/data/internet_anecdotes_02.txt",
    week: "assets/data/internet_anecdotes_03.txt"
};
const computerAsset = "assets/data/internet_computer.txt";
const VIRUS_EVENT_PERIOD_HOURS = 72;
const VIRUS_MIN_STOLEN_MONEY = 5;
const VIRUS_MAX_STOLEN_MONEY = 30;
const viewDisplays = {
    provider: "block",
    anecdotes: "flex",
    computer: "grid"
};

let $infoText;
let $connectButton;
let $enterButton;
let $sitesDialog;
let $allViews;
let $anecdoteButtons;
let $anecdoteText;
let $anecdotePlaceholder;
let $computerText;
let $anecdoteHours;
let $computerHours;
let $downloadButton;
let $downloadProgress;
let $downloadProgressLabel;
let $downloadProgressBar;
let $disconnectButtons;
let $virusDialog;
let $virusKillButton;
let $virusKillRequirement;
let currentView = "provider";
let textAssetPromises = {};
let anecdoteDownloadInterval = null;

function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function has_blocking_overlay() {
    return $(".confirm_dialog_overlay:visible").not("#virus_dialog").length > 0;
}

function clear_anecdote_download_interval() {
    if (anecdoteDownloadInterval) {
        clearInterval(anecdoteDownloadInterval);
        anecdoteDownloadInterval = null;
    }
}

function finalize_anecdotes_download(options = {}) {
    clear_anecdote_download_interval();
    Player.internet.anecdotes_download_in_progress = false;
    if (options.downloaded) {
        Player.internet.anecdotes_downloaded = true;
    }
    Interface.internet.hide_download_progress();
    Interface.internet.update_download_controls();
    if (options.dialog_title && options.dialog_text) {
        Interface.show_dialog(options.dialog_title, options.dialog_text);
    }
}

function load_text_asset(path) {
    if (!textAssetPromises[path]) {
        textAssetPromises[path] = fetch(path)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
                return response.text();
            })
            .then(function(text) {
                return text
                    .replace(/\r\n/g, "\n")
                    .trim();
            });
    }
    return textAssetPromises[path];
}

Interface.internet = {
    update_status_label: function() {
        $("#internet_access").text(Player.internet.has_connected_once ? "Есть" : "Нет");
        $("#internet_anecdotes_status").text(Player.internet.anecdotes_downloaded ? "Скачаны" : "Нет");
    },
    update_panel: function() {
        $connectButton.text(Player.internet.connected ? "Отключиться" : "Подключение");
        $enterButton.prop("disabled", !Player.internet.connected);
        $infoText.text(Player.internet.connected ? connectedText : disconnectedText);
        if (!Player.internet.connected) {
            this.hide_sites_dialog();
        }
        this.update_hours_labels();
        this.sync_home_button();
    },
    update_all: function() {
        this.update_status_label();
        this.update_panel();
    },
    show_view: function(view_name) {
        currentView = view_name;
        $allViews.hide();
        $("#internet_" + view_name + "_view").css("display", viewDisplays[view_name]);
        if (view_name !== "provider") {
            this.hide_sites_dialog();
        }
        this.sync_home_button();
    },
    toggle_sites_dialog: function() {
        if (!Player.internet.connected) return;
        if ($sitesDialog.is(":visible")) {
            $sitesDialog.hide();
        } else {
            $sitesDialog.css("display", "flex");
        }
    },
    hide_sites_dialog: function() {
        $sitesDialog.hide();
    },
    update_hours_labels: function() {
        $anecdoteHours.text(Player.internet.hours_online);
        $computerHours.text(Player.internet.hours_online);
    },
    sync_home_button: function() {
        let shouldShow = currentView === "provider" && $("#internet_panel").is(":visible");
        $("#home_button").toggle(shouldShow);
    },
    update_download_controls: function() {
        let disabled = Player.internet.anecdotes_download_in_progress;
        $downloadButton.prop("disabled", disabled);
        $anecdoteButtons.prop("disabled", disabled);
        $disconnectButtons.prop("disabled", disabled);
        $("#internet_open_anecdotes_button").prop("disabled", disabled);
        $("#internet_open_computer_button").prop("disabled", disabled);
        $enterButton.prop("disabled", disabled || !Player.internet.connected);
        if (currentView === "provider") {
            $connectButton.prop("disabled", disabled);
        }
    },
    reset_anecdotes_view: function() {
        $anecdoteButtons.removeClass("is-active");
        $anecdoteText.hide().text("");
        $anecdotePlaceholder.show();
    },
    show_anecdote_loading: function($button) {
        $anecdoteButtons.removeClass("is-active");
        $button.addClass("is-active");
        $anecdotePlaceholder.hide();
        $anecdoteText.show().text("Загрузка...");
    },
    show_download_progress: function() {
        $downloadProgressLabel.text("::: Скачивание [0%] :::");
        $downloadProgressBar.css("width", "0%");
        $downloadProgress.css("visibility", "visible");
    },
    set_download_progress: function(percent) {
        $downloadProgressLabel.text("::: Скачивание [" + Math.floor(percent) + "%] :::");
        $downloadProgressBar.css("width", percent + "%");
    },
    hide_download_progress: function() {
        $downloadProgress.css("visibility", "hidden");
        $downloadProgressBar.css("width", "0%");
    }
};

Player.internet = {
    connected: false,
    has_connected_once: false,
    hours_online: 0,
    session_hours_online: 0,
    anecdotes_downloaded: false,
    anecdotes_download_in_progress: false,
    virus_window_start_hour: null,
    virus_scheduled_hour: null,
    virus_dialog_open: false,
    get_attributes: function() {
        return [];
    },
    schedule_virus_event: function() {
        if (!this.has_connected_once || this.virus_window_start_hour === null) return;
        this.virus_scheduled_hour = this.virus_window_start_hour + get_random_int(1, VIRUS_EVENT_PERIOD_HOURS);
    },
    advance_virus_window: function() {
        if (this.virus_window_start_hour === null) return;
        this.virus_window_start_hour += VIRUS_EVENT_PERIOD_HOURS;
        this.schedule_virus_event();
    },
    unlock_virus_events: function() {
        if (this.virus_window_start_hour !== null) return;
        this.virus_window_start_hour = Player.time.total_hours;
        this.schedule_virus_event();
    },
    show_virus_dialog: function() {
        let antivirus = Player.software.antivirus;
        let hasAntivirus = Boolean(antivirus);

        this.virus_dialog_open = true;
        $virusKillButton.prop("disabled", !hasAntivirus);
        $virusKillRequirement.toggle(!hasAntivirus);
        $virusDialog.show();
    },
    finish_virus_event: function() {
        this.virus_dialog_open = false;
        $virusDialog.hide();
        this.advance_virus_window();
    },
    steal_money_by_virus: function(messagePrefix) {
        let stolenMoney = get_random_int(VIRUS_MIN_STOLEN_MONEY, VIRUS_MAX_STOLEN_MONEY);
        Player.status.subtract_money(stolenMoney);
        this.finish_virus_event();
        Interface.show_dialog("Вирус", messagePrefix + " Вирус украл " + stolenMoney + "$.");
    },
    let_virus_live: function() {
        this.steal_money_by_virus("Вы оставили вирус в покое.");
    },
    try_kill_virus: function() {
        let antivirus = Player.software.antivirus;
        if (!antivirus) return;

        let successProbability = antivirus.level >= 2 ? 1 : 0.5;
        if (Math.random() < successProbability) {
            this.finish_virus_event();
            Interface.show_dialog("Вирус", "Поздравляем! Вирус был уничтожен.");
            return;
        }

        this.steal_money_by_virus("Антивирус не справился.");
    },
    maybe_trigger_virus_event: function() {
        if (!this.has_connected_once || this.virus_scheduled_hour === null) return;
        if (this.virus_dialog_open || has_blocking_overlay()) return;
        if (Player.time.total_hours < this.virus_scheduled_hour) return;
        this.show_virus_dialog();
    },
    connect: function() {
        let requirements = World["internet"]["requirements"];
        for (const requirement_key in requirements) {
            let requirement_val = requirements[requirement_key];
            if (!Player.check_requirement(requirement_key, requirement_val)) {
                let html = "Вы не соответствуете требованиям для выхода в интернет:<br><br>" +
                    build_requirements_html(requirements);
                $("#global_dialog_title").text("Не соответствуете требованиям");
                $("#global_dialog_text").html(html);
                $("#global_dialog").show();
                return;
            }
        }
        if (!this.has_connected_once) {
            if (Player.status.money < 30) {
                Interface.status.alert_no_money();
                return;
            }
            Player.status.subtract_money(30);
            this.has_connected_once = true;
            this.unlock_virus_events();
        }
        this.connected = true;
        this.session_hours_online = 0;
        Interface.internet.show_view("provider");
        Interface.internet.update_all();
        Interface.internet.update_download_controls();
    },
    disconnect: function(options = {}) {
        let force = Boolean(options.force);
        if (this.anecdotes_download_in_progress && !force) return;
        if (this.anecdotes_download_in_progress) {
            finalize_anecdotes_download();
        }
        this.connected = false;
        Interface.internet.show_view("provider");
        Interface.internet.update_all();
        Interface.internet.update_download_controls();
        if (options.dialog_title && options.dialog_text) {
            Interface.show_dialog(options.dialog_title, options.dialog_text);
        }
    },
    disconnect_due_to_no_money: function() {
        let message = "\u0423 \u0432\u0430\u0441 \u0437\u0430\u043a\u043e\u043d\u0447\u0438\u043b\u0438\u0441\u044c \u0434\u0435\u043d\u044c\u0433\u0438, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442 \u0431\u044b\u043b \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d.\n" +
            "\u0412\u044b \u043f\u0440\u043e\u0441\u0438\u0434\u0435\u043b\u0438 \u0432 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0435 " + this.session_hours_online + " \u0447.";
        if (this.anecdotes_download_in_progress) {
            message += "\n\u0421\u043a\u0430\u0447\u0438\u0432\u0430\u043d\u0438\u0435 \u0431\u0430\u0437\u044b \u0430\u043d\u0435\u043a\u0434\u043e\u0442\u043e\u0432 \u043f\u0440\u0435\u0440\u0432\u0430\u043d\u043e.";
        }
        this.disconnect({
            force: true,
            dialog_title: "\u0418\u043d\u0442\u0435\u0440\u043d\u0435\u0442",
            dialog_text: message
        });
    }
};

function connect_button_click_handler() {
    if (Player.internet.connected) {
        Player.internet.disconnect();
    } else {
        Player.internet.connect();
    }
}

function enter_button_click_handler() {
    if (Player.internet.anecdotes_download_in_progress) return;
    Interface.internet.toggle_sites_dialog();
}

function open_anecdotes_button_click_handler() {
    if (Player.internet.anecdotes_download_in_progress) return;
    Interface.internet.reset_anecdotes_view();
    Interface.internet.show_view("anecdotes");
}

async function open_computer_button_click_handler() {
    if (Player.internet.anecdotes_download_in_progress) return;
    Interface.internet.show_view("computer");
    $computerText.text("Загрузка...");
    try {
        let text = await load_text_asset(computerAsset);
        if (currentView === "computer") {
            $computerText.text(text);
        }
    } catch (error) {
        if (currentView === "computer") {
            $computerText.text("Не удалось загрузить страницу о компьютере.");
        }
    }
}

async function anecdote_button_click_handler() {
    let $button = $(this);
    let kind = $button.data("kind");

    Interface.internet.show_anecdote_loading($button);
    try {
        let text = await load_text_asset(anecdoteAssets[kind]);
        if (currentView === "anecdotes") {
            $anecdoteText.text(text);
        }
    } catch (error) {
        if (currentView === "anecdotes") {
            $anecdoteText.text("Не удалось загрузить анекдоты.");
        }
    }
}

function anecdotes_download_button_click_handler() {
    if (Player.internet.anecdotes_download_in_progress) return;
    if (Player.internet.anecdotes_downloaded) {
        Interface.show_dialog("Интернет", "База анекдотов уже скачана.");
        return;
    }

    let hasDownloader = Boolean(Player.software.downloader);
    let duration = 10000;
    let failAt = hasDownloader ? null : Math.floor(Math.random() * 7000) + 1000;
    let start = Date.now();

    Player.internet.anecdotes_download_in_progress = true;
    Interface.internet.show_download_progress();
    Interface.internet.update_download_controls();

    anecdoteDownloadInterval = setInterval(function() {
        let elapsed = Date.now() - start;
        let percent = Math.min(100, (elapsed / duration) * 100);
        Interface.internet.set_download_progress(percent);

        if (!hasDownloader && elapsed >= failAt) {
            finalize_anecdotes_download();
            Interface.show_dialog("Скачивание прервано", "Скачивание оборвалось. Установите качалку FlashGet, чтобы докачать базу анекдотов до конца.");
            return;
        }

        if (elapsed >= duration) {
            finalize_anecdotes_download({
                downloaded: true
            });
            Interface.show_dialog("Интернет", "База анекдотов успешно скачана.");
        }
    }, 50);
}

function disconnect_button_click_handler() {
    Player.internet.disconnect();
}

function virus_spare_button_click_handler() {
    Player.internet.let_virus_live();
}

function virus_kill_button_click_handler() {
    if ($(this).prop("disabled")) return;
    Player.internet.try_kill_virus();
}

function update_internet_state() {
    if (Player.internet.connected) {
        Player.internet.hours_online++;
        Player.internet.session_hours_online++;
        let moneyBeforeCharge = Player.status.money;
        Player.status.subtract_money(5);
        if (moneyBeforeCharge >= 0 && Player.status.money < 0) {
            Player.status.set_money(0);
        }
        Interface.internet.update_hours_labels();
        if (Player.status.money <= 0) {
            Player.internet.disconnect_due_to_no_money();
        }
    }
    Player.internet.maybe_trigger_virus_event();
}

function internet_panel_setup() {
    $infoText = $("#internet_panel_info_text");
    $connectButton = $("#internet_connect_button");
    $enterButton = $("#internet_enter_button");
    $sitesDialog = $("#internet_sites_dialog");
    $allViews = $("#internet_panel .internet_view");
    $anecdoteButtons = $(".internet_anecdote_button");
    $anecdoteText = $("#internet_anecdotes_text");
    $anecdotePlaceholder = $("#internet_anecdotes_placeholder");
    $computerText = $("#internet_computer_text");
    $anecdoteHours = $("#internet_anecdotes_hours_value");
    $computerHours = $("#internet_computer_hours_value");
    $downloadButton = $("#internet_anecdotes_download_button");
    $downloadProgress = $("#internet_anecdotes_download_progress");
    $downloadProgressLabel = $("#internet_anecdotes_download_label");
    $downloadProgressBar = $("#internet_anecdotes_download_bar");
    $disconnectButtons = $(".internet_disconnect_button");
    $virusDialog = $("#virus_dialog");
    $virusKillButton = $("#virus_dialog_kill");
    $virusKillRequirement = $("#virus_dialog_requirement");

    $connectButton.on("click", connect_button_click_handler);
    $enterButton.on("click", enter_button_click_handler);
    $("#internet_open_anecdotes_button").on("click", open_anecdotes_button_click_handler);
    $("#internet_open_computer_button").on("click", open_computer_button_click_handler);
    $anecdoteButtons.on("click", anecdote_button_click_handler);
    $downloadButton.on("click", anecdotes_download_button_click_handler);
    $disconnectButtons.on("click", disconnect_button_click_handler);
    $("#virus_dialog_spare").on("click", virus_spare_button_click_handler);
    $virusKillButton.on("click", virus_kill_button_click_handler);

    Interface.internet.show_view("provider");
    Interface.internet.reset_anecdotes_view();
    Interface.internet.update_all();
    Interface.internet.update_download_controls();
}

export {
    internet_panel_setup,
    update_internet_state
};
