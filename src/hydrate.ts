var { jStat } = require('jstat')


export function hydrateLibrary(LibraryIn, numberOfTrialsRequested) {
  let simLibrary = {};
  for (let i = 0; i < LibraryIn.sips.length; i++) {
    const tokenIn = LibraryIn.sips[i].name;
    // console.log(tokenIn);
    var output = simulateSIP(LibraryIn, tokenIn, numberOfTrialsRequested);
    simLibrary[tokenIn] = output;
  }
  return simLibrary;
}

export function simulateSIP(selfIn, sip, simTrials) {
  /**
   * Expects library as input and the name of A sip
   * TODO: Add an all option for doing all sips
   * example keyword argument for input: simulateSIP("Variable1", HDR2= {"seed3":0, "seed4":1})
   */

  let randomarray = [];
  let returnValue = [];
  let sipIndex = selfIn.sips.findIndex(item => item.name === sip);

  let aCoeffs = selfIn.sips[sipIndex].arguments.aCoefficients;
  let lowerBound = undefined;
  let upperBound = undefined;
  let a = "";
  let functionName = selfIn.sips[sipIndex].function;

  // This need to be rethought out as we are pulling a lot of numbers we don't need but for now :shrugs:
  if (selfIn.sips[sipIndex].ref.source === "copula") {
    randomarray = generateCopula(selfIn, selfIn.sips[sipIndex].ref.copulaLayer, simTrials); // c1 or c2 etc
  } else if (selfIn.sips[sipIndex].ref.source === "rng") {
    randomarray = prepGenerateRandom(selfIn.sips[sipIndex].ref.name, selfIn.U01, simTrials);
  }

  try {
    lowerBound = selfIn.sips[sipIndex]["arguments"]["lowerBound"];
  } catch (e) {
    //km console.log("Nothing to see here. Just no lowerBound");
  }

  try {
    upperBound = selfIn.sips[sipIndex]["arguments"]["upperBound"];
  } catch (e) {
    //km console.log("Nothing to see here. Just no upperBound");
  }

  if (functionName === "Metalog_1_0") {
    // TODO: change for loop into a vectorized numpy like function.
    if (randomarray.constructor === Array) {
      for (var i = 0; i < randomarray.length; i++) {
        let ml = metalog(randomarray[i], aCoeffs, lowerBound, upperBound);
        returnValue.push(ml);
      }
    }

    for (let index = 0; index < randomarray.length; ++index) {
      let ml = metalog(randomarray[index], aCoeffs, lowerBound, upperBound);
      returnValue.push(ml);
    }
  }
  //console.log(returnValue)
  let merged = flatten(returnValue);
  return merged.slice(0, simTrials);

}

export function metalog(y, a, bl?: number, bu?: number) {

  let vector = [];
  let np_a = a;
  for (let index = 1; index < a.length + 1; ++index) {
    //cant start with 0 coeeffs for each aCoeff
    vector.push(basis(y, index));
  }

  let wrappedVector = [vector];
  let wrappedNp_x = [np_a];

  let wrappedNp_a = wrappedNp_x[0].map(e => [e])
  let mky = multiply(wrappedVector, wrappedNp_a);

  const newMky = mky[0][0];

  // Bounded
  if (bl && bu) return bl + (bu * Math.exp(newMky)) / (1 + Math.exp(newMky));
  // Bounded lower
  if (bl) return bl + Math.exp(newMky);
  // Bounded upper
  if (bu) return bu - Math.exp(-newMky);
  // Unbounded
  return newMky
}

export function listSIPs(LibraryIn) {
  let sipList = [];
  for (let i = 0; i < LibraryIn.sips.length; i++) {
    sipList[i] = LibraryIn.sips[i].name;;
  }
  return sipList;
}

function generateCopula(selfy, copulaCount, simTrials) {
  let ret = [];
  let whichCorrelationMatrix = 0;

  selfy.U01.copula.forEach((copula) => {
    if (copula.function === "GaussianCopula") {
      // now get the cholesky factors and the global variable
      let specifyCorrelationMatrix = copula.arguments.correlationMatrix.value;
      let copulaArgs = copula.arguments.rng;
      let randomMatrixOfHDRs = [];
      for (let i = 0; i < copulaArgs.length; i++) {
        let val = prepGenerateRandom(copulaArgs[i], selfy.U01, simTrials); // from U01/RNG
        /* TODO update HDRv2 using { "counter": "PM_Index","entity": 1,"varId": 6187319,"seed3": 0,"seed4": 0} */
        randomMatrixOfHDRs.push(val);
      }

      selfy.globalVariables.forEach((item, index) => {
        if (item["name"] == specifyCorrelationMatrix) {
          whichCorrelationMatrix = index;
        } else {
          let index = -1;
        }
      });

      let thisCorrelationMatrix = selfy.globalVariables[whichCorrelationMatrix].value.matrix;
      let correlationMatrix = convertMx(thisCorrelationMatrix);

      // Find the Cholesky Factors
      let cho = jStat(jStat.cholesky(correlationMatrix));
      //Apply the Cholesky Factors to the randoms
      let col = copula.copulaLayer.findIndex((item) => item === copulaCount);
      let choSubSample = cho[col].slice(0, col + 1);
      let runiRow = [];
      let corrSamples = [];
      let normSinv = [];

      for (let i = 0; i < randomMatrixOfHDRs[0].length; i++) {
        let randomMatrixHRDsSample = [];
        for (let index = 0; index < col + 1; ++index) {
          //each variable upto pos col
          // get first x cols in randuniframe
          randomMatrixHRDsSample[index] = randomMatrixOfHDRs[index];
          runiRow[i] = randomMatrixHRDsSample.map(function (x) {
            return x[i];
          });
        }

        normSinv = runiRow[i].map((sin) => jStat.normal.inv(sin, 0, 1));
        corrSamples[i] = jStat.dot(normSinv, choSubSample); // TODO: Replace jstat 
        corrSamples[i] = jStat.normal.cdf(corrSamples[i], 0, 1); // TODO: Replace jstat 
      }

      ret = corrSamples;
    } else {
      console.log("TypeError The function type for this copula is unsupported.");
    }
  });
  return ret;
}

