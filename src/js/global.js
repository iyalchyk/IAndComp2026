let World = {
    // data is provided by external json file

    get_modules: function() {
        return [
            "time", "status", "housing", "shop", "entertainment", "hobby", "education",
            "job", "bank", "hardware", "software"
        ];
    }
};

let Player = {
    // data is provided by partials

    check_requirement: function(requirement_key, requirement_val) {
        let module_attribute_val = null;
        for (const module of World.get_modules()) {
            let module_attributes = this[module].get_attributes();
            if (module_attributes.includes(requirement_key)) {
                let module_attribute_obj = this[module][requirement_key];
                module_attribute_val = module_attribute_obj ? module_attribute_obj.level : null;
            }
        }
        return module_attribute_val && module_attribute_val >= requirement_val;
    }
};

let Interface = {
    // data is provided by partials
};

export {
    World,
    Player,
    Interface
}
