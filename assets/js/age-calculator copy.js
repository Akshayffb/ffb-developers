if (!$) {
  $ = jQuery;
}

$(document).ready(function () {
  let $day = $("#day");
  let $month = $("#month");
  let $year = $("#year");
  let $hour = $("#birthHour");
  let $minute = $("#birthMinute");
  let $amPm = $("input[name='am_pm']");
  let $timezone = $("#timezone");
  let $targetDate = $("#targetDate");
  let $ageField = $("#calculatedAge");

  // Populate years 1900-3100
  for (let y = 3100; y >= 1900; y--)
    $year.append(`<option value="${y}">${y}</option>`);

  // Populate hours 1-12
  for (let h = 1; h <= 12; h++)
    $hour.append(`<option value="${h}">${h}</option>`);

  // Populate minutes 00-59
  for (let m = 0; m < 60; m++) {
    let val = m < 10 ? "0" + m : m;
    $minute.append(`<option value="${val}">${val}</option>`);
  }

  // Populate IANA timezones
  let timezones = Intl.supportedValuesOf("timeZone");
  timezones.forEach((tz) =>
    $timezone.append(`<option value="${tz}">${tz}</option>`)
  );

  // Default timezone = user local
  $timezone.val(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Default target date = today
  $targetDate.val(new Date().toISOString().split("T")[0]);

  function updateDayOptions() {
    let m = parseInt($month.val());
    let y = parseInt($year.val());
    if (!m || !y) {
      $day.html('<option value="">Day</option>');
      return;
    }
    let daysInMonth = new Date(y, m, 0).getDate();
    let options = '<option value="">Day</option>';
    for (let d = 1; d <= daysInMonth; d++)
      options += `<option value="${d}">${d}</option>`;
    $day.html(options);
  }

  function calculateExactAge() {
    let day = parseInt($day.val());
    let month = parseInt($month.val());
    let year = parseInt($year.val());
    let hour = parseInt($hour.val()) || 0;
    let minute = parseInt($minute.val()) || 0;
    let amPm = $amPm.filter(":checked").val() || "AM";
    let tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!day || !month || !year) return null;

    // Convert hour based on AM/PM
    if (hour === 12) hour = amPm === "AM" ? 0 : 12;
    else if (amPm === "PM") hour += 12;

    // Birth date UTC
    let birthUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

    // Target date
    let targetInput = $targetDate.val();
    let now = targetInput ? new Date(targetInput) : new Date();

    // Convert both to selected timezone
    let options = { timeZone: tz };
    let birthDate = new Date(birthUTC.toLocaleString("en-US", options));
    let nowDate = new Date(now.toLocaleString("en-US", options));

    // Compute exact years, months, days
    let years = nowDate.getFullYear() - birthDate.getFullYear();
    let months = nowDate.getMonth() - birthDate.getMonth();
    let days = nowDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      let prevMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years,
      months,
      days,
      birthDate,
      timezone: tz,
      hour,
      minute,
      amPm,
      targetDate: nowDate,
    };
  }

  function updateAgeField() {
    let obj = calculateExactAge();
    if (!obj) {
      $ageField.val("");
      return null;
    }
    $ageField.val(`${obj.years} years, ${obj.months} months, ${obj.days} days`);
    return obj;
  }

  // Event listeners
  [$month, $year, $day, $hour, $minute, $amPm, $timezone, $targetDate].forEach(
    ($el) => $el.on("change input", updateAgeField)
  );

  // Defaults
  let today = new Date();
  $year.val(today.getFullYear());
  $month.val(today.getMonth() + 1);
  updateDayOptions();
  $day.val(today.getDate());
  $hour.val(12);
  $minute.val("00");
  $amPm.filter("[value='AM']").prop("checked", true);
  updateAgeField();
});
