export const TOPICS = [
  [
    'Smith chart',
    'A Smith chart maps complex impedance and admittance through reflection coefficient. Center means matched.',
  ],
  ['Normalization', 'Divide load impedance by characteristic impedance before chart conversion.'],
  [
    'Toward generator',
    'A lossless line rotates reflection coefficient clockwise without changing its magnitude.',
  ],
  [
    'Why admittance',
    'Parallel stub admittances add directly, so shunt matching targets conductance g = 1.',
  ],
  ['Open and short stubs', 'Open stubs follow j tan(βl); short stubs follow −j cot(βl).'],
  [
    'Electrical length',
    'Degrees and wavelengths describe phase. Physical length also depends on frequency and velocity factor.',
  ],
  [
    'Practical trimming',
    'Connectors, exposed conductor, dielectric variation, coupling, loss, and calibration shift final length.',
  ],
] as const;
