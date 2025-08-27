if (!$) {
  $ = jQuery;
}

$(document).ready(function () {
  let $day = $("#birthDay");
  let $month = $("#birthMonth");
  let $year = $("#birthYear");
  let $hour = $("#birthHour");
  let $minute = $("#birthMinute");
  let $amPm = $("input[name='am_pm']");
  let $timezone = $("#timezone");
  let $targetHour = $("#targetHour");
  let $targetMinute = $("#targetMinute");
  let $target_am_pm = $("input[name='target_am_pm']");
  let $targetDay = $("#targetDay");
  let $targetMonth = $("#targetMonth");
  let $targetYear = $("#targetYear");
  let $ageField = $("#calculatedAge");
  let $resultContainer = $(".result-container");

  let currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1500; y--)
    $year.append(`<option value="${y}">${y}</option>`);
  for (let m = 1; m <= 12; m++)
    $month.append(`<option value="${m}">${m}</option>`);
  for (let d = 1; d <= 31; d++)
    $day.append(`<option value="${d}">${d}</option>`);

  for (let m = 1; m <= 12; m++)
    $targetMonth.append(`<option value="${m}">${m}</option>`);
  for (let d = 1; d <= 31; d++)
    $targetDay.append(`<option value="${d}">${d}</option>`);

  for (let h = 1; h <= 12; h++)
    $hour.append(`<option value="${h}">${h}</option>`);
  for (let m = 0; m < 60; m++) {
    let val = m < 10 ? "0" + m : m;
    $minute.append(`<option value="${val}">${val}</option>`);
  }

  for (let h = 1; h <= 12; h++)
    $targetHour.append(`<option value="${h}">${h}</option>`);
  for (let m = 0; m < 60; m++) {
    let val = m < 10 ? "0" + m : m;
    $targetMinute.append(`<option value="${val}">${val}</option>`);
  }

  let timezones = Intl.supportedValuesOf
    ? Intl.supportedValuesOf("timeZone")
    : [];
  timezones.forEach((tz) =>
    $timezone.append(`<option value="${tz}">${tz}</option>`)
  );
  $timezone.val(Intl.DateTimeFormat().resolvedOptions().timeZone);

  function calculateExactAge() {
    let day = parseInt($day.val());
    let month = parseInt($month.val());
    let year = parseInt($year.val());
    let hour = parseInt($hour.val()) || 0;
    let minute = parseInt($minute.val()) || 0;
    let amPm = $amPm.filter(":checked").val() || "AM";

    let targetDayVal = parseInt($targetDay.val()) || new Date().getDate();
    let targetMonthVal =
      parseInt($targetMonth.val()) || new Date().getMonth() + 1;
    let targetYearVal = parseInt($targetYear.val()) || new Date().getFullYear();

    if (!day || !month || !year) return null;

    // Convert hour for AM/PM
    if (hour === 12) hour = amPm === "AM" ? 0 : 12;
    else if (amPm === "PM") hour += 12;

    // Birth date UTC
    let birthUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

    // Target date UTC (set to midnight)
    let targetUTC = new Date(
      Date.UTC(targetYearVal, targetMonthVal - 1, targetDayVal, 0, 0, 0)
    );

    // Apply timezone
    let tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;
    let birthDate = new Date(
      birthUTC.toLocaleString("en-US", { timeZone: tz })
    );
    let targetDate = new Date(
      targetUTC.toLocaleString("en-US", { timeZone: tz })
    );

    // Compute age
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

  // On submit button click
  $("#ageForm").on("submit", function (e) {
    e.preventDefault();
    displayAge();

    // Reset fields to current values
    let now = new Date();
    $year.val(now.getFullYear());
    $month.val(now.getMonth() + 1);
    $day.val(now.getDate());
    $hour.val(12);
    $minute.val("00");
    $amPm.filter("[value='AM']").prop("checked", true);
    $targetYear.val(now.getFullYear());
    $targetMonth.val(now.getMonth() + 1);
    $targetDay.val(now.getDate());

    if ($resultContainer.length)
      $("html, body").animate(
        { scrollTop: $resultContainer.offset().top - 50 },
        300
      );
  });

  // Initialize default values
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
});
