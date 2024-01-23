// COOL JS GUESSING GAME

// Personal Notes:
// TODO DONATE 1pln
// fail text not updating !!!

const MESSAGE_DEFAULT_PROMPT = 'Input an Integer';
const MESSAGE_GUESS_TOO_HIGH = 'Too High!';
const MESSAGE_GUESS_TOO_LOW = 'Too Low!';
const MESSAGE_GUESS_CORRECT = '!! You Win !!';
const MESSAGE_EXIT_CODE_PLAYER_LEAVE = '- You just left the game! -';
const MESSAGE_EXIT_CODE_UNKNOWN = 'Unknown exit code!'
const MESSAGE_HINT_INTRODUCTION = 'Maybe try:';
const MESSAGE_GUESS_FAIL_COULD_NOT_PARSE = "Sorry! Couldn't parse answer to float!";
const MESSAGE_GUESS_FAIL_EMPTY = 'Please write something!';
const NUMBERS_FORMATTING_MAX_DECIMALS = 3;
const THOUSANDS_SEPARATORS = [',', '_'];
const THOUSANDS_SEPARATORS_IN_MESSAGES_CHARACTER = ',';
const SECRET_NUMBER_MAX = 10;
const SECRET_NUMBER_MAX_ROUNDED = getRoundedFloatToDecimalSpots(SECRET_NUMBER_MAX);
const SECRET_NUMBER_MAX_ROUNDED_THOUSANDS_SEPARATORS = getNumberWithThousandsSeparators(SECRET_NUMBER_MAX_ROUNDED);
const SECRET_NUMBER_LOW = 0;
const SECRET_NUMBER_LOW_ROUNDED = getRoundedFloatToDecimalSpots(SECRET_NUMBER_LOW);
const SECRET_NUMBER_LOW_ROUNDED_THOUSANDS_SEPARATORS = getNumberWithThousandsSeparators(SECRET_NUMBER_LOW_ROUNDED);
const HINTS_ENABLED = true;
const HINTS_UPDATE_GUESSING_RANGE = true;
const HINTS_RANDOMIZE_ROUNDING = true;
const FUN_TRAP_PLAYER_UNTIL_WIN = false;
const EXIT_CODE_PLAYER_LEAVE = 'Exit 1';
let thousandsSeparatorsSearchRegex = undefined; // Lazy loaded
// UNCAUGHT TYPE ERROR ON LINE 82

class GameState {
  constructor(secretNumber) {
    this.secretNumber = getRandomInt(SECRET_NUMBER_LOW, SECRET_NUMBER_MAX);
    this.playerGuess;
    this.currentHighestTooLow = SECRET_NUMBER_LOW;
    this.currentLowestTooHigh = SECRET_NUMBER_MAX;
  };
};


function getRoundedFloatToDecimalSpots(num, decimalSpots) {
  const roundedAsString = num.toFixed(decimalSpots);
  const roundedAsFloat = parseFloat(roundedAsString);
  return roundedAsFloat;
};


function getNumberWithThousandsSeparators(number, thousandsSeparatorsCharacter=THOUSANDS_SEPARATORS_IN_MESSAGES_CHARACTER, thousandsSrparatorsInterval=3) {
  const numberInteger = parseInt(Math.floor(number));
  const numberIntegerStringOriginal = String(numberInteger);
  
  let numberIntegerStringModified = "";
  
  for (let i = 0; i < numberIntegerStringOriginal.length; i++) {
    const negativeIndex = numberIntegerStringOriginal.length - i - 1;
    const negativeIndexCharacter = numberIntegerStringOriginal[negativeIndex];

    numberIntegerStringModified = negativeIndexCharacter + numberIntegerStringModified;

    if ((i + 1) % 3 === 0 && (i + 1) !== numberIntegerStringOriginal.length) {
      numberIntegerStringModified = thousandsSeparatorsCharacter + numberIntegerStringModified;
    };
  };

  const dotFindRegex = /\./;
  
  const numberString = String(number);
  const numberStringIsDecimal = dotFindRegex.test(numberString);
  let numberWithThousandsSeparators;
  
  if (numberStringIsDecimal) {
    const numberStringDecimals = numberString.split('.')[1];
    numberWithThousandsSeparators = `${numberIntegerStringModified}.${numberStringDecimals}`;
  } else {
    numberWithThousandsSeparators = numberIntegerStringModified;
  };

  return numberWithThousandsSeparators;
}; 
// INSERTING COMMAS DOES NOT WORK WITH FLOATS
//  FINISH REFACTORING THE ROUNDED VARIABLE

