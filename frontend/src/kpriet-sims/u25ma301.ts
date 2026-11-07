import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25MA301
 * Course Name: Probability and Statistical Modeling for Computing Systems
 * Semester: III | Category: BSC | Credits: 4 (L-T-P-J-C: 3-1-0-0-4) | Regulation: R2025 CBCS
 * Common to: IT, CSE, AI&DS, AI&ML, Cyber Security (SC), CSBS (CB)
 * 
 * Uses isolated Smart Board Probability & Statistics Engine architecture (boardEngine: 'ps')
 * Dynamic routing via smartboardPresetKey to ps-simulation.html and tools/ps-simulation.js.
 */
export const U25MA301_SUBJECT_KEYWORDS = [
  'probability and statistical modeling for computing systems',
  'probability and statistical modeling',
  'probability & statistical modeling for computing systems',
  'probability & statistical modeling',
  'probability and statistics',
  'probability & statistics',
  'u25ma301',
  'ma301',
  'probability',
  'statistical modeling',
];

function u25maSimulation(def: {
  id: string;
  unit: number;
  unitTitle: string;
  topic: string;
  title: string;
  icon: string;
  shortDescription: string;
  learningObjectives: string[];
  formulaOverview: string;
  parameters: ISimulationParam[];
  metrics: ISimulationMetric[];
  flagship?: boolean;
}): ISimulationDefinition {
  return {
    id: def.id,
    boardEngine: 'ps',
    domain: 'MATHEMATICS',
    category: 'probability & statistics',
    unit: def.unit,
    unitTitle: def.unitTitle,
    topic: def.topic,
    title: def.title,
    icon: def.icon,
    subjectKeywords: U25MA301_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with an interactive 2D mathematical canvas, parameter sliders, step-by-step pedagogical derivations, dynamic sampling animations, and context-aware Probability AI assistant.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    tags: ['U25MA301', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Probability', 'Statistics', 'R2025 CBCS'],
    parameters: def.parameters,
    metrics: def.metrics,
    engine: {
      createInitialState: () => ({ active: true, step: 0 }),
      update: (state: any, _p: any, dt: number) => ({ ...state, time: (state.time || 0) + dt }),
      render: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      },
    },
  };
}

