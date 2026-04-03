let labels = {};
let labels_by_locale = {};
let current_locale = "ru";

function set_locale(locale) {
    if (!(locale in labels_by_locale)) {
        return false;
    }

    current_locale = locale;
    labels = labels_by_locale[locale] || {};
    return true;
}

function load_labels(labels_file, locale = null) {
    return $.getJSON(labels_file, function(data) {
        let loaded_labels = data || {};
        let resolved_locale = locale || (loaded_labels.meta && loaded_labels.meta.lang) || current_locale;

        labels_by_locale[resolved_locale] = loaded_labels;
        if (resolved_locale === current_locale || !labels || !Object.keys(labels).length) {
            set_locale(resolved_locale);
        }
    });
}

function load_label_sets(locale_files, default_locale = "ru") {
    let requests = Object.entries(locale_files).map(function([locale, labels_file]) {
        return load_labels(labels_file, locale);
    });

    return $.when.apply($, requests).done(function() {
        set_locale(default_locale);
    });
}

function get_label(key, fallback = null) {
    return get_locale_label(current_locale, key, fallback);
}

function get_locale_label(locale, key, fallback = null) {
    if (!key) {
        return fallback;
    }

    let value = labels_by_locale[locale] || {};
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
    get_locale_label,
    load_label_sets,
    load_labels,
    resolve_translations,
    set_locale,
    t
};