function getThousandsSeparatorsSearchRegex() {
  if (thousandsSeparatorsSearchRegex === undefined) {
    const separatorsEscaped = regexEscapeListCharacters(THOUSANDS_SEPARATORS);
    const separatorsEscapedJoined = separatorsEscaped.join('');
    const searchPattern = '[' + separatorsEscapedJoined + ']';
    const searchFlags = 'gm';
    thousandsSeparatorsSearchRegex = new RegExp(searchPattern, searchFlags);
  };

  return thousandsSeparatorsSearchRegex;
};


function regexEscapeListCharacters(list) {
  const escapedList = list.map(element => '\\' + element);
  return escapedList;
};


function promptFloatGetFailText(failMessage, failCount) {
  return `${MESSAGE_GUESS_FAIL_EMPTY} (${failCount})`;
};


function promptFloat(promptText, supportThousandsSeparators = true, failCount = 0, failText = undefined) {
  let promptTextModified;
  
  if (failText === undefined) {
    promptTextModified = promptText;
  } else {
    promptTextModified = `${failText}\n${promptText}`;  
  };
  
  const answerRaw = prompt(promptTextModified);
  let answerFormatted

  // If answerRaw is null it means that the user cancelled the prompt

  let trapPlayer = false
  const answerRawIsNull = (answerRaw === null)

  if (FUN_TRAP_PLAYER_UNTIL_WIN) {
    trapPlayer = answerRawIsNull;
  } else if (answerRawIsNull) {
    return EXIT_CODE_PLAYER_LEAVE
  };
  
  if (answerRaw === '' || trapPlayer) {
    failCount++
    failText = promptFloatGetFailText(MESSAGE_GUESS_FAIL_EMPTY, failCount);

    return promptFloat(promptText, supportThousandsSeparators, failCount, failText);
  }

  if (supportThousandsSeparators) {
    const thousandsSeparatorsSearchRegex = getThousandsSeparatorsSearchRegex();
    answerFormatted = answerRaw.replace(thousandsSeparatorsSearchRegex, '');
  } else {
    answerFormatted = answerRaw;
  };

  const parsedFloat = parseFloat(answerFormatted);

  if (isNaN(parsedFloat)) {
    failCount++
    failText = promptFloatGetFailText(MESSAGE_GUESS_FAIL_COULD_NOT_PARSE, failCount);
    
    return promptFloat(promptText, supportThousandsSeparators, failCount, failText);
  };
  
  return parsedFloat;
};


function getRandomlyRoundedNumber(number) {
  const roundingMode = getRandomInt(0,2);

  if (roundingMode === 0) {
    return Math.floor(number);
  } else if (roundingMode === 1) {
    return Math.ceil(number);
  };

  return Math.round(number);
};


function getHintNumber(gameState) {
  const currentPossibleNumbersPool = gameState.currentLowestTooHigh - gameState.currentHighestTooLow;
  const centerOfPossibleNumbers = gameState.currentHighestTooLow + (currentPossibleNumbersPool / 2);

  if (HINTS_RANDOMIZE_ROUNDING) {
    return getRandomlyRoundedNumber(centerOfPossibleNumbers);
  } else {
    return Math.round(centerOfPossibleNumbers);
  };
};


function getHintText(gameState, addThousandsSeparators=true) {
  const hintNumber = getHintNumber(gameState);
  let hintNumberText;
  
  if (addThousandsSeparators) {
    hintNumberText = getNumberWithThousandsSeparators(hintNumber);
  } else {
    hintNumberText = String(hintNumber);
  };

  const hintText = `${MESSAGE_HINT_INTRODUCTION} ${hintNumberText}`;
  return hintText;
};


