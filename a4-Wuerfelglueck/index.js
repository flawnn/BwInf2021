// ------------------------
// Codeabschnitt, der für die Verarbeitung der Eingabe zuständig ist
"use strict";

process.stdin.resume();
process.stdin.setEncoding("utf-8");

let inputString = "";
let currentLine = 0;

process.stdin.on("data", (inputStdin) => {
  inputString += inputStdin;
});

process.stdin.on("end", (_) => {
  inputString = inputString
    .trim()
    .split("\n")
    .map((string) => {
      return string.trim();
    });

  main();
});

function readline() {
  return inputString[currentLine++];
}
// ---------------------------

/**
 * Usage (Linux/Unix): cat input.txt | node index.js
 */

function main() {
  var diceCount = +readline();

  var dices = [];

  for (let i = 0; i < diceCount; i++) {
    let diceInput = readline().split(" ");

    // dices[x][1] = Summe aller Gewinnwahrwscheinlichkeiten
    dices.push([diceInput, 0]);
  }

  // For-Schleife zur Kombinationsbestimmung
  for (let i = 0; i < diceCount; i++) {
    let x = i;
    while (x < diceCount) {
      if (x != i) {
        let result = simulateGames(dices[i][0], dices[x][0]);

        // Addieren der jeweiligen Gewinnwahrscheinlichkeiten aus dem Spiel
        dices[i][1] += result[1]
        dices[x][1] += result[2]
      }

      x++;
    }
  }

  dices.sort((a, b) => b[1] - a[1])

  // Ausgeben der Ergebnisse
  console.log("Würfel-Bestenliste:")
  dices.forEach((x,i) => console.log(`${i + 1}. ${x[0][0]} Seiten -> : ${x[0].slice(1).join(" ")}; ${(x[1] / (dices.length - 1) * 100).toFixed(2) + '%'}`))
}

// Simuliere (mehrere) Spiele zwischen Spielern mit diesen Würfeln, bis die relativen Häufigkeiten der Spiele nicht mehr signifikant steigen
// gibt ein Array mit true bzw. false zurück, falls Spieler 1 mit Würfel 1 bzw. Spieler 2 mit Würfel 2 gewonnen hat
function simulateGames(dice1, dice2) {
  // wins[0] = Siege Würfel 1, wins[1] = Siege Würfel 2
  let wins = [0, 0];
  let playedGames = 0;

  // Letzte relative Häufigkeit von der Gewinnwahrscheinlichkeit von Würfel 1 & 2
  let lastWinPercentage = [0, 0];

  while (true) {
    let gameResult;
    if ((playedGames + 1) % 2 == 0) {
      gameResult = playGame(dice1, dice2, true);
    } else {
      gameResult = playGame(dice1, dice2, false);
    }

    // Egal wie das Spiel ausgegangen ist, wird die Spielanzahl um 1 erhöht
    playedGames++;

    // Sieganzahl um 1 erhöhen, falls wir kein Unentschieden haben
    if (gameResult != 0) {
      wins[gameResult - 1]++;
    }

    // Prüfung, ob Abweichung zwischen Wahrscheinlichkeiten ist kleiner als 0.5% & beide Spieler gleich oft anfangen durften
    // ==> Falls ja, Stoppen mit weiteren Spielen & Ausgabe des Ergebnis
    if (
      Math.abs(
        lastWinPercentage[gameResult - 1] - wins[gameResult - 1] / playedGames
      ) < 0.005 &&
      playedGames % 2 == 0 &&
      playedGames >= 15
    ) {
      break;
    } else {
      lastWinPercentage[gameResult - 1] = wins[gameResult - 1] / playedGames;
    }
  }

  // Zurückgeben der auf 2 Nachkommastellen gerundeten Wahrscheinlichkeiten sowie den Gewinner
  return [wins[1] > wins[0] ? false: true, Math.round((wins[0] / playedGames) * 100) / 100, Math.round((wins[1] / playedGames) * 100) / 100]
}

