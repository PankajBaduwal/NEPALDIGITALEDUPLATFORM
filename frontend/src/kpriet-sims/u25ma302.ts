import type { ISimulationDefinition, ISimulationParam, ISimulationMetric } from './types';

/**
 * Authoritative Simulations for:
 * Course Code: U25MA302
 * Course Name: Probability and Statistics
 * Semester: III | Category: BSC | Credits: 3 (L-T-P-J-C: 2-0-2-0-3) | Regulation: R2025 CBCS
 * Department: Civil Engineering (Common to BM, CE, CH, EC, EE, ME, MI)
 *
 * Uses isolated Smart Board Probability & Statistics Engine architecture (boardEngine: 'ps')
 * Dynamic routing via smartboardPresetKey to ps-simulation.html and tools/ps-simulation.js.
 */
export const U25MA302_SUBJECT_KEYWORDS = [
  'probability and statistics',
  'probability & statistics',
  'u25ma302',
  'ma302',
  'probability',
  'statistics',
  'civil engineering',
];

function u25ma302Simulation(def: {
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
    subjectKeywords: U25MA302_SUBJECT_KEYWORDS,
    shortDescription: def.shortDescription,
    detailedDescription: `${def.shortDescription} Opens inside the Smart Board and Simulation Shell with an interactive 2D mathematical canvas, parameter sliders, linked data tables, step-by-step pedagogical derivations, dynamic sampling animations, and context-aware Probability AI assistant.`,
    learningObjectives: def.learningObjectives,
    suggestedUnits: [def.unit],
    smartboardPresetKey: def.id,
    formulaOverview: def.formulaOverview,
    flagship: def.flagship ?? true,
    tags: ['U25MA302', `Unit ${def.unit}`, def.unitTitle, def.topic, 'Probability', 'Statistics', 'Civil Engineering', 'R2025 CBCS'],
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

export const U25MA302_BOARD_SIMULATIONS: ISimulationDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATION 1 — PROBABILITY DISTRIBUTIONS EXPLORER
  // (Units I & II · Discrete & Continuous Distributions · Experiments 1 & 2)
  // ═══════════════════════════════════════════════════════════════════════════
  u25ma302Simulation({
    id: 'u25ma302-prob-distributions',
    unit: 1,
    unitTitle: 'One-Dimensional Random Variables',
    topic: 'Probability Distributions',
    title: 'Probability Distributions Explorer ⭐',
    icon: '📊',
    flagship: true,
    shortDescription: 'Explore discrete (Binomial, Poisson, Geometric) and continuous (Normal, Exponential, Uniform) distributions with interactive PMF/PDF and CDF plots, parameter sliders, and shaded interval probabilities.',
    learningObjectives: [
      'Distinguish discrete probability mass functions (PMF) from continuous probability density functions (PDF)',
      'Analyze how parameter adjustments reshape probability density, spread, and location',
      'Compute shaded interval probabilities P(a ≤ X ≤ b) and verify cumulative distribution functions (CDF)',
      'Calculate theoretical expected value E[X] and variance Var(X)',
    ],
    formulaOverview: 'P(a \\le X \\le b) = \\int_{a}^{b} f(x)\\,dx \\quad \\text{or} \\quad \\sum_{k=a}^{b} P(X = k)',
    parameters: [
      {
        key: 'distribution',
        label: 'Distribution Family',
        type: 'select',
        default: 'normal',
        options: [
          { label: 'Normal (Gaussian) Continuous', value: 'normal' },
          { label: 'Binomial Discrete', value: 'binomial' },
          { label: 'Poisson Discrete', value: 'poisson' },
          { label: 'Geometric Discrete', value: 'geometric' },
          { label: 'Exponential Continuous', value: 'exponential' },
          { label: 'Uniform Continuous', value: 'uniform' },
        ],
      },
      { key: 'param1', label: 'Primary Param (μ / n / λ / a)', type: 'range', min: 0.5, max: 20, step: 0.5, default: 0 },
      { key: 'param2', label: 'Secondary Param (σ / p / b)', type: 'range', min: 0.1, max: 5.0, step: 0.1, default: 1.5 },
      {
        key: 'viewMode',
        label: 'Plot View',
        type: 'select',
        default: 'density',
        options: [
          { label: 'Density / Mass (PDF / PMF)', value: 'density' },
          { label: 'Cumulative Distribution (CDF)', value: 'cdf' },
        ],
      },
      { key: 'x1', label: 'Interval Lower Bound (a)', type: 'range', min: -10, max: 20, step: 0.5, default: -1.5 },
      { key: 'x2', label: 'Interval Upper Bound (b)', type: 'range', min: -10, max: 20, step: 0.5, default: 1.5 },
    ],
    metrics: [
      { key: 'meanVal', label: 'Expected Value E[X]', unit: '' },
      { key: 'varVal', label: 'Variance Var(X)', unit: '' },
      { key: 'stdDevVal', label: 'Std Dev σ', unit: '' },
      { key: 'intervalProb', label: 'P(a ≤ X ≤ b)', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATION 2 — SAMPLING AND SAMPLING DISTRIBUTION LAB
  // (Unit IV · Inferential Statistics & Central Limit Theorem · Experiment 4)
  // ═══════════════════════════════════════════════════════════════════════════
  u25ma302Simulation({
    id: 'u25ma302-sampling-distributions',
    unit: 4,
    unitTitle: 'Inferential Statistics',
    topic: 'Sampling & Central Limit Theorem',
    title: 'Sampling and Sampling Distribution Lab ⭐',
    icon: '🏛',
    flagship: true,
    shortDescription: 'Simulate repeated sampling from custom population distributions (Uniform, Normal, Skewed, Bimodal), observe empirical convergence to normality, and verify Central Limit Theorem and Standard Error.',
    learningObjectives: [
      'Differentiate population parameters (μ, σ²) from sample statistics (X̄, s² with Bessel’s n-1 correction)',
      'Demonstrate the Central Limit Theorem: distribution of sample means approaches Gaussian as n increases',
      'Verify the theoretical standard error formula SE = σ / √n against empirical sampling variance',
      'Conduct reproducible sampling runs using deterministic random seeds',
    ],
    formulaOverview: '\\bar{X}_n \\xrightarrow{d} \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad | \\quad \\text{SE} = \\frac{\\sigma}{\\sqrt{n}}',
    parameters: [
      {
        key: 'popType',
        label: 'Parent Population',
        type: 'select',
        default: 'skewed',
        options: [
          { label: 'Skewed / Exponential (Asymmetric)', value: 'skewed' },
          { label: 'Uniform (Flat)', value: 'uniform' },
          { label: 'Bimodal (Twin Peaks)', value: 'bimodal' },
          { label: 'Normal (Gaussian)', value: 'normal' },
        ],
      },
      { key: 'sampleSize', label: 'Sample Size (n)', type: 'range', min: 2, max: 60, step: 2, default: 20 },
      {
        key: 'sampleBatches',
        label: 'Repeat Sampling Draws',
        type: 'select',
        default: '50',
        options: [
          { label: 'Draw 1 Sample', value: '1' },
          { label: 'Draw 25 Samples', value: '25' },
          { label: 'Draw 100 Samples', value: '100' },
          { label: 'Draw 500 Samples', value: '500' },
        ],
      },
      {
        key: 'replacement',
        label: 'Sampling Method',
        type: 'select',
        default: 'with',
        options: [
          { label: 'With Replacement', value: 'with' },
          { label: 'Without Replacement', value: 'without' },
        ],
      },
      { key: 'seed', label: 'PRNG Random Seed', type: 'range', min: 1, max: 9999, step: 1, default: 42 },
    ],
    metrics: [
      { key: 'popMean', label: 'Population μ', unit: '' },
      { key: 'popVar', label: 'Population σ²', unit: '' },
      { key: 'sampleMean', label: 'Mean of X̄', unit: '' },
      { key: 'theoreticalSE', label: 'Theoretical SE = σ/√n', unit: '' },
      { key: 'empiricalSE', label: 'Empirical SE', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATION 3 — LEAST-SQUARES REGRESSION EXPLORER
  // (Unit III · Two-Dimensional Probability Distributions & Regression)
  // ═══════════════════════════════════════════════════════════════════════════
  u25ma302Simulation({
    id: 'u25ma302-least-squares-regression',
    unit: 3,
    unitTitle: 'Two-Dimensional Probability Distributions',
    topic: 'Least-Squares Regression',
    title: 'Least-Squares Regression Explorer ⭐',
    icon: '📉',
    flagship: true,
    shortDescription: 'Fit ordinary least-squares regression lines to engineering bivariate datasets, visualize vertical residuals e_i, verify sum(e_i) = 0, evaluate R² goodness of fit, and explore prediction and extrapolation limits.',
    learningObjectives: [
      'Derive OLS slope β1 = Sxy / Sxx and intercept β0 = Ȳ - β1*X̄ from observational bivariate data',
      'Inspect vertical residuals e_i = y_i - ŷ_i and verify sum of residuals is mathematically zero',
      'Interpret the coefficient of determination R² as the fraction of variance explained by the model',
      'Distinguish valid interpolation within the data range from hazardous extrapolation outside it',
    ],
    formulaOverview: '\\hat{y} = \\beta_0 + \\beta_1 x \\quad | \\quad \\beta_1 = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} \\quad | \\quad R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}}',
    parameters: [
      {
        key: 'dataset',
        label: 'Engineering Dataset',
        type: 'select',
        default: 'concrete',
        options: [
          { label: 'Concrete: Compressive Strength vs Water-Cement Ratio', value: 'concrete' },
          { label: 'Hydrology: Rainfall Depth vs Peak Runoff', value: 'hydrology' },
          { label: 'Traffic: Vehicle Speed vs Traffic Density', value: 'traffic' },
          { label: 'Surveying: Measured Distance vs Temperature Error', value: 'surveying' },
        ],
      },
      {
        key: 'showResiduals',
        label: 'Show Residual Lines (e_i)',
        type: 'select',
        default: 'yes',
        options: [
          { label: 'Visible Vertical Residuals', value: 'yes' },
          { label: 'Hide Residuals', value: 'no' },
        ],
      },
      {
        key: 'showFitted',
        label: 'Display Fitted Points (ŷ_i)',
        type: 'select',
        default: 'yes',
        options: [
          { label: 'Show Fitted Values on Line', value: 'yes' },
          { label: 'Hide Fitted Points', value: 'no' },
        ],
      },
      { key: 'predictX', label: 'Predict at Explanatory X', type: 'range', min: 0.1, max: 1.0, step: 0.05, default: 0.5 },
    ],
    metrics: [
      { key: 'fittedSlope', label: 'Fitted Slope β1', unit: '' },
      { key: 'fittedIntercept', label: 'Intercept β0', unit: '' },
      { key: 'rSquared', label: 'R² Score', unit: '' },
      { key: 'predictedY', label: 'Predicted ŷ', unit: '' },
      { key: 'residualSum', label: 'Residual Sum Σe_i', unit: '' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMULATION 4 — CORRELATION AND STATISTICAL DATA EXPLORER
  // (Unit III · Covariance & Correlation · Experiment 3)
  // ═══════════════════════════════════════════════════════════════════════════
  u25ma302Simulation({
    id: 'u25ma302-correlation-data',
    unit: 3,
    unitTitle: 'Two-Dimensional Probability Distributions',
    topic: 'Covariance & Correlation',
    title: 'Correlation and Statistical Data Explorer ⭐',
    icon: '↔',
    flagship: true,
    shortDescription: 'Investigate positive, negative, and non-linear bivariate associations with an interactive scatterplot, linked data table, Pearson r and Spearman rank calculations, and high-leverage outlier effects.',
    learningObjectives: [
      'Compute sample covariance Cov(X,Y) and dimensionless Pearson correlation coefficient r in [-1, +1]',
      'Compare Pearson linear correlation with Spearman rank correlation for monotonic non-linear data',
      'Demonstrate that r ≈ 0 for symmetric non-linear relationships (e.g. parabolic), highlighting limits of linear correlation',
      'Observe how a single high-leverage outlier can artificially inflate or deflate correlation',
      'Emphasize that strong statistical association does not imply physical causation',
    ],
    formulaOverview: 'r = \\frac{\\text{Cov}(X,Y)}{s_X s_Y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}',
    parameters: [
      {
        key: 'associationType',
        label: 'Association Pattern',
        type: 'select',
        default: 'strong_pos',
        options: [
          { label: 'Strong Positive Linear (r ≈ +0.9)', value: 'strong_pos' },
          { label: 'Moderate Positive Linear (r ≈ +0.5)', value: 'mod_pos' },
          { label: 'Uncorrelated / Random (r ≈ 0.0)', value: 'uncorrelated' },
          { label: 'Strong Negative Linear (r ≈ -0.85)', value: 'strong_neg' },
          { label: 'Parabolic / Non-Linear (y = x², r ≈ 0.0)', value: 'quadratic' },
        ],
      },
      { key: 'numPoints', label: 'Number of Observations (n)', type: 'range', min: 10, max: 50, step: 5, default: 25 },
      {
        key: 'outlier',
        label: 'Inject Outlier',
        type: 'select',
        default: 'none',
        options: [
          { label: 'None (Clean Dataset)', value: 'none' },
          { label: 'High Leverage Outlier', value: 'high' },
        ],
      },
      {
        key: 'corrMethod',
        label: 'Correlation Metric',
        type: 'select',
        default: 'both',
        options: [
          { label: 'Show Both (Pearson r & Spearman r_s)', value: 'both' },
          { label: 'Pearson Linear r Only', value: 'pearson' },
          { label: 'Spearman Rank r_s Only', value: 'spearman' },
        ],
      },
    ],
    metrics: [
      { key: 'covarianceVal', label: 'Sample Cov(X,Y)', unit: '' },
      { key: 'pearsonR', label: 'Pearson r', unit: '' },
      { key: 'spearmanR', label: 'Spearman r_s', unit: '' },
      { key: 'rSquared', label: 'r²', unit: '' },
      { key: 'associationVerdict', label: 'Interpretation', unit: '' },
    ],
  }),
];
