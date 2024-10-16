var socket;
var timeInterval = 10;
var miliseconds = 0;
var currentState = 0;
var gameState = new Array();
var matchStartDate;
var match, match_stats;
var innings;
var bestofsets;
var socketLastResponseTime;

var totalBattingNumber;
var battingState = new Array();
var curBat, curPit;
var tAbbr = new Array();
var currentBattNumber;
var isLimitedCov = false;
var atbatNumber = 0;
// var overAtBat = { number: 0, pitchnumber: 0 };
var overAtBat;
var isMiddleOfTheInning = false;
var isatbat = false;

function countdown() {
  var interval = setInterval(function () {
    changeScreenSize();
    if (isLimitedCov)
      setCenterFrame("Limited Coverage", homeScore + " : " + awayScore);
    miliseconds += timeInterval;
    if (matchStartDate) {
      const currentDate = new Date();
      var seconds = Math.floor((matchStartDate - currentDate.getTime()) / 1000);
      seconds = max(seconds, 0);
      var second = seconds % 60;
      var minutes = Math.floor(seconds / 60);
      var minute = minutes % 60;
      var hours = Math.floor(minutes / 60);
      var hour = hours % 24;
      var days = Math.floor(hours / 24);
      if (seconds == 0) {
        setCenterFrame("Match about to start", "");
      } else
        setCenterFrame(
          "Not Started",
          days + "D " + hour + "H " + minute + "M " + second + "S"
        );
      $("#score").text("0 - 0");
    } else if (miliseconds > 2000) {
      stepInitialize();
      miliseconds = 0;
    }
    setBattingState();
    setMatch();
    if (isMiddleOfTheInning && isatbat) {
      setCenterFrame("MIDDLE OF THE INNING", homeScore + " : " + awayScore);
    }
  }, timeInterval);
}
function load() {
  countdown();
  arrangeScoreTable();
  for (let i = 0; i < 20; i++) {
    battingState[i] = "";
  }
  currentBattNumber = 0;
  connect();
}

