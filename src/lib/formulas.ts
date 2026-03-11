export interface Formula {
  name: string;
  formula: string;
  description: string;
}

export interface FormulaCategory {
  name: string;
  icon: string;
  formulas: Formula[];
}

export const FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    name: 'Algebra',
    icon: 'x',
    formulas: [
      { name: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Solutions to ax² + bx + c = 0' },
      { name: 'Slope', formula: 'm = \\frac{y_2 - y_1}{x_2 - x_1}', description: 'Slope between two points' },
      { name: 'Slope-Intercept', formula: 'y = mx + b', description: 'Linear equation form' },
      { name: 'Point-Slope', formula: 'y - y_1 = m(x - x_1)', description: 'Line through a point with slope m' },
      { name: 'Distance Formula', formula: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', description: 'Distance between two points' },
      { name: 'Midpoint', formula: 'M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)', description: 'Midpoint between two points' },
      { name: 'Difference of Squares', formula: 'a^2 - b^2 = (a+b)(a-b)', description: 'Factoring pattern' },
      { name: 'Perfect Square', formula: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2', description: 'Expanding perfect squares' },
      { name: 'Logarithm Rules', formula: '\\log_b(xy) = \\log_b x + \\log_b y', description: 'Product rule for logarithms' },
      { name: 'Change of Base', formula: '\\log_b a = \\frac{\\ln a}{\\ln b}', description: 'Convert between log bases' },
    ],
  },
  {
    name: 'Geometry',
    icon: '△',
    formulas: [
      { name: 'Area of Circle', formula: 'A = \\pi r^2', description: 'Area with radius r' },
      { name: 'Circumference', formula: 'C = 2\\pi r', description: 'Circumference of a circle' },
      { name: 'Area of Triangle', formula: 'A = \\frac{1}{2}bh', description: 'Base × height / 2' },
      { name: 'Pythagorean Theorem', formula: 'a^2 + b^2 = c^2', description: 'Right triangle sides' },
      { name: 'Area of Rectangle', formula: 'A = lw', description: 'Length × width' },
      { name: 'Volume of Sphere', formula: 'V = \\frac{4}{3}\\pi r^3', description: 'Volume with radius r' },
      { name: 'Volume of Cylinder', formula: 'V = \\pi r^2 h', description: 'Circular base × height' },
      { name: 'Volume of Cone', formula: 'V = \\frac{1}{3}\\pi r^2 h', description: '1/3 of cylinder' },
      { name: 'Surface Area of Sphere', formula: 'SA = 4\\pi r^2', description: 'Total surface area' },
      { name: "Heron's Formula", formula: 'A = \\sqrt{s(s-a)(s-b)(s-c)}', description: 'Area from 3 sides, s = (a+b+c)/2' },
    ],
  },
  {
    name: 'Trigonometry',
    icon: 'θ',
    formulas: [
      { name: 'SOH-CAH-TOA', formula: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}}, \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}}, \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}', description: 'Basic trig ratios' },
      { name: 'Pythagorean Identity', formula: '\\sin^2\\theta + \\cos^2\\theta = 1', description: 'Fundamental trig identity' },
      { name: 'Law of Sines', formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}', description: 'Any triangle sides and angles' },
      { name: 'Law of Cosines', formula: 'c^2 = a^2 + b^2 - 2ab\\cos C', description: 'Generalized Pythagorean theorem' },
      { name: 'Double Angle (sin)', formula: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta', description: 'Sine double angle' },
      { name: 'Double Angle (cos)', formula: '\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta', description: 'Cosine double angle' },
      { name: 'Unit Circle', formula: '(\\cos\\theta, \\sin\\theta)', description: 'Point on unit circle at angle θ' },
      { name: 'Radian Conversion', formula: '\\text{radians} = \\text{degrees} \\times \\frac{\\pi}{180}', description: 'Degrees to radians' },
    ],
  },
  {
    name: 'Calculus',
    icon: '∫',
    formulas: [
      { name: 'Power Rule', formula: '\\frac{d}{dx}[x^n] = nx^{n-1}', description: 'Derivative of xⁿ' },
      { name: 'Product Rule', formula: '(fg)\' = f\'g + fg\'', description: 'Derivative of product' },
      { name: 'Quotient Rule', formula: '\\left(\\frac{f}{g}\\right)\' = \\frac{f\'g - fg\'}{g^2}', description: 'Derivative of quotient' },
      { name: 'Chain Rule', formula: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)', description: 'Derivative of composition' },
      { name: 'Power Rule (Integration)', formula: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C', description: 'Antiderivative of xⁿ (n ≠ -1)' },
      { name: 'Fundamental Theorem', formula: '\\int_a^b f(x)\\,dx = F(b) - F(a)', description: 'Definite integral evaluation' },
      { name: 'Derivative of eˣ', formula: '\\frac{d}{dx}[e^x] = e^x', description: 'eˣ is its own derivative' },
      { name: 'Derivative of ln', formula: '\\frac{d}{dx}[\\ln x] = \\frac{1}{x}', description: 'Natural log derivative' },
      { name: 'Derivative of sin', formula: '\\frac{d}{dx}[\\sin x] = \\cos x', description: 'Sine derivative' },
      { name: 'Derivative of cos', formula: '\\frac{d}{dx}[\\cos x] = -\\sin x', description: 'Cosine derivative' },
    ],
  },
  {
    name: 'Physics',
    icon: 'F',
    formulas: [
      { name: "Newton's 2nd Law", formula: 'F = ma', description: 'Force = mass × acceleration' },
      { name: 'Kinematic (velocity)', formula: 'v = v_0 + at', description: 'Final velocity' },
      { name: 'Kinematic (displacement)', formula: 'd = v_0 t + \\frac{1}{2}at^2', description: 'Displacement with constant acceleration' },
      { name: 'Kinematic (no time)', formula: 'v^2 = v_0^2 + 2ad', description: 'Velocity without time' },
      { name: 'Gravitational Force', formula: 'F = G\\frac{m_1 m_2}{r^2}', description: 'Universal gravitation' },
      { name: 'Work', formula: 'W = Fd\\cos\\theta', description: 'Work = force × displacement × cos(angle)' },
      { name: 'Kinetic Energy', formula: 'KE = \\frac{1}{2}mv^2', description: 'Energy of motion' },
      { name: 'Potential Energy', formula: 'PE = mgh', description: 'Gravitational potential energy' },
      { name: "Ohm's Law", formula: 'V = IR', description: 'Voltage = current × resistance' },
      { name: 'Wave Speed', formula: 'v = f\\lambda', description: 'Speed = frequency × wavelength' },
    ],
  },
  {
    name: 'Chemistry',
    icon: '⚗',
    formulas: [
      { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Pressure × Volume = moles × R × Temperature' },
      { name: 'Density', formula: '\\rho = \\frac{m}{V}', description: 'Mass per unit volume' },
      { name: 'Molarity', formula: 'M = \\frac{\\text{mol solute}}{\\text{L solution}}', description: 'Concentration in mol/L' },
      { name: 'Dilution', formula: 'M_1V_1 = M_2V_2', description: 'Dilution equation' },
      { name: 'pH', formula: 'pH = -\\log[H^+]', description: 'Acidity measure' },
      { name: "Gibbs Free Energy", formula: '\\Delta G = \\Delta H - T\\Delta S', description: 'Spontaneity of reaction' },
      { name: 'Rate Law', formula: 'r = k[A]^m[B]^n', description: 'Reaction rate expression' },
      { name: "Avogadro's Number", formula: 'N_A = 6.022 \\times 10^{23}', description: 'Particles per mole' },
    ],
  },
  {
    name: 'Statistics',
    icon: 'σ',
    formulas: [
      { name: 'Mean', formula: '\\bar{x} = \\frac{\\sum x_i}{n}', description: 'Average of values' },
      { name: 'Standard Deviation', formula: 's = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}', description: 'Spread of data (sample)' },
      { name: 'Z-Score', formula: 'z = \\frac{x - \\mu}{\\sigma}', description: 'Standard deviations from mean' },
      { name: 'Combination', formula: 'C(n,r) = \\frac{n!}{r!(n-r)!}', description: 'Choose r from n (order irrelevant)' },
      { name: 'Permutation', formula: 'P(n,r) = \\frac{n!}{(n-r)!}', description: 'Arrange r from n (order matters)' },
      { name: 'Probability', formula: 'P(A) = \\frac{\\text{favorable}}{\\text{total}}', description: 'Basic probability' },
      { name: 'Bayes Theorem', formula: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}', description: 'Conditional probability' },
      { name: 'Linear Regression', formula: 'y = a + bx, \\quad b = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}', description: 'Best fit line' },
    ],
  },
];
