import {
    World, Player, Interface
} from "../global.js"

Interface.job = {
    update_view_title_salary: function() {
        let job_id = Player.job.id;
        let job_salary = Player.job.salary;
        let job_title = World["job"][job_id].title;
        $("#job").text(job_title);
        $("#salary").text(job_salary);
    },
    disable_prev_jobs: function(job_id) {
        let job_obj = World["job"][job_id];
        let job_salary = job_obj["salary"];
        let all_job_ids_arr = Object.keys(World["job"]);
        for (const other_job_id of all_job_ids_arr) {
            let other_job_salary = World["job"][other_job_id]["salary"];
            if (job_salary >= other_job_salary) {
                $(`#job_${other_job_id}_button`).prop('disabled', true);
            }
        }
    },
    update_job_labels: function(job_id) {
        let job_obj = World["job"][job_id];
        let job_salary = job_obj["salary"];
        let job_description = job_obj["description"];
        let job_requirements = JSON.stringify(job_obj["requirements"]);
        $("#job_panel_salary_label").text(job_salary);
        $("#job_panel_description_label").text(job_description);
        $("#job_panel_requirements_label").text(job_requirements);
    },
    reset_job_labels: function() {
        $("#job_panel_salary_label").text("-");
        $("#job_panel_description_label").text("");
        $("#job_panel_requirements_label").text("");
    },
    alert_new_job: function(job_id) {
        alert("You are now " + job_id);
    },
    alert_requirement: function(job_requirement_key, job_requirement_val) {
        alert(`${job_requirement_key} should be at least ${job_requirement_val}!`);
    }
};

Player.job = {
    id: "unemployed",
    salary: 0,
    get_attributes: function() {
        return ["id", "salary"];
    },
    set_title_salary: function(job_id, job_salary) {
        this.id = job_id;
        this.salary = job_salary;
        Interface.job.update_view_title_salary();
    },
    apply_for_new_job: function(job_id) {
        let job_obj = World["job"][job_id];
        let job_requirements = job_obj["requirements"];
        for (const job_requirement_key in job_requirements) {
            let job_requirement_val = job_requirements[job_requirement_key];
            let job_requirement_status = Player.check_requirement(job_requirement_key, job_requirement_val);
            if (!job_requirement_status) {
                Interface.job.alert_requirement(job_requirement_key, job_requirement_val);
                return;
            }
        }
        Player.job.set_title_salary(job_id, job_obj.salary);
        Interface.job.disable_prev_jobs(job_id);
        Interface.job.alert_new_job(job_id);
    }
};

function job_button_click_handler() {
    Player.job.apply_for_new_job(this.name);
}

function job_button_mouseenter_handler() {
    Interface.job.update_job_labels(this.name);
}

function job_button_mouseleave_handler() {
    Interface.job.reset_job_labels();
}

function job_panel_setup() {
    $(
        "#job_porter_button, " +
        "#job_taxi_driver_button, " +
        "#job_gardener_button, " +
        "#job_junior_dev_button, " +
        "#job_middle_dev_button, " +
        "#job_internet_provider_button, " +
        "#job_web_master_button, " +
        "#job_hacker_button, " +
        "#job_graphical_designer_button, " +
        "#job_computer_president_button"
    ).on({
        click: job_button_click_handler,
        mouseenter: job_button_mouseenter_handler,
        mouseleave: job_button_mouseleave_handler
    });
    Interface.job.update_view_title_salary();
}

export {
    job_panel_setup
}