export const U25MA301_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT I — PROBABILITY & RANDOM VARIABLES
  // ═══════════════════════════════════════════════════════════════════════════
  u25maSimulation({
    id: 'u25ma301-sample-space',
    unit: 1,
    unitTitle: 'Probability & Random Variables',
    topic: 'Sample Space & Events',
    title: 'Random Experiment & Sample Space Explorer ⭐',
    icon: '🎲',
    flagship: true,
    shortDescription: 'Explore finite sample spaces, discrete outcome points, event unions (A ∪ B), intersections (A ∩ B), and complementary events with exact probability fractions.',
    learningObjectives: [
      'Construct discrete sample spaces for single and multi-stage experiments',
      'Compute exact probabilities for event unions without double-counting: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
      'Verify complementary event rule P(Aᶜ) = 1 - P(A)',
    ],
    formulaOverview: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\quad | \\quad P(A^c) = 1 - P(A)',
    parameters: [
      { key: 'experiment', label: 'Experiment', type: 'select', default: 'dice2', options: [
        { label: 'Pair of Fair 6-sided Dice (N=36)', value: 'dice2' },
        { label: 'Tossing 3 Coins (N=8)', value: 'coin3' },
      ]},
      { key: 'eventA', label: 'Event A', type: 'select', default: 'sum_even', options: [
        { label: 'Sum is Even', value: 'sum_even' },
        { label: 'Sum is Prime', value: 'sum_prime' },
      ]},
      { key: 'eventB', label: 'Event B', type: 'select', default: 'sum_gt_7', options: [
        { label: 'Sum > 7', value: 'sum_gt_7' },
        { label: 'First Die is Odd', value: 'first_is_odd' },
      ]},
    ],
    metrics: [
      { key: 'probA', label: 'P(A)', unit: '' },
      { key: 'probB', label: 'P(B)', unit: '' },
      { key: 'probUnion', label: 'P(A ∪ B)', unit: '' },
      { key: 'probIntersect', label: 'P(A ∩ B)', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-conditional-bayes',
    unit: 1,
    unitTitle: 'Probability & Random Variables',
    topic: 'Conditional Probability & Bayes',
    title: 'Conditional Probability & Bayes\' Theorem Lab ⭐',
    icon: '🌲',
    flagship: true,
    shortDescription: 'Visualize multi-stage event trees, law of total probability, and inverse Bayesian inference for computing system fault diagnostics.',
    learningObjectives: [
      'Calculate conditional probability P(A|B) over a reduced sample space where P(B) > 0',
      'Apply Law of Total Probability to partition sample spaces into mutually exclusive scenarios',
      'Evaluate posterior probabilities P(Hypothesis | Evidence) using Bayes\' Theorem for automated diagnostic alerts',
    ],
    formulaOverview: 'P(A_i \\mid B) = \\frac{P(B \\mid A_i) P(A_i)}{\\sum_{j=1}^k P(B \\mid A_j) P(A_j)}',
    parameters: [
      { key: 'priorH1', label: 'Prior P(Server Failure)', type: 'range', min: 0.01, max: 0.5, step: 0.01, default: 0.05 },
      { key: 'sensH1', label: 'Sensitivity P(Alert | Failure)', type: 'range', min: 0.5, max: 0.99, step: 0.01, default: 0.95 },
      { key: 'fpH2', label: 'False Alarm P(Alert | Healthy)', type: 'range', min: 0.01, max: 0.3, step: 0.01, default: 0.08 },
    ],
    metrics: [
      { key: 'marginalPAlert', label: 'Total P(Alert)', unit: '' },
      { key: 'posteriorFault', label: 'P(Fault | Alert)', unit: '' },
      { key: 'falseDiscoveryRate', label: 'FDR P(Healthy | Alert)', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-random-variables',
    unit: 1,
    unitTitle: 'Probability & Random Variables',
    topic: 'Discrete Random Variables',
    title: 'Discrete Random Variables & Expectation Lab',
    icon: '📊',
    shortDescription: 'Construct probability mass functions (PMF), verify axiomatic normalization sum(p_i) = 1, and compute term-by-term expected value and variance.',
    learningObjectives: [
      'Map physical sample space outcomes to discrete numerical real values X',
      'Derive expectation E[X] = sum(x_i * p(x_i)) as the probability-weighted center of mass',
      'Calculate variance Var(X) = E[X^2] - (E[X])^2 and verify standard deviation units',
    ],
    formulaOverview: 'E[X] = \\sum_{i} x_i P(X = x_i) \\quad | \\quad \\text{Var}(X) = \\sum_{i} (x_i - \\mu)^2 P(X = x_i)',
    parameters: [
      { key: 'numStates', label: 'Number of States (k)', type: 'range', min: 3, max: 6, step: 1, default: 4 },
      { key: 'skew', label: 'Probability Skew', type: 'range', min: -1, max: 1, step: 0.1, default: 0 },
    ],
    metrics: [
      { key: 'sumProb', label: 'Sum P(X=x)', unit: '' },
      { key: 'expectedVal', label: 'E[X]', unit: '' },
      { key: 'varianceVal', label: 'Var(X)', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-law-large-numbers',
    unit: 1,
    unitTitle: 'Probability & Random Variables',
    topic: 'Empirical Convergence',
    title: 'Empirical Probability & Law of Large Numbers',
    icon: '📈',
    shortDescription: 'Run large-scale simulated Bernoulli trials and track how observed relative frequencies converge toward theoretical probabilities as trial count grows.',
    learningObjectives: [
      'Differentiate empirical relative frequency from fixed theoretical probability',
      'Demonstrate the Weak Law of Large Numbers through stochastic convergence curves',
      'Understand error bounds and variance contraction scaling as 1/sqrt(N)',
    ],
    formulaOverview: '\\lim_{n \\to \\infty} P\\left(\\left| \\frac{S_n}{n} - p \\right| < \\varepsilon\\right) = 1',
    parameters: [
      { key: 'probSuccess', label: 'True Theoretical p', type: 'range', min: 0.1, max: 0.9, step: 0.05, default: 0.5 },
      { key: 'trialBatch', label: 'Batch Size', type: 'range', min: 10, max: 500, step: 10, default: 50 },
    ],
    metrics: [
      { key: 'totalTrials', label: 'Trials N', unit: '' },
      { key: 'empiricalFreq', label: 'Observed f/N', unit: '' },
      { key: 'absError', label: '|f/N - p|', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT II — STANDARD PROBABILITY DISTRIBUTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  u25maSimulation({
    id: 'u25ma301-binomial-distribution',
    unit: 2,
    unitTitle: 'Standard Probability Distributions',
    topic: 'Binomial Distribution',
    title: 'Binomial Distribution & Bernoulli Trials Lab ⭐',
    icon: '🎯',
    flagship: true,
    shortDescription: 'Model repeated independent trials with fixed success probability, analyze PMF histograms, and verify theoretical expectation np and variance np(1-p).',
    learningObjectives: [
      'State and verify the 4 Binomial assumptions (fixed n, two outcomes, constant p, mutual independence)',
      'Calculate individual PMF values P(X=k) using combinatorics nCk * p^k * (1-p)^(n-k)',
      'Compare exact discrete probabilities with empirical simulated frequencies',
    ],
    formulaOverview: 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k} \\quad | \\quad E[X] = np, \\; \\text{Var}(X) = np(1-p)',
    parameters: [
      { key: 'n', label: 'Number of Trials (n)', type: 'range', min: 2, max: 30, step: 1, default: 12 },
      { key: 'p', label: 'Success Probability (p)', type: 'range', min: 0.05, max: 0.95, step: 0.05, default: 0.4 },
    ],
    metrics: [
      { key: 'mean', label: 'E[X] = np', unit: '' },
      { key: 'variance', label: 'Var(X)', unit: '' },
      { key: 'stdDev', label: 'Std Dev σ', unit: '' },
      { key: 'mode', label: 'Mode k', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-poisson-distribution',
    unit: 2,
    unitTitle: 'Standard Probability Distributions',
    topic: 'Poisson Distribution',
    title: 'Poisson Distribution & Request Arrivals Lab',
    icon: '⏱',
    shortDescription: 'Simulate Poisson-distributed packet arrivals and server request counts per unit interval, adjusting average arrival rate lambda and observing PMF shape.',
    learningObjectives: [
      'Model rare independent events occurring at a constant average rate λ in time or space',
      'Verify equidisperion: E[X] = Var(X) = λ',
      'Demonstrate Poisson approximation to the Binomial as n -> inf, p -> 0 with np = λ',
    ],
    formulaOverview: 'P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!} \\quad | \\quad E[X] = \\text{Var}(X) = \\lambda',
    parameters: [
      { key: 'lambda', label: 'Arrival Rate (λ)', type: 'range', min: 0.5, max: 15.0, step: 0.5, default: 4.5 },
      { key: 'maxK', label: 'Max Horizon (k)', type: 'range', min: 10, max: 30, step: 1, default: 18 },
    ],
    metrics: [
      { key: 'lambdaVal', label: 'Rate λ', unit: 'req/s' },
      { key: 'modeVal', label: 'Mode k', unit: '' },
      { key: 'zeroProb', label: 'P(0 arrivals)', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-normal-distribution',
    unit: 2,
    unitTitle: 'Standard Probability Distributions',
    topic: 'Normal Distribution',
    title: 'Normal (Gaussian) Distribution Explorer ⭐',
    icon: '🔔',
    flagship: true,
    shortDescription: 'Visualize continuous Gaussian density curves, compute shaded interval probabilities via standard normal CDF Φ(z), and test empirical 68-95-99.7% bounds.',
    learningObjectives: [
      'Understand probability density function f(x) and why point probabilities P(X = a) = 0 for continuous random variables',
      'Compute standardization z-scores: z = (x - μ) / σ',
      'Calculate exact area probabilities P(x1 ≤ X ≤ x2) using polynomial error function approximations',
    ],
    formulaOverview: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}} \\quad | \\quad z = \\frac{x - \\mu}{\\sigma}',
    parameters: [
      { key: 'mu', label: 'Mean (μ)', type: 'range', min: -10, max: 10, step: 0.5, default: 0 },
      { key: 'sigma', label: 'Std Dev (σ)', type: 'range', min: 0.5, max: 5.0, step: 0.1, default: 1.5 },
      { key: 'x1', label: 'Lower Bound (x1)', type: 'range', min: -10, max: 10, step: 0.5, default: -1.5 },
      { key: 'x2', label: 'Upper Bound (x2)', type: 'range', min: -10, max: 10, step: 0.5, default: 1.5 },
    ],
    metrics: [
      { key: 'intervalProb', label: 'P(x1 ≤ X ≤ x2)', unit: '' },
      { key: 'z1', label: 'z1 Score', unit: '' },
      { key: 'z2', label: 'z2 Score', unit: '' },
      { key: 'peakDensity', label: 'Peak f(μ)', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-exponential-distribution',
    unit: 2,
    unitTitle: 'Standard Probability Distributions',
    topic: 'Exponential Distribution',
    title: 'Exponential Distribution & Memoryless Property',
    icon: '⏳',
    shortDescription: 'Model computing component lifetimes and inter-arrival intervals with parameter lambda, demonstrating the fundamental memoryless property.',
    learningObjectives: [
      'Derive exponential density f(x) = λe^(-λx) and cumulative distribution F(x) = 1 - e^(-λx)',
      'Demonstrate the memoryless property: P(X > s + t | X > s) = P(X > t)',
      'Calculate Mean Time To Failure (MTTF) = 1/λ',
    ],
    formulaOverview: 'f(x) = \\lambda e^{-\\lambda x} \\quad | \\quad P(X > s + t \\mid X > s) = P(X > t)',
    parameters: [
      { key: 'lambda', label: 'Failure/Service Rate (λ)', type: 'range', min: 0.1, max: 3.0, step: 0.1, default: 0.8 },
      { key: 'thresholdT', label: 'Interval (t)', type: 'range', min: 0.5, max: 5.0, step: 0.5, default: 1.5 },
    ],
    metrics: [
      { key: 'mttf', label: 'MTTF = 1/λ', unit: 'hrs' },
      { key: 'probSurvive', label: 'P(X > t)', unit: '' },
      { key: 'varianceExp', label: 'Var(X) = 1/λ²', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT III — JOINT DISTRIBUTIONS & STATISTICAL MODELING
  // ═══════════════════════════════════════════════════════════════════════════
  u25maSimulation({
    id: 'u25ma301-joint-distributions',
    unit: 3,
    unitTitle: 'Joint Distributions & Statistical Modeling',
    topic: 'Joint Probability Mass Functions',
    title: 'Joint & Marginal Probability Table Explorer',
    icon: '▦',
    shortDescription: 'Inspect 2D discrete joint PMFs p(x,y), sum along rows and columns to derive marginal probabilities, and test stochastic independence.',
    learningObjectives: [
      'Validate joint PMF normalization sum_x sum_y p(x,y) = 1',
      'Compute marginal distributions P(X=x) = sum_y p(x,y) and P(Y=y) = sum_x p(x,y)',
      'Determine stochastic independence by verifying whether p(x,y) = p_X(x) * p_Y(y) for all (x,y)',
    ],
    formulaOverview: 'P(X = x) = \\sum_{y} P(X = x, Y = y) \\quad | \\quad P(X, Y) = P(X)P(Y) \\iff \\text{Independent}',
    parameters: [
      { key: 'association', label: 'Correlation Bias', type: 'range', min: -0.8, max: 0.8, step: 0.1, default: 0.3 },
    ],
    metrics: [
      { key: 'totalProb', label: 'Total Probability', unit: '' },
      { key: 'isIndependent', label: 'Independent?', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-covariance-correlation',
    unit: 3,
    unitTitle: 'Joint Distributions & Statistical Modeling',
    topic: 'Covariance and Correlation',
    title: 'Covariance & Pearson Correlation Explorer',
    icon: '↔',
    shortDescription: 'Plot paired bivariate computing metrics (e.g. CPU load vs latency), calculate sample covariance and Pearson r, and observe how outliers skew coefficients.',
    learningObjectives: [
      'Calculate sample covariance Cov(X,Y) = 1/(n-1) * sum((x_i - mean_x)(y_i - mean_y))',
      'Compute dimensionless Pearson correlation coefficient r in [-1, +1]',
      'Distinguish strong correlation from causation in observational computing benchmarks',
    ],
    formulaOverview: 'r = \\frac{\\text{Cov}(X,Y)}{s_X s_Y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}',
    parameters: [
      { key: 'numPoints', label: 'Number of Observations', type: 'range', min: 10, max: 50, step: 5, default: 25 },
      { key: 'targetCorr', label: 'Preset Association', type: 'range', min: -1.0, max: 1.0, step: 0.1, default: 0.7 },
      { key: 'outlier', label: 'Inject Outlier', type: 'select', default: 'none', options: [
        { label: 'None', value: 'none' },
        { label: 'High Leverage Outlier', value: 'high' },
      ]},
    ],
    metrics: [
      { key: 'covVal', label: 'Cov(X,Y)', unit: '' },
      { key: 'corrVal', label: 'Pearson r', unit: '' },
      { key: 'rSquared', label: 'r²', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-linear-regression',
    unit: 3,
    unitTitle: 'Joint Distributions & Statistical Modeling',
    topic: 'Linear Regression',
    title: 'Ordinary Least Squares (OLS) Linear Regression ⭐',
    icon: '📉',
    flagship: true,
    shortDescription: 'Fit least-squares regression lines y = b0 + b1*x to performance datasets, visualize vertical residual distances, and evaluate coefficient of determination R².',
    learningObjectives: [
      'Derive OLS slope b1 = Cov(X,Y) / Var(X) and intercept b0 = mean_y - b1 * mean_x',
      'Inspect vertical residuals e_i = y_i - y_hat_i and verify residual sum sum(e_i) = 0',
      'Interpret R² as the fraction of response variance explained by the linear model',
    ],
    formulaOverview: '\\hat{y} = \\beta_0 + \\beta_1 x \\quad | \\quad \\beta_1 = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}',
    parameters: [
      { key: 'n', label: 'Sample Size (N)', type: 'range', min: 10, max: 50, step: 5, default: 20 },
      { key: 'slope', label: 'Underlying Slope (β1)', type: 'range', min: -3.0, max: 3.0, step: 0.2, default: 1.4 },
      { key: 'noise', label: 'Gaussian Noise σ_ε', type: 'range', min: 0.5, max: 5.0, step: 0.5, default: 1.5 },
    ],
    metrics: [
      { key: 'fittedSlope', label: 'Fitted β1', unit: '' },
      { key: 'fittedIntercept', label: 'Fitted β0', unit: '' },
      { key: 'r2Goodness', label: 'R² Score', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT IV — SAMPLING DISTRIBUTIONS & HYPOTHESIS TESTING
  // ═══════════════════════════════════════════════════════════════════════════
  u25maSimulation({
    id: 'u25ma301-central-limit-theorem',
    unit: 4,
    unitTitle: 'Sampling Distributions & Hypothesis Testing',
    topic: 'Central Limit Theorem',
    title: 'Central Limit Theorem (CLT) Sampling Lab ⭐',
    icon: '🏛',
    flagship: true,
    shortDescription: 'Sample repeated subsets from non-normal populations (Uniform, Exponential, Bimodal) and observe empirical sample means form a bell-shaped Gaussian distribution.',
    learningObjectives: [
      'Demonstrate that the distribution of sample means approaches normality as sample size n increases',
      'Verify the standard error formula: SE = sigma / sqrt(n)',
      'Observe that sample mean remains an unbiased estimator of population mean mu',
    ],
    formulaOverview: '\\bar{X}_n \\xrightarrow{d} \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad | \\quad \\text{SE} = \\frac{\\sigma}{\\sqrt{n}}',
    parameters: [
      { key: 'popType', label: 'Parent Population', type: 'select', default: 'uniform', options: [
        { label: 'Uniform (Flat)', value: 'uniform' },
        { label: 'Exponential (Highly Skewed)', value: 'exponential' },
        { label: 'Bimodal (Twin Peaks)', value: 'bimodal' },
      ]},
      { key: 'sampleSize', label: 'Sample Size (n)', type: 'range', min: 2, max: 60, step: 2, default: 24 },
    ],
    metrics: [
      { key: 'popMean', label: 'Population μ', unit: '' },
      { key: 'stdError', label: 'SE = σ/√n', unit: '' },
      { key: 'sampleMean', label: 'Mean of X̄', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-hypothesis-testing',
    unit: 4,
    unitTitle: 'Sampling Distributions & Hypothesis Testing',
    topic: 'Hypothesis Testing',
    title: 'Z-Test & One-Sample Hypothesis Testing Lab',
    icon: '⚖',
    shortDescription: 'Formulate null H0 and alternative H1 hypotheses for server response times, set significance level alpha, calculate z-statistic, and evaluate p-values.',
    learningObjectives: [
      'Formulate null hypothesis H0: mu = mu0 vs alternative hypothesis H1',
      'Compute test statistic z = (x_bar - mu0) / (sigma / sqrt(n))',
      'Identify critical rejection regions and compare p-value against significance level alpha = 0.05',
    ],
    formulaOverview: 'z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad | \\quad \\text{Reject } H_0 \\text{ if } |z| > z_{\\alpha/2}',
    parameters: [
      { key: 'mu0', label: 'Null Mean (μ0)', type: 'range', min: 80, max: 120, step: 5, default: 100 },
      { key: 'alpha', label: 'Significance Level (α)', type: 'select', default: '0.05', options: [
        { label: 'α = 0.05 (95% Confidence)', value: '0.05' },
        { label: 'α = 0.01 (99% Confidence)', value: '0.01' },
      ]},
      { key: 'observedMean', label: 'Observed Sample Mean', type: 'range', min: 85, max: 115, step: 1, default: 104 },
    ],
    metrics: [
      { key: 'zStat', label: 'z-statistic', unit: '' },
      { key: 'pValue', label: 'p-value', unit: '' },
      { key: 'decision', label: 'Statistical Decision', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-chisquare-independence',
    unit: 4,
    unitTitle: 'Sampling Distributions & Hypothesis Testing',
    topic: 'Chi-Square Test',
    title: 'Chi-Square Test of Independence Lab',
    icon: '⊞',
    shortDescription: 'Analyze categorical contingency tables (e.g. Cache Architecture vs Error Occurrence), calculate expected cell counts E_ij, and compute chi-square test statistic.',
    learningObjectives: [
      'Compute expected frequencies E_ij = (Row Total * Column Total) / Grand Total',
      'Calculate chi-square statistic sum((O - E)^2 / E)',
      'Evaluate degrees of freedom df = (r-1)(c-1) and test categorical independence',
    ],
    formulaOverview: '\\chi^2 = \\sum \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} \\quad | \\quad df = (r - 1)(c - 1)',
    parameters: [
      { key: 'tableType', label: 'Contingency Matrix', type: 'select', default: '2x2', options: [
        { label: '2x2 Table: Cache Hit vs Memory Leak', value: '2x2' },
        { label: '2x3 Table: Server OS vs Security Patch', value: '2x3' },
      ]},
    ],
    metrics: [
      { key: 'chiSquareVal', label: 'χ² Statistic', unit: '' },
      { key: 'dfVal', label: 'Degrees of Freedom', unit: '' },
      { key: 'chiDecision', label: 'Independence', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-anova-testing',
    unit: 4,
    unitTitle: 'Sampling Distributions & Hypothesis Testing',
    topic: 'Analysis of Variance',
    title: 'One-Way ANOVA & F-Distribution Explorer',
    icon: '📑',
    shortDescription: 'Compare performance metrics across 3 or more computing architectures, partitioning total variance into between-group (SSB) and within-group (SSW) variances.',
    learningObjectives: [
      'Partition total sum of squares: SST = SSB + SSW',
      'Compute mean squares MSB and MSW with corresponding degrees of freedom',
      'Evaluate F-ratio = MSB / MSW to test whether architecture means differ significantly',
    ],
    formulaOverview: 'F = \\frac{\\text{MSB}}{\\text{MSW}} = \\frac{\\text{SSB} / (k - 1)}{\\text{SSW} / (N - k)}',
    parameters: [
      { key: 'treatmentDiff', label: 'Architecture Mean Difference', type: 'range', min: 0, max: 10, step: 1, default: 4 },
      { key: 'withinVar', label: 'Within-Group Noise', type: 'range', min: 1, max: 5, step: 0.5, default: 2 },
    ],
    metrics: [
      { key: 'fRatio', label: 'F-Statistic', unit: '' },
      { key: 'pValAnova', label: 'p-value', unit: '' },
      { key: 'anovaConclusion', label: 'Group Means', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT V — STOCHASTIC PROCESSES, QUEUEING & COMPUTING SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════
  u25maSimulation({
    id: 'u25ma301-markov-chains',
    unit: 5,
    unitTitle: 'Stochastic Processes, Queueing & Systems',
    topic: 'Discrete-Time Markov Chains',
    title: 'Discrete-Time Markov Chain & Steady State Lab ⭐',
    icon: '🔄',
    flagship: true,
    shortDescription: 'Model multi-state computing systems (Healthy, Degraded, Failed), step through n-step transition probability matrices P^n, and solve for steady-state stationary distribution π.',
    learningObjectives: [
      'Define Markov property: P(X_{n+1} | X_n, ..., X_0) = P(X_{n+1} | X_n)',
      'Calculate n-step transition probabilities using Chapman-Kolmogorov matrix multiplication P^n',
      'Solve steady-state balance equations π = πP with sum(π_i) = 1 for long-term server availability',
    ],
    formulaOverview: 'P^{(n)} = P^n \\quad | \\quad \\boldsymbol{\\pi} = \\boldsymbol{\\pi} P, \\quad \\sum \\pi_i = 1',
    parameters: [
      { key: 'p11', label: 'P(Normal → Normal)', type: 'range', min: 0.1, max: 0.95, step: 0.05, default: 0.85 },
      { key: 'p21', label: 'P(Degraded → Normal Recovery)', type: 'range', min: 0.05, max: 0.8, step: 0.05, default: 0.35 },
    ],
    metrics: [
      { key: 'piHealthy', label: 'Steady State π(Normal)', unit: '' },
      { key: 'piDegraded', label: 'Steady State π(Degraded)', unit: '' },
      { key: 'meanTimeToFail', label: 'MTTF Cycles', unit: '' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-queueing-models',
    unit: 5,
    unitTitle: 'Stochastic Processes, Queueing & Systems',
    topic: 'Queueing Theory (M/M/1)',
    title: 'M/M/1 Queueing Performance & Little\'s Law Lab ⭐',
    icon: '🚪',
    flagship: true,
    shortDescription: 'Simulate single-server queue systems with Poisson arrivals (λ) and exponential service (μ), observing utilization ρ, buffer backlog L, and latency expansion.',
    learningObjectives: [
      'Understand Poisson arrival and exponential service assumptions of M/M/1 queueing models',
      'Compute traffic intensity ρ = λ / μ and verify stability criterion ρ < 1',
      'Verify Little\'s Law L = λW and analyze exponential response time degradation near saturation',
    ],
    formulaOverview: 'L = \\frac{\\rho}{1 - \\rho} \\quad | \\quad W = \\frac{1}{\\mu - \\lambda} \\quad | \\quad L = \\lambda W',
    parameters: [
      { key: 'lambda', label: 'Arrival Rate λ', type: 'range', min: 0.5, max: 9.0, step: 0.5, default: 3.5 },
      { key: 'mu', label: 'Service Capacity μ', type: 'range', min: 2.0, max: 10.0, step: 0.5, default: 5.0 },
    ],
    metrics: [
      { key: 'utilizationRho', label: 'Traffic ρ = λ/μ', unit: '' },
      { key: 'systemItemsL', label: 'Avg Requests L', unit: 'req' },
      { key: 'responseTimeW', label: 'Avg Latency W', unit: 's' },
      { key: 'queueBacklogLq', label: 'Queue Backlog Lq', unit: 'req' },
    ],
  }),

  u25maSimulation({
    id: 'u25ma301-system-reliability',
    unit: 5,
    unitTitle: 'Stochastic Processes, Queueing & Systems',
    topic: 'System Reliability Modeling',
    title: 'Computing System Reliability & Redundancy Explorer',
    icon: '🛡',
    shortDescription: 'Compute overall system reliability and Mean Time Between Failures (MTBF) for series, parallel, and k-out-of-n fault-tolerant computing architectures.',
    learningObjectives: [
      'Calculate reliability of series architectures: R_series = product(R_i)',
      'Calculate reliability of parallel redundant architectures: R_parallel = 1 - product(1 - R_i)',
      'Design fault-tolerant cloud clusters using k-out-of-n active standby configurations',
    ],
    formulaOverview: 'R_{\\text{series}} = \\prod_{i=1}^n R_i \\quad | \\quad R_{\\text{parallel}} = 1 - \\prod_{i=1}^n (1 - R_i)',
    parameters: [
      { key: 'compReliability', label: 'Component Reliability (R)', type: 'range', min: 0.5, max: 0.99, step: 0.01, default: 0.9 },
      { key: 'numRedundant', label: 'Number of Replicas (n)', type: 'range', min: 1, max: 5, step: 1, default: 3 },
      { key: 'topology', label: 'Architecture', type: 'select', default: 'parallel', options: [
        { label: 'Parallel Active Redundancy', value: 'parallel' },
        { label: 'Series Cascaded Dependencies', value: 'series' },
      ]},
    ],
    metrics: [
      { key: 'systemReliability', label: 'System Reliability R_sys', unit: '' },
      { key: 'systemFailureProb', label: 'Failure Prob Q_sys', unit: '' },
      { key: 'ninesAvailability', label: 'Uptime Availability', unit: '' },
    ],
  }),
];