function getGuess(promptText) {
  // promotFloat may reurn an exit code string!
  return promptFloat(promptText, true);
};


function processGuess(gameState) {
  const playerGuessRounded = getRoundedFloatToDecimalSpots(gameState.playerGuess, NUMBERS_FORMATTING_MAX_DECIMALS);
  const playerGuessRoundedWithThousandsSeparators = getNumberWithThousandsSeparators(playerGuessRounded);
  
  if (gameState.playerGuess > gameState.secretNumber) {
    if (gameState.playerGuess < gameState.currentLowestTooHigh) {
      gameState.currentLowestTooHigh = gameState.playerGuess;
    };

    const retryTextL1 = `${MESSAGE_GUESS_TOO_HIGH} (${playerGuessRoundedWithThousandsSeparators})`;
    retryGuess(gameState, retryTextL1);
    
  } else if (gameState.playerGuess < gameState.secretNumber) {
    if (gameState.playerGuess > gameState.currentHighestTooLow) {
      gameState.currentHighestTooLow = gameState.playerGuess
    };
    
    const retryTextL1 = `${MESSAGE_GUESS_TOO_LOW} (${playerGuessRoundedWithThousandsSeparators})`;
    retryGuess(gameState, retryTextL1);
    
  } else {
    const winText = `${MESSAGE_GUESS_CORRECT} (${playerGuessRoundedWithThousandsSeparators})\n`;
    console.log(winText);
  };
};


function retryGuess(gameState, promptTextL1) {
  let numbersRangeLowestTooHighFormatted;
  let numbersRangeHighestTooLowFormatted;
  
  if (HINTS_UPDATE_GUESSING_RANGE) {
    const currentLowestTooHighRounded = getRoundedFloatToDecimalSpots(gameState.currentLowestTooHigh, NUMBERS_FORMATTING_MAX_DECIMALS);
    const currentLowestTooHighRoundedThousandsSeparators = getNumberWithThousandsSeparators(currentLowestTooHighRounded);
    numbersRangeLowestTooHighFormatted = currentLowestTooHighRoundedThousandsSeparators;
    
    const currentHighestTooLowRounded = getRoundedFloatToDecimalSpots(gameState.currentHighestTooLow, NUMBERS_FORMATTING_MAX_DECIMALS);
    const currentHighestTooLowRoundedThousandsSeparators = getNumberWithThousandsSeparators(currentHighestTooLowRounded);
    numbersRangeHighestTooLowFormatted = currentHighestTooLowRoundedThousandsSeparators;
  } else {
    numbersRangeLowestTooHighFormatted = SECRET_NUMBER_LOW_ROUNDED_THOUSANDS_SEPARATORS;
    numbersRangeHighestTooLowFormatted = SECRET_NUMBER_MAX_ROUNDED_THOUSANDS_SEPARATORS;
  };
  
  const promptTextL2 = `${MESSAGE_DEFAULT_PROMPT} (from ${numbersRangeLowestTooHighFormatted} to ${numbersRangeHighestTooLowFormatted})`;
  let promptTextLines;
  
  if (typeof promptTextL1 === 'undefined') {
    promptTextLines = [promptTextL2];
  } else {
    promptTextLines = [promptTextL1, promptTextL2];
  };

  if (HINTS_ENABLED) {
    const promptTextL3 = getHintText(gameState);
    promptTextLines.push(promptTextL3);
  }

  const promptText = promptTextLines.join('\n');
  const playerGuess = getGuess(promptText);

  if (playerGuess === EXIT_CODE_PLAYER_LEAVE) {
    return EXIT_CODE_PLAYER_LEAVE
  }
  
  gameState.playerGuess = playerGuess;
  processGuess(gameState);
};


function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
};


function startGame() {
  const gameState = new GameState();
  const exitCode = retryGuess(gameState, undefined);

  if (exitCode === EXIT_CODE_PLAYER_LEAVE) {
    console.log(MESSAGE_EXIT_CODE_PLAYER_LEAVE);
  } else {
    console.log(`${MESSAGE_EXIT_CODE_UNKNOWN} Exit code: `)
  }
};


startGame();
