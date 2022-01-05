import { World } from "./global.js";

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

function load_assets(world_data_file, onload_fn) {
    $.getJSON(world_data_file, function(world_data_obj) {
        Object.assign(World, preprocess_shop_assortment(world_data_obj));
        onload_fn();
        }).fail(function(e, e2) {
            console.log("An error has occurred.", e, e2);
        });
}

export { load_assets }
