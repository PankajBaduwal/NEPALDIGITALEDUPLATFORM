/**
 * ps-catalog.js
 * Probability and Statistical Modeling for Computing Systems (U25MA301) — 18 Simulations Catalog
 * Regulation R2025 CBCS · Semester III · Common to IT, CSE, AI&DS, AI&ML, Cyber · BSC · 4 Credits
 *
 * 5 Units:
 * Unit I:   Probability & Random Variables (Sims 1-4)
 * Unit II:  Standard Probability Distributions (Sims 5-8)
 * Unit III: Joint Distributions & Statistical Modeling (Sims 9-11)
 * Unit IV:  Sampling Distributions & Hypothesis Testing (Sims 12-15)
 * Unit V:   Stochastic Processes, Queueing & Computing System Performance (Sims 16-18)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof root !== 'undefined') root.EduversePSCatalog = exp;
  if (typeof window !== 'undefined') window.EduversePSCatalog = exp;
  if (typeof global !== 'undefined') global.EduversePSCatalog = exp;
  if (typeof module === 'object' && module.exports) module.exports = exp;
  if (typeof define === 'function' && define.amd) define([], function () { return exp; });
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    { number: 1, title: 'Probability & Random Variables', code: 'UNIT I' },
    { number: 2, title: 'Standard Probability Distributions', code: 'UNIT II' },
    { number: 3, title: 'Joint Distributions & Statistical Modeling', code: 'UNIT III' },
    { number: 4, title: 'Sampling Distributions & Hypothesis Testing', code: 'UNIT IV' },
    { number: 5, title: 'Stochastic Processes, Queueing & Computing Systems', code: 'UNIT V' }
  ];

  const SIMULATIONS = [
    // ══════════════════════════════════════════════════════════
    // UNIT I — PROBABILITY & RANDOM VARIABLES
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma301-sample-space',
      unit: 1,
      unitTitle: 'Probability & Random Variables',
      topic: 'Sample Space & Events',
      title: 'Random Experiment & Sample Space Explorer ⭐ (Flagship)',
      icon: '🎲',
      flagship: true,
      description: 'Explore finite sample spaces, discrete outcome points, event unions (A ∪ B), intersections (A ∩ B), and complementary events with exact probability fractions.',
      formula: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\quad | \\quad P(A^c) = 1 - P(A)',
      defaultParams: { experiment: 'dice2', eventA: 'sum_even', eventB: 'sum_gt_7' },
      challenge: {
        goal: 'Calculate the probability of rolling a sum greater than 7 or an even sum with a pair of fair dice.',
        expectedProbability: '24/36 = 2/3'
      }
    },
    {
      id: 'u25ma301-conditional-bayes',
      unit: 1,
      unitTitle: 'Probability & Random Variables',
      topic: 'Conditional Probability & Bayes',
      title: 'Conditional Probability & Bayes\' Theorem Lab ⭐ (Flagship)',
      icon: '🌲',
      flagship: true,
      description: 'Visualize multi-stage event trees, law of total probability, and inverse Bayesian inference for computing system fault diagnostics.',
      formula: 'P(A_i \\mid B) = \\frac{P(B \\mid A_i) P(A_i)}{\\sum_{j=1}^k P(B \\mid A_j) P(A_j)}',
      defaultParams: { priorA: 0.02, sensitivity: 0.98, falsePositive: 0.05 },
      challenge: {
        goal: 'Given a server fault alarm with 2% prior anomaly rate, 98% detection rate, and 5% false alarm rate, calculate the posterior probability of a real defect.',
        expectedPosterior: 0.2857
      }
    },
    {
      id: 'u25ma301-random-variables',
      unit: 1,
      unitTitle: 'Probability & Random Variables',
      topic: 'Random Variables & Moments',
      title: 'Discrete Random Variables & Expectation Studio',
      icon: '📊',
      flagship: false,
      description: 'Define discrete probability mass functions (PMF), verify the axiom sum(p_i) = 1, and compute expected value E[X], variance Var(X), and standard deviation.',
      formula: 'E[X] = \\sum x_i p_i \\quad | \\quad \\text{Var}(X) = E[X^2] - (E[X])^2',
      defaultParams: { values: [0, 1, 2, 3], probs: [0.1, 0.4, 0.3, 0.2] },
      challenge: {
        goal: 'Verify that the user-defined PMF sums to 1.0 and compute E[X] and Var(X).',
        expectedMean: 1.6,
        expectedVar: 0.84
      }
    },
    {
      id: 'u25ma301-law-large-numbers',
      unit: 1,
      unitTitle: 'Probability & Random Variables',
      topic: 'Law of Large Numbers',
      title: 'Empirical Probability & Law of Large Numbers (LLN)',
      icon: '📈',
      flagship: false,
      description: 'Simulate up to 10,000 Bernoulli trials and observe relative frequencies converging toward theoretical probability with animated sample trajectory paths.',
      formula: '\\lim_{n \\to \\infty} P\\left(\\left| \\frac{S_n}{n} - p \\right| < \\epsilon\\right) = 1',
      defaultParams: { numTrials: 1000, trueProb: 0.5 },
      challenge: {
        goal: 'Observe the deviation between empirical frequency and theoretical probability as sample size grows from 50 to 5,000.',
        expectedConvergence: 'Deviation bounded by O(1/sqrt(n))'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT II — STANDARD PROBABILITY DISTRIBUTIONS
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma301-binomial-distribution',
      unit: 2,
      unitTitle: 'Standard Probability Distributions',
      topic: 'Binomial Distribution',
      title: 'Binomial Distribution & Bernoulli Trials ⭐ (Flagship)',
      icon: '🪙',
      flagship: true,
      description: 'Explore the Binomial distribution B(n, p) with sliders for trial count n and success probability p, comparing PMF/CDF against simulated frequencies.',
      formula: 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\quad E[X] = np, \\quad \\text{Var}(X) = np(1-p)',
      defaultParams: { n: 10, p: 0.4 },
      challenge: {
        goal: 'For packet transmission over an error-prone link with n=10 and packet loss p=0.1, find the probability of at most 2 dropped packets.',
        expectedCdf: 0.9298
      }
    },
    {
      id: 'u25ma301-poisson-distribution',
      unit: 2,
      unitTitle: 'Standard Probability Distributions',
      topic: 'Poisson Distribution',
      title: 'Poisson Distribution & Request Arrivals Model',
      icon: '⏱️',
      flagship: false,
      description: 'Model random independent events in continuous time intervals (server hits, network packet arrivals) using rate parameter lambda.',
      formula: 'P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad E[X] = \\lambda, \\quad \\text{Var}(X) = \\lambda',
      defaultParams: { lambda: 4 },
      challenge: {
        goal: 'If a database receives an average of lambda=4 queries/sec, calculate the probability of receiving exactly 4 queries in a given second.',
        expectedProb: 0.1954
      }
    },
    {
      id: 'u25ma301-normal-distribution',
      unit: 2,
      unitTitle: 'Standard Probability Distributions',
      topic: 'Normal Distribution',
      title: 'Gaussian / Normal Distribution & Z-Score Lab ⭐ (Flagship)',
      icon: '🔔',
      flagship: true,
      description: 'Interactive Gaussian bell curve with adjustable mean mu and standard deviation sigma, showing the 68-95-99.7 empirical rule, z-score mapping, and shaded interval probabilities.',
      formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}} \\quad | \\quad Z = \\frac{X - \\mu}{\\sigma}',
      defaultParams: { mu: 100, sigma: 15, lowerBound: 85, upperBound: 115 },
      challenge: {
        goal: 'Calculate the probability P(mu - sigma <= X <= mu + sigma) for any normal distribution.',
        expectedIntervalProb: 0.6827
      }
    },
    {
      id: 'u25ma301-exponential-distribution',
      unit: 2,
      unitTitle: 'Standard Probability Distributions',
      topic: 'Exponential Distribution',
      title: 'Exponential Distribution & Memoryless Property',
      icon: '⏳',
      flagship: false,
      description: 'Analyze continuous inter-arrival times and hardware component lifespans with rate parameter lambda and prove the memoryless property.',
      formula: 'f(x) = \\lambda e^{-\\lambda x} \\quad | \\quad P(X > s+t \\mid X > s) = P(X > t)',
      defaultParams: { lambda: 0.5, t: 2 },
      challenge: {
        goal: 'Demonstrate that an active cloud instance running for s=10 hours without failure has the same remaining failure distribution as a new instance.',
        expectedProperty: 'P(X > 10 + t | X > 10) = e^(-0.5 t)'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT III — JOINT DISTRIBUTIONS & STATISTICAL MODELING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma301-joint-distributions',
      unit: 3,
      unitTitle: 'Joint Distributions & Statistical Modeling',
      topic: 'Joint & Marginal Distributions',
      title: 'Two-Dimensional Joint & Marginal Probability Matrix',
      icon: '🗂️',
      flagship: false,
      description: 'Inspect 2D discrete joint distribution tables P(X=x, Y=y), compute row/column marginal probabilities, and test for random variable independence.',
      formula: 'p_X(x) = \\sum_y p_{X,Y}(x, y) \\quad | \\quad X \\perp Y \\iff p_{X,Y}(x,y) = p_X(x) p_Y(y)',
      defaultParams: { matrixSize: '2x2' },
      challenge: {
        goal: 'Check whether X and Y are independent in a given 2x2 joint distribution table.',
        expectedCheck: 'Compare every cell p(x,y) with p(x)*p(y)'
      }
    },
    {
      id: 'u25ma301-covariance-correlation',
      unit: 3,
      unitTitle: 'Joint Distributions & Statistical Modeling',
      topic: 'Covariance & Correlation',
      title: 'Covariance & Pearson Correlation Studio',
      icon: '📐',
      flagship: false,
      description: 'Interact with 2D paired scatter datasets, calculating Covariance Cov(X,Y) and Pearson correlation coefficient r in [-1, +1] with outlier sensitivity testing.',
      formula: 'r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\sigma_Y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\sum(y_i-\\bar{y})^2}}',
      defaultParams: { dataset: 'positive_linear' },
      challenge: {
        goal: 'Demonstrate why moving a single extreme outlier can drastically alter the Pearson correlation coefficient.',
        expectedSensitivity: 'High outlier sensitivity'
      }
    },
    {
      id: 'u25ma301-linear-regression',
      unit: 3,
      unitTitle: 'Joint Distributions & Statistical Modeling',
      topic: 'Linear Regression',
      title: 'Least Squares Linear Regression Model ⭐ (Flagship)',
      icon: '📏',
      flagship: true,
      description: 'Fit optimal ordinary least squares (OLS) regression lines y = b0 + b1*x through bivariate data points with visual residual squares and R-squared metric.',
      formula: 'b_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}, \\quad b_0 = \\bar{y} - b_1 \\bar{x}',
      defaultParams: { points: [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]] },
      challenge: {
        goal: 'Fit the regression line for benchmark server response times vs user concurrency and predict latency at 10 concurrent requests.',
        expectedSlope: 0.9,
        expectedIntercept: 1.3
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT IV — SAMPLING DISTRIBUTIONS & HYPOTHESIS TESTING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma301-central-limit-theorem',
      unit: 4,
      unitTitle: 'Sampling Distributions & Hypothesis Testing',
      topic: 'Central Limit Theorem',
      title: 'Central Limit Theorem (CLT) Interactive Simulator ⭐ (Flagship)',
      icon: '🎯',
      flagship: true,
      description: 'Draw repeated random samples of size n from arbitrary parent distributions (Uniform, Exponential, Bimodal) and watch the sample mean distribution become normal.',
      formula: '\\bar{X}_n \\xrightarrow{d} N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad \\text{as } n \\to \\infty',
      defaultParams: { parentDist: 'uniform', sampleSize: 30, numSamples: 1000 },
      challenge: {
        goal: 'Demonstrate that the standard error of the sample mean decreases as sigma / sqrt(n) when sample size n increases.',
        expectedStdError: 'sigma / sqrt(n)'
      }
    },
    {
      id: 'u25ma301-hypothesis-testing',
      unit: 4,
      unitTitle: 'Sampling Distributions & Hypothesis Testing',
      topic: 'Hypothesis Testing',
      title: 'Statistical Hypothesis Testing Lab (Z-Test & t-Test)',
      icon: '⚖️',
      flagship: false,
      description: 'Formulate Null (H0) and Alternative (H1) hypotheses, set significance level alpha (0.05, 0.01), compute test statistics (z, t), and interpret critical rejection regions and p-values.',
      formula: 'z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad | \\quad t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}, \\; \\text{df} = n-1',
      defaultParams: { testType: 'z-test', alpha: 0.05, sampleMean: 104, popMean: 100, sigma: 10, n: 36 },
      challenge: {
        goal: 'Determine whether a new sorting algorithm with mean runtime 104ms is significantly slower than baseline 100ms at alpha=0.05.',
        expectedDecision: 'Reject H0 (z = 2.40, p = 0.0082 < 0.05)'
      }
    },
    {
      id: 'u25ma301-chisquare-independence',
      unit: 4,
      unitTitle: 'Sampling Distributions & Hypothesis Testing',
      topic: 'Chi-Square Tests',
      title: 'Chi-Square Test for Independence & Goodness of Fit',
      icon: '📋',
      flagship: false,
      description: 'Compute expected frequencies from observed contingency tables, evaluate the Chi-Square test statistic sum((O-E)^2/E), and determine statistical independence.',
      formula: '\\chi^2 = \\sum_{i=1}^r \\sum_{j=1}^c \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}, \\quad E_{ij} = \\frac{R_i C_j}{N}, \\quad \\text{df} = (r-1)(c-1)',
      defaultParams: { observed: [[30, 10], [20, 40]] },
      challenge: {
        goal: 'Evaluate the test of independence between user device type and bug occurrence.',
        expectedChiSq: 16.67
      }
    },
    {
      id: 'u25ma301-anova-testing',
      unit: 4,
      unitTitle: 'Sampling Distributions & Hypothesis Testing',
      topic: 'ANOVA',
      title: 'One-Way Analysis of Variance (ANOVA F-Test) Visualizer',
      icon: '📊',
      flagship: false,
      description: 'Compare the means of three or more treatment groups (e.g. database query optimizers) by partitioning total sum of squares into Between-Group and Within-Group variations.',
      formula: 'F = \\frac{\\text{MSB}}{\\text{MSW}} = \\frac{\\text{SSB} / (k - 1)}{\\text{SSW} / (N - k)}',
      defaultParams: { numGroups: 3, samplePerGroup: 10 },
      challenge: {
        goal: 'Test whether three caching policies yield identical mean retrieval times at alpha=0.05.',
        expectedFStat: 'F > F_critical -> Reject equality of means'
      }
    },

    // ══════════════════════════════════════════════════════════
    // UNIT V — STOCHASTIC PROCESSES & QUEUEING
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma301-markov-chains',
      unit: 5,
      unitTitle: 'Stochastic Processes, Queueing & Computing Systems',
      topic: 'Markov Chains',
      title: 'Discrete-Time Markov Chain State Transition Explorer ⭐ (Flagship)',
      icon: '🕸️',
      flagship: true,
      description: 'Simulate discrete-time Markov chains with interactive state nodes, transition probability matrix P, n-step Chapman-Kolmogorov distributions, and steady-state vector pi.',
      formula: 'P = \\begin{pmatrix} p_{11} & p_{12} \\\\ p_{21} & p_{22} \\end{pmatrix}, \\quad \\pi P = \\pi, \\quad \\sum \\pi_i = 1',
      defaultParams: { states: ['Available', 'Busy'], p00: 0.7, p01: 0.3, p10: 0.6, p11: 0.4 },
      challenge: {
        goal: 'Compute the long-run steady-state probability of a server being in the Busy state.',
        expectedSteadyState: { Available: 0.667, Busy: 0.333 }
      }
    },
    {
      id: 'u25ma301-queueing-models',
      unit: 5,
      unitTitle: 'Stochastic Processes, Queueing & Computing Systems',
      topic: 'Queueing Systems (M/M/1)',
      title: 'Queueing Systems & Little\'s Law (M/M/1 Server Lab)',
      icon: '🚶',
      flagship: false,
      description: 'Model single-server M/M/1 queues with Poisson arrivals lambda, exponential service rate mu, traffic utilization rho = lambda/mu, and verify Little\'s Law L = lambda * W.',
      formula: '\\rho = \\frac{\\lambda}{\\mu}, \\quad L = \\frac{\\rho}{1-\\rho}, \\quad W = \\frac{1}{\\mu - \\lambda}, \\quad L = \\lambda W',
      defaultParams: { lambda: 6, mu: 8 },
      challenge: {
        goal: 'Calculate the average number of customer requests in an API gateway with arrival rate 6 req/s and service rate 8 req/s.',
        expectedL: 3.0,
        expectedW: 0.5
      }
    },
    {
      id: 'u25ma301-system-reliability',
      unit: 5,
      unitTitle: 'Stochastic Processes, Queueing & Computing Systems',
      topic: 'Reliability & Availability',
      title: 'Computing System Reliability & 99.999% Availability Studio',
      icon: '🛡️',
      flagship: false,
      description: 'Model system uptime, Mean Time Between Failures (MTBF), Mean Time to Repair (MTTR), and compare Series (R = prod R_i) vs Parallel (R = 1 - prod(1-R_i)) redundant computing clusters.',
      formula: 'R_{\\text{series}} = \\prod R_i, \\quad R_{\\text{parallel}} = 1 - \\prod (1 - R_i), \\quad A = \\frac{\\text{MTBF}}{\\text{MTBF} + \\text{MTTR}}',
      defaultParams: { mtbf: 720, mttr: 4, redundancy: 'parallel_2' },
      challenge: {
        goal: 'Calculate system availability for a dual-redundant server array with MTBF=720 hours and MTTR=4 hours.',
        expectedAvailability: 0.9945
      }
    },

    // ══════════════════════════════════════════════════════════
    // U25MA302: PROBABILITY AND STATISTICS (CIVIL ENGINEERING)
    // ══════════════════════════════════════════════════════════
    {
      id: 'u25ma302-prob-distributions',
      unit: 1,
      unitTitle: 'One-Dimensional Random Variables',
      topic: 'Probability Distributions',
      title: 'Probability Distributions Explorer ⭐',
      icon: '📊',
      flagship: true,
      courseCode: 'U25MA302',
      description: 'Explore discrete (Binomial, Poisson, Geometric) and continuous (Normal, Exponential, Uniform) distributions with interactive PMF/PDF and CDF plots, parameter sliders, and shaded interval probabilities.',
      formula: 'P(a \\le X \\le b) = \\int_{a}^{b} f(x)\\,dx \\quad \\text{or} \\quad \\sum_{k=a}^{b} P(X = k)',
      defaultParams: {
        distribution: 'normal',
        param1: 0,
        param2: 1.5,
        viewMode: 'density',
        x1: -1.5,
        x2: 1.5
      },
      challenge: {
        goal: 'For a standard Normal distribution N(0, 1), find the interval [a, b] centered at 0 that contains approximately 95% of total probability.',
        expectedInterval: '[-1.96, 1.96]'
      }
    },
    {
      id: 'u25ma302-sampling-distributions',
      unit: 4,
      unitTitle: 'Inferential Statistics',
      topic: 'Sampling & Central Limit Theorem',
      title: 'Sampling and Sampling Distribution Lab ⭐',
      icon: '🏛',
      flagship: true,
      courseCode: 'U25MA302',
      description: 'Simulate repeated sampling from custom population distributions (Uniform, Normal, Skewed, Bimodal), observe empirical convergence to normality, and verify Central Limit Theorem and Standard Error.',
      formula: '\\bar{X}_n \\xrightarrow{d} \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad | \\quad \\text{SE} = \\frac{\\sigma}{\\sqrt{n}}',
      defaultParams: {
        popType: 'skewed',
        sampleSize: 20,
        sampleBatches: '50',
        replacement: 'with',
        seed: 42
      },
      challenge: {
        goal: 'Verify how sample size affects Standard Error: if population std dev is 10, calculate theoretical SE for sample size n = 25.',
        expectedSE: 2.0
      }
    },
    {
      id: 'u25ma302-least-squares-regression',
      unit: 3,
      unitTitle: 'Two-Dimensional Probability Distributions',
      topic: 'Least-Squares Regression',
      title: 'Least-Squares Regression Explorer ⭐',
      icon: '📉',
      flagship: true,
      courseCode: 'U25MA302',
      description: 'Fit ordinary least-squares regression lines to engineering bivariate datasets, visualize vertical residuals e_i, verify sum(e_i) = 0, evaluate R² goodness of fit, and explore prediction and extrapolation limits.',
      formula: '\\hat{y} = \\beta_0 + \\beta_1 x \\quad | \\quad \\beta_1 = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} \\quad | \\quad R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}}',
      defaultParams: {
        dataset: 'concrete',
        showResiduals: 'yes',
        showFitted: 'yes',
        predictX: 0.5
      },
      challenge: {
        goal: 'Examine the residual sum of an OLS fitted line: what should the sum of vertical residuals equal for any valid least-squares line?',
        expectedSum: 0
      }
    },
    {
      id: 'u25ma302-correlation-data',
      unit: 3,
      unitTitle: 'Two-Dimensional Probability Distributions',
      topic: 'Covariance & Correlation',
      title: 'Correlation and Statistical Data Explorer ⭐',
      icon: '↔',
      flagship: true,
      courseCode: 'U25MA302',
      description: 'Investigate positive, negative, and non-linear bivariate associations with an interactive scatterplot, linked data table, Pearson r and Spearman rank calculations, and high-leverage outlier effects.',
      formula: 'r = \\frac{\\text{Cov}(X,Y)}{s_X s_Y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}',
      defaultParams: {
        associationType: 'strong_pos',
        numPoints: 25,
        outlier: 'none',
        corrMethod: 'both'
      },
      challenge: {
        goal: 'Select the Parabolic / Non-Linear pattern: observe that Pearson r is near 0 even though there is a strong deterministic relationship. Explain why.',
        expectedObservation: 'Pearson r only measures linear relationships.'
      }
    }
  ];

  function getSimulationById(id) {
    if (!id) return null;
    const clean = id.trim();
    for (let i = 0; i < SIMULATIONS.length; i++) {
      if (SIMULATIONS[i].id === clean) return SIMULATIONS[i];
    }
    return null;
  }

  function getSimulationsForUnit(unitNumber) {
    const num = parseInt(unitNumber, 10);
    return SIMULATIONS.filter(s => s.unit === num);
  }

  return {
    courseCode: 'U25MA301',
    courseTitle: 'Probability and Statistical Modeling for Computing Systems',
    regulation: 'R2025 CBCS',
    semester: 3,
    credits: 4,
    UNITS: UNITS,
    SIMULATIONS: SIMULATIONS,
    getSimulationById: getSimulationById,
    getSimulationsForUnit: getSimulationsForUnit
  };
}));
