export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  units: Unit[];
}

export const COURSES: Course[] = [
  {
    id: 'math1h',
    name: 'Integrated Math 1 Honors',
    units: [
      {
        id: 'm1-equations',
        name: 'Equations & Inequalities',
        topics: [
          { id: 'm1-eq-1', name: 'Solving Linear Equations', description: 'One-variable linear equations with variables on both sides, distribution, and fractions' },
          { id: 'm1-eq-2', name: 'Solving Linear Inequalities', description: 'One-variable inequalities, compound inequalities, and graphing on a number line' },
          { id: 'm1-eq-3', name: 'Literal Equations', description: 'Rearranging formulas to solve for a specific variable' },
        ],
      },
      {
        id: 'm1-twovareq',
        name: 'Two-Variable Equations',
        topics: [
          { id: 'm1-tv-1', name: 'Slope & Rate of Change', description: 'Calculating slope from points, graphs, and tables; interpreting rate of change' },
          { id: 'm1-tv-2', name: 'Forms of Linear Equations', description: 'Slope-intercept, point-slope, and standard form; converting between forms' },
          { id: 'm1-tv-3', name: 'Systems of Equations', description: 'Solving systems by graphing, substitution, and elimination' },
          { id: 'm1-tv-4', name: 'Systems of Inequalities', description: 'Graphing systems of linear inequalities and identifying solution regions' },
        ],
      },
      {
        id: 'm1-units',
        name: 'Units & Variation',
        topics: [
          { id: 'm1-un-1', name: 'Unit Conversions', description: 'Dimensional analysis and converting between measurement units' },
          { id: 'm1-un-2', name: 'Direct & Inverse Variation', description: 'Proportional relationships, direct variation (y=kx), inverse variation (y=k/x)' },
        ],
      },
      {
        id: 'm1-radrats',
        name: 'Radicals & Rationals',
        topics: [
          { id: 'm1-rr-1', name: 'Simplifying Radicals', description: 'Square roots, cube roots, simplifying radical expressions' },
          { id: 'm1-rr-2', name: 'Operations with Radicals', description: 'Adding, subtracting, multiplying, and rationalizing denominators' },
          { id: 'm1-rr-3', name: 'Rational Expressions Intro', description: 'Simplifying basic rational expressions and identifying restrictions' },
        ],
      },
      {
        id: 'm1-functions',
        name: 'Functions',
        topics: [
          { id: 'm1-fn-1', name: 'Function Notation & Evaluation', description: 'Function notation f(x), evaluating functions, domain and range' },
          { id: 'm1-fn-2', name: 'Function Transformations', description: 'Translations, reflections, stretches, and compressions of function graphs' },
          { id: 'm1-fn-3', name: 'Piecewise Functions', description: 'Defining and graphing piecewise-defined functions' },
        ],
      },
      {
        id: 'm1-absval',
        name: 'Absolute Value',
        topics: [
          { id: 'm1-av-1', name: 'Absolute Value Equations', description: 'Solving equations involving absolute value, checking for extraneous solutions' },
          { id: 'm1-av-2', name: 'Absolute Value Inequalities', description: 'Solving and graphing absolute value inequalities' },
        ],
      },
      {
        id: 'm1-exponents',
        name: 'Exponents',
        topics: [
          { id: 'm1-ex-1', name: 'Exponent Rules', description: 'Product, quotient, power, zero, and negative exponent rules' },
          { id: 'm1-ex-2', name: 'Scientific Notation', description: 'Converting to/from scientific notation and performing operations' },
          { id: 'm1-ex-3', name: 'Exponential Growth & Decay', description: 'Modeling with exponential functions, growth/decay rate, half-life' },
        ],
      },
      {
        id: 'm1-polynomials',
        name: 'Polynomials',
        topics: [
          { id: 'm1-po-1', name: 'Polynomial Operations', description: 'Adding, subtracting, and multiplying polynomials' },
          { id: 'm1-po-2', name: 'Factoring Polynomials', description: 'GCF, difference of squares, trinomial factoring, grouping' },
        ],
      },
      {
        id: 'm1-sequences',
        name: 'Sequences',
        topics: [
          { id: 'm1-sq-1', name: 'Arithmetic Sequences', description: 'Common difference, explicit and recursive formulas, finding terms' },
          { id: 'm1-sq-2', name: 'Geometric Sequences', description: 'Common ratio, explicit and recursive formulas, finding terms' },
        ],
      },
      {
        id: 'm1-geometry',
        name: 'Geometry',
        topics: [
          { id: 'm1-ge-1', name: 'Angle Relationships', description: 'Complementary, supplementary, vertical angles, parallel lines and transversals' },
          { id: 'm1-ge-2', name: 'Triangle Properties', description: 'Triangle angle sum, exterior angles, triangle inequality, congruence criteria' },
          { id: 'm1-ge-3', name: 'Coordinate Geometry', description: 'Distance formula, midpoint formula, parallel and perpendicular lines' },
        ],
      },
      {
        id: 'm1-statistics',
        name: 'Statistics',
        topics: [
          { id: 'm1-st-1', name: 'Measures of Center & Spread', description: 'Mean, median, mode, range, IQR, standard deviation' },
          { id: 'm1-st-2', name: 'Data Displays', description: 'Histograms, box plots, dot plots, stem-and-leaf; choosing appropriate displays' },
          { id: 'm1-st-3', name: 'Scatter Plots & Correlation', description: 'Line of best fit, correlation coefficient, making predictions' },
        ],
      },
    ],
  },
  {
    id: 'math2h',
    name: 'Integrated Math 2 Honors',
    units: [
      {
        id: 'm2-numbersys',
        name: 'Number Systems',
        topics: [
          { id: 'm2-ns-1', name: 'Real Number Properties', description: 'Properties of real numbers, classifying numbers, closure' },
          { id: 'm2-ns-2', name: 'Complex Numbers', description: 'Imaginary unit i, complex number operations, complex conjugates' },
        ],
      },
      {
        id: 'm2-polynomials',
        name: 'Polynomials',
        topics: [
          { id: 'm2-po-1', name: 'Polynomial Long Division', description: 'Dividing polynomials using long division and synthetic division' },
          { id: 'm2-po-2', name: 'Remainder & Factor Theorems', description: 'Using remainder theorem, factor theorem, and rational root theorem' },
          { id: 'm2-po-3', name: 'Polynomial Graphs', description: 'End behavior, zeros and multiplicity, sketching polynomial graphs' },
        ],
      },
      {
        id: 'm2-quadratic',
        name: 'Quadratic Functions',
        topics: [
          { id: 'm2-qf-1', name: 'Graphing Quadratics', description: 'Vertex form, standard form, axis of symmetry, max/min values' },
          { id: 'm2-qf-2', name: 'Solving Quadratic Equations', description: 'Factoring, completing the square, quadratic formula, discriminant' },
          { id: 'm2-qf-3', name: 'Quadratic Applications', description: 'Projectile motion, optimization, and modeling with quadratics' },
        ],
      },
      {
        id: 'm2-functions',
        name: 'Functions',
        topics: [
          { id: 'm2-fn-1', name: 'Function Composition', description: 'Composing functions f(g(x)), domain of composite functions' },
          { id: 'm2-fn-2', name: 'Inverse Functions', description: 'Finding inverses, verifying inverses, restricting domains' },
          { id: 'm2-fn-3', name: 'Function Analysis', description: 'Increasing/decreasing intervals, even/odd functions, symmetry' },
        ],
      },
      {
        id: 'm2-absval',
        name: 'Absolute Value Functions',
        topics: [
          { id: 'm2-av-1', name: 'Graphing Absolute Value Functions', description: 'Transformations of y=|x|, vertex, domain and range' },
          { id: 'm2-av-2', name: 'Absolute Value Equations & Inequalities', description: 'Multi-step absolute value equations, compound inequalities with absolute value' },
        ],
      },
      {
        id: 'm2-explog',
        name: 'Exponentials & Logarithms',
        topics: [
          { id: 'm2-el-1', name: 'Exponential Functions', description: 'Graphing exponentials, transformations, modeling growth and decay' },
          { id: 'm2-el-2', name: 'Logarithmic Functions', description: 'Definition of logarithm, common and natural logs, graphing' },
          { id: 'm2-el-3', name: 'Logarithm Properties', description: 'Product, quotient, power rules; expanding and condensing expressions' },
          { id: 'm2-el-4', name: 'Exponential & Log Equations', description: 'Solving exponential and logarithmic equations using properties' },
        ],
      },
      {
        id: 'm2-seqseries',
        name: 'Sequences & Series',
        topics: [
          { id: 'm2-ss-1', name: 'Arithmetic Series', description: 'Partial sums of arithmetic sequences, sigma notation' },
          { id: 'm2-ss-2', name: 'Geometric Series', description: 'Finite and infinite geometric series, convergence' },
        ],
      },
      {
        id: 'm2-ratrad',
        name: 'Rationals & Radicals',
        topics: [
          { id: 'm2-rr-1', name: 'Rational Expressions & Equations', description: 'Operations with rational expressions, solving rational equations, extraneous solutions' },
          { id: 'm2-rr-2', name: 'Radical Expressions & Equations', description: 'Rational exponents, solving radical equations, domain restrictions' },
        ],
      },
      {
        id: 'm2-geometry',
        name: 'Geometry',
        topics: [
          { id: 'm2-ge-1', name: 'Similarity & Proportions', description: 'Similar triangles, AA/SAS/SSS similarity, proportional reasoning' },
          { id: 'm2-ge-2', name: 'Right Triangle Trigonometry', description: 'SOH-CAH-TOA, solving right triangles, angles of elevation/depression' },
          { id: 'm2-ge-3', name: 'Circles', description: 'Arc length, sector area, central and inscribed angles, tangent lines' },
        ],
      },
      {
        id: 'm2-solidgeo',
        name: 'Solid Geometry',
        topics: [
          { id: 'm2-sg-1', name: 'Surface Area & Volume', description: 'Prisms, cylinders, pyramids, cones, spheres; composite solids' },
          { id: 'm2-sg-2', name: 'Cross-Sections & Solids of Revolution', description: 'Identifying cross-sections, describing solids formed by rotation' },
        ],
      },
      {
        id: 'm2-trig',
        name: 'Trigonometry',
        topics: [
          { id: 'm2-tr-1', name: 'Unit Circle', description: 'Radian measure, unit circle coordinates, reference angles' },
          { id: 'm2-tr-2', name: 'Trig Functions of Any Angle', description: 'Evaluating trig functions using the unit circle, coterminal angles' },
          { id: 'm2-tr-3', name: 'Law of Sines & Cosines', description: 'Solving non-right triangles, ambiguous case, area formulas' },
        ],
      },
      {
        id: 'm2-probstats',
        name: 'Probability & Statistics',
        topics: [
          { id: 'm2-ps-1', name: 'Probability Rules', description: 'Addition and multiplication rules, conditional probability, independence' },
          { id: 'm2-ps-2', name: 'Counting Methods', description: 'Permutations, combinations, and the fundamental counting principle' },
          { id: 'm2-ps-3', name: 'Normal Distribution', description: 'Properties of normal curves, z-scores, empirical rule' },
        ],
      },
    ],
  },
  {
    id: 'math3h',
    name: 'Integrated Math 3 Honors',
    units: [
      {
        id: 'm3-seqseries',
        name: 'Sequences & Series',
        topics: [
          { id: 'm3-ss-1', name: 'Advanced Sequences', description: 'Recursive definitions, summation notation, mathematical induction basics' },
          { id: 'm3-ss-2', name: 'Binomial Theorem', description: 'Binomial expansion, Pascal\'s triangle, finding specific terms' },
        ],
      },
      {
        id: 'm3-polynomials',
        name: 'Polynomials',
        topics: [
          { id: 'm3-po-1', name: 'Polynomial Division & Theorems', description: 'Synthetic division, rational root theorem, Descartes\' rule of signs' },
          { id: 'm3-po-2', name: 'Fundamental Theorem of Algebra', description: 'Complex zeros, conjugate pairs, finding all zeros of a polynomial' },
          { id: 'm3-po-3', name: 'Polynomial Inequalities', description: 'Solving polynomial inequalities using sign analysis and test intervals' },
        ],
      },
      {
        id: 'm3-rational',
        name: 'Rational Equations & Functions',
        topics: [
          { id: 'm3-ra-1', name: 'Graphing Rational Functions', description: 'Vertical/horizontal/slant asymptotes, holes, end behavior' },
          { id: 'm3-ra-2', name: 'Solving Rational Equations', description: 'Cross-multiplication, LCD method, extraneous solutions' },
          { id: 'm3-ra-3', name: 'Partial Fractions', description: 'Decomposing rational expressions into partial fractions' },
        ],
      },
      {
        id: 'm3-radical',
        name: 'Radical Functions',
        topics: [
          { id: 'm3-rd-1', name: 'Graphing Radical Functions', description: 'Square root and cube root functions, transformations, domain/range' },
          { id: 'm3-rd-2', name: 'Solving Radical Equations', description: 'Isolating radicals, squaring both sides, checking for extraneous solutions' },
        ],
      },
      {
        id: 'm3-inequalities',
        name: 'Inequalities',
        topics: [
          { id: 'm3-iq-1', name: 'Rational Inequalities', description: 'Solving rational inequalities using sign charts' },
          { id: 'm3-iq-2', name: 'Systems of Nonlinear Inequalities', description: 'Graphing and solving systems with quadratic and other nonlinear functions' },
        ],
      },
      {
        id: 'm3-conics',
        name: 'Conics',
        topics: [
          { id: 'm3-cn-1', name: 'Circles & Parabolas', description: 'Standard form equations, completing the square, focus and directrix' },
          { id: 'm3-cn-2', name: 'Ellipses & Hyperbolas', description: 'Standard form, foci, vertices, asymptotes, eccentricity' },
          { id: 'm3-cn-3', name: 'Conic Applications', description: 'Identifying conics from general form, real-world applications' },
        ],
      },
      {
        id: 'm3-trigfunc',
        name: 'Trigonometric Functions',
        topics: [
          { id: 'm3-tf-1', name: 'Graphing Trig Functions', description: 'Amplitude, period, phase shift, vertical shift for sin, cos, tan' },
          { id: 'm3-tf-2', name: 'Inverse Trig Functions', description: 'arcsin, arccos, arctan, restricted domains, evaluating compositions' },
          { id: 'm3-tf-3', name: 'Trig Applications', description: 'Modeling periodic phenomena: sound waves, tides, circular motion' },
        ],
      },
      {
        id: 'm3-trigident',
        name: 'Trig Identities',
        topics: [
          { id: 'm3-ti-1', name: 'Fundamental Identities', description: 'Pythagorean, reciprocal, quotient identities; simplifying expressions' },
          { id: 'm3-ti-2', name: 'Sum & Difference Formulas', description: 'sin(A+B), cos(A+B), tan(A+B) and their difference counterparts' },
          { id: 'm3-ti-3', name: 'Double & Half Angle Formulas', description: 'Deriving and applying double-angle and half-angle identities' },
        ],
      },
      {
        id: 'm3-trigeq',
        name: 'Trig Equations',
        topics: [
          { id: 'm3-te-1', name: 'Solving Trig Equations', description: 'Finding all solutions in an interval, general solutions, using identities' },
          { id: 'm3-te-2', name: 'Multi-Step Trig Equations', description: 'Equations requiring factoring, substitution, or identity application' },
        ],
      },
      {
        id: 'm3-parametric',
        name: 'Parametric Equations',
        topics: [
          { id: 'm3-pa-1', name: 'Parametric Equations & Graphs', description: 'Graphing parametric curves, eliminating the parameter, direction of motion' },
          { id: 'm3-pa-2', name: 'Parametric Applications', description: 'Projectile motion with parametric equations, Lissajous curves' },
        ],
      },
      {
        id: 'm3-polar',
        name: 'Polar Equations',
        topics: [
          { id: 'm3-pl-1', name: 'Polar Coordinates', description: 'Converting between rectangular and polar, plotting points' },
          { id: 'm3-pl-2', name: 'Polar Graphs', description: 'Roses, cardioids, limacons, circles; symmetry tests' },
        ],
      },
      {
        id: 'm3-complex',
        name: 'Complex Numbers',
        topics: [
          { id: 'm3-cx-1', name: 'Complex Number Operations', description: 'Arithmetic with complex numbers, complex conjugates, absolute value' },
          { id: 'm3-cx-2', name: 'Polar Form & De Moivre\'s Theorem', description: 'Trigonometric form, multiplying/dividing in polar form, finding roots' },
        ],
      },
      {
        id: 'm3-vectors',
        name: 'Vectors',
        topics: [
          { id: 'm3-vc-1', name: 'Vector Operations', description: 'Adding, subtracting, scalar multiplication, magnitude, unit vectors' },
          { id: 'm3-vc-2', name: 'Dot Product & Applications', description: 'Dot product, angle between vectors, projections, work' },
        ],
      },
      {
        id: 'm3-matrices',
        name: 'Matrices',
        topics: [
          { id: 'm3-mx-1', name: 'Matrix Operations', description: 'Addition, subtraction, scalar multiplication, matrix multiplication' },
          { id: 'm3-mx-2', name: 'Determinants & Inverses', description: 'Finding determinants, inverse matrices, Cramer\'s rule' },
          { id: 'm3-mx-3', name: 'Solving Systems with Matrices', description: 'Augmented matrices, row reduction, matrix equations' },
        ],
      },
      {
        id: 'm3-probstats',
        name: 'Probability & Statistics',
        topics: [
          { id: 'm3-ps-1', name: 'Advanced Probability', description: 'Bayes\' theorem, expected value, probability distributions' },
          { id: 'm3-ps-2', name: 'Statistical Inference', description: 'Confidence intervals, hypothesis testing concepts, margin of error' },
        ],
      },
    ],
  },
];
