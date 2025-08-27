if (!$) {
  $ = jQuery;
}

$(document).ready(function () {
  $("#post_loop_title .elementor-button-text").each(function () {
    const postLoopBtn = $(this).text();
    const maxWord = 2;
    const trim = postLoopBtn.split(" ").slice(0, maxWord).join(" ") + "...";
    $(this).text("View ".trim);
  });

  $("#ageForm #toggleAgeSection").on("click", function (e) {
    if (e.target.id === "toggleAgeSection") {
      $("#ageForm #ageCalcSection").slideToggle(300);
    }
  });
});
