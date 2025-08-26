<?php

// Allow SVG
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {

    global $wp_version;
    if ($wp_version !== '4.7.1') {
        return $data;
    }

    $filetype = wp_check_filetype($filename, $mimes);

    return [
        'ext' => $filetype['ext'],
        'type' => $filetype['type'],
        'proper_filename' => $data['proper_filename']
    ];
}, 10, 4);

function cc_mime_types($mimes)
{
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}

add_filter('upload_mimes', 'cc_mime_types');

function fix_svg()
{
    echo '<style type="text/css">
        .attachment-266x266, .thumbnail img {
             width: 100% !important;
             height: auto !important;
        }
        </style>';
}

add_action('admin_head', 'fix_svg');



// function fix_elementor_addons_check()
// {
//     if (class_exists('Elementor\Modules\Home\Transformations\Filter_Plugins')) {
//         // Hook into the method that processes add-ons
//         add_filter('elementor/add_ons/filter', 'fix_elementor_add_ons_array', 10, 1);
//     }
// }

// function fix_elementor_add_ons_array($add_ons)
// {
//     // Check if $add_ons is an array before processing
//     if (!is_array($add_ons)) {
//         $add_ons = []; // Initialize an empty array to avoid errors
//     }

//     // Return the modified $add_ons array
//     return $add_ons;
// }

// add_action('wp_loaded', 'fix_elementor_addons_check');

// function disable_elementor_transformations()
// {
//     remove_action('elementor/frontend/transformations', ['Elementor\Modules\Home\Transformations\Filter_Plugins', 'transform']);
// }
// add_action('wp_loaded', 'disable_elementor_transformations');


function estimated_reading_time($atts)
{
    global $post;

    $content = get_post_field('post_content', $post->ID);

    $word_count = str_word_count(strip_tags($content));

    $reading_time = ceil($word_count / 260);

    if ($reading_time == 1) {
        $timer = " minute read";
    } else {
        $timer = " minutes read";
    }
    $total_reading_time = $reading_time . $timer;
    return $total_reading_time;
}

add_shortcode('reading_time', 'estimated_reading_time');
