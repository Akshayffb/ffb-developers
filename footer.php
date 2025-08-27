<?php

/**
 * The template for displaying the footer
 *
 * @package HelloElementor Child
 */
if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

// Elementor footer override check
if (! function_exists('elementor_theme_do_location') || ! elementor_theme_do_location('footer')) {
	if (hello_elementor_display_header_footer()) {

		$is_editor    = isset($_GET['elementor-preview']);
		$site_name    = get_bloginfo('name');
		$tagline      = get_bloginfo('description', 'display');
		$footer_class = did_action('elementor/loaded') ? hello_get_footer_layout_class() : '';

		$footer_nav_menu = wp_nav_menu([
			'theme_location' => 'menu-2',
			'fallback_cb'    => false,
			'container'      => false,
			'echo'           => false,
		]);
?>

		<footer id="site-footer" class="site-footer custom-footer dynamic-footer <?php echo esc_attr($footer_class); ?>">
			<div class="e-con fullwidth">
				<div class="e-con-inner footer-inner">

					<div class="footer-branding">
						<?php if (has_custom_logo()) : ?>
							<div class="site-logo"><?php the_custom_logo(); ?></div>
						<?php endif; ?>

						<?php if ($site_name) : ?>
							<div class="site-title">
								<a href="<?php echo esc_url(home_url('/')); ?>" rel="home">
									<?php echo esc_html($site_name); ?>
								</a>
							</div>
						<?php endif; ?>
					</div>

					<?php if ($footer_nav_menu) : ?>
						<div class="footer-menu">
							<nav class="site-navigation" aria-label="<?php echo esc_attr__('Footer menu', 'hello-elementor'); ?>">
								<?php echo $footer_nav_menu; ?>
							</nav>
						</div>
					<?php endif; ?>

				</div>
				<div class="footer-bottom">
					<div class="copyright">
						<p>© Copyright <?php echo date('Y'); ?>. All Rights Reserved.</p>
					</div>
				</div>
			</div>
		</footer>
<?php
	}
}
?>

<?php wp_footer(); ?>
</body>

</html>