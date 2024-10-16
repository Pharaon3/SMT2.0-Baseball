// Variables Init
let ball_x = 475, ball_y = 505;
let homeTeamName, awayTeamName;
let teamNames = [];
let ball_pos = [[0.5, 0.5, 0, ["", ""], 0], [0.5, 0.5, 0, ["", ""], 0]];
let current_step = 1;       // current step of event
let current_time_per_event = 0;       // it's initialized to 0 at the beginning of each event.
let kick_or_bounce = 0; // 0: kick, 1: bounce, 2: hidden
let prev_x = 0.5, prev_y = 0.5, next_x = 0.5, next_y = 0.5;
let homeScore = 0, awayScore = 0;
let gameTime = 0;
let isTimerRunning = 1;
let startTime;
let eventTexts = [["", ""], ["", ""]];
let setlastposx = 0, setlastposy = 0;
let hasXYpos = false;
let currentBallPossessionTeam = 1; // 1: home, 2: away
let rectId = 0, currentRectId = 0; // 0: none, 1: homeSafe, 2: homeAttack, 3: homeDangerousAttack, -3: awaySafe, -2: awayAttack, -1: awayDangerousAttack;

let noTimeRunningState = 0; // 0: default, running, 1: match not started, 2: half time, 3: match ended, 4: other.
let matchStartTime;

var lineX = [
    mapnx(0.5, 0.5),
    mapnx(0.5, 0.5),
    mapnx(0.5, 0.5),
    mapnx(0.5, 0.5)
]
var lineY = [
    mapny(0.5, 0.5),
    mapny(0.5, 0.5),
    mapny(0.5, 0.5),
    mapny(0.5, 0.5)
]

// ball_pos = [
//     [0.5, 0.5],
//     [0.5, 0.1],
//     [0.1, 0.1],
//     [0.1, 0.1],
//     [0.1, 0.1],
//     [0.1, 0.1],
//     [0.1, 0.5]
// ]