import {
    World, Player, Interface
} from "../global.js"

const REQUIREMENT_TITLES = {
    school: "Школа",
    english_course: "Англ. язык",
    computer_course: "Комп. курсы",
    clothes: "Одежда",
    car: "Машина",
    apartment: "Квартира",
    furniture: "Мебель",
    kitchen: "Кухня",
    bathroom: "Ванная",
    compiler: "Компилятор",
    graphics: "Графика",
    modem: "Модем",
    scanner: "Сканер",
    fish: "Рыба"
};

const REQUIREMENT_SECTIONS = {
    school: "education",
    english_course: "education",
    computer_course: "education",
    clothes: "shop",
    car: "shop",
    apartment: "housing",
    furniture: "housing",
    kitchen: "housing",
    bathroom: "housing",
    compiler: "software",
    graphics: "software",
    modem: "hardware",
    scanner: "hardware",
    fish: null
};

function get_requirement_short_desc(key, level) {
    let section = REQUIREMENT_SECTIONS[key];
    if (!section) return level;
    if (section === "education") {
        return World.education[key].descriptions[level];
    }
    let data = World[section][key];
    if (Array.isArray(data)) {
        let item = data.find(i => i.level === level);
        return item ? (item.short_desc || item.description) : level;
    }
    for (const id in data) {
        if (data[id].level === level) {
            return data[id].description || level;
        }
    }
    return level;
}

let $description_label;
let $salary_label;
let $requirements_list;
let $current_label;

Interface.job = {
    update_view_title_salary: function() {
        let job_id = Player.job.id;
        let job_salary = Player.job.salary;
        let job_title = World["job"][job_id].title;
        $("#job").text(job_title);
        $("#salary").text(job_salary);
    },
    update_current_job_label: function() {
        let job_title = World["job"][Player.job.id].title;
        $current_label.text(job_title);
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
    build_requirements_html: function(job_id) {
        let job_obj = World["job"][job_id];
        let requirements = job_obj["requirements"];
        let keys = Object.keys(requirements);
        if (keys.length === 0) {
            return '<div class="field-row"><label>Нет</label></div>';
        }
        let html = "";
        for (const key of keys) {
            let req_val = requirements[key];
            let title = REQUIREMENT_TITLES[key] || key;
            let met = Player.check_requirement(key, req_val);
            let mark = met ? "\u2714" : "\u2718";
            let color = met ? "#008000" : "#c00000";
            let desc = get_requirement_short_desc(key, req_val);
            html += `<div class="field-row" style="color:${color}">${mark} ${title}: ${desc}</div>`;
        }
        return html;
    },
    update_job_labels: function(job_id) {
        let job_obj = World["job"][job_id];
        let job_salary = job_obj["salary"] + "$/день";
        let job_description = job_obj["description"];
        $salary_label.text(job_salary);
        $description_label.text(job_description);
        $requirements_list.html(Interface.job.build_requirements_html(job_id));
    },
    reset_job_labels: function() {
        $salary_label.text("-");
        $description_label.text("Выберите вакансию из списка слева, чтобы увидеть описание и требования. Устройтесь на работу, чтобы получать зарплату каждый день.");
        $requirements_list.empty();
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
        Interface.job.update_current_job_label();
    },
    apply_for_new_job: function(job_id) {
        let job_obj = World["job"][job_id];
        let job_requirements = job_obj["requirements"];
        for (const job_requirement_key in job_requirements) {
            let job_requirement_val = job_requirements[job_requirement_key];
            let job_requirement_status = Player.check_requirement(job_requirement_key, job_requirement_val);
            if (!job_requirement_status) {
                return;
            }
        }
        Player.job.set_title_salary(job_id, job_obj.salary);
        Interface.job.disable_prev_jobs(job_id);
        Interface.job.update_job_labels(job_id);
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
    $description_label = $("#job_panel_description_label");
    $salary_label = $("#job_panel_salary_label");
    $requirements_list = $("#job_panel_requirements_list");
    $current_label = $("#job_panel_current_label");

    $(".job_list button").on({
        click: job_button_click_handler,
        mouseenter: job_button_mouseenter_handler,
        mouseleave: job_button_mouseleave_handler
    });
    Interface.job.update_view_title_salary();
    Interface.job.update_current_job_label();
}

export {
    job_panel_setup
}
