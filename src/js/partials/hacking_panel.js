import {
    World, Player, Interface
} from "../global.js"
import { t } from "../i18n.js";

let $task_label;
let $get_task_button;
let $execute_button;
let $progress_container;
let $progress_bar;

let current_task = null;
let executing = false;

Interface.hacking = {
    update_view: function() {
        if (executing) {
            $get_task_button.hide();
            $execute_button.hide();
        } else if (current_task) {
            $get_task_button.text(t("js.hacking.cancel")).show();
            $execute_button.show();
            $task_label.text(t("js.hacking.task_reward", { description: current_task.description, reward: current_task.reward }));
        } else {
            $get_task_button.text(t("dom.hacking.get_task_button")).show();
            $execute_button.hide();
            $task_label.text(t("dom.hacking.no_task"));
        }
    }
};

Player.hacking = {
    get_attributes: function () {
        return [];
    }
};

function get_random_task() {
    let tasks = World["hacking"]["tasks"];
    let index = Math.floor(Math.random() * tasks.length);
    return tasks[index];
}

function get_task_button_click_handler() {
    if (executing) return;

    if (current_task) {
        Player["status"].subtract_money(5);
        current_task = null;
        Interface.hacking.update_view();
    } else {
        current_task = get_random_task();
        Interface.hacking.update_view();
    }
}

function execute_button_click_handler() {
    if (!current_task || executing) return;

    executing = true;
    let task = current_task;

    let duration = task.duration * 1000;
    if (Math.random() < task.delay_probability) {
        duration *= 2;
    }

    $task_label.text(t("js.hacking.executing"));
    Interface.hacking.update_view();

    $progress_container.show();
    $progress_bar.css("width", "0%");

    let start = Date.now();
    let progressInterval = setInterval(function() {
        let elapsed = Date.now() - start;
        let percent = Math.min(100, (elapsed / duration) * 100);
        $progress_bar.css("width", percent + "%");

        if (elapsed >= duration) {
            clearInterval(progressInterval);
            $progress_container.hide();
            executing = false;

            if (Math.random() < task.failure_probability) {
                let penalty = Math.floor(task.reward / 2);
                Player["status"].subtract_money(penalty);
                $task_label.text(t("js.hacking.failed", { penalty: penalty }));
            } else {
                Player["status"].add_money(task.reward);
                $task_label.text(t("js.hacking.completed", { reward: task.reward }));
            }

            current_task = null;
            $get_task_button.text(t("dom.hacking.get_task_button")).show();
            $execute_button.hide();
        }
    }, 50);
}

function hacking_panel_setup() {
    $task_label = $("#hacking_task_label");
    $get_task_button = $("#hacking_get_task_button");
    $execute_button = $("#hacking_execute_button");
    $progress_container = $("#hacking_progress_container");
    $progress_bar = $("#hacking_progress_bar");

    $get_task_button.on({
        click: get_task_button_click_handler
    });
    $execute_button.on({
        click: execute_button_click_handler
    });
}

export {
    hacking_panel_setup
}
