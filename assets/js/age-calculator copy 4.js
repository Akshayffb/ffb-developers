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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let currentYear = new Date().getFullYear();

  // Populate years
  for (let y = currentYear; y >= 1500; y--) {
    $year.append(`<option value="${y}">${y}</option>`);
  }

  // Populate months (number + name)
  for (let m = 1; m <= 12; m++) {
    let label = `${m.toString().padStart(2, "0")} - ${monthNames[m - 1]}`;
    $month.append(`<option value="${m}">${label}</option>`);
    $targetMonth.append(`<option value="${m}">${label}</option>`);
  }

  // Populate hours
  for (let h = 1; h <= 12; h++) {
    $hour.append(`<option value="${h}">${h}</option>`);
    $targetHour.append(`<option value="${h}">${h}</option>`);
  }

  // Populate minutes
  for (let m = 0; m < 60; m++) {
    let val = m < 10 ? "0" + m : m;
    $minute.append(`<option value="${val}">${val}</option>`);
    $targetMinute.append(`<option value="${val}">${val}</option>`);
  }

  // Dynamic days depending on month + year
  function loadDays($daySelect, month, year) {
    let prevVal = $daySelect.val();
    let daysInMonth = new Date(year, month, 0).getDate();
    $daySelect.empty().append(`<option value="">Day</option>`);
    for (let d = 1; d <= daysInMonth; d++) {
      $daySelect.append(`<option value="${d}">${d}</option>`);
    }
    if (prevVal && prevVal <= daysInMonth) {
      $daySelect.val(prevVal);
    }
  }

  // Init days
  loadDays($day, new Date().getMonth() + 1, currentYear);
  loadDays($targetDay, new Date().getMonth() + 1, currentYear);

  // Recalculate days when month/year changes
  $month.add($year).change(() => {
    loadDays(
      $day,
      parseInt($month.val()) || 1,
      parseInt($year.val()) || currentYear
    );
  });
  $targetMonth.add($targetYear).change(() => {
    loadDays(
      $targetDay,
      parseInt($targetMonth.val()) || 1,
      parseInt($targetYear.val()) || currentYear
    );
  });

  // Timezones with UTC offset
  let tzList = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [];
  tzList.forEach((tz) => {
    let now = new Date();
    let fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    let parts = fmt.formatToParts(now);
    let offset = parts.find((p) => p.type === "timeZoneName").value;
    $timezone.append(`<option value="${tz}">${tz} (${offset})</option>`);
  });
  $timezone.val(Intl.DateTimeFormat().resolvedOptions().timeZone);

  function getDateInTimezone(year, month, day, hour, minute, tz) {
    let utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
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

    if (hour === 12) hour = amPm === "AM" ? 0 : 12;
    else if (amPm === "PM") hour += 12;

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

    let birthDate = getDateInTimezone(year, month, day, hour, minute, tz);
    let targetDate = getDateInTimezone(
      targetYearVal,
      targetMonthVal,
      targetDayVal,
      targetHourVal,
      targetMinuteVal,
      tz
    );

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

  $("#toggleAgeSection").on("click", function () {
    $("#ageCalcSection").slideToggle(300);
  });

  $("#ageForm").on("submit", function (e) {
    e.preventDefault();
    displayAge();
    if ($resultContainer.length) {
      $("html, body").animate(
        { scrollTop: $resultContainer.offset().top - 50 },
        300
      );
    }
  });

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
