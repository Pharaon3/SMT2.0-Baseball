// Static functions

function initEvent(data) {
    console.log("data: ", data);
    if (data.s?.n == "Baseball") {
        initBaseball(data);
    }
}

function initBaseball(data) {
    if (data.c1?.n) homeTeamName = data.c1.n;
    if (data.c2?.n) awayTeamName = data.c2.n;
    teamNames['home'] = homeTeamName;
    teamNames['away'] = awayTeamName;
    if (homeTeamName.length > 16) {
        teamNames['home'] = homeTeamName.substr(0, 13) + '...';
    }
    if (awayTeamName.length > 16) {
        teamNames['away'] = awayTeamName.substr(0, 13) + '...';
    }
    $("#headerHome").text(teamNames['home']);
    $("#headerAway").text(teamNames['away']);

    if (data.c1?.k) $(".homePlayerBase").attr("fill", data.c1?.k?.TC);
    if (data.c2?.k) $(".awayPlayerBase").attr("fill", data.c2?.k?.TC);
    let homeKC = data.c1?.k?.KC?.split(",");
    if (homeKC?.length > 3) $(".homePlayerLeftLongSleeve").attr("fill", homeKC[3]);
    if (homeKC?.length > 3) $(".homePlayerRightLongSleeve").attr("fill", homeKC[3]);
    let awayKC = data.c2?.k?.KC?.split(",");
    if (awayKC?.length > 3) $(".awayPlayerLeftLongSleeve").attr("fill", awayKC[3]);
    if (awayKC?.length > 3) $(".awayPlayerRightLongSleeve").attr("fill", awayKC[3]);

    if (data?.ps?.TN?.score) {
        homeScore = data?.ps?.TN?.score?.c1;
        awayScore = data?.ps?.TN?.score?.c2;
        $("#score").text(homeScore + '-' + awayScore);
    }

    for (let i = 1; i < 10; i ++) {
        if (data?.ps?.['' + i]?.['score']){
            $("#homeTable" + i).text(data?.ps?.['' + i]?.['score']['c1']);
            $("#awayTable" + i).text(data?.ps?.['' + i]?.['score']['c2']);
        }
    }

    if (data?.cl) {
        gameTime = data?.cl?.m * 60 + data?.cl?.s;
        showTime(gameTime);
        if (data?.cl?.r == 0) isTimerRunning = data?.cl?.r;
        if (data?.cl?.r) isTimerRunning = data?.cl?.r;
        let newDate = new Date;
        startTime = Math.floor(newDate.getTime() / 1000) - gameTime;
    }

    if (data?.p?.n) {
        $("#period").text(data?.p?.n);
    }

    if (data?.et) {
        matchStartTime = new Date(data?.et);
    }
}
function showTime(showTimeArgument) {
    if (showTimeArgument >= 0) {
        let showTimeMinute = Math.floor(showTimeArgument / 60);
        if (showTimeMinute < 10) showTimeMinute = "0" + showTimeMinute;
        let showTimeSecond = Math.floor(showTimeArgument % 60);
        if (showTimeSecond < 10) showTimeSecond = "0" + showTimeSecond;
        $("#time").text(showTimeMinute + ":" + showTimeSecond);
    }
}
function stopMatch() {
    isTimerRunning = 1;
}



