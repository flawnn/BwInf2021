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
 */

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var stationaryCars;

function main() {
    // Geparkten Autos
    stationaryCars = readline().split(" ")

    // Verschiebbaren Autos, die waagerecht zu den anderen Autos stehen
    var moveableCars = []

    // Anzahl der verschiebbaren Autos
    let numMCars = +readline();
    
    for(let i = 0; i < numMCars; i++){
        let car = readline().split(" ")

        car[1] = +car[1]

        moveableCars.push(car)
    }

    for(let i = 0; i < alphabet.indexOf(stationaryCars[1]) - alphabet.indexOf(stationaryCars[0]) + 1; i++){
        // Auto, welches hinter dem ausfahrenden Auto möglicherweise steht
        let blockingCar = moveableCars.find(car => car[1] == i || car[1] + 1 == i)
        if(blockingCar){
            let result = findUnblockCombo(i, blockingCar, JSON.parse(JSON.stringify(moveableCars)))
            let output = ""
            if(result){
                // Umkehren des Arrays, damit die einzeln benötigten Verschiebung der Autos in der Reihenfolge sind, in welcher sie durchgeführt werden müssten
                for(let steps of result.reverse()){
                    output += `${steps[0][0]} ${steps[1]} ${steps[2] == "L" ? "Links" : "Rechts"}, `
                }
    
                console.log(`${alphabet[alphabet.indexOf(stationaryCars[0]) + i]}: ${output.slice(0, -2)}`)    
            } else {
                console.log(`${alphabet[alphabet.indexOf(stationaryCars[0]) + i]}: Keine Ausfahrt möglich`)    
            }

        } else {
            console.log(`${alphabet[alphabet.indexOf(stationaryCars[0]) + i]}: Kein Bewegen nötig`)
        }
    }
}

// Versucht aus beiden Möglichkeiten das blockierende Auto zu bewegen (links oder rechts), die beste Kombination zu finden
function findUnblockCombo(carPosition, blockingCar, moveableCars){
    let parkingLotEnd = alphabet.indexOf(stationaryCars[1]) - alphabet.indexOf(stationaryCars[0])

    // Array, in denen die Kombinationen gespeichert werden und aus welchen am Ende die besser gewählt wird
    let moveCombinations = [[],[]]

    // Anzahl der Felder, die man nach links bzw. rechts gehen müsste, damit das Auto frei wird.
    let movesNeeded = [1 + blockingCar[1] - carPosition + 1, 1 + carPosition - blockingCar[1]]
    
    // Bestimmung der Kombination bei einer Bewegung nach rechts 
    if(blockingCar[1] + movesNeeded[1] <= parkingLotEnd){
        // Äußerstes bewegliche Auto
        let furthestNearbyCar = blockingCar
        // Anzahl der Menge der Felder, die die Autos sich wegbewegen müssen
        // (nur wichtig für die Zusammenstellung der Verschiebungen)
        let moveCount = []

        // Felder, die die einzelnen Autos sich bewegen müssen
        let moveCombo = []

        // Verbleibenden Felder, die die weiteren Autos der Kette sich bewegen müssen
        let movesRemaining = movesNeeded[1];

        while(movesRemaining != 0){
            // Bestimmen eines weiteren störenden Autos; Müsste weiter außen sein als das jetzige Auto und auf den zu überquerenden Feldern stehen
            let anotherNearbyCar = moveableCars.find(car => car[1] <= furthestNearbyCar[1] + movesRemaining + 1 && car[1] > furthestNearbyCar[1])
            if(anotherNearbyCar){
                if(anotherNearbyCar[1] - furthestNearbyCar[1] - 1 == 2 && movesRemaining == 2){
                    moveCount.push(movesRemaining)
                    movesRemaining = 1
                } else {
                    moveCount.push(movesRemaining)
                }
                
                furthestNearbyCar = anotherNearbyCar
            } else if(furthestNearbyCar[1] + movesRemaining + 1 > parkingLotEnd){
                // Falls bei keinem störenden Auto der Raum des Parkplatz überschritten würde, kann das blockierende Auto in diese Richtung nicht weggebewegt werden 
                furthestNearbyCar = 0;
                break;
            } else {
                moveCount.push(movesRemaining)
                break;
            }
        }
    
        if(furthestNearbyCar != 0){
            for(let i = blockingCar[1]; i <= furthestNearbyCar[1]; i++){
                let car = moveableCars.find(car => car[1] == i)
                if(car){
                    moveCombo.push([car, moveCount.shift(), "R"])
                }
            }

            moveCombinations[1] = moveCombo
        }
    }

     // Bestimmung der Kombination bei einer Bewegung nach links 
    if(blockingCar[1] - movesNeeded[0] >= 0){
        // Äußerstes bewegliche Auto
        let furthestNearbyCar = blockingCar

        // Anzahl der Menge der Felder, die die Autos sich wegbewegen müssen
        // (nur wichtig für die Zusammenstellung der Verschiebungen)
        let moveCount = []

        // Felder, die die einzelnen Autos sich bewegen müssen
        let moveCombo = []

        // Verbleibenden Felder, die die weiteren Autos der Kette sich bewegen müssen
        let movesRemaining = movesNeeded[0];
        
        while(movesRemaining != 0){
            // Bestimmen eines weiteren störenden Autos; Müsste weiter außen sein als das jetzige Auto und auf den zu überquerenden Feldern stehen
            let anotherNearbyCar = moveableCars.find(car => car[1] == furthestNearbyCar[1] - movesRemaining || car[1] + 1 == furthestNearbyCar[1] - movesRemaining && car[1] < furthestNearbyCar[1])
            if(anotherNearbyCar){
                if(furthestNearbyCar[1] - anotherNearbyCar[1] - 1 == 2 && movesRemaining == 2){
                    moveCount.push(movesRemaining)
                    movesRemaining = 1
                } else {
                    moveCount.push(movesRemaining)
                }

                furthestNearbyCar = anotherNearbyCar
            } else if(furthestNearbyCar[1] - movesRemaining < 0){
                // Falls bei keinem störenden Auto der Raum des Parkplatz überschritten würde, kann das blockierende Auto in diese Richtung nicht weggebewegt werden  
                furthestNearbyCar = 0;
                break;
            } else {
                moveCount.push(movesRemaining)
                break;
            }
        }

        if(furthestNearbyCar != 0){
            for(let i =  blockingCar[1]; i >= furthestNearbyCar[1]; i--){
                let car = moveableCars.find(car => car[1] == i)
                if(car){
                    moveCombo.push([car,moveCount.shift(), "L"])
                }
            }

            moveCombinations[0] = moveCombo
        }
    }

    // Einzelnen Summen der Schritte & Summe der Autos die bewegt werden müssen. 
    if(!moveCombinations.some(comb => comb.length == 0)){
        let scores = []
        for(let comb of moveCombinations){
            let stepSum = 0
            let carsToBeMoved = 0
            for(let step of comb){
                carsToBeMoved++
                stepSum += step[1]
            }
            scores.push([stepSum, carsToBeMoved])
        }
    
        if(scores[0][1] == scores[1][1]){
            return scores[0][0] < scores[1][0] ? moveCombinations[0]: moveCombinations[1]
        } else {
            return scores[0][1] < scores[1][1] ? moveCombinations[0]: moveCombinations[1]
        }
    } else {
        return moveCombinations.find(comb => comb.length != 0)
    }
}