function connect() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = Number(urlParams.get("id"));

  socket = new WebSocket("ws://80.79.6.111:3443/websocket/1.0/xb_receiver/");
  socket.onopen = function (e) {
    socketLastResponseTime = Date.now();
    socket.send(JSON.stringify({ r: "subscribe_event", a: { id: eventId } }));
  };

  socket.onmessage = function (e) {
    socketLastResponseTime = Date.now();
    var data = JSON.parse(e.data);
    if (data?.d && data.d[eventId]) {
      if (data.wm == 'u') { // It's update information
        handleEventData(data.d[eventId])
      } else if (data.wm == 'f') { // It's init information
        handleInfoData(data.d[eventId]);
      } else if (data.wm == 'rm') {// It's the end time I think
        stopMatch();
      }
    }
  };
}
setInterval(function () {
  if (socketLastResponseTime && Date.now() - socketLastResponseTime > 8000) {
    if (socket) {
      try {
        socket.close();
      } catch (err) {}
    }
    console.log("Reconnecting...");
    connect();
  }
}, 4000);
function max(a, b) {
  if (a > b) return a;
  return b;
}
function setCenterFrame(title, content) {
  if (title == "unknown") return;
  title = getString(title);
  document.getElementById("center_rect").setAttribute("fill-opacity", 0.5);
  center_text = capitalizeWords(title.split(" ")).join(" ");
  document.getElementById("center_text").textContent = center_text;
  titleWidth = document.getElementById("center_text").getBBox().width + 40;
  document.getElementById("center_rect").setAttribute("height", 140);
  document.getElementById("bottom_text").textContent = content;
  document
    .getElementById("center_rect")
    .setAttribute("width", max(380, titleWidth));
  document
    .getElementById("center_rect")
    .setAttribute("x", 400 - max(380, titleWidth) / 2);
  if (content == "" || !content) {
    document.getElementById("center_text").setAttribute("y", 300);
  } else {
    document.getElementById("center_text").setAttribute("y", 280);
  }
}
function resetCenterFrame() {
  document.getElementById("center_rect").setAttribute("fill-opacity", 0);
  document.getElementById("center_text").textContent = "";
  document.getElementById("center_rect").setAttribute("height", 0);
  document.getElementById("bottom_text").textContent = "";
}
function capitalizeWords(arr) {
  return arr.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const rest = word.slice(1).toLowerCase();

    return firstLetter + rest;
  });
}
function stepInitialize() {
  if (!gameState.length) return;
  var teams = match["teams"];
  let lastState = currentState;
  currentState = max(currentState + 1, gameState.length - 10);
  currentState = min(currentState, gameState.length - 1);
  if (currentState == lastState) return;
  if (!isLimitedCov) resetCenterFrame();
  let cs = gameState[currentState];
  if (cs?.batter_count) {
    setBatterBall(cs["batter_count"]["balls"]);
    setBatterStrike(cs["batter_count"]["strikes"]);
    setBatterOuts(cs["batter_count"]["outs"]);
  }
  if (cs?.bases) {
    for (let i = 1; i < 4; i++) {
      if (cs["bases"]["" + i]["occupied"] == false) setBase(i, "");
      else if (cs["bases"]["" + i]["player_id"] == null)
        setBase(i, tAbbr[curBat]);
      else {
        if (curBat == "home" && homePlayers) {
          setBase(
            i,
            abbrevName(homePlayers[cs["bases"]["" + i]["player_id"]]?.name)
          );
        }
        if (curBat == "away" && awayPlayers) {
          setBase(
            i,
            abbrevName(awayPlayers[cs["bases"]["" + i]["player_id"]]?.name)
          );
        }
      }
    }
  }
  if (
    cs?.type != "play_over_baseball" &&
    cs?.type != "player_on_base_x" &&
    cs?.type != "ball" &&
    cs?.type != "strike" &&
    cs?.type != "ball_in_play" &&
    cs?.type != "gumbo_commentary" &&
    cs?.type != "foul_ball" &&
    ((cs?.atbat != overAtBat && overAtBat) || !overAtBat)
  )
    setCenterFrame(getString(cs?.type), teamNames[cs?.team]);
  if (cs?.atbat) {
    isatbat = true;
    if (atbatNumber != cs?.atbat?.number) {
      for (let i = 0; i < 20; i++) battingState[i] = "";
    }
    atbatNumber = cs?.atbat?.number;
    let batter_count = cs?.atbat?.pitchnumber;
    for (let i = batter_count; i < 20; i++) battingState[i] = "";
    currentBattNumber = min(currentBattNumber, batter_count);
    currentBattNumber = max(currentBattNumber, 0);
  }
  if (cs?.type == "play_start_baseball") {
  }
  if (cs?.type == "play_over_baseball") {
    overAtBat = cs?.atbat;
  }
  if (
    cs["advancement_type"] &&
    cs["advancement_type"] != "unknown" &&
    cs["advancement_type"] != "no_advancement" &&
    cs["advancement_type"] != "other_advance" &&
    (cs?.atbat !== overAtBat || !overAtBat)
  ) {
    setCenterFrame(getString(cs["advancement_type"]), teamNames[curBat]);
  }
  if (cs["advancement_type"] == "unknown" && cs?.runner) {
    setCenterFrame(
      getAdvancement(cs?.runner?.ending_base - cs?.runner?.starting_base),
      teamNames[curBat]
    );
  }
  if (cs?.advancement_type) {
    resetBattingState();
    currentBattNumber = 0;
  }
  if (cs["type"] == "half_inning_start") {
    resetState();
  }
  if ( 1
    // cs?.atbat?.number != overAtBat?.number ||
    // cs?.atbat?.pitchnumber != overAtBat?.pitchnumber ||
    // !overAtBat
  ) {
    if (cs["type"] == "batter_out") {
      if (cs["out_type"] && cs.out_type != "unknown")
        setCenterFrame(getString(cs?.out_type), teamNames[curBat]);
      else setCenterFrame("Batter out", teamNames[curBat]);
      resetBattingState();
      currentBattNumber = 0;
    }
    if (cs["type"] == "player_out") {
      if (cs["out_type"] && cs.out_type != "unknown")
        setCenterFrame(getString(cs?.out_type), teamNames[curBat]);
      else setCenterFrame("Player out", teamNames[curBat]);
      if (cs?.player_type && cs?.player_type != "unknown") setCenterFrame(cs?.player_type + " out", teamNames[curBat]);
      resetBattingState();
    }
    if (cs["type"] == "runner_out") {
      if (cs["out_type"] && cs.out_type != "unknown")
        setCenterFrame(getString(cs?.out_type), teamNames[curBat]);
      else setCenterFrame("Runner out", teamNames[curBat]);
      resetBattingState();
    }
    if (cs["type"] == "runners_in_motion") {
      setCenterFrame("Runner in motion", teamNames[curBat]);
    }
    if (cs["type"] == "runner_checked") {
      if (cs?.runner?.playerid)
        setCenterFrame(cs?.name, getName(cs?.runner?.playerid));
      else setCenterFrame(cs["name"], "");
    }
    if (cs["type"] == "run_scored") {
      if (cs?.runner?.playerid)
        setCenterFrame(getString(cs?.run_type), getName(cs?.runner?.playerid));
      else setCenterFrame(getString(cs?.run_type), teamNames[curBat]);
      resetBattingState();
    }
    $("#innerBall").attr("fill-opacity", 0);
    $("#roundBall").attr("fill-opacity", 0);
    $("#rectBallId1").text("");
    $("#rectBallId2").text("");
    if (cs["type"] == "ball") {
      $("#roundBall").attr("fill-opacity", 0.5);
      $("#roundBall").attr("fill", "#0f0");
      if (cs?.atbat?.pitchnumber) {
        battingState[cs?.atbat?.pitchnumber - 1] = "Ball";
        currentBattNumber = cs?.atbat?.pitchnumber;
      } else {
        battingState[currentBattNumber] = "Ball";
        currentBattNumber++;
      }
      $("#rectBallId1").text(currentBattNumber);
    }
    if (cs["type"] == "foul_ball") {
      $("#innerBall").attr("fill-opacity", 0.5);
      $("#innerBall").attr("fill", "#888");
      if (cs?.atbat?.pitchnumber) {
        battingState[cs?.atbat?.pitchnumber - 1] = "Foul";
        currentBattNumber = cs?.atbat?.pitchnumber;
      } else {
        battingState[currentBattNumber] = "Foul";
        currentBattNumber++;
      }
      $("#rectBallId2").text(currentBattNumber);
    }
    if (cs["type"] == "strike") {
      $("#innerBall").attr("fill-opacity", 0.5);
      $("#innerBall").attr("fill", "#f00");
      if (cs?.atbat?.pitchnumber) {
        battingState[cs?.atbat?.pitchnumber - 1] = "Strike";
        if (cs["strike_type"] == "foul_ball") {
          battingState[cs?.atbat?.pitchnumber - 1] = "Foul";
        }
        currentBattNumber = cs?.atbat?.pitchnumber;
      } else {
        battingState[currentBattNumber] = "Strike";
        if (cs["strike_type"] == "foul_ball") {
          battingState[currentBattNumber] = "Foul";
        }
        currentBattNumber++;
      }
      $("#rectBallId2").text(currentBattNumber);
    }
    if (cs["type"] == "gumbo_commentary") {
      console.log("commentary")
      if (cs?.commentary?.length > 40) {
        $("#commentary_text").text(cs?.commentary?.substr(0, 38));
        $("#commentary_text1").text(cs?.commentary?.substr(39, cs?.commentary?.length - 1));
        $("#commentary_rect").attr("height", 60);
      } else {
        $("#commentary_text").text(cs?.commentary);
        $("#commentary_text1").text("");
        $("#commentary_rect").attr("height", 30);
      }
      $("#commentary_rect").attr("fill-opacity", 0.5);
    } else {
      $("#commentary_text").text("");
      $("#commentary_text1").text("");
      $("#commentary_rect").attr("fill-opacity", 0);
    }
    if (cs["type"] == "ball_in_play") {
      // $("#innerBall").attr("fill-opacity", 0.5);
      // $("#innerBall").attr("fill", "#00f");
      // if (cs?.atbat?.pitchnumber) {
      //   battingState[cs?.atbat?.pitchnumber - 1] = "In play";
      //   currentBattNumber = cs?.atbat?.pitchnumber;
      // } else {
      //   battingState[currentBattNumber] = "In play";
      //   currentBattNumber++;
      // }
      // $("#rectBallId2").text(currentBattNumber);
      setCenterFrame("In Play", "")
      resetBattingState();
      currentBattNumber = 0;
    }
    if (cs["type"] == "goal") {
      setCenterFrame("RUN SCORED", teamNames[curBat])
    }
  }
  if (cs?.batter?.playerid && getName(cs?.batter?.playerid)) {
    if (curBat == "home") {
      $("#homeMember").text(getName(cs?.batter?.playerid));
    }
    if (curBat == "away") {
      $("#awayMember").text(getName(cs?.batter?.playerid));
    }
  }
  if (cs?.pitcher?.playerid && getName(cs?.pitcher?.playerid)) {
    if (curPit == "home") {
      $("#homeMember").text(getName(cs?.pitcher?.playerid));
    }
    if (curPit == "away") {
      $("#awayMember").text(getName(cs?.pitcher?.playerid));
    }
  }
  if (cs?.playerid && cs?.player_type && getName(cs?.playerid)) {
    if (cs?.player_type == "batter" || cs?.player_type == "runner")
      $("#" + curBat + "Member").text(getName(cs?.playerid));
  }
}
function setBase(baseNumber, baseMember) {
  if (baseMember) {
    $("#base" + baseNumber).attr("fill-opacity", "0.8");
    $("#base" + baseNumber).attr("fill", "#0f0");
    $("#base" + baseNumber + "Number").attr("fill-opacity", "0.8");
    $("#base" + baseNumber + "Member").text(baseMember);
  } else {
    $("#base" + baseNumber).attr("fill-opacity", "0.2");
    $("#base" + baseNumber).attr("fill", "#fff");
    $("#base" + baseNumber + "Number").attr("fill-opacity", "0.5");
    $("#base" + baseNumber + "Member").text("-");
  }
}
function setBatterBall(ballCount) {
  if (ballCount == 0) {
    $("#ball1").attr("fill-opacity", 0.2);
    $("#ball2").attr("fill-opacity", 0.2);
    $("#ball3").attr("fill-opacity", 0.2);
    $("#ball1").attr("fill", "#fff");
    $("#ball2").attr("fill", "#fff");
    $("#ball3").attr("fill", "#fff");
  }
  if (ballCount == 1) {
    $("#ball1").attr("fill-opacity", 0.8);
    $("#ball2").attr("fill-opacity", 0.2);
    $("#ball3").attr("fill-opacity", 0.2);
    $("#ball1").attr("fill", "#0f0");
    $("#ball2").attr("fill", "#fff");
    $("#ball3").attr("fill", "#fff");
  }
  if (ballCount == 2) {
    $("#ball1").attr("fill-opacity", 0.8);
    $("#ball2").attr("fill-opacity", 0.8);
    $("#ball3").attr("fill-opacity", 0.2);
    $("#ball1").attr("fill", "#0f0");
    $("#ball2").attr("fill", "#0f0");
    $("#ball3").attr("fill", "#fff");
  }
  if (ballCount == 3) {
    $("#ball1").attr("fill-opacity", 0.8);
    $("#ball2").attr("fill-opacity", 0.8);
    $("#ball3").attr("fill-opacity", 0.8);
    $("#ball1").attr("fill", "#0f0");
    $("#ball2").attr("fill", "#0f0");
    $("#ball3").attr("fill", "#0f0");
  }
}
function setBatterStrike(strikeCount) {
  if (strikeCount == 0) {
    $("#strike1").attr("fill-opacity", 0.2);
    $("#strike2").attr("fill-opacity", 0.2);
    $("#strike3").attr("fill-opacity", 0.2);
    $("#strike1").attr("fill", "#fff");
    $("#strike2").attr("fill", "#fff");
    $("#strike3").attr("fill", "#fff");
  }
  if (strikeCount == 1) {
    $("#strike1").attr("fill-opacity", 0.8);
    $("#strike2").attr("fill-opacity", 0.2);
    $("#strike3").attr("fill-opacity", 0.2);
    $("#strike1").attr("fill", "#ff0");
    $("#strike2").attr("fill", "#fff");
    $("#strike3").attr("fill", "#fff");
  }
  if (strikeCount == 2) {
    $("#strike1").attr("fill-opacity", 0.8);
    $("#strike2").attr("fill-opacity", 0.8);
    $("#strike3").attr("fill-opacity", 0.2);
    $("#strike1").attr("fill", "#ff0");
    $("#strike2").attr("fill", "#ff0");
    $("#strike3").attr("fill", "#fff");
  }
  if (strikeCount == 3) {
    $("#strike1").attr("fill-opacity", 0.8);
    $("#strike2").attr("fill-opacity", 0.8);
    $("#strike3").attr("fill-opacity", 0.8);
    $("#strike1").attr("fill", "#ff0");
    $("#strike2").attr("fill", "#ff0");
    $("#strike3").attr("fill", "#ff0");
  }
}
function setBatterOuts(outCount) {
  if (outCount == 0) {
    $("#outs1").attr("fill-opacity", 0.2);
    $("#outs2").attr("fill-opacity", 0.2);
    $("#outs3").attr("fill-opacity", 0.2);
    $("#outs1").attr("fill", "#fff");
    $("#outs2").attr("fill", "#fff");
    $("#outs3").attr("fill", "#fff");
  }
  if (outCount == 1) {
    $("#outs1").attr("fill-opacity", 0.8);
    $("#outs2").attr("fill-opacity", 0.2);
    $("#outs3").attr("fill-opacity", 0.2);
    $("#outs1").attr("fill", "#f00");
    $("#outs2").attr("fill", "#fff");
    $("#outs3").attr("fill", "#fff");
  }
  if (outCount == 2) {
    $("#outs1").attr("fill-opacity", 0.8);
    $("#outs2").attr("fill-opacity", 0.8);
    $("#outs3").attr("fill-opacity", 0.2);
    $("#outs1").attr("fill", "#f00");
    $("#outs2").attr("fill", "#f00");
    $("#outs3").attr("fill", "#fff");
  }
  if (outCount == 3) {
    $("#outs1").attr("fill-opacity", 0.8);
    $("#outs2").attr("fill-opacity", 0.8);
    $("#outs3").attr("fill-opacity", 0.8);
    $("#outs1").attr("fill", "#f00");
    $("#outs2").attr("fill", "#f00");
    $("#outs3").attr("fill", "#f00");
  }
}
function setBattingState() {
  totalBattingNumber = currentBattNumber;
  battingState.map((eachState, index) => {
    // if(eachState){
    $("#overNumber" + (index + 1)).text(index + 1);
    $("#overState" + (index + 1)).text(eachState);
    // }
  });
  if (totalBattingNumber < 6) {
    for (let i = 1; i < 7; i++) {
      $("#overNumber" + i).attr("x", -28 + i * 55);
      $("#overState" + i).attr("x", -28 + i * 55);
      $("#overNumber" + i).attr("font-size", 20);
      $("#overState" + i).attr("font-size", 20);
      $("#overGroup").attr("transform", "translate(460, 150)")
      $("#overBackground").attr("width", "330")
    }
  } else {
    for (let i = 1; i <= totalBattingNumber; i++) {
        $("#overNumber" + i).attr("x", -28 + i * 55);
        $("#overState" + i).attr("x", -28 + i * 55);
        $("#overNumber" + i).attr("font-size", 20);
        $("#overState" + i).attr("font-size", 20);
    }
    let overGroupX = 460 - 55 * (totalBattingNumber - 6)
    let overBackground = 330 + 55 * (totalBattingNumber - 6)
    $("#overGroup").attr("transform", "translate(" + overGroupX + ", 150)")
    $("#overBackground").attr("width", overBackground)
  }
  for (let i = 1; i <= totalBattingNumber; i ++) {
    if(battingState[i - 1] == "") $("#overState" + i).text("-");
  }
  for (let i = totalBattingNumber + 1; i <= 20; i++) {
    $("#overNumber" + i).text("");
    $("#overState" + i).text("");
  }
}
function resetBattingState() {
  currentBattNumber = 0;
  for (let i = 0; i < 20; i++) {
    battingState[i] = "";
    totalBattingNumber = 1;
  }
}
var dob = 0;
var gameState = new Array();
var gameType = new Array();
var newEvents = new Array();
var lastEvents = new Array();
var awayteamname, hometeamname;
var homeScore = 0,
  awayScore = 0,
  periodlength,
  getDataTime;
