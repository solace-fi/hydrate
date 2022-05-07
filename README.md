# hydrate

This libray is intended to do three things:

1 - Generate n monte carlo simulation trials 
2 - Return a quantile value for any give probabilty (0-1)
3 - TODO: Return a probability for any given quantile value 

Each of the following functions takes as input a SIPMath Library or Metalog<sup>*</sup> aCoefficients and boundaries.
The SIPmath 3.0 standard is expected as the input format. See ProbabilityManagement.org for specificaitons.
 

The following functions are supported:
```js
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
```

Hydrate works with the output from Solace /volatility endpoint https://risk-data-docs.solace.fi/ and any SIPMath 3.0 compliant libraries.
TODO Update swagger with /volatility and /price-history

*metalog package can be found at https://pypi.org/project/metalog/