function setCenterFrame(title, content) {
    if (title === "unknown") return;
    title = getString(title);
    $("#center_rect").attr("fill-opacity", 0.5);
    let center_text = capitalizeWords(title.split(" ")).join(" ");
    $("#center_text").text(center_text);
    let titleWidth = $("#center_text").get(0).getBBox().width + 40;
    $("#center_rect").attr("height", 140);
    $("#bottom_text").text(content);
    $("#center_rect").attr("width", Math.max(380, titleWidth));
    $("#center_rect").attr("x", 400 - Math.max(380, titleWidth) / 2);
    if (content === "" || !content) {
        $("#center_text").attr("y", 300);
    } else {
        $("#center_text").attr("y", 280);
    }
}
function resetCenterFrame() {
    $("#center_rect").attr("fill-opacity", 0);
    $("#center_text").text("");
    $("#center_rect").attr("height", 0);
    $("#bottom_text").text("");
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
    for (let i = 1; i <= totalBattingNumber; i++) {
        if (battingState[i - 1] == "") $("#overState" + i).text("-");
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



function setEventLabel(eventTitle, team, detail) {
    if (eventTitle[0] == "") $("#center_rect").attr("fill-opacity", 0);
    else $("#center_rect").attr("fill-opacity", 0.7);
    $("#center_text").text(eventTitle[0]);
    $("#bottom_text").text(eventTitle[1] || teamNames[team == 1 ? "home" : "away"]);
    let textwidth = Math.max($('#center_text')[0].getBoundingClientRect().width, $('#bottom_text')[0].getBoundingClientRect().width, MINTEXTWIDTH) + 40;
    $("#center_rect").attr("x", pitch_center_x - textwidth / 2);
    if (detail?.color) {
        $("#center_text").attr("fill", detail.color);
    } else {
        $("#center_text").attr("fill", DEFAULTCOLOR);
    }
    if (detail?.svg) {
        $("#centerImage").css("display", "block");
        $("#center_rect").attr("width", textwidth + 40 + 70);
        $("#centerrectdiv").attr("x1", pitch_center_x + textwidth / 2);
        $("#centerrectdiv").attr("x2", pitch_center_x + textwidth / 2);
        $("#centerrectdiv").attr("stroke-opacity", 0.5);
        $("#centerImage").attr("href", "./media/" + detail?.svg);
        $("#centerImage").attr("x", pitch_center_x + textwidth / 2 + 20);
    } else {
        $("#centerImage").css("display", "none");
        $("#center_rect").attr("width", textwidth);
        $("#centerrectdiv").attr("stroke-opacity", 0);
    }
}

function resetEventLabel() {
    $("#center_rect").attr("fill-opacity", 0);
    $("#center_text").text("");
    $("#bottom_text").text("");
    $("#centerImage").css("display", "none");
    $("#centerrectdiv").attr("stroke-opacity", 0);
}
function capitalizeWords(arr) {
    return arr.map(word => {
        const firstLetter = word.charAt(0).toUpperCase();
        const rest = word.slice(1).toLowerCase();

        return firstLetter + rest;
    });
}

function setBallByVC(vc, playerName = "") {
    currentBallPossessionTeam = vc[0];
    let y = 0.5;
    if (vc == "11002") {            // Possession
        let x = 0.4;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);
    } else if (vc == "21002") {     // Possession
        let x = 0.6;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);
    } else if (vc == "11004") {     // Cornor kick
        let x = 1;
        y = 1;
        setBallByXY(playerName, x, y, ["Cornor Kick", ""], 2);
    } else if (vc == "21004") {     // Cornor kick
        let x = 0;
        y = 0;
        setBallByXY(playerName, x, y, ["Cornor Kick", ""], 2);
    } else if (vc == "11010") {     // Free kick
        let x = 0.4;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Free kick", ""], 2);
    } else if (vc == "21010") {     // Free kick
        let x = 0.6;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Free kick", ""], 2);
    } else if (vc == "11001") {     // Attack
        let x = 0.6;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);
    } else if (vc == "21001") {     // Attack
        let x = 0.4;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);
    } else if (vc == "11007") {     // Goal kick
        let x = 0.1;
        setBallByXY(playerName, x, y, ["Goal kick", ""], 2);
    } else if (vc == "21007") {     // Goal kick
        let x = 0.9;
        setBallByXY(playerName, x, y, ["Goal kick", ""], 2);
    } else if (vc == "11008") {     // Penalty
        let x = 0.9;
        setBallByXY(playerName, x, y, ["Penalty", ""], 1);
    } else if (vc == "21008") {     // Penalty
        let x = 0.1;
        setBallByXY(playerName, x, y, ["Penalty", ""], 1);
    } else if (vc == "11009") {     // Dangerous Free Kick
        let x = 0.6;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Dangerous Free Kick", ""], 2);
    } else if (vc == "21009") {     // Dangerous Free Kick
        let x = 0.4;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Dangerous Free Kick", ""], 2);
    } else if (vc == "11010") {     // Simple Free Kick
        let x = 0.6;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Simple Free Kick", ""], 2);
    } else if (vc == "21010") {     // Simple Free Kick
        let x = 0.4;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Simple Free Kick", ""], 2);
    } else if (vc == "11024") {     // Throw
        let x = 0.6;
        y = 0;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        } else {
            x = ball_pos[ball_pos.length - 1][0];
        }
        setBallByXY(playerName, x, y, ["Throw", ""], 2);
    } else if (vc == "21024") {     // Throw
        let x = 0.4;
        y = 1;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        } else {
            x = ball_pos[ball_pos.length - 1][0];
        }
        setBallByXY(playerName, x, y, ["Throw", ""], 2);

    } else if (vc == "11003") {     // Goal
        let x = 0.95;
        setBallByXY(playerName, x, y, ["Goal", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-goal.svg",
            "centertextposition": DEFAULTCENTERTEXTPOSITION,
            "bottomtextposition": DEFAULTBOTTOMTEXTPOSITION,
            "svgposition": [600, 420, 70]
        });
    } else if (vc == "21003") {     // Goal
        let x = 0.05;
        setBallByXY(playerName, x, y, ["Goal", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-goal.svg",
            "centertextposition": DEFAULTCENTERTEXTPOSITION,
            "bottomtextposition": DEFAULTBOTTOMTEXTPOSITION,
            "svgposition": [600, 420, 70]
        });

    } else if (vc == "11242") {     // Disallowed Goal
        let x = 0.95;
        setBallByXY(playerName, x, y, ["Disallowed Goal", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-disgoal.svg",
            "centertextposition": DEFAULTCENTERTEXTPOSITION,
            "bottomtextposition": DEFAULTBOTTOMTEXTPOSITION,
            "svgposition": [600, 420, 70]
        });
    } else if (vc == "21242") {     // Disallowed Goal
        let x = 0.05;
        setBallByXY(playerName, x, y, ["Disallowed Goal", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-disgoal.svg",
            "centertextposition": DEFAULTCENTERTEXTPOSITION,
            "bottomtextposition": DEFAULTBOTTOMTEXTPOSITION,
            "svgposition": [600, 420, 70]
        });

    } else if (vc == "11005") {     // Yellow Card
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Yellow Card", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "yellowcard.svg"
        });
    } else if (vc == "21005") {     // Yellow Card
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Yellow Card", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "yellowcard.svg"
        });
    } else if (vc == "11006") {     // Red Card
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Red Card", ""], 1, {
            "color": REDCOLOR,
            "svg": "redcard.svg"
        });
    } else if (vc == "21006") {     // Red Card
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Red Card", ""], 1, {
            "color": REDCOLOR,
            "svg": "redcard.svg"
        });
    } else if (vc == "11011") {     // Shot on target
        let x = 0.9;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Shot on target", ""], 2);
    } else if (vc == "21011") {     // Shot on target
        let x = 0.1;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Shot on target", ""], 2);
    } else if (vc == "11012") {     // Shot off target
        let x = 0.9;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Shot off target", ""], 2);
    } else if (vc == "21012") {     // Shot off target
        let x = 0.1;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Shot off target", ""], 2);
    } else if (vc == "11013") {     // Substitution
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Substitution", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-substitution.svg"
        });
    } else if (vc == "21013") {     // Substitution
        let x = 0.6;
        setBallByXY(playerName, x, y, ["Substitution", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-substitution.svg"
        });
    } else if (vc == "11014") {     // Kick off
        let x = 0.8;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Kick off", ""], 2);
    } else if (vc == "21014") {     // Kick off
        let x = 0.2;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Kick off", ""], 2);
    } else if (vc == "11000") {     // Dangerous Attack
        let x = 0.8;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);
    } else if (vc == "21000") {     // Dangerous Attack
        let x = 0.2;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["", ""], 0);

    } else if (vc == "11234") {     // Off Side
        let x = 0.7;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Off Side", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-offside.svg"
        });
    } else if (vc == "21234") {     // Off Side
        let x = 0.3;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Off Side", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-offside.svg"
        });

    } else if (vc == "1026") {     // Stop Page Time
        let x = 0.5;
        if (hasXYpos) {
            x = setlastposx;
            y = setlastposy;
        }
        setBallByXY(playerName, x, y, ["Stop Page Time", ""], 1);

    } else if (vc == "1015") {     // Half Time
        let x = 0.5;
        setBallByXY(playerName, x, y, ["Half Time", homeScore + "-" + awayScore], 1);

    } else if (vc == "1017") {     // Full Time
        let x = 0.5;
        setBallByXY(playerName, x, y, ["Full Time", homeScore + "-" + awayScore], 1);

    } else if (vc == "11025") {     // Injury
        let x = 0.5;
        setBallByXY(playerName, x, y, ["Injury", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-injury.svg"
        });
    } else if (vc == "21025") {     // Injury
        let x = 0.5;
        setBallByXY(playerName, x, y, ["Injury", ""], 1, {
            "color": DEFAULTCOLOR,
            "svg": "soccer-injury.svg"
        });
    }
}

