<?php

function get_script_path($script)
{
    return get_stylesheet_directory_uri() . $script;
}

function get_version()
{
    if (WP_DEBUG) {
        return time();
    }
    return wp_get_theme()->get('version');
}

function enqueue_scripts_styles()
{
    wp_enqueue_style('ffbdevelopers-style', get_script_path('/assets/css/custom.css'), array(), get_version());
    wp_enqueue_script('ffbdevelopers-script', get_script_path('/assets/js/custom.js'), array('jquery'), get_version(), true);

    if (is_front_page()) {
        wp_enqueue_style('ffbdevelopers-age-calculator-style', get_script_path('/assets/css/age-calculator.css'), array(), get_version());
        wp_enqueue_script('ffbdevelopers-age-calculator-script', get_script_path('/assets/js/age-calculator.js'), array('jquery'), get_version(), true);
    }
}

add_action('wp_enqueue_scripts', 'enqueue_scripts_styles', 100);

/** Utility scripts **/
require_once('inc/utility.php');