// Je nachdem, ob Würfel 1 starten soll, wird true bzw. false als Argument angegeben bei dice1Begins
// gibt true bzw. false zurück, wenn der Gewinner Würfel 1 bzw. 2 ist; 0 bei einem Unentschieden
function playGame(dice1, dice2, dice1Begins) {
  // Spielfeld
  let board = new Array(40).fill(0);

  // Besetzung der Felder
  board[0] = [1, 0];
  board[20] = [2, 0];

  // Verbleibende Steine der Spieler;
  // leftPieces[0] = Steine des Spieler 1, leftPieces[1] = Steine des Spieler 2
  let leftPieces = [3, 3];

  // jeweiligen Zielfelder der Spieler
  let goalFields = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  let turnNumber = 1;

  // Array, um festzuhalten, wann welcher Spieler keine Zugmöglichkeit mehr hat.
  let isStuck = [false, false];

  // Falls Würfel 1 nicht beginnen soll, wird turnNumber auf 2 gesetzt, da bei geraden Zahlen Würfel 1 spielt & ungeraden Zahlen Würfel 2
  if (!dice1Begins) {
    turnNumber = 2;
  }

  // Gameloop; jede Iteration 1 Spielzug (inkl. Würfel)
  while (true) {
    let dice;

    // Kennzeichner auf dem jeweiligen Spielfeld
    let mark;

    // Index des Anfangsfeld des Spielers (ausgehend von board)
    let startField;

    // Falls Zugnummer ungerade ist, spielt Spieler 1, sonst Spieler2
    if (turnNumber % 2 != 0) {
      dice = dice1;
      mark = 1;
      startField = 0;
    } else {
      dice = dice2;
      mark = 2;
      startField = 20;
    }

    // isStuck wieder auf false setzen, falls nun doch ein Zug möglich sein sollte
    isStuck[mark - 1] = false;

    let diceThrow = simulateDiceThrow(dice);

    if (diceThrow == 6) {
      if (leftPieces[mark - 1] > 0) {
        if (board[startField] != 0) {
          if (board[startField][0] == mark) {
            // Falls das 6.te Feld nach dem Startfeld auch besetzt sein sollte, kann man keine weitere Figur hinausbringen
            if (board[startField + 6][0] != mark) {
              // Falls es von keiner gegnerischer Figur besetzt ist ==> Nutzen des Zugs um neue Figur bzw. blockierende Figur weiterzuziehen
              if (board[startField + 6][0] != 3 - mark) {
                board[startField + 6] = [mark, 6];
                leftPieces[mark - 1]--;

                // Vorzeitiges Beenden dieser Iteration, da er nun erneut würfeln darf.
                continue;
              } else {
                // Falls es von einer gegnerischer Figur besetzt ist ==> schlagen
                board[startField + 6] = [mark, 6];
                leftPieces[mark - 1]--;

                // Steinanzahl des anderen Spielers um 1 erhöhen, da seine Figur geschlagen wurde
                leftPieces[2 - mark]++;

                // Vorzeitiges Beenden dieser Iteration, da er nun erneut würfeln darf.
                continue;
              }
            }
          } else {
            board[startField] = [mark, 0];
            leftPieces[mark - 1]--;
            leftPieces[2 - mark]++;
          }
        } else {
          board[startField] = [mark, 0];
          leftPieces[mark - 1]--;
        }
      }
    }

    // Bestimmen aller auf dem Feld verbleibenden Stücke
    let pieces = [];

    board.forEach((x, i) => {
      if (x != 0) {
        if (x[0] == mark) {
          pieces.push(i);
        }
      }
    });

    // Sortieren der Steine nach ihrem Fortschritt auf dem Spielfeld
    if (mark == 1) {
      pieces = pieces.sort((a, b) => b - a);
    } else {
      pieces = pieces.sort((a, b) => {
        a = 21 - a;
        b = 21 - b;

        if (a <= 0) {
          a = 40 - Math.abs(a);
        }

        if (b <= 0) {
          b = 40 - Math.abs(b);
        }

        return a < b ? -1 : 1;
      });
    }

    // Alle freien Felder in den Zielfeldern
    let freeFields = [];

    for (let l = 0; l < goalFields[mark - 1].length; l++) {
      if (goalFields[mark - 1][l] == 0) {
        freeFields.push(l + 1);
      }
    }

    // Durchgehen durch alle auf dem Spielfeld findbaren Steine, startend mit dem vordersten
    check: for (var z = 0; z < pieces.length; z++) {
      let piece = pieces[z];

      // Falls ein Stein schon eine Runde vollendet hat, darf er nicht mehr gezogen werden
      if (board[piece][1] == 40) {
        if (diceThrow <= 4 && diceThrow > 0) {
          for (let field of freeFields) {
            if (field == diceThrow) {
              goalFields[mark - 1][diceThrow - 1] = mark;
              board[piece] = 0;
              break check;
            }
          }
        }
        continue;
      } else {
        // Überprüfen, ob das Ende des "Spielfelds" erreicht wurde
        if (piece + diceThrow < 40) {
          // Falls das Ende nicht erreicht wurde, wird überprüft ob man das Anfangsfeld überspringt
          // (Wird allerdings nur bei Spieler 2 der Fall sein, da bei Spieler 1 ein Überspringen des Feldes (ohne schon auf dem Anfangsfeld zu sein) 
          // nur mit dem Erreichen des Endes vom Spielfeld einhergeht)
          if (board[piece][1] + diceThrow > 40) {
            let remainingFieldsInGoal = piece + diceThrow - startField;

            // Überprüfen ob die verbleibende Zahl zu ziehen klein genug ist
            // Falls sie zu groß ist, verfällt der Zug für diesen Stein
            if (remainingFieldsInGoal <= 4 && remainingFieldsInGoal > 0) {
              for (let field of freeFields) {
                if (field == remainingFieldsInGoal) {
                  goalFields[mark - 1][remainingFieldsInGoal - 1] = mark;
                  board[piece] = 0;
                  break check;
                }
              }
            }
            continue;
          }

          // Überprüfen,ob das Feld besetzt ist...
          if (board[piece + diceThrow] != 0) {
            // falls ja, ...
            if (board[piece + diceThrow][0] == mark) {
              // ... wird bei Besetzung durch seine eigene Figur die Schleife fortgesetzt, da kein Zug mit dieser Figur möglich ist
              continue;
            } else {
              // ... wird bei Besetzung durch eine gegnerische Figur geschlagen
              board[piece + diceThrow] = [mark, board[piece][1] + diceThrow];
              board[piece] = 0;
              leftPieces[2 - mark]++;

              break check;
            }
          } else {
            board[piece + diceThrow] = [mark, board[piece][1] + diceThrow];
            board[piece] = 0;
            break check;
          }
        } else {
          // Felder, die man ziehen muss nach Erreichen des "Ende" des Spielfelds
          let remainingFields = piece + diceThrow - 40;

          // Falls die übrigen Felder nicht das Zielfeld überschreiten, als normalen Zug ausführen
          if (remainingFields <= startField) {
            // Überprüfen,ob das Feld besetzt ist...
            if (board[remainingFields] != 0) {
              // falls ja, ...
              if (board[remainingFields][0] == mark) {
                // ... wird bei Besetzung durch seine eigene Figur die Schleife fortgesetzt, da kein Zug mit dieser Figur möglich ist
                continue;
              } else {
                // ... wird bei Besetzung durch eine gegnerische Figur geschlagen
                board[remainingFields] = [mark, board[piece][1] + diceThrow];
                board[piece] = 0;
                leftPieces[2 - mark]++;

                break check;
              }
            } else {
              board[remainingFields] = [mark, board[piece][1] + diceThrow];
              board[piece] = 0;

              break check;
            }
          } else {
            let remainingFieldsInGoal = remainingFields - startField;

            if ((remainingFieldsInGoal <= 4) & (remainingFieldsInGoal > 0)) {
              for (let field of freeFields) {
                if (field == remainingFieldsInGoal) {
                  goalFields[mark - 1][remainingFieldsInGoal - 1] = mark;
                  board[piece] = 0;
                  break check;
                }
              }
            }
            continue;
          }
        }
      }
    }

    // Falls die Zählvariable z == pieces.length, bedeutet das, dass man keine der Figuren auf
    // dem Spielfeld (ausgeschlossen der Zielfelder) ziehen kann
    // ==> Falls man mit keinem der Figuren auf dem Zielfeld ziehen kann, wird gar nichts gezogen
    control: if (z == pieces.length) {
      var i;
      var x = 0;
      for (i = 0; i < 4; i++) {
        // Falls das derzeitige Feld nicht belegt ist, skippen, da nichts gezogen werden kann
        if (goalFields[mark - 1][i] != mark) {
          continue;
        }

        // Berechnen freier Felder nach einem belegten Zielfeld
        x = 0;
        while (true) {
          if (goalFields[mark - 1][x + i + 1] == mark || x + i + 1 > 3) {
            break;
          } else {
            x++;
          }
        }

        if (x > 0) {
          if (diceThrow <= x) {
            goalFields[mark - 1][x + i] = mark;
            goalFields[mark - 1][i] = 0;

            break control;
          }

          // Die Schleife kann abgebrochen werden, da die Anzahl der freien Felder nicht überboten werden
          //==> (X0X0) (Anzahl 1), (X00X, 0X00) (Anzahl 2), (X000) (Anzahl 3)
          break;
        }
      }

      // Falls die Felderanzahl nicht mehr gewürfelt werden kann, kann man überprüfen
      // ob der Spieler "feststeckt", also ausser durch eine Interaktion des Gegners
      // sich nicht mehr bewegen kann
      if (
        !dice
          .slice(1, dice.length)
          .some(
            (y) =>
              (+y == x && x != 0) ||
              freeFields.includes(+y - (40 - board[pieces[0]]?.[1])) ||
              (40 - board[pieces[0]]?.[1] >= +y &&
                0 < 40 - board[pieces[0]]?.[1])
          ) &&
        leftPieces[mark - 1] == 0
      ) {
        isStuck[mark - 1] = true;
      }
    }

    // Falls der Spieler eine 6 gewürfelt hatte, ist er immernoch dran und darf daher erneut würfeln
    if (diceThrow != 6) {
      turnNumber++;
    }

    // Überprüfen, ob Spieler gewonnen hat
    let goalFieldsFull = !goalFields[mark - 1].some((x) => x == 0);

    if (goalFieldsFull) {
      return mark;
    }

    // Falls beide Spieler nicht mehr ziehen können sollten ==> Unentschieden
    if (!isStuck.some((X) => X == false)) {
      return 0;
    }
  }
}

// Gibt eine zufällig ausgewählte Zahl, ausgehend der Seiten eines Würfels, zurück
// Da es sich um ein Laplace-Experiment handelt und es gleichwahrscheinlich ist jede Seite zu würfeln, muss man hier nicht die Wahrscheinlichkeiten
// der einzelnen würfelbaren Zahlen ausrechnen, sondern zufällig eine Zahl zwischen 1 und der Seitenanzahl bestimmen und die Zahl dieser "Seite" zurückgeben
function simulateDiceThrow(dice) {
  let sides = dice[0];

  let rndmNum = Math.floor(Math.random() * sides) + 1;

  return +dice[rndmNum];
}