var teamNames = new Array();
var periodScoreH = new Array();
var periodScoreA = new Array();
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
var homePlayers, awayPlayers;

function handleEventData(data) {
  handleInfoData(data);
  if (data["match"]) match = data["match"];
  if (data?.info?.match) match = data?.info?.match;
  if (data?.stats_match_stats) {
    match_stats = data?.stats_match_stats?.match;
    homePlayers = data?.stats_match_stats?.match?.teams?.home?.players;
    awayPlayers = data?.stats_match_stats?.match?.teams?.away?.players;
  }

  var events = data["events"] || {};

  var newEvents = new Array();
  Object.values(events).forEach((event) => {
    if (
      event?.type != "play_start_baseball" &&
      event?.type != "periodstart" &&
      event?.type != "periodscore"
    )
      newEvents.push(event);
  });
  newEvents.forEach((newEvent) => {
    let flag = 1;
    gameState.forEach((lastEvent) => {
      if (equals(newEvent, lastEvent)) flag = 0;
    });
    if (flag == 1) {
      gameState.push(newEvent);
    }
  });
  lastEvents = newEvents;
}
function handleInfoData(data) {
  var data1 = data.info;
  var jerseys = data1["jerseys"];
  homePlayerColor = jerseys?.home?.player?.sleeve;
  awayPlayerColor = jerseys?.away?.player?.sleeve;
  // homePlayerColor = jerseys["home"]["player"]["sleeve"];
  // awayPlayerColor = jerseys["away"]["player"]["sleeve"];
  $("#homebox").attr("fill", "#" + homePlayerColor);
  $("#awaybox").attr("fill", "#" + awayPlayerColor);
}
function changeScreenSize() {
  screenHeight = window.innerHeight;
  screenWidth = window.innerWidth;

  scale = min(screenWidth / 800, screenHeight / 496);

  document
    .getElementById("scale")
    .setAttribute("transform", "scale(" + scale + ")");
  document.getElementById("svg").setAttribute("width", 800 * scale);
  document.getElementById("svg").setAttribute("height", 496 * scale);
}
function min(a, b) {
  if (a > b) return b;
  return a;
}

