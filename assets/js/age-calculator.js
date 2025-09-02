if (typeof $ === "undefined") {
  $ = jQuery;
}

$(document).ready(function () {
  // ========================
  // Cached selectors
  // ========================
  const $day = $("#birthDay"),
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

  const currentYear = new Date().getFullYear();

  // ========================
  // Populate dropdowns
  // ========================
  for (let y = currentYear; y >= 1500; y--) {
    $year.append(`<option value="${y}">${y}</option>`);
  }

  for (let m = 1; m <= 12; m++) {
    const label = `${String(m).padStart(2, "0")} - ${monthNames[m - 1]}`;
    $month.add($targetMonth).append(`<option value="${m}">${label}</option>`);
  }

  for (let h = 1; h <= 12; h++) {
    $hour.add($targetHour).append(`<option value="${h}">${h}</option>`);
  }

  for (let m = 0; m < 60; m++) {
    const val = m.toString().padStart(2, "0");
    $minute.add($targetMinute).append(`<option value="${val}">${val}</option>`);
  }

  // ========================
  // Days population
  // ========================
  function loadDays($daySelect, month, year) {
    const prevVal = $daySelect.val();
    const daysInMonth = new Date(year, month, 0).getDate();
    $daySelect.empty().append(`<option value="">Day</option>`);
    for (let d = 1; d <= daysInMonth; d++) {
      $daySelect.append(`<option value="${d}">${d}</option>`);
    }
    if (prevVal && prevVal <= daysInMonth) $daySelect.val(prevVal);
  }

  loadDays($day, new Date().getMonth() + 1, currentYear);
  loadDays($targetDay, new Date().getMonth() + 1, currentYear);

  $month
    .add($year)
    .change(() =>
      loadDays($day, +$month.val() || 1, +$year.val() || currentYear)
    );
  $targetMonth
    .add($targetYear)
    .change(() =>
      loadDays(
        $targetDay,
        +$targetMonth.val() || 1,
        +$targetYear.val() || currentYear
      )
    );

  // ========================
  // Timezones
  // ========================
  const tzList = Intl.supportedValuesOf
    ? Intl.supportedValuesOf("timeZone")
    : [];
  tzList.forEach((tz) => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName").value;
    $timezone.append(`<option value="${tz}">${tz} (${offset})</option>`);
  });
  $timezone.val(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // ========================
  // Utility functions
  // ========================
  function getDateInTimezone(year, month, day, hour, minute, tz) {
    const utcDate = new Date(year, month - 1, day, hour, minute);
    const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { utcDate, formatted: formatter.format(utcDate), timeZone };
  }

  function to24Hour(hourVal, ampm) {
    let h = parseInt(hourVal, 10) || 0;
    if (h === 12) return ampm === "AM" ? 0 : 12;
    return ampm === "PM" ? h + 12 : h;
  }

  const formatWithCommas = (num) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ========================
  // Age calculations
  // ========================
  function calculateExactAge() {
    const day = +$day.val(),
      month = +$month.val(),
      year = +$year.val();
    if (!day || !month || !year) return null;

    const amPm = $amPm.filter(":checked").val() || "AM";
    const hour = to24Hour($hour.val(), amPm);
    const minute = +$minute.val() || 0;

    const targetDay = +$targetDay.val() || new Date().getDate();
    const targetMonth = +$targetMonth.val() || new Date().getMonth() + 1;
    const targetYear = +$targetYear.val() || new Date().getFullYear();
    const targetAmPm = $target_am_pm.filter(":checked").val() || "AM";
    const targetHour = to24Hour($targetHour.val(), targetAmPm);
    const targetMinute = +$targetMinute.val() || 0;

    const tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const birthDate = getDateInTimezone(
      year,
      month,
      day,
      hour,
      minute,
      tz
    ).utcDate;
    const targetDate = getDateInTimezone(
      targetYear,
      targetMonth,
      targetDay,
      targetHour,
      targetMinute,
      tz
    ).utcDate;

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
      days += new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        0
      ).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days, hours, minutes, tz };
  }

  function calcDiffDetailed(fromDate, toDate) {
    let diff = {
      years: toDate.getFullYear() - fromDate.getFullYear(),
      months: toDate.getMonth() - fromDate.getMonth(),
      days: toDate.getDate() - fromDate.getDate(),
      hours: toDate.getHours() - fromDate.getHours(),
      minutes: toDate.getMinutes() - fromDate.getMinutes(),
      seconds: toDate.getSeconds() - fromDate.getSeconds(),
    };

    if (diff.seconds < 0) {
      diff.seconds += 60;
      diff.minutes--;
    }
    if (diff.minutes < 0) {
      diff.minutes += 60;
      diff.hours--;
    }
    if (diff.hours < 0) {
      diff.hours += 24;
      diff.days--;
    }
    if (diff.days < 0) {
      diff.days += new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        0
      ).getDate();
      diff.months--;
    }
    if (diff.months < 0) {
      diff.months += 12;
      diff.years--;
    }

    return diff;
  }

  // ========================
  // Display Age
  // ========================
  let liveTimer = null;
  let savedBirthDate = null;
  let savedUserDob = "";
  let savedTz = "";

  function displayAge() {
    const ageCalc = calculateExactAge();
    if (!ageCalc) {
      $ageField.val("");
      return $resultContainer.html("<p>Please select a valid birthday.</p>");
    }

    const formatParts = (parts) =>
      parts
        .filter(([val]) => val > 0)
        .map(([val, label]) => `${val} ${label}${val > 1 ? "s" : ""}`)
        .join(" ") || "0 minutes";

    const birthHour24 = to24Hour(
      $hour.val(),
      $amPm.filter(":checked").val() || "AM"
    );

    const birthMinute = +$minute.val() || 0;
    savedTz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    savedBirthDate = getDateInTimezone(
      +$year.val(),
      +$month.val(),
      +$day.val(),
      birthHour24,
      birthMinute,
      savedTz
    ).utcDate;

    savedUserDob = new Date(
      +$year.val(),
      +$month.val() - 1,
      +$day.val(),
      birthHour24,
      birthMinute
    ).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: savedTz,
    });

    function updateLive() {
      $("#result_image").hide();
      $resultContainer.show();

      const now = new Date();
      const ageDetailed = calcDiffDetailed(savedBirthDate, now);

      let nextBirthday = new Date(
        now.getFullYear(),
        savedBirthDate.getMonth(),
        savedBirthDate.getDate(),
        savedBirthDate.getHours(),
        savedBirthDate.getMinutes(),
        savedBirthDate.getSeconds() || 0
      );
      if (nextBirthday <= now) nextBirthday.setFullYear(now.getFullYear() + 1);

      const nextBdayDiff = calcDiffDetailed(now, nextBirthday);

      const diffMs = now - savedBirthDate;
      const totalMinutes = Math.floor(diffMs / 60000);
      const totalHours = Math.floor(diffMs / 3600000);
      const totalDays = Math.floor(diffMs / 86400000);
      const totalMonthsExact = ageDetailed.years * 12 + ageDetailed.months;

      const html = `
        <div class="age-result">
          <div class="current-age"><p>Your age is..</p>
            <p>${formatParts([
              [ageDetailed.years, "year"],
              [ageDetailed.months, "month"],
              [ageDetailed.days, "day"],
              [ageDetailed.hours, "hour"],
              [ageDetailed.minutes, "minute"],
            ])}</p>
          </div>
          <div class="born-on"><p>You were born on..</p><p>${savedUserDob}</p></div>
          <div class="next-birth"><p>Your Next birthday in:</p>
            <p>${formatParts([
              [nextBdayDiff.years, "year"],
              [nextBdayDiff.months, "month"],
              [nextBdayDiff.days, "day"],
              [nextBdayDiff.hours, "hour"],
              [nextBdayDiff.minutes, "minute"],
            ])}</p>
          </div>
          <div class="total-age"><p>Your total age in:</p>
            <p>${[
              [totalMonthsExact, "month"],
              [totalDays, "day"],
              [totalHours, "hour"],
              [totalMinutes, "minute"],
            ]
              .filter(([val]) => val > 0)
              .map(
                ([val, label]) =>
                  `${formatWithCommas(val)} ${label}${val > 1 ? "s" : ""}`
              )
              .join(" ")}</p>
          </div>
        </div>`;

      $resultContainer.html(html);
      $ageField.val(
        `${ageDetailed.years} years, ${ageDetailed.months} months, ${ageDetailed.days} days`
      );
    }

    // updateLive();
    if (liveTimer) clearTimeout(liveTimer);
    minuteSync(updateLive);
  }

  // ========================
  // Sync real time
  // ========================
  function minuteSync(updatefn) {
    function scheduleNext() {
      const now = new Date();
      const msToNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      liveTimer = setTimeout(() => {
        updatefn();
        scheduleNext();
      }, msToNextMinute);
    }

    updatefn();
    scheduleNext();
  }

  // ========================
  // Events
  // ========================
  $("#toggleAgeSection").click(() => $("#ageCalcSection").slideToggle(300));

  $("#ageForm").submit((e) => {
    e.preventDefault();
    displayAge();
    if ($resultContainer.length) {
      $("html, body").animate(
        { scrollTop: $resultContainer.offset().top - 50 },
        300
      );
    }
  });

  // ========================
  // Default values
  // ========================
  const today = new Date();
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
