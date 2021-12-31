import {
    Shop, Player, activate_status_panel, update_player_view
} from "../global.js"

const BUTTON_ID_TO_ASSORTMENT_MAP = {
    job_porter_button: "porter",
    job_taxi_driver_button: "taxi_driver",
    job_gardener_button: "gardener",
    job_junior_dev_button: "junior_dev",
    job_middle_dev_button: "middle_dev",
    job_internet_provider_button: "internet_provider",
    job_web_master_button: "web_master",
    job_hacker_button: "hacker",
    job_graphical_designer_button: "graphical_designer",
    job_computer_president_button: "computer_president"
};

function check_job_requirement(job_requirement_key, job_requirement_val) {
    let player_val = null;
    const levels_arr = ["school", "english_course", "computer_course"];
    const property_arr = ["apartment", "furniture", "kitchen", "bathroom", "clothes", "car"];
    if (levels_arr.includes(job_requirement_key)) {
        player_val = Player.levels[job_requirement_key];
    }
    else if (property_arr.includes(job_requirement_key)) {
        player_val = Player.property[job_requirement_key] ? Player.property[job_requirement_key]["level"] : null;
    }
    else {
        alert("Unknown job requirement " + job_requirement_key);
        return false;
    }
    return player_val && player_val >= job_requirement_val;
}

function job_button_handler() {
    let job_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id];
    let job_obj = Shop["job"][job_str];
    let job_requirements = job_obj["requirements"];
    for (const job_requirement_key in job_requirements) {
        let job_requirement_val = job_requirements[job_requirement_key];
        let job_requirement_status = check_job_requirement(job_requirement_key, job_requirement_val)
        if (!job_requirement_status) {
            alert(`${job_requirement_key} should be at least ${job_requirement_val}!`);
            return;
        }
    }
    Player.job = job_str;
    Player.salary = job_obj.salary;
    alert("You are now " + job_str);
    update_player_view();
    activate_status_panel();
}

function set_salary_label_handler() {
    let job_str = BUTTON_ID_TO_ASSORTMENT_MAP[this.id];
    let job_obj = Shop["job"][job_str];
    $("#job_panel_salary_label").text(job_obj["salary"]);
    $("#job_panel_description_label").text(job_obj["description"]);
    $("#job_panel_requirements_label").text(JSON.stringify(job_obj["requirements"]));
}

function reset_salary_label_handler() {
    $("#job_panel_salary_label").text("-");
    $("#job_panel_description_label").text("");
    $("#job_panel_requirements_label").text("");
}

function job_panel_setup() {
    $("#job_porter_button, #job_taxi_driver_button, #job_gardener_button, #job_junior_dev_button, " +
        "#job_middle_dev_button, #job_internet_provider_button, #job_web_master_button, #job_hacker_button, " +
        "#job_graphical_designer_button, #job_computer_president_button").on({
        click: job_button_handler,
        mouseenter: set_salary_label_handler,
        mouseleave: reset_salary_label_handler
    });
}

export {
    job_panel_setup
}
