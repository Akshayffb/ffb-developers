if (typeof $ === "undefined") {
  $ = jQuery;
}

$(document).ready(function () {
  let $day = $("#birthDay"),
    $month = $("#birthMonth"),
    $year = $("#birthYear"),
    $hour = $("#birthHour"),
    $minute = $("#birthMinute"),
    $amPm = $("input[name='am_pm']"),
    $timezone = $("#timezone"),
    $targetHour = $("#targetHour"),
    $targetMinute = $("#targetMinute"),
    $target_am_pm = $("input[name='target_am_pm']"),
    $targetDay = $("#targetDay"),
    $targetMonth = $("#targetMonth"),
    $targetYear = $("#targetYear"),
    $ageField = $("#calculatedAge"),
    $resultContainer = $(".result-container");

  let currentYear = new Date().getFullYear();

  // Populate dropdowns
  for (let y = currentYear; y >= 1500; y--)
    $year.append(`<option value="${y}">${y}</option>`);
  for (let m = 1; m <= 12; m++) {
    $month.append(`<option value="${m}">${m}</option>`);
    $targetMonth.append(`<option value="${m}">${m}</option>`);
  }
  for (let d = 1; d <= 31; d++) {
    $day.append(`<option value="${d}">${d}</option>`);
    $targetDay.append(`<option value="${d}">${d}</option>`);
  }
  for (let h = 1; h <= 12; h++) {
    $hour.append(`<option value="${h}">${h}</option>`);
    $targetHour.append(`<option value="${h}">${h}</option>`);
  }
  for (let m = 0; m < 60; m++) {
    let val = m < 10 ? "0" + m : m;
    $minute.append(`<option value="${val}">${val}</option>`);
    $targetMinute.append(`<option value="${val}">${val}</option>`);
  }

  // Timezones
  let timezones = Intl.supportedValuesOf
    ? Intl.supportedValuesOf("timeZone")
    : [];
  timezones.forEach((tz) =>
    $timezone.append(`<option value="${tz}">${tz}</option>`)
  );
  $timezone.val(Intl.DateTimeFormat().resolvedOptions().timeZone);

  function getDateInTimezone(year, month, day, hour, minute, tz) {
    // Create UTC date first
    let utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    // Convert that UTC into target timezone
    let formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    let parts = formatter.formatToParts(utcDate);
    let map = {};
    parts.forEach((p) => (map[p.type] = p.value));

    return new Date(
      parseInt(map.year),
      parseInt(map.month) - 1,
      parseInt(map.day),
      parseInt(map.hour),
      parseInt(map.minute)
    );
  }

  function calculateExactAge() {
    let day = parseInt($day.val());
    let month = parseInt($month.val());
    let year = parseInt($year.val());
    let hour = parseInt($hour.val()) || 0;
    let minute = parseInt($minute.val()) || 0;
    let amPm = $amPm.filter(":checked").val() || "AM";

    if (!day || !month || !year) return null;

    // Convert birth hour for AM/PM
    if (hour === 12) hour = amPm === "AM" ? 0 : 12;
    else if (amPm === "PM") hour += 12;

    // Target date & time
    let targetDayVal = parseInt($targetDay.val()) || new Date().getDate();
    let targetMonthVal =
      parseInt($targetMonth.val()) || new Date().getMonth() + 1;
    let targetYearVal = parseInt($targetYear.val()) || new Date().getFullYear();
    let targetHourVal = parseInt($targetHour.val()) || 0;
    let targetMinuteVal = parseInt($targetMinute.val()) || 0;
    let targetAmPm = $target_am_pm.filter(":checked").val() || "AM";

    if (targetHourVal === 12) targetHourVal = targetAmPm === "AM" ? 0 : 12;
    else if (targetAmPm === "PM") targetHourVal += 12;

    let tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Build both dates in chosen timezone
    let birthDate = getDateInTimezone(year, month, day, hour, minute, tz);
    let targetDate = getDateInTimezone(
      targetYearVal,
      targetMonthVal,
      targetDayVal,
      targetHourVal,
      targetMinuteVal,
      tz
    );

    // Age difference
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();
    let hours = targetDate.getHours() - birthDate.getHours();
    let minutes = targetDate.getMinutes() - birthDate.getMinutes();

    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      let prevMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        0
      );
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days, hours, minutes, tz };
  }

  function displayAge() {
    let age = calculateExactAge();
    if (!age) {
      $ageField.val("");
      $resultContainer.html("Please select a valid birthday.");
      return;
    }
    let resultText = `${age.years} years, ${age.months} months, ${age.days} days`;
    if (age.hours || age.minutes)
      resultText += `, ${age.hours} hours, ${age.minutes} minutes`;
    resultText += ` (Time zone: ${age.tz})`;

    $ageField.val(resultText);
    $resultContainer.html(resultText);
  }

  // Toggle optional target date
  $("#toggleAgeSection").on("click", function () {
    $("#ageCalcSection").slideToggle(200);
  });

  // On submit
  $("#ageForm").on("submit", function (e) {
    e.preventDefault();
    displayAge();
    if ($resultContainer.length)
      $("html, body").animate(
        { scrollTop: $resultContainer.offset().top - 50 },
        300
      );
  });

  // Initialize defaults
  let today = new Date();
  $year.val(today.getFullYear());
  $month.val(today.getMonth() + 1);
  $day.val(today.getDate());
  $hour.val(12);
  $minute.val("00");
  $amPm.filter("[value='AM']").prop("checked", true);
  $targetYear.val(today.getFullYear());
  $targetMonth.val(today.getMonth() + 1);
  $targetDay.val(today.getDate());
  $targetHour.val(12);
  $targetMinute.val("00");
  $target_am_pm.filter("[value='AM']").prop("checked", true);
});