function displayState(team, playerName = "") {
    // let statePositionX, statePositionY;
    // if (team == 1) {
    //     $('#homeStateLabels').show();
    //     $('#awayStateLabels').hide();
    //     $('#homeName').text(teamNames['home'].toUpperCase());

    //     if (next_y < 0.30) {
    //         statePositionY = 500;
    //     } else if (next_y < 0.60) {
    //         statePositionY = 540;
    //     } else {
    //         statePositionY = 500;
    //     }

    //     if (next_x < 0.50) {
    //         $('#homeState').text('Ball Safe');
    //         statePositionX = 350;
    //     } else if (next_x < 0.75) {
    //         $('#homeState').text('Attacking');
    //         statePositionX = 550;
    //     } else {
    //         $('#homeState').text('Dangerous Attack');
    //         statePositionX = 700;
    //     }

    //     $('#homeStateLabels').attr('transform', 'translate(' + statePositionX + ',' + statePositionY + ')');
    //     if (playerName) {
    //         $('#homeStateBoard').attr('width', Math.max($('#homeName').get(0).getBBox().width, $('#homeState').get(0).getBBox().width) + 90);
    //         $('#homeStateBoard').attr('x', -Math.max($('#homeName').get(0).getBBox().width, $('#homeState').get(0).getBBox().width) - 90);
    //         $("#homePlayerName").text(playerName);
    //         convertTo3Line();
    //     } else {
    //         $('#homeStateBoard').attr('width', Math.max($('#homeName').get(0).getBBox().width, $('#homeState').get(0).getBBox().width) + 70);
    //         $('#homeStateBoard').attr('x', -Math.max($('#homeName').get(0).getBBox().width, $('#homeState').get(0).getBBox().width) - 70);
    //         $("#homePlayerName").text("");
    //         convertTo2Line();
    //     }
    // } else {
    //     $('#homeStateLabels').hide();
    //     $('#awayStateLabels').show();
    //     $('#awayName').text(teamNames['away'].toUpperCase());

    //     if (next_y < 0.30) {
    //         statePositionY = 500;
    //     } else if (next_y < 0.60) {
    //         statePositionY = 540;
    //     } else {
    //         statePositionY = 500;
    //     }

    //     if (next_x < 0.25) {
    //         $('#awayState').text('Dangerous Attack');
    //         statePositionX = 200;
    //     } else if (next_x < 0.50) {
    //         $('#awayState').text('Attacking');
    //         statePositionX = 400;
    //     } else {
    //         $('#awayState').text('Ball Safe');
    //         statePositionX = 550;
    //     }

    //     $('#awayStateLabels').attr('transform', 'translate(' + statePositionX + ',' + statePositionY + ')');
    //     if (playerName) {
    //         $('#awayStateBoard').attr('width', Math.max($('#awayName').get(0).getBBox().width, $('#awayState').get(0).getBBox().width) + 90);
    //         $("#awayPlayerName").text(playerName);
    //         convertTo3Line();
    //     } else {
    //         $('#awayStateBoard').attr('width', Math.max($('#awayName').get(0).getBBox().width, $('#awayState').get(0).getBBox().width) + 70);
    //         $("#awayPlayerName").text("");
    //         convertTo2Line();
    //     }
    // }
}

