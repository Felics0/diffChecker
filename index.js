async function main() {

    document.getElementById("description").textContent = null;
    document.getElementById('kind').textContent = null;
    diffOutputField.latex('')
    // limitOutputField.latex('')
    leftLimitOutputField.latex('')
    rightLimitOutputField.latex('')
    desmos.setExpressions([
        { id: 'graph1', latex: '' },
        { id: 'graph2', latex: '' }
    ]);

    document.getElementById('loadingIndicator').style.display = 'block';

    let pyodide = await loadPyodide();
    await pyodide.loadPackage("sympy")
    // let pythonCode = await (await fetch("main.py")).text();
    let pythonCode = `
from sympy import limit, symbols, diff, simplify, S

def calculator(fnction, x_0):
    
    x = symbols('x')
    derivative = diff(simplify(fnction), x)
    fnction_limit = limit(fnction, x, x_0)
    right_fnction_limit = limit(fnction, x, x_0, "+")
    left_fnction_limit = limit(fnction, x, x_0, "-")
    right_limit = limit(derivative, x, x_0, "+")
    left_limit = limit(derivative, x, x_0, "-")
    fnction_y_0 = fnction.subs(x, x_0)
    continuos = fnction_y_0 == right_fnction_limit and fnction_y_0 == left_fnction_limit
    derivative_y_0 = derivative.subs(x, x_0)
    return derivative, fnction_limit, right_limit, left_limit, continuos, derivative_y_0, fnction_y_0

# Test the function
calculator(fnctionInput, dotInput)


`;

    let dotInput = dotInputField.text();
    let fnctionInput = nerdamer.convertFromLaTeX(replaceLn(functionInputField.latex()));
    desmos.setExpression({ id: 'graph1', latex: 'y=' + functionInputField.latex(), color: Desmos.Colors.BLUE });

    pyodide.globals.set("dotInput", dotInput);
    pyodide.globals.set("fnctionInput", fnctionInput);

    let result_py = pyodide.runPython(pythonCode.toString());
    let result_js = result_py.toJs();

    let derivative = result_js.toString().split(',')[0];
    let limit = result_js.toString().split(',')[1];
    let rightLimit = result_js.toString().split(',')[2];
    let leftLimit = result_js.toString().split(',')[3];
    let continuos = result_js.toString().split(',')[4];
    let derivative_y_0 = result_js.toString().split(',')[5];
    let fnction_y_0 = result_js.toString().split(',')[6];

    rightLimit = nerdamer(rightLimit);
    leftLimit = nerdamer(leftLimit);
    if (rightLimit.toString().includes('oo')) {
        rightLimit = rightLimit.evaluate();
    }
    if (leftLimit.toString().includes('oo')) {
        leftLimit = leftLimit.evaluate();
    }


    diffOutputField.latex(nerdamer.convertToLaTeX(replaceLog(replaceDoubleAsterisks(derivative.toString()))));
    desmos.setExpression({ id: 'graph2', latex: 'y=' + removeMathrm(replaceLogWithLn(diffOutputField.latex())), color: Desmos.Colors.GREEN });
    // limitOutputField.latex(nerdamer.convertToLaTeX(replaceLog(replaceDoubleAsterisks(limit.toString()))));
    leftLimitOutputField.latex(nerdamer.convertToLaTeX(replaceDoubleAsterisks(leftLimit.toString())));
    rightLimitOutputField.latex(nerdamer.convertToLaTeX(replaceDoubleAsterisks(rightLimit.toString())));
    console.log(continuos.toString())
    if (continuos == "true") {

        if ((!leftLimit.toString().includes('oo') && !rightLimit.toString().includes('oo')) && leftLimit.toString() == rightLimit.toString()) {
            document.getElementById("description").textContent = "la funzione nel punto (" + dotInput.toString() + " ; " + replaceZWithSymbol(fnction_y_0.toString()) + ") " + "é continua e derivabile";
            if (derivative_y_0.toString() == '0') {
                document.getElementById("kind").textContent = " - punto stazionario";
            }
        } else if (leftLimit.toString().includes('oo') && rightLimit.toString().includes('oo')) {
            if (leftLimit.toString() == rightLimit.toString()) {
                document.getElementById("description").textContent = "la funzione nel punto (" + dotInput.toString() + " ; " + replaceZWithSymbol(fnction_y_0.toString()) + ") " + "é continua ma non derivabile";
                document.getElementById("kind").textContent = " - flesso a tangente verticale";
            } else {
                document.getElementById("description").textContent = "la funzione nel punto (" + dotInput.toString() + " ; " + replaceZWithSymbol(fnction_y_0.toString()) + ") " + "é continua ma non derivabile";
                document.getElementById("kind").textContent = " - cuspide";
            }
        } else if (leftLimit.toString() !== rightLimit.toString()) {
            document.getElementById("description").textContent = "la funzione nel punto (" + dotInput.toString() + " ; " + replaceZWithSymbol(fnction_y_0.toString()) + ") " + "é continua ma non derivabile";
            document.getElementById("kind").textContent = " - punto angoloso";
        }

    } else {
        document.getElementById("description").textContent = "la funzione nel punto (" + dotInput.toString() + " ; " + replaceZWithSymbol(fnction_y_0.toString()) + ") " + "non é continua e non derivabile";
    }
    document.getElementById('loadingIndicator').style.display = 'none';
}

function replaceDoubleAsterisks(str) {
    return str.replace(/\*\*/g, '^');
}
function replaceAbs(fnction) {
    var replaced = fnction.replace("\\left|", "abs(");
    replaced = replaced.replace("\\right|", ")");
    return replaced;
}
function replaceLog(fnction) {
    var replaced = fnction.replace("log", "ln");
    return replaced;
}
function replaceLn(fnction) {
    var replaced = fnction.replace("ln", "log");
    return replaced;
}
function removeMathrm(inputString) {
    return inputString.replace(/\\mathrm\{(.*?)\}/g, '$1');
}
function replaceLogWithLn(inputString) {
    return inputString.replace(/\blog\b/g, 'ln');
}
function replaceZWithSymbol(inputString) {
    return inputString.replace(/z/g, '±');
  }