function setMatch() {
  if (!match) return;
  if (match?.coverage?.lmtsupport == 2) {
    isLimitedCov = true;
    $("#overBackground").attr("fill-opacity", 0);
  } else isLimitedCov = false;
  bestofsets = match["numberofperiods"];
  var teams = match["teams"];
  periodlength = match["periodlength"];
  var hometeam = teams["home"];
  if (hometeam["name"]) hometeamname = hometeam["name"];
  var awayteam = teams["away"];
  if (awayteam["name"]) awayteamname = awayteam["name"];
  teamNames["home"] = hometeamname;
  teamNames["away"] = awayteamname;
  tAbbr["home"] = match["teams"]["home"]["abbr"];
  tAbbr["away"] = match["teams"]["away"]["abbr"];
  // hometeamname = 'This team name is longer than 19 characters'

  if (hometeamname.length > 15) {
    teamNames["home"] = hometeamname.substr(0, 13) + "...";
  }
  if (awayteamname.length > 15) {
    teamNames["away"] = awayteamname.substr(0, 13) + "...";
  }
  document.getElementById("headerHome").textContent = teamNames["home"];
  document.getElementById("headerAway").textContent = teamNames["away"];
  if (document.getElementById("homeMember").textContent == "")
    document.getElementById("homeMember").textContent = teamNames["home"];
  if (document.getElementById("awayMember").textContent == "")
    document.getElementById("awayMember").textContent = teamNames["away"];
  document.getElementById("homeTableName").textContent = tAbbr["home"];
  document.getElementById("awayTableName").textContent = tAbbr["away"];

  // H and E
  if (match_stats?.teams?.home?.stats?.hitting_hits?.value) {
    $("#homeTableH").text(match_stats?.teams?.home?.stats?.hitting_hits?.value.total);
    $("#awayTableH").text(match_stats?.teams?.away?.stats?.hitting_hits?.value.total);
    $("#homeTableE").text(
      match_stats?.teams?.home?.stats?.fielding_errors_total?.value.total
    );
    $("#awayTableE").text(
      match_stats?.teams?.away?.stats?.fielding_errors_total?.value.total
    );
  }

  // Score Setting
  var result = match["result"];
  if (result["home"] > -1 && result.home != null) homeScore = result["home"];
  if (result["away"] > -1 && result.away != null) awayScore = result["away"];
  $("#score").text(homeScore + " - " + awayScore);
  if (homeScore != null) $("#homeTableR").text(homeScore);
  if (awayScore != null) $("#awayTableR").text(awayScore);
  // Period Score
  let lastperiodscoreH = homeScore;
  let lastperiodscoreA = awayScore;
  if (match["periods"]) {
    for (let i = 1; i <= 9; i++) {
      if (
        match["periods"]["p" + i] &&
        match["periods"]["p" + i]["home"] != null
      ) {
        $("#homeTable" + i).text(match["periods"]["p" + i]["home"]);
        $("#awayTable" + i).text(match["periods"]["p" + i]["away"]);
        lastperiodscoreH -= match["periods"]["p" + i]["home"];
        lastperiodscoreA -= match["periods"]["p" + i]["away"];
      } else {
        $("#homeTable" + i).text(lastperiodscoreH);
        $("#awayTable" + i).text(lastperiodscoreA);
        lastperiodscoreH = "-";
        lastperiodscoreA = "-";
      }
    }
  } else if (homeScore != null && $("#homeTable1").text != "-") {
    $("#homeTable1").text(homeScore);
    $("#awayTable1").text(awayScore);
  }
  // Batting or Pitching
  if (match["livestate"]) {
    if (match?.livestate?.batter?.team == "home") {
      $("#homeRole").text("BATTER");
      $("#awayRole").text("PITCHER");
      curBat = "home";
      curPit = "away";
    }
    if (match?.livestate?.batter?.team == "away") {
      $("#awayRole").text("BATTER");
      $("#homeRole").text("PITCHER");
      curBat = "away";
      curPit = "home";
    }
  }
  // Name
  if(match?.batter?.player?._id) $("#" + curBat + "Member").text(getName(match?.batter?.player?._id));
  if(match?.pitcher?.player?._id) $("#" + curPit + "Member").text(getName(match?.pitcher?.player?._id));
  // Period Setting
  $("#period").text(match?.status?.name);
  if (match?.status?.name == "Ended") {
    setCenterFrame("Match End", homeScore + " : " + awayScore);
    $("#period").text("Ended");
    resetState();
  }
  if (match?.status?.name == "AET") {
    setCenterFrame("Match End", homeScore + " : " + awayScore);
    $("#period").text("Ended");
    resetState();
  }
  if (match?.livestate?.inning_half == "P") {
    setCenterFrame("Middle of the inning", homeScore + " : " + awayScore);
    resetState();
    isMiddleOfTheInning = true
  }
  if (match?.livestate?.inning_half == "T") {
    isMiddleOfTheInning = false
  }
  if (match?.livestate?.inning_half == "B") {
    isMiddleOfTheInning = false
  }
  if (match?.status?.name == "Break") {
    setCenterFrame("Break", homeScore + " : " + awayScore);
    if(innings) $("#period").text(order(innings));
    else $("#period").text("Break");
    resetState();
  }
  if (match?.status?.name == "Not started") {
    $("#period").text("Not Yet");
    const currentDate = new Date();
    upCommingTime = currentDate.getTime() / 1000 - match["updated_uts"];
    // var seconds = Math.floor(updated_uts / 1000)
    var seconds = Math.floor(upCommingTime);
    var minute = Math.floor(seconds / 60);
    var second = seconds % 60;
    // var date = new Date(match['_dt']['date'] + '4:52:48 PM UTC');
    var matchDate = match["_dt"]["date"].split("/");
    var date = new Date(
      matchDate[1] +
        "/" +
        matchDate[0] +
        "/20" +
        matchDate[2] +
        " " +
        match["_dt"]["time"] +
        ":00 UTC"
    );

    matchStartDate = date.getTime();
  } else if (match?.status) matchStartDate = null;
  if (match["p"] >= 31 && match["p"] <= 39) {
    setCenterFrame("End of inning", homeScore + " : " + awayScore);
    if(innings) $("#period").text(order(innings));
    else $("#period").text("Break");
    isMiddleOfTheInning = false;
    resetState();
  }
  if (match?.p > 100) {
    innings = match?.p % 100;
  }
}

