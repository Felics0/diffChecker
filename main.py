from sympy import limit, symbols, diff, simplify, sympify

def calculator(fnction, x_0):
    x = symbols('x')
    fnction = simplify(sympify(fnction))
    derivative = diff(fnction, x)
    fnction_limit = limit(fnction, x, x_0)
    right_fnction_limit = limit(fnction, x, x_0, "+")
    left_fnction_limit = limit(fnction, x, x_0, "-")
    right_limit = limit(derivative, x, x_0, "+")
    left_limit = limit(derivative, x, x_0, "-")
    
    # Substituting value using subs for fnction_y_0
    fnction_y_0 = fnction.subs(x, x_0)
    
    # Substituting value using subs for derivative_y_0
    derivative_y_0 = derivative.subs(x, x_0)
    
    continuos = fnction_y_0 == right_fnction_limit and fnction_y_0 == left_fnction_limit
    
    return derivative, fnction_limit, right_limit, left_limit, continuos, derivative_y_0, fnction_y_0

# Test the function
result = calculator(fnctionInput, dotInput)
print(result)
