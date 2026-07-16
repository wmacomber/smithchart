export type ChartEducationTarget =
  | 'chart-overview'
  | 'normalization'
  | 'reflection'
  | 'feedline-rotation'
  | 'unit-conductance'
  | 'stub-path'
  | 'electrical-length'
  | 'physical-length'
  | 'velocity-factor'
  | 'matched-center';

export type LearnCategory =
  'Chart basics' | 'Following the match' | 'Building the network' | 'Assumptions';

export interface LearnTopic {
  readonly id: string;
  readonly category: LearnCategory;
  readonly title: string;
  readonly summary: string;
  readonly explanation: readonly string[];
  readonly technicalDetail?: string;
  readonly chartTarget: ChartEducationTarget;
}

export const TOPICS: readonly LearnTopic[] = [
  {
    id: 'smith-chart',
    category: 'Chart basics',
    title: 'What the Smith chart shows',
    summary:
      'The chart maps complex loads through reflection coefficient; its center is a perfect match.',
    explanation: [
      'Circles and arcs let impedance, admittance, and line movement share one picture. The outer boundary is total reflection.',
    ],
    technicalDetail: 'Γ = (z − 1) / (z + 1), where z is impedance normalized to Z₀.',
    chartTarget: 'chart-overview',
  },
  {
    id: 'normalization',
    category: 'Chart basics',
    title: 'Normalized impedance',
    summary: 'Normalization compares the load with its transmission line.',
    explanation: [
      'Divide resistance and reactance by characteristic impedance before placing the load on the chart.',
    ],
    technicalDetail: 'z = Z / Z₀. A 25 Ω load on a 50 Ω line becomes z = 0.5.',
    chartTarget: 'normalization',
  },
  {
    id: 'reflection',
    category: 'Chart basics',
    title: 'Reflection coefficient (Γ)',
    summary: 'Γ records reflected-wave magnitude and phase.',
    explanation: [
      'Distance from center is reflection magnitude. Angle around the chart is reflection phase.',
    ],
    technicalDetail: '|Γ| = 0 is matched; |Γ| = 1 lies on the lossless outer boundary.',
    chartTarget: 'reflection',
  },
  {
    id: 'toward-generator',
    category: 'Following the match',
    title: 'Moving toward the generator',
    summary: 'A lossless feed line rotates clockwise without changing |Γ|.',
    explanation: [
      'Start at the load and follow the constant-SWR circle toward the transmitter or generator.',
    ],
    technicalDetail: 'Γ(d) = ΓL e^(−j2βd), using the project toward-generator convention.',
    chartTarget: 'feedline-rotation',
  },
  {
    id: 'shunt-admittance',
    category: 'Following the match',
    title: 'Why shunt matching uses admittance',
    summary: 'Parallel elements add as admittances, so the target junction has conductance g = 1.',
    explanation: [
      'At either unit-conductance intersection, the stub only needs to cancel the remaining susceptance.',
    ],
    technicalDetail: 'At the junction y = 1 + jb; choose the stub so ystub = −jb.',
    chartTarget: 'unit-conductance',
  },
  {
    id: 'stub-types',
    category: 'Following the match',
    title: 'Open and short stubs',
    summary: 'Both terminations can supply the required susceptance, but with different lengths.',
    explanation: [
      'Choose the construction that suits the installation, then trim it while measuring the assembled system.',
    ],
    technicalDetail: 'Open: y = j tan(βl). Short: y = −j cot(βl).',
    chartTarget: 'stub-path',
  },
  {
    id: 'electrical-length',
    category: 'Building the network',
    title: 'Electrical length',
    summary: 'Wavelengths and degrees describe phase, independent of the chosen display unit.',
    explanation: [
      'One full wavelength is 360°. Feed and stub results stay inside one half wavelength.',
    ],
    technicalDetail: 'Electrical degrees = wavelengths × 360°.',
    chartTarget: 'electrical-length',
  },
  {
    id: 'physical-length',
    category: 'Building the network',
    title: 'Electrical versus physical length',
    summary: 'Frequency and propagation speed convert phase length into a cut length.',
    explanation: [
      'Metres, centimetres, feet, and inches are alternate displays of the same physical result.',
    ],
    technicalDetail: 'λ = c × VF / f; physical length = electrical wavelengths × λ.',
    chartTarget: 'physical-length',
  },
  {
    id: 'velocity-factor',
    category: 'Building the network',
    title: 'Velocity factor',
    summary: 'Velocity factor is wave speed in the line divided by vacuum light speed.',
    explanation: [
      'Use manufacturer data and a value above zero through one. It changes physical lengths, not degrees or wavelengths.',
    ],
    technicalDetail:
      'This v1 calculation applies one VF to both feed line and stub. Convert separately when their cables differ.',
    chartTarget: 'velocity-factor',
  },
  {
    id: 'trimming',
    category: 'Assumptions',
    title: 'Why trimming is required',
    summary: 'Calculated lengths are starting values for measurement, not final cut guarantees.',
    explanation: [
      'Connectors, exposed conductor, end effects, dielectric tolerance, coupling, nearby objects, loss, and calibration shift the installed match. Cut conservatively and trim incrementally.',
    ],
    chartTarget: 'stub-path',
  },
  {
    id: 'limitations',
    category: 'Assumptions',
    title: 'Model assumptions and limits',
    summary: 'This tool solves one lossless shunt stub at one frequency.',
    explanation: [
      'It does not model line loss, frequency sweep, parasitics, coupling, connector geometry, or different feed/stub velocity factors.',
    ],
    technicalDetail:
      'Residual values verify the ideal numerical construction; they do not predict real assembly tolerances.',
    chartTarget: 'matched-center',
  },
] as const;

export const LEARN_CATEGORIES: readonly LearnCategory[] = [
  'Chart basics',
  'Following the match',
  'Building the network',
  'Assumptions',
];

export const EDUCATION_TARGET_LABELS: Readonly<Record<ChartEducationTarget, string>> = {
  'chart-overview': 'Smith chart boundary, axes, and matched center',
  normalization: 'load marker and normalized load position',
  reflection: 'constant-reflection-magnitude circle',
  'feedline-rotation': 'clockwise path toward the generator',
  'unit-conductance': 'both g = 1 junctions',
  'stub-path': 'selected shunt-stub susceptance path',
  'electrical-length': 'feed and stub electrical-length annotations',
  'physical-length': 'physical lengths in the chart legend',
  'velocity-factor': 'physical-length annotations affected by velocity factor',
  'matched-center': 'matched center point',
};
