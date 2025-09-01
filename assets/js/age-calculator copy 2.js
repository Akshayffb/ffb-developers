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
    console.log("getDateInTimezone called with:", {
      year,
      month,
      day,
      hour,
      minute,
      tz,
    });

    // const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
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

    console.log("Generated UTC date:", utcDate, "Formatted:", formatter);

    return {
      utcDate,
      formatted: formatter.format(utcDate),
      timeZone,
    };
  }

  function to24Hour(hourVal, ampm) {
    let h = parseInt(hourVal, 10) || 0;
    console.log("Converting to 24-hour format:", hourVal, ampm);
    if (h === 12) return ampm === "AM" ? 0 : 12;
    if (ampm === "PM") return h + 12;
    return h;
  }

  function calculateExactAge() {
    console.log("calculateExactAge called");
    let day = parseInt($day.val());
    let month = parseInt($month.val());
    let year = parseInt($year.val());
    let amPm = $amPm.filter(":checked").val() || "AM";
    let hour = to24Hour($hour.val(), amPm);
    let minute = parseInt($minute.val()) || 0;

    console.log("Birth inputs:", { day, month, year, hour, minute, amPm });

    if (!day || !month || !year) return null;

    let targetDayVal = parseInt($targetDay.val()) || new Date().getDate();
    let targetMonthVal =
      parseInt($targetMonth.val()) || new Date().getMonth() + 1;
    let targetYearVal = parseInt($targetYear.val()) || new Date().getFullYear();
    let targetAmPm = $target_am_pm.filter(":checked").val() || "AM";
    let targetHourVal = to24Hour($targetHour.val(), targetAmPm);
    let targetMinuteVal = parseInt($targetMinute.val()) || 0;

    console.log("Target inputs:", {
      targetDayVal,
      targetMonthVal,
      targetYearVal,
      targetHourVal,
      targetMinuteVal,
    });

    let tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log("Using timezone:", tz);

    let birthDate = getDateInTimezone(
      year,
      month,
      day,
      hour,
      minute,
      tz
    ).utcDate;
    let targetDate = getDateInTimezone(
      targetYearVal,
      targetMonthVal,
      targetDayVal,
      targetHourVal,
      targetMinuteVal,
      tz
    ).utcDate;

    console.log("BirthDate UTC:", birthDate, "TargetDate UTC:", targetDate);

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();
    let hours = targetDate.getHours() - birthDate.getHours();
    let minutes = targetDate.getMinutes() - birthDate.getMinutes();

    console.log("Raw diff:", { years, months, days, hours, minutes });

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

    console.log("Adjusted diff:", { years, months, days, hours, minutes });
    return { years, months, days, hours, minutes, tz };
  }

  function calcDiffDetailed(from, to) {
    console.log("calcDiffDetailed called, from:", from, "to:", to);
    let diffMs = to.getTime() - from.getTime();

    if (diffMs < 0)
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0 };

    let remaining = diffMs;

    const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365.25));
    remaining -= years * 1000 * 60 * 60 * 24 * 365.25;

    const months = Math.floor(remaining / (1000 * 60 * 60 * 24 * 30.44));
    remaining -= months * 1000 * 60 * 60 * 24 * 30.44;

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    remaining -= days * 1000 * 60 * 60 * 24;

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    remaining -= hours * 1000 * 60 * 60;

    const minutes = Math.floor(remaining / (1000 * 60));

    console.log("Detailed diff:", { years, months, days, hours, minutes });
    return { years, months, days, hours, minutes };
  }

  let liveInterval;
  function displayAge() {
    clearInterval(liveInterval);

    // verify inputs
    let ageCalc = calculateExactAge();
    if (!ageCalc) {
      $ageField.val("");
      $resultContainer.html("<p>Please select a valid birthday.</p>");
      return;
    }

    // Helpers
    function formatParts(parts) {
      return (
        parts
          .filter(([val]) => val > 0)
          .map(([val, label]) => `${val} ${label}${val > 1 ? "s" : ""}`)
          .join(" ") || "0 minutes"
      );
    }

    // birthDate in selected timezone (same as your code)
    let birthHour24 = to24Hour(
      $hour.val(),
      $amPm.filter(":checked").val() || "AM"
    );
    let birthMinute = parseInt($minute.val()) || 0;
    let tz =
      $timezone.val() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    let birthDate = getDateInTimezone(
      parseInt($year.val()),
      parseInt($month.val()),
      parseInt($day.val()),
      birthHour24,
      birthMinute,
      tz
    ).utcDate;

    // formatted DOB string
    const userDob = new Date(
      parseInt($year.val()),
      parseInt($month.val()) - 1,
      parseInt($day.val()),
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
      timeZone: tz,
    });

    function updateLive() {
      console.log("updateLive tick");

      $("#result_image").hide();
      $resultContainer.show();

      // CURRENT time (always fresh)
      let current = new Date();

      // format "as of" using the selected timezone so user can see which now we used
      let asOf = current.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: tz,
      });

      console.log("As of:", asOf);

      // age using calendar-aware diff (use the same calcDiffDetailed you already added)
      let ageDetailed = calcDiffDetailed(birthDate, current);
      console.log("ageDetailed:", ageDetailed);

      // next birthday (recompute each tick so it stays accurate)
      let nextBirthday = new Date(
        current.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
        birthDate.getHours(),
        birthDate.getMinutes(),
        birthDate.getSeconds() || 0
      );
      if (nextBirthday.getTime() <= current.getTime()) {
        nextBirthday.setFullYear(current.getFullYear() + 1);
      }

      let nextBdayDiff = calcDiffDetailed(current, nextBirthday);
      console.log("nextBdayDiff:", nextBdayDiff);

      // totals (exact)
      let diffMs = current - birthDate;
      let totalMinutes = Math.floor(diffMs / (1000 * 60));
      let totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      let totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let totalMonthsExact = ageDetailed.years * 12 + ageDetailed.months;
      console.log("Totals:", {
        totalMinutes,
        totalHours,
        totalDays,
        totalMonthsExact,
      });
      $ageField.val(
        `${ageDetailed.years} years, ${ageDetailed.months} months, ${ageDetailed.days} days`
      );

      // Build HTML and hide zero parts
      let html = `
      <div class="age-result">
        <div class="as-of"><small>As of: ${asOf} (${tz})</small></div>

        <div class="current-age"><p>Your age is..</p>
          <p>${formatParts([
            [ageDetailed.years, "year"],
            [ageDetailed.months, "month"],
            [ageDetailed.days, "day"],
            [ageDetailed.hours, "hour"],
            [ageDetailed.minutes, "minute"],
          ])}</p>
        </div>

        <div class="born-on"><p>You were born on..</p>
          <p>${userDob}</p>
        </div>

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
          <p>${formatParts([
            [totalMonthsExact, "month"],
            [totalDays, "day"],
            [totalHours, "hour"],
            [totalMinutes, "minute"],
          ])}</p>
        </div>
      </div>
    `;

      $resultContainer.html(html);
      $ageField.val(
        `${ageDetailed.years} years, ${ageDetailed.months} months, ${ageDetailed.days} days`
      );
    }

    updateLive();
    liveInterval = setInterval(updateLive, 60000);
  }

  $("#toggleAgeSection").on("click", function () {
    $("#ageCalcSection").slideToggle(300);
  });

  $("#ageForm").on("submit", function (e) {
    e.preventDefault();
    console.log("Form submitted");
    displayAge();
    if ($resultContainer.length) {
      $("html, body").animate(
        { scrollTop: $resultContainer.offset().top - 50 },
        300
      );
    }
  });

  function formatParts(parts) {
    return parts
      .filter(([val, label]) => val > 0)
      .map(([val, label]) => `${val} ${label}${val > 1 ? "s" : ""}`)
      .join(" ");
  }

  let today = new Date();
  console.log("Setting default inputs:", today);
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