function prepGenerateRandom(args, selfIn, simTrials) {
  // from U01/RNG
  let rngArgs = selfIn.rng.findIndex((x) => x.name === args);
  var samples = [];
  const seedPerDistEntity = selfIn.rng[rngArgs].arguments.entity;
  const seedPerDistVarId = selfIn.rng[rngArgs].arguments.varId;
  const seedPerDistSeed3 = selfIn.rng[rngArgs].arguments.seed3;
  const seedPerDistSeed4 = selfIn.rng[rngArgs].arguments.seed4;

  for (var distTrials = 0; distTrials < simTrials; distTrials++) {
    // samples[distTrials] = HDRando(seedPerDist, distTrials);
    samples[distTrials] = HDRando2(seedPerDistEntity,seedPerDistVarId,seedPerDistSeed3, seedPerDistSeed4,distTrials);
  }
  return samples;
}

// HELPER FUNCTIONS TODO: Remove need for jstat
/*
 * hubbardresearch.com for more info. This is a function that generates the random numbers with seeds.
 * TODO update this to use all the seeds from the U01/RNG ie use HRDv2. DONE! Move into own package? Nah
 */
function HDRando2(entityID, varId, option1, option2, PM_Index) {
  // supports 4 variables for sip 3.0 standard
  const largePrime = 4294967296; // there are a lot of primes. ?? Need to find out when to change them
  // Do we need this in js? is there a modulo?
  function MOD(n, m) {
    var remain = n % m;
    return Math.floor(remain >= 0 ? remain : remain + m);
  }
  let randi =
    (MOD(
      (MOD(
        MOD(
          999999999999989,
          MOD(
            PM_Index * 2499997 +
              varId * 1800451 +
              entityID * 2000371 +
              option1 * 1796777 +
              option2 * 2299603,
            7450589
          ) *
            4658 +
            7450581
        ) * 383,
        99991
      ) *
        7440893 +
        MOD(
          MOD(
            999999999999989,
            MOD(
              PM_Index * 2246527 +
                varId * 2399993 +
                entityID * 2100869 +
                option1 * 1918303 +
                option2 * 1624729,
              7450987
            ) *
              7580 +
              7560584
          ) * 17669,
          7440893
        )) *
        1343,
      largePrime
    ) +
      0.5) /
    largePrime;

  return randi;
}

function convertMx(correlationMatrix) {
  let variables = [];

  //gotta figure out all of the variables in the matrix
  correlationMatrix.forEach(sipVar => {
    if (variables.includes(sipVar["row"])) {
    } else {
      variables.push(sipVar["row"]);
    }
  });

  let variableCount = variables.length;
  let returnArray = Array(variableCount)
    .fill(0)
    .map(() => Array(variableCount).fill(0));

  correlationMatrix.forEach(items => {
    let i = items.row;
    let j = items.col;
    let value = items.value;

    i = variables.indexOf(items["row"]);
    j = variables.indexOf(items["col"]);
    returnArray[i][j] = value;
    returnArray[j][i] = value;
  });

  return returnArray;
}

function multiply(a, b): number[][] {
  var aNumRows = a.length,
    aNumCols = a[0].length || 0, // if a is a vector
    bNumRows = b.length,
    bNumCols = b[0].length || 0,
    m = new Array(aNumRows); // initialize array of rows

  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0; // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }

  return m;
}

function basis(y, t) {
  // y must be uniform 0-1
  let ret = 0;
  if (t === 1) {
    ret = 1;
  } else if (t === 2) {
    ret = Math.log(y / (1 - y));
    if (isNaN(ret)) {}
  } else if (t === 3) {
    ret = (y - 0.5) * Math.log(y / (1 - y));
    if (isNaN(ret)) {
      console.log("ret when t3 ", y, ret);
    }
  } else if (t === 4) {
    ret = y - 0.5;
    if (isNaN(ret)) {}
  } else if (t >= 5 && t % 2 === 1) {
    ret = Math.pow(y - 0.5, Math.floor((t - 1) / 2));
    if (isNaN(ret)) {}
  } else if (t >= 6 && t % 2 === 0) {
    ret = Math.pow(y - 0.5, Math.floor((t - 1) / 2)) * Math.log(y / (1 - y));
    if (isNaN(ret)) {}
  }
  return ret;
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}