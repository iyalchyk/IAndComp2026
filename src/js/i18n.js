let labels = {};

function load_labels(labels_file) {
    return $.getJSON(labels_file, function(data) {
        labels = data || {};
    });
}

function get_label(key, fallback = null) {
    if (!key) {
        return fallback;
    }

    let value = labels;
    for (const part of key.split(".")) {
        if (value == null || typeof value !== "object" || !(part in value)) {
            return fallback;
        }
        value = value[part];
    }
    return value;
}

function interpolate(template, variables = {}) {
    return template.replace(/\{(\w+)\}/g, function(match, variableName) {
        return variableName in variables ? variables[variableName] : match;
    });
}

function t(key, variables = {}, fallback = "") {
    let value = get_label(key, fallback);
    if (typeof value !== "string") {
        return fallback;
    }
    return interpolate(value, variables);
}

function resolve_translations(value) {
    if (Array.isArray(value)) {
        return value.map(resolve_translations);
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    let keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "i18n") {
        return get_label(value.i18n, value.i18n);
    }

    let resolved = {};
    for (const key of keys) {
        resolved[key] = resolve_translations(value[key]);
    }
    return resolved;
}

function apply_translations(root = document) {
    document.title = t("dom.index.document_title", {}, document.title);
    document.documentElement.lang = get_label("meta.lang", document.documentElement.lang || "ru");

    root.querySelectorAll("[data-i18n]").forEach(function(element) {
        element.textContent = t(element.dataset.i18n, {}, element.textContent);
    });

    root.querySelectorAll("[data-i18n-html]").forEach(function(element) {
        element.innerHTML = t(element.dataset.i18nHtml, {}, element.innerHTML);
    });
}

export {
    apply_translations,
    get_label,
    load_labels,
    resolve_translations,
    t
};
