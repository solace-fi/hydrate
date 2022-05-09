# hydrate

This **alpha** libray is intended to do three things:

1 - Generate n Monte Carlo simulation trials  
2 - Return a quantile value for any give probability (0-1)  
3 - Return a probability for any given quantile value.  

Each of the following functions takes as input a SIPMath Library or Metalog<sup>*</sup> aCoefficients and boundaries.
The SIPmath 3.0 standard is expected as the input format. See ProbabilityManagement.org for specifications.
 

The following functions are supported:
```js
import { hydrateLibrary, metalog, simulateSIP, listSIPs } from "@solace-fi/hydrate"

// Generate n Monte Carlos Trials for each distribution found in the input SIPMath 'library'
hydrateLibrary(example_tokens, 10) // first 10 trials for all SIPs in the library

// Return an array of the names for the SIPs found in a SIPMath Library
listSIPs(example_tokens) // eg ['AAVE', 'SOLACE', 'ETH']

// Generate n Monte Carlos Trials for a distribution found in the input SIPMath 'library'
simulateSIP(example_tokens, 'AAVE', 10)

// Returns the value at the probability of y (0 - 1) 
const y = 0.9 // the probability that a value will be occur
const a = example_bounded.sips[3].arguments.aCoefficients // array of Metalog aCoefficients 
const bu = example_bounded.sips[3].arguments.upperBound // may be empty string
const bl = example_bounded.sips[3].arguments.lowerBound // may be empty string
metalog(y, a, bl, bu)

// Returns the qualtile values at the probabiliies of p[] (0 - 1)  
const p = [0.9, 0.5, 0.1] // variable represents the probability values to find quantiles for
const a = example_tokens.sips[0].arguments.aCoefficients // see src/json folder for example_xyz
q(p, a, undefined, undefined)

// Returns the probabilities at the quantile values []
const q = [1.01, 1.0, 0.98] // variable represents the quantile values to find probabilities for
const a = example_tokens.sips[0].arguments.aCoefficients // see src/json folder for example_xyz
p(q, a, 3) 
```

Hydrate works with the output from Solace /volatility endpoint https://risk-data-docs.solace.fi/ and any SIPMath 3.0 compliant libraries. Example libraries can be found in the [Hydrate repository](https://github.com/solace-fi/hydrate/tree/main/src/json)  
TODO Update swagger with /volatility and /price-history

*Metalog package can be found at https://pypi.org/project/metalog/
