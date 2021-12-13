// ------------------------
// Codeabschnitt, der für die Verarbeitung der Eingabe zuständig ist
'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});

process.stdin.on('end', _ => {
    inputString = inputString.trim().split('\n').map(string => {
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
 * 
 * Notizen für das Protokoll:
 * * "niedrigste Bewertung soll so hoch wie möglich sein" ==> Lara & Paul wollen die 5 besten Hotels haben ?!?
 * 
 * Methode 1: (Bis zur 360 Minuten Marke (maximale Fahrtzeit an einem Tag) alle Hotels betrachten und das beste Hotel erstmal wählen. 
 * ==> Für jeden Tag bis man die maximalen Nächte (5) erreicht hat)
 * 
 * Methode 2: Von jedem Hotel, das man am ersten Tag erreichen könnte alle Möglichkeiten ausprobieren und speichern 
 * & am Ende mit der besten Durchschnittsbewertung nehmen
 * 
 * Dann betrachtet man die Hotels und schaut inwiefern die
 */

var hotelNum;
var totalTime;
var buffer;

// Menge aller zur Wahl stehenden Hotels
var hotels = []

// Alle Hotelkombinationen, die zum Ziel führen in der gegebenen Zeit
var combinations = [];

function main() {
    // Anzahl aller Hotels
    hotelNum = +readline();

    // Fahrtzeit in Minuten
    totalTime = +readline();

    // Zeit die wir über haben, falls man in 5 Tagen die maximalen Fahrzeit fährt
    buffer = 360 * 5 - totalTime
    
    var hotelsInReachOnFirstDay = [];

    for(var i = 0;i<hotelNum;i++){
        // info[0] = Entfernung, info[1] = Bewertung
        let information = readline().split(" ")

        // Umwandlung in int zwecks einfacherer Umrechnung
        information[0] = +information[0]
    
        // Filtert alle Hotels, die am ersten Tag erreicht werden können & fügt sie einem Array hinzu
        if(information[0] <= 360){
            hotelsInReachOnFirstDay.push(information)
        }

        hotels.push(information);
    }

    

    for(var x of hotelsInReachOnFirstDay){
        let currentCombinationPath = []
        currentCombinationPath.push(x)

        // Startet den Algorithmus, der alle Kombinationen beginnend von einem der am ersten Tag erreichbaren Hotels, berechnet.  
       findNextHotel(currentCombinationPath)
    }

    // Hotel mit höherer durchschnittlicher Bewertung wählen 
    // ==> bei Gleichstand Kombination mit konsistenteren Bewertungen wählen (Abstand zwischen Maximum & Minimum).
    combinations.sort((a, b) => {
        let diff = a[a.length - 2] - b[b.length - 2]

        // Falls die Bewertungen gleich groß scheinen sollten, wähle den konsistenteren Datensatz aus
        if(diff == 0){   
           return a[a.length - 1] - b[b.length - 1]
        } else {
            return diff;
        }
    });

    // Die besten 3 Kombinationen ausgeben (absteigend)
    console.log(combinations.slice(Math.max(combinations.length - 3, 0)).reverse())
}

// Rekursiver Algorithmus, der letztlich das nächste mögliche Hotel, 
// ausgehend von dem derzeitigen Stand gegeben durch den Funktionsparameter, berechnet.
function findNextHotel(currentCombinationPath) {
    // Zeit, die man schon gefahren ist
    let timeTraveled = currentCombinationPath[currentCombinationPath.length - 1][0]
    
    // Hotels, die man erreichen könnte vom jetzigen Stand aus
    let hotelsInReach = hotels.filter(x => x[0] > timeTraveled && x[0] <= timeTraveled + 360)

    // Falls die schon gereiste Zeit + die Zeit, die man einem Tag fahren könnte >= die benötigte Zeit ist, 
    // wird keine Übernachtung mehr benötigt und der Kombinationspfad als fertig betrachtet.
    if(timeTraveled + 360 >= totalTime){
        // Berechne die durchschnittliche Bewertung sowie den Bereich der Werte, um nicht im Nachhinein ressourcenlastige for-loops durchzuführen
        let range = [0,5];
        let avgRating = currentCombinationPath.reduce((p, c) => {
            // Gleichzeitig der Optimierung halber den minimalen sowie maximalen Wert berechnen 
            if(range[0] < +c[1]){
                range[0] = +c[1]
            }

            if(range[1] > +c[1]){
                range[1] = +c[1]
            }


            return p + +c[1]
        }, 0) / currentCombinationPath.length
        combinations.push(currentCombinationPath.concat([avgRating, range[0] - range[1]]))
        
        // Beenden der Betrachtung weiterer erreichbarer Hotels, da keine Übernachtung mehr benötigt wird. 
        return;
    }

    for(let x of hotelsInReach){
        // Überprüft ob die maximale Zeit, die man bis zu dem Tag hätte fahren können minus die Zeit, die wir gefahren sind
        // kleiner ist als der im Vorhinein berechnete Puffer...
        if((currentCombinationPath.length + 1) * 360 - (x[0]) <= buffer){
            // ... falls ja, dann starte von diesem Hotel aus erneut den Algorithmus
            findNextHotel(currentCombinationPath.concat([x]));
            continue;
        } else {
            // ... falls nein, dann beende den Durchlauf dieses Pfads vorzeitig, da das Ziel nicht mehr erreicht werden kann.
            continue;
        }   
    }
}

// Optimierung
// ==> Ersetzen for for..of loops mit Standard Loops 
// Anstatt Filter Funktionen einfache for loops mit bedingungen & Weglassen des 2. Kriteriums bei Gleichstand keine großen Auswirkungen 
// Betrachtung mithilfe des Chrome Profilers ==> linear hoher Anstieg des Heaps aufgrund der vielen Kombinationen
// ===> letztlich auch OOM Error, wurde nie fertig