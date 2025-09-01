if (!$) {
  $ = jQuery;
}

$(document).ready(function () {
  function drawClock() {
    const canvas = document.getElementById("analogClock");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function renderClock() {
      // Set canvas width/height based on CSS
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.save(); // Save current state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);

      drawFace(radius);
      drawNumbers(radius);
      drawTime(radius);

      ctx.restore(); // Restore state
    }

    function drawFace(radius) {
      ctx.beginPath();
      ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
      ctx.fillStyle = "#333";
      ctx.fill();
    }

    function drawNumbers(radius) {
      ctx.font = radius * 0.15 + "px Arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let num = 1; num <= 12; num++) {
        const ang = (num * Math.PI) / 6;
        const x = radius * 0.85 * Math.sin(ang);
        const y = -radius * 0.85 * Math.cos(ang);
        ctx.fillText(num.toString(), x, y);
      }
    }

    function drawTime(radius) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();

      // Hour
      let hourPos =
        ((hour % 12) * Math.PI) / 6 +
        (minute * Math.PI) / (6 * 60) +
        (second * Math.PI) / (360 * 60);
      drawHand(hourPos, radius * 0.5, radius * 0.06);

      // Minute
      let minutePos = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
      drawHand(minutePos, radius * 0.75, radius * 0.04);

      // Second
      let secondPos = (second * Math.PI) / 30;
      drawHand(secondPos, radius * 0.85, radius * 0.02, "red");
    }

    function drawHand(pos, length, width, color = "black") {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.moveTo(0, 0);
      ctx.rotate(pos);
      ctx.lineTo(0, -length);
      ctx.stroke();
      ctx.rotate(-pos);
    }

    setInterval(renderClock, 1000);
    renderClock();
  }

  // Digital clock + location
  function updateDigitalClock() {
    const now = new Date();
    const digital = now.toLocaleTimeString("en-US", { hour12: true });
    $("#digitalClock").text("Digital Time: " + digital);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || "en-US";

    let country = "";
    try {
      country = new Intl.DisplayNames([locale], { type: "region" }).of(
        tz.split("/")[0].toUpperCase()
      );
    } catch (e) {
      country = "Unknown";
    }

    $("#locationInfo").html(
      `Timezone: ${tz}<br>Locale: ${locale}<br>Country: ${country}`
    );
  }

  drawClock();
  setInterval(updateDigitalClock, 1000);
  updateDigitalClock();
});
