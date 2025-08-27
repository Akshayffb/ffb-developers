<?php

/**
 * The template for displaying the header
 *
 * @package HelloElementor Child
 */
if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

$viewport_content = apply_filters('hello_elementor_viewport_content', 'width=device-width, initial-scale=1');
$enable_skip_link = apply_filters('hello_elementor_enable_skip_link', true);
$skip_link_url    = apply_filters('hello_elementor_skip_link_url', '#content');
?>
<!doctype html>
<html <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="<?php echo esc_attr($viewport_content); ?>">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

	<?php wp_body_open(); ?>

	<?php if ($enable_skip_link) { ?>
		<a class="skip-link screen-reader-text" href="<?php echo esc_url($skip_link_url); ?>">
			<?php echo esc_html__('Skip to content', 'hello-elementor'); ?>
		</a>
	<?php } ?>

	<?php
	// Keep Elementor compatibility
	if (! function_exists('elementor_theme_do_location') || ! elementor_theme_do_location('header')) {
		if (hello_elementor_display_header_footer()) {

			// 🔹 Instead of loading template part, insert your custom header here
			$is_editor   = isset($_GET['elementor-preview']);
			$site_name   = get_bloginfo('name');
			$tagline     = get_bloginfo('description', 'display');
			$header_class = did_action('elementor/loaded') ? hello_get_header_layout_class() : '';
			$menu_args   = [
				'theme_location' => 'menu-1',
				'fallback_cb'    => false,
				'container'      => false,
				'echo'           => false,
			];
			$header_nav_menu = wp_nav_menu($menu_args);
	?>
			<header id="site-header" class="site-header custom-header dynamic-header <?php echo esc_attr($header_class); ?>">
				<div class="e-con fullwidth">
					<div class="e-con-inner header-inner">

						<div class="site-branding">
							<?php if (has_custom_logo()) : ?>
								<div class="site-logo"><?php the_custom_logo(); ?></div>
							<?php endif; ?>

							<div class="site-info">
								<?php if ($site_name) : ?>
									<p class="site-title">
										<a href="<?php echo esc_url(home_url('/')); ?>" rel="home"><?php echo esc_html($site_name); ?></a>
									</p>
								<?php endif; ?>

								<?php if (!$tagline) : ?>
									<p class="site-tagline"><?php echo esc_html($tagline); ?></p>
								<?php endif; ?>
							</div>
						</div>

						<?php if ($header_nav_menu) : ?>
							<nav class="site-navigation" aria-label="<?php echo esc_attr__('Main menu', 'hello-elementor'); ?>">
								<?php echo $header_nav_menu; ?>
							</nav>
						<?php endif; ?>

						<div class="mobile-menu-btn">
							<a href="<?php echo esc_url(home_url('/emi-calculator')); ?>" class="btn btn-primary">
								EMI Calculator
							</a>
						</div>

					</div>
				</div>
			</header>
	<?php
		}
	}