function order(params) {
  if (params == 1) return "1st inning";
  if (params == 2) return "2nd inning";
  if (params == 3) return "3rd inning";
  return params + "th inning";
}
function invertHex(hex) {
  return (Number(`0x1${hex}`) ^ 0xffffff).toString(16).substr(1).toUpperCase();
}
function abbrevName(fullName) {
  if (!fullName) return "";
  var split_names = fullName.trim().split(", ");
  if (split_names.length > 1) {
    return split_names[1].charAt(0) + ". " + split_names[0];
  }
  return split_names[0];
}
function getName(playerId) {
  if (!playerId) {
    return "";
  }
  if (homePlayers) {
    let fullName = homePlayers[playerId]?.name;
    if (fullName) return abbrevName(fullName);
  }
  if (awayPlayers) {
    let fullName = awayPlayers[playerId]?.name;
    if (fullName) return abbrevName(fullName);
  }
  return "";
}
function getString(underlinedString) {
  if (!underlinedString) return "";
  let split_strings = underlinedString.trim().split("_");
  if (split_strings.length == 0) return underlinedString;
  let resultString = split_strings[0];
  for (let i = 1; i < split_strings.length; i++) {
    resultString = resultString + " " + split_strings[i];
  }
  return resultString;
}
function getAdvancement(advanceAmount) {
  if (advanceAmount == 1) return "Single";
  if (advanceAmount == 2) return "Double";
  if (advanceAmount == 3) return "Tripple";
  return "";
}
function resetState() {
  resetBattingState();
  currentBattNumber = 0;
  setBase(1, "");
  setBase(2, "");
  setBase(3, "");
  setBatterBall(0);
  setBatterStrike(0);
  setBatterOuts(0);
  $("#innerBall").attr("fill-opacity", 0);
  $("#roundBall").attr("fill-opacity", 0);
  $("#rectBallId1").text("");
  $("#rectBallId2").text("");
  $("#homeMember").text("");
  $("#awayMember").text("");
}
