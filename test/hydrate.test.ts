import { hydrateLibrary, simulateSIP, metalog, listSIPs, p, q } from '../src/hydrate';
import example_tokens from '../src/json/example_tokens.json';
import example_bounded from '../src/json/example_bounded.json'
// import example_gaussian from '../src/json/example_gaussian.json'

describe('SolaceBalance', () => {
    beforeEach(() => {
        // Avoid jest avoid timeout error
        jest.setTimeout(20000);
    })

    describe('#hydrateLibrary', () => {
        it('will return a valid response', async () => {
            console.log(hydrateLibrary(example_tokens, 10))
        })
    })

    describe('#simulateSIP', () => {
        it('will return a valid response', async () => {
            console.log(simulateSIP(example_tokens, 'AAVE', 10))
        })
    })

    describe('#listSIPs', () => {
        it('will return a valid response', async () => {
            console.log(listSIPs(example_tokens))
        })
    })

    describe('#metalog', () => {
        it('will return a valid response', async () => {
            const y = 0.9 // variable represents the probability that a value will be occur
            const a = example_tokens.sips[0].arguments.aCoefficients
            console.log(metalog(y, a, undefined, undefined))
        })
    })

    describe('#p', () => {
        it('will return a valid response', async () => {
            const q = [1.01, 1.0, 0.98] // variable represents the quantile values to find probabilities for
            const a = example_tokens.sips[0].arguments.aCoefficients
            console.log(p(q, a, 3))
        })
    })

    describe('#q', () => {
        it('will return a valid response', async () => {
            const p = [0.9, 0.5, 0.1] // variable represents the probability values to find quantiles for
            const a = example_bounded.sips[0].arguments.aCoefficients
            const bl = example_bounded.sips[0].arguments.lowerBound
            const bu = example_bounded.sips[3].arguments.upperBound
            console.log(q(p, a, bl, bu))
        })
    })
})
