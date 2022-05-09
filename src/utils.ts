function quantileMetalog(a: any, y: number, t: number, bounds = [], boundedness = 'u') {
    // Some values for calculation
    let f = y - 0.5
    let l = Math.log(y / (1 - y))

    //For the first three terms
    let x = a[0] + a[1] * l + a[2] * f * l

    //For the fourth term
    if (t > 3) {
        x = x + a[3] * f
    }
    //Some tracking variables
    let o = 2
    let e = 2

    //For all other terms greater than 4
    if (t > 4) {
        for (let i = 5; i < t + 1; i++) {
            if (i % 2 == 0) {
                x = x + a[i - 1] * f ** e * l
                e += 1
            }
            if (i % 2 != 0) {
                x = x + a[i - 1] * f ** o
                o += 1
            }
        }
    }
    if (boundedness == 'sl') {
        x = bounds[0] + Math.exp(x)
    }
    if (boundedness == 'su') {
        x = bounds[1] - Math.exp(-x)
    }
    if (boundedness == 'b') {
        x = (bounds[0] + bounds[1] * Math.exp(x)) / (1 + Math.exp(x))
    }
    // Returns a single float
    return x
}

function pdfMetalog(a, y, t, bounds = [], boundedness = 'u') {
    let d = y * (1 - y)
    let f = (y - 0.5)
    let l = Math.log(y / (1 - y))

    // Initiate pdf

    // For the first three terms
    let x = a[1] / d
    if (a[2] != 0) {
        x = x + a[2] * ((f / d) + l)
    }
    // For the fourth term
    if (t > 3) {
        x = x + a[3]
    }
    // Initialize some counting variables
    let e = 1
    let o = 1

    // For all other terms greater than 4
    if (t > 4) {
        for (let i = 5; i < t + 1; i++) {
            if (i % 2 != 0) {
                // iff odd
                x = x + ((o + 1) * a[i - 1] * f ** o)
                o = o + 1
            }
            if (i % 2 == 0) {
                // iff even
                x = x + a[i - 1] * (((f ** (e + 1)) / d) + (e + 1) * f ** e * l)
                e = e + 1
            }
        }
    }
    // Some change of variables here for boundedness
    x = x ** (-1)
    let M: number;
    if (boundedness != 'u') {
        M = quantileMetalog(a, y, t, bounds = bounds, boundedness = 'u')
    }
    if (boundedness == 'sl') {
        x = x * Math.exp(-M)
    }
    if (boundedness == 'su') {
        x = x * Math.exp(M)
    }
    if (boundedness == 'b') {
        x = (x * (1 + Math.exp(M)) ** 2) / ((bounds[1] - bounds[0]) * Math.exp(M))
    }
    // Returns a single float
    return x
}

export function newtons_method_metalog(q, m, term): number {
    // A simple newtons method application
    let alpha_step = 0.01
    let err = 0.0000001
    let temp_err = 0.1
    let y_now = 0.5

    //let avec = 'a' + term.toString()
    //let a = m['A'][avec]
    let a = m
    let i = 1

    while (temp_err > err) {
        let frist_function = quantileMetalog(a, y_now, term) - q
        let derv_function = pdfMetalog(a, y_now, term)
        let y_next = y_now - alpha_step * frist_function * derv_function
        temp_err = Math.abs(y_next - y_now)

        if (y_next > 1) {
            y_next = 0.99999
        }
        if (y_next < 0) {
            y_next = 0.000001
        }
        y_now = y_next
        i += 1

        if (i > 10000) {
            console.log('Approximation taking too long, quantile value: ', q, ' is too far from distribution median. Try plot() to see distribution.')
        }
    }
    // Returns a single float
    return y_now
}

