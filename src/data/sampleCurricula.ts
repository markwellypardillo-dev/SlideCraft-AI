import { SlideDeck } from '../types/deck';

export interface SampleCurriculum {
  id: string;
  title: string;
  subject: string;
  audience: string;
  sourceText: string;
  summary: string;
  icon: string;
}

export const SAMPLE_CURRICULA: SampleCurriculum[] = [
  {
    id: 'biology-photosynthesis',
    title: 'Photosynthesis & Cellular Energy Transfer',
    subject: 'AP Biology & Life Sciences',
    audience: 'Senior High School (Grades 11-12)',
    summary: 'Light reactions in thylakoids, Calvin cycle in stroma, ATP/NADPH yield, and evolutionary significance.',
    icon: 'Leaf',
    sourceText: `# AP Biology: Cellular Energy Transfer & Photosynthesis

## Course Overview & Objectives
Photosynthesis converts solar radiant energy into chemical energy stored in the covalent bonds of carbohydrate molecules. This fundamental biological process sustains nearly all terrestrial and marine ecosystems.

### 1. Structural Architecture of the Chloroplast
- Double-membrane envelope enclosing the fluid stroma.
- Thylakoid sacs organized into stacks known as grana.
- Thylakoid lumen maintains a steep proton electrochemical gradient essential for ATP synthase photophosphorylation.

### 2. Stage 1: The Light-Dependent Reactions
- Location: Embedded across the thylakoid membrane.
- Photosystem II (P680) absorbs photons (wavelength 680 nm), exciting electrons transferred down the electron transport chain (ETC).
- Photolysis of Water: 2 H₂O → 4 H⁺ + 4 e⁻ + O₂. Oxygen is liberated as a vital byproduct.
- Photosystem I (P700) re-energizes electrons to reduce NADP⁺ into NADPH catalyzed by ferredoxin-NADP⁺ reductase.
- Chemiosmosis: Protons pumped into the lumen flow through ATP synthase down their electrochemical gradient, synthesizing ATP from ADP + Pi.

### 3. Stage 2: The Calvin Cycle (Light-Independent Reactions)
- Location: Chloroplast stroma.
- Carbon Fixation: The enzyme RuBisCO catalyzes the fixation of atmospheric CO₂ to Ribulose 1,5-bisphosphate (RuBP), yielding unstable 6-carbon intermediates that split into 3-PGA.
- Reduction Phase: ATP and NADPH drive the reduction of 3-PGA into Glyceraldehyde 3-phosphate (G3P).
- Regeneration Phase: For every 6 G3P produced, 1 net G3P exits to form glucose, while 5 G3P molecules are rearranged with ATP input to regenerate RuBP.

### 4. Environmental Limiting Factors
- Light intensity and spectral quality (chlorophyll a and b peak in blue and red wavelengths, reflecting green).
- Carbon dioxide partial pressure.
- Ambient temperature affecting RuBisCO enzymatic kinetics versus photorespiration.

### 5. Review & Active Discussion Questions
- How does the endosymbiotic theory explain chloroplast double membranes and circular DNA?
- What would happen to Calvin cycle turnover if chloroplast thylakoids developed ion leaks?`
  },
  {
    id: 'history-industrial-revolution',
    title: 'The Industrial Revolution: Mechanization & Urbanization',
    subject: 'World History & Social Studies',
    audience: 'Junior High School (Grades 7-10)',
    summary: 'Steam power, factory system shifts, labor organization, urbanization shocks, and the birth of modern economics.',
    icon: 'Factory',
    sourceText: `# World History: The First and Second Industrial Revolutions

## Unit Rationale
The transition from agrarian handicraft economies to machine-driven industrial systems fundamentally reordered global society, human geography, family structures, and geopolitics.

### 1. Catalysts in 18th Century Britain
- Abundant domestic coal and iron ore reserves in close proximity to navigable waterways.
- Agricultural Revolution innovations (enclosure acts, Jethro Tull seed drill, four-field crop rotation) that released surplus labor to growing cities.
- Capital accumulation from colonial trade, patent protection laws, and financial institutions (Bank of England).

### 2. Mechanization of Textiles and Steam Power
- Inventions: James Hargreaves' Spinning Jenny (1764), Richard Arkwright's Water Frame, and Edmund Cartwright's Power Loom.
- James Watt's separate condenser steam engine (1769-1776) liberated factories from riverbank geographic constraints, enabling coal-fired industrial centers in Manchester and Birmingham.

### 3. Demographic Upheaval & Urban Realities
- Rapid, unregulated urbanization leading to tenement overcrowding, inadequate sanitation, and cholera epidemics.
- Rise of the industrial working class (proletariat) alongside the burgeoning entrepreneurial middle class (bourgeoisie).
- Child labor conditions: 12-16 hour shifts, structural hazards in textile mills and coal pits, leading to the Factory Acts (1833).

### 4. Ideological Responses
- Adam Smith and Classical Laissez-Faire capitalism (Wealth of Nations, 1776): market equilibrium and the invisible hand.
- Karl Marx and Friedrich Engels (The Communist Manifesto, 1848): historical materialism and class struggle.
- Early trade unionism and the Luddite protests resisting labor displacement.

### 5. Classroom Exit Ticket & Reflection
- Did the Industrial Revolution create more liberty or more exploitation for ordinary working families?`
  },
  {
    id: 'cs-neural-networks',
    title: 'Neural Networks & Modern Machine Learning',
    subject: 'Computer Science & AI',
    audience: 'College / Higher Education',
    summary: 'Perceptrons, backpropagation, activation functions, transformer attention, and ethical AI alignment.',
    icon: 'Cpu',
    sourceText: `# Computer Science: Deep Learning & Neural Network Architectures

## Module Overview
Neural networks are parameter-rich function approximators modeled loosely after biological synaptic plasticity. They power modern computer vision, natural language processing, and multimodal foundation models.

### 1. The Artificial Neuron (Perceptron)
- Inputs x_i multiplied by learnable weights w_i and summed with a bias term b: z = ∑ (w_i * x_i) + b.
- Non-linear Activation Functions: ReLU (Rectified Linear Unit), Sigmoid, GeLU, and Softmax for classification probabilities.
- Why non-linearity matters: Without non-linear activation, multi-layer networks collapse mathematically into a single linear regression.

### 2. Forward Propagation and Loss Functions
- Data flows layer-by-layer: input layer → hidden representation layers → output predictions.
- Objective Loss Functions: Mean Squared Error (MSE) for regression; Cross-Entropy Loss for categorical classification.

### 3. Backpropagation & Gradient Optimization
- The Chain Rule of calculus computes partial derivatives of the loss with respect to every weight parameter: ∂Loss/∂w.
- Stochastic Gradient Descent (SGD) and Adam optimizer iteratively nudge weights in the opposite direction of the gradient: w_new = w_old - η * ∇Loss.

### 4. The Transformer Revolution (Attention is All You Need, 2017)
- Replaced recurrent sequential processing (RNNs/LSTMs) with Scaled Dot-Product Self-Attention: Attention(Q,K,V) = softmax(QK^T / √d_k) * V.
- Multi-Head Attention allows models to simultaneously attend to syntax, semantic references, and contextual nuance across arbitrary token distances.

### 5. Ethical Alignment and Safety
- Hallucination mitigation, bias in training corpora, RLHF (Reinforcement Learning from Human Feedback), and responsible AI deployment.`
  },
  {
    id: 'sel-growth-mindset',
    title: 'Growth Mindset & Neuroplasticity in the Classroom',
    subject: 'Social-Emotional Learning & Psychology',
    audience: 'Junior High School (Grades 7-10)',
    summary: 'Dweck mindset theory, how the brain forms neural bridges during struggle, and reframing mistakes as data.',
    icon: 'Brain',
    sourceText: `# Social-Emotional Learning: Growth Mindset & Brain Plasticity

## Lesson Goal
Empower young adolescents to understand that intelligence and skill are not static traits, but elastic muscles strengthened through focused effort, deliberate practice, and cognitive reframing.

### 1. Neuroplasticity: The Elastic Brain
- The human brain contains approximately 86 billion neurons connected by trillions of synapses.
- When we encounter challenging problems and persist, neurons grow dendrite branches and form thicker myelin sheaths, speeding up signal transmission.
- "Struggle" is not a sign of failure; it is physical evidence of neural connection growth!

### 2. Fixed vs. Growth Mindset (Carol Dweck's Research)
- Fixed Mindset: Believes talent is inborn ("I'm just not a math person"). Avoids challenges out of fear of looking inadequate.
- Growth Mindset: Believes abilities develop through dedication and hard work. Embraces challenges as necessary friction for growth.

### 3. The Power of "Yet"
- Shifting student self-talk: Replace "I can't do this" with "I can't do this YET."
- Reframing mistakes as high-value computational feedback rather than character judgments.

### 4. Action Strategies for School & Life
- Embrace the Learning Pit: Knowing that confusion is the halfway point to mastery.
- Praise process and strategy rather than innate smarts ("You tried three creative approaches!" instead of "You're a genius!").
- High-five moments of productive failure.`
  }
];
