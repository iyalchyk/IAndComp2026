import { World } from "./global.js";
import { load_labels, resolve_translations } from "./i18n.js";

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

function load_assets(world_data_file, labels_file, onload_fn) {
    $.when($.getJSON(world_data_file), load_labels(labels_file))
        .done(function(worldResponse) {
            let world_data_obj = worldResponse[0];
            let resolved_world = resolve_translations(world_data_obj);
            Object.assign(World, preprocess_shop_assortment(resolved_world));
            onload_fn();
        })
        .fail(function(e, e2) {
            console.log("An error has occurred.", e, e2);
        });
}

export { load_assets }
