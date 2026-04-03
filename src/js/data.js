import { World } from "./global.js";
import { resolve_translations } from "./i18n.js";

function preprocess_shop_assortment(data) {
    let processed_data = {};
    for (const panel_id in data) {
        let one_panel_assortment = data[panel_id];
        processed_data[panel_id] = {};
        for (const category_str in one_panel_assortment) {
            let category_arr = one_panel_assortment[category_str];
            if (category_arr instanceof Array) {
                for (let i = 0; i < category_arr.length - 1; ++i) {
                    category_arr[i].next = category_arr[i+1];
                    category_arr[i+1].prev = category_arr[i];
                }
                category_arr[0].prev = null;
                category_arr[category_arr.length - 1].next = null;
            }
            processed_data[panel_id][category_str] = category_arr;
        }
    }
    return processed_data;
}

function load_world_data(world_data_file) {
    return $.getJSON(world_data_file);
}

function apply_world_data(world_data_obj) {
    let resolved_world = resolve_translations(world_data_obj);
    Object.assign(World, preprocess_shop_assortment(resolved_world));
}

export {
    apply_world_data,
    load_world_data
}
