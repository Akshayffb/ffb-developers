<?php

function get_script_path($script)
{
    return get_stylesheet_directory_uri() . $script;
}

function get_version()
{
    return time();
}

function enqueue_scripts_styles()
{
    wp_enqueue_style('ffbdevelopers-style', get_script_path('/assets/css/custom.css'), array(), get_version());
    wp_enqueue_script('ffbdevelopers-script', get_script_path('/assets/js/custom.js'), array('jquery'), get_version(), true);
}

add_action('wp_enqueue_scripts', 'enqueue_scripts_styles', 100);

/** Utility scripts **/
require_once('inc/utility.php');