function resetState() {
    $('#homeStateLabels').hide();
    $('#awayStateLabels').hide();
}
function showAction(gameState) {
    // text, team, x, y
    let text = gameState[3][0];
    let team = gameState[2];
    let playerNAME = gameState[6];
    let x = mapnx(gameState[0], gameState[1]);
    let y = mapny(gameState[0], gameState[1]);
    var centerText = capitalizeWords(text.split(" ")).join('');
    $('#ballState').text(centerText);
    $('#holder').text(teamNames[team == 1 ? "home" : "away"].toUpperCase());
    $('#holderName').text(playerNAME);

    var rectWidth = $('#ballState').get(0).getBBox().width;
    rectWidth = Math.max(rectWidth, $('#holder').get(0).getBBox().width) + 20;

    if (playerNAME) {
        $('#actionBoard').attr('width', rectWidth)
            .attr('height', 75)
            .attr('x', x - rectWidth - 10)
            .attr('y', y - 50 - 10 - 25);

        $('#holder').attr('text-anchor', 'end')
            .attr('x', x - 20)
            .attr('y', y - 12 - 5 - 25);

        $('#holderName').attr('text-anchor', 'end')
            .attr('x', x - 20)
            .attr('y', y - 12 - 5);

        $('#ballState').attr('text-anchor', 'end')
            .attr('x', x - 20)
            .attr('y', y - 37 - 5 - 25);

        $('#stateBoardLine').attr('stroke-opacity', 0.9)
            .attr('x1', x - 15)
            .attr('x2', x - 15)
            .attr('y1', y - 50 - 5 - 25)
            .attr('y2', y - 15);
    } else {
        $('#actionBoard').attr('width', rectWidth)
            .attr('height', 50)
            .attr('x', x - rectWidth - 10)
            .attr('y', y - 50 - 10);

        $('#holder').attr('text-anchor', 'end')
            .attr('x', x - 20)
            .attr('y', y - 12 - 5);

        $('#ballState').attr('text-anchor', 'end')
            .attr('x', x - 20)
            .attr('y', y - 37 - 5);

        $('#stateBoardLine').attr('stroke-opacity', 0.9)
            .attr('x1', x - 15)
            .attr('x2', x - 15)
            .attr('y1', y - 50 - 5)
            .attr('y2', y - 15);
    }
    if (team == 2) {
        $('#actionBoard').attr('x', x + 10);
        $('#holder').attr('text-anchor', 'start')
            .attr('x', x + 20);
        $('#ballState').attr('text-anchor', 'start')
            .attr('x', x + 20);

        $('#stateBoardLine').attr('stroke-opacity', 0.9)
            .attr('x1', x + 15)
            .attr('x2', x + 15);
    }

    if (team == 1) {
        $('#homeKickPolygon').css('fill', 'url(#homeKick)');
        $('#awayKickPolygon').css('fill', 'url(#none)');
        if (gameState[1] < 0.3 && gameState[0] > 0.6) {
            $('#homeKickPolygon').css('fill', 'url(#homeTopKick)');
        }
        if (gameState[1] > 0.7 && gameState[0] > 0.6) {
            $('#homeKickPolygon').css('fill', 'url(#homeBottomKick)');
        }
        var points = $('#homeKickPolygon')[0].points;
        points[0].x = x;
        points[0].y = y;
    } else {
        $('#awayKickPolygon').css('fill', 'url(#awayKick)');
        $('#homeKickPolygon').css('fill', 'url(#none)');
        if (gameState[1] < 0.3 && gameState[0] < 0.6) {
            $('#awayKickPolygon').css('fill', 'url(#awayTopKick)');
        }
        if (gameState[1] > 0.7 && gameState[0] < 0.6) {
            $('#awayKickPolygon').css('fill', 'url(#awayBottomKick)');
        }
        var points = $('#awayKickPolygon')[0].points;
        points[0].x = x;
        points[0].y = y;
    }
}

