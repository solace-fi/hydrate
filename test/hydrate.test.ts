import { hydrateLibrary, simulateSIP, metalog, listSIPs } from '../src/hydrate';
import example_tokens from '../src/json/example_tokens.json';
// import example_bounded from '../src/json/example_bounded.json'
// import example_gaussian from '../src/json/example_gaussian.json'

describe('SolaceBalance', () => {
    beforeEach(() => {
        // Avoid jest avoid timeout error
        jest.setTimeout(20000);
    })

    describe('#hydrateLibrary', () => {
        it('will return a valid response', async () => {
            console.log(hydrateLibrary(example_tokens,10) )
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
            const y = 0.5 // variable represents the probability that a value will be occur
            const a = example_tokens.sips[0].arguments.aCoefficients
            console.log(metalog(y, a, undefined, undefined))
        })
    })
})
