function load() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = Number(urlParams.get('id'));
  socket = new WebSocket("ws://80.79.6.111:3443/websocket/1.0/xb_receiver/");
  socket.onopen = function (e) {
    //socket.send(JSON.stringify({r:"authenticate", a:{key:"*******"}}));
    socket.send(JSON.stringify({ r: "subscribe_event", a: { id: eventId } }));
  };

  socket.onmessage = function (e) {
    var data = JSON.parse(e.data);
    if (data?.d && data.d[eventId]) {
      if (data.wm == 'u') { // It's update information
        updateEvent(data.d[eventId])
      } else if (data.wm == 'f') { // It's init information
        initEvent(data.d[eventId]);
      } else if (data.wm == 'rm') {// It's the end time I think
        stopMatch();
      }
    }
  };

  countdown();
}

function updateEvent(data) {
  console.log("data: ", data);
  if (data.gcd) {
    if (data.gcd.XY) {
      hasXYpos = true;
      let x = parseFloat(data.gcd.XY.split(",")[0]);
      let y = parseFloat(data.gcd.XY.split(",")[1]);
      if (x > 1.5) x = x / 100;
      if (y > 1.5) y = y / 100;
      setBallByXY(data.gcd.PG, x, y);
      setlastposx = x;
      setlastposy = y;
    }
    if (data.gcd.VC) {
      setBallByVC(data.gcd.VC, data.gcd.PG);
    }
  }
  initBaseball(data);
}
function countdown() {
  var interval = setInterval(function () {
    current_time_per_event += 1 / (eventPeriod / framePeriod);
    if (current_time_per_event >= 1) {    // It's time to set next event
      initEachEvent()
    }
    if (isTimerRunning == 0) {
      if (startTime) {
        let newDate = new Date;
        gameTime = Math.floor(newDate.getTime() / 1000) - startTime;
        showTime(gameTime);
      }
    } else {
      resetState();
      resetAction();
      if (noTimeRunningState == 1) {
        var now = new Date();
        var difference = now - matchStartTime;
        var seconds = Math.floor((difference / 1000) % 60);
        var minutes = Math.floor((difference / (1000 * 60)) % 60);
        var hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        // setEventLabel(["Match Not Started", `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`], 1, null);
        setEventLabel(["Match Not Started", "0-0"], 1, null);
      }
      if (noTimeRunningState == 2) {
        setEventLabel(["Half Time", homeScore + "-" + awayScore], 1, null);
      }
    }
  }, framePeriod)
}
function setBallByXY(playerName="", x, y, eventTexts, stateType = 0, detail) { // stateType 0: no text, 1: center text, 2: ball text
  ball_pos.push([x, y, currentBallPossessionTeam, eventTexts, stateType, detail, playerName]);
}

function initEachEvent() {
  current_time_per_event = 0;
  if (ball_pos.length > current_step + 1) {
    current_step++;
  } else if (ball_pos.length) {
    // bounceBall(current_step);
  }
}