function resetAction() {
    $('#ballState').text("");
    $('#holder').text("");
    $('#holderName').text("");
    $('#actionBoard').attr('width', 0)
        .attr('height', 0)
    $('#stateBoardLine').attr('stroke-opacity', 0);
    $('#homeKickPolygon').css('fill', 'url(#none)');
    $('#awayKickPolygon').css('fill', 'url(#none)');
}

function convertTo3Line() {
    $("#awayStateBoard").attr("height", 60);
    $("#awayStateBoard").attr("rx", 30);
    $("#awayStateBoard").attr("ry", 30);
    $("#awayStateJerseyCircle").attr("cx", 30);
    $("#awayStateJerseyCircle").attr("cy", 30);
    $("#awayStateJerseyCircle").attr("r", 30);
    $("#awayState").attr("x", 70);
    $("#awayName").attr("x", 70);
    $("#awayJerseyGroup").attr("transform", "scale(0.165)");

    $("#homeStateBoard").attr("height", 60);
    $("#homeStateBoard").attr("rx", 30);
    $("#homeStateBoard").attr("ry", 30);
    $("#homeStateJerseyCircle").attr("cx", -30);
    $("#homeStateJerseyCircle").attr("cy", 30);
    $("#homeStateJerseyCircle").attr("r", 30);
    $("#homeState").attr("x", -70);
    $("#homeName").attr("x", -70);
    $("#homeJerseyGroup").attr("transform", "scale(0.165)");
}

function convertTo2Line() {
    $("#awayStateBoard").attr("height", 40);
    $("#awayStateBoard").attr("rx", 20);
    $("#awayStateBoard").attr("ry", 20);
    $("#awayStateJerseyCircle").attr("cx", 20);
    $("#awayStateJerseyCircle").attr("cy", 20);
    $("#awayStateJerseyCircle").attr("r", 20);
    $("#awayState").attr("x", 50);
    $("#awayName").attr("x", 50);
    $("#awayJerseyGroup").attr("transform", "scale(0.11)");

    $("#homeStateBoard").attr("height", 40);
    $("#homeStateBoard").attr("rx", 20);
    $("#homeStateBoard").attr("ry", 20);
    $("#homeStateJerseyCircle").attr("cx", -20);
    $("#homeStateJerseyCircle").attr("cy", 20);
    $("#homeStateJerseyCircle").attr("r", 20);
    $("#homeState").attr("x", -50);
    $("#homeName").attr("x", -50);
    $("#homeJerseyGroup").attr("transform", "scale(0.11)");
}