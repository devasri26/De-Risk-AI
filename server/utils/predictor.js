/**
 * Predicts AI Project Failure likelihood and generates detailed breakdown and recommendations.
 * 
 * Input format:
 * {
 *   projectName: string,
 *   answers: {
 *     // Data Readiness
 *     dataQuality: number (1-5),
 *     dataVolume: number (1-5),
 *     dataPipeline: number (1-5),
 *     dataLabeling: number (1-5),
 *     // Team Capability
 *     mlExpertise: number (1-5),
 *     domainKnowledge: number (1-5),
 *     devopsMaturity: number (1-5),
 *     // Organizational Alignment
 *     stakeholderExpectations: number (1-5),
 *     successMetrics: number (1-5),
 *     computeBudget: number (1-5),
 *     // Technical Feasibility
 *     modelFeasibility: number (1-5),
 *     integrationEase: number (1-5),
 *     clearScope: number (1-5)
 *   }
 * }
 */
export function calculatePrediction(projectName, answers) {
  // Normalize answer scores (fallback to 3 if missing or invalid)
  const getVal = (key) => {
    const val = Number(answers?.[key]);
    return isNaN(val) || val < 1 || val > 5 ? 3 : val;
  };

  const scores = {
    dataQuality: getVal('dataQuality'),
    dataVolume: getVal('dataVolume'),
    dataPipeline: getVal('dataPipeline'),
    dataLabeling: getVal('dataLabeling'),
    mlExpertise: getVal('mlExpertise'),
    domainKnowledge: getVal('domainKnowledge'),
    devopsMaturity: getVal('devopsMaturity'),
    stakeholderExpectations: getVal('stakeholderExpectations'),
    successMetrics: getVal('successMetrics'),
    computeBudget: getVal('computeBudget'),
    modelFeasibility: getVal('modelFeasibility'),
    integrationEase: getVal('integrationEase'),
    clearScope: getVal('clearScope')
  };

  // 1. Calculate category averages (1 to 5 scale)
  const dataAverage = (scores.dataQuality + scores.dataVolume + scores.dataPipeline + scores.dataLabeling) / 4;
  const teamAverage = (scores.mlExpertise + scores.domainKnowledge + scores.devopsMaturity) / 3;
  const alignmentAverage = (scores.stakeholderExpectations + scores.successMetrics + scores.computeBudget) / 3;
  const feasibilityAverage = (scores.modelFeasibility + scores.integrationEase + scores.clearScope) / 3;

  // 2. Convert to success percentage (0 to 100%)
  const toPercent = (avg) => ((avg - 1) / 4) * 100;
  
  const dataSuccess = toPercent(dataAverage);
  const teamSuccess = toPercent(teamAverage);
  const alignmentSuccess = toPercent(alignmentAverage);
  const feasibilitySuccess = toPercent(feasibilityAverage);

  // 3. Category Weights
  const WEIGHTS = {
    data: 0.35,        // Data is the biggest driver in AI success
    team: 0.25,        // Team capability
    feasibility: 0.20, // Feasibility and scope complexity
    alignment: 0.20    // Organizational alignment and expectations
  };

  // 4. Calculate overall weighted success probability and failure risk
  const overallSuccess = (
    dataSuccess * WEIGHTS.data +
    teamSuccess * WEIGHTS.team +
    feasibilitySuccess * WEIGHTS.feasibility +
    alignmentSuccess * WEIGHTS.alignment
  );

  const failureProbability = Math.round(100 - overallSuccess);

  // 5. Determine Risk Level
  let riskLevel = 'Low';
  let colorTheme = 'emerald'; // frontend mapping helper
  if (failureProbability >= 70) {
    riskLevel = 'High';
    colorTheme = 'rose';
  } else if (failureProbability >= 35) {
    riskLevel = 'Medium';
    colorTheme = 'amber';
  }

  // 6. Generate Recommendations
  const recommendations = [];

  // Data Quality Checks
  if (scores.dataQuality <= 2) {
    recommendations.push({
      category: 'Data Readiness',
      severity: 'Critical',
      title: 'Address Critical Data Quality Gaps',
      description: 'Your model will inherit biases and errors from poor data. Pause modeling efforts to clean datasets and establish quality controls.'
    });
  } else if (scores.dataQuality === 3) {
    recommendations.push({
      category: 'Data Readiness',
      severity: 'Warning',
      title: 'Improve Data Integrity Checks',
      description: 'Establish standard verification and validation processes to check for label consistency.'
    });
  }

  if (scores.dataVolume <= 2) {
    recommendations.push({
      category: 'Data Readiness',
      severity: 'Critical',
      title: 'Insufficient Data Volume',
      description: 'You lack enough training examples. Collect more representative samples, or use transfer learning with large pre-trained models rather than building from scratch.'
    });
  }

  if (scores.dataPipeline <= 2) {
    recommendations.push({
      category: 'Data Readiness',
      severity: 'Info',
      title: 'Automate Data Feeds',
      description: 'Static dataset extracts lead to model drift. Plan a continuous ingestion pipeline to support model retraining down the road.'
    });
  }

  // Team Capability Checks
  if (scores.mlExpertise <= 2) {
    recommendations.push({
      category: 'Team Capability',
      severity: 'Critical',
      title: 'Urgent AI Skills Shortage',
      description: 'The team lacks hands-on ML modeling experience. Onboard experienced AI consultants, invest in specialized training, or prioritize pre-built APIs over custom model development.'
    });
  }

  if (scores.devopsMaturity <= 2) {
    recommendations.push({
      category: 'Team Capability',
      severity: 'Warning',
      title: 'Integrate MLOps Practices',
      description: 'Deploying models is vastly different from writing code. Train your DevOps engineers on ML tracking, version control (DVC), and model serving frameworks.'
    });
  }

  // Organizational Alignment Checks
  if (scores.stakeholderExpectations <= 2) {
    recommendations.push({
      category: 'Organizational Alignment',
      severity: 'Critical',
      title: 'Unrealistic Executive Expectations',
      description: 'Stakeholders are treating AI as a magical solution. Schedule alignment workshops to define AI limitations, error tolerances, and iterative rollout phases.'
    });
  }

  if (scores.successMetrics <= 2) {
    recommendations.push({
      category: 'Organizational Alignment',
      severity: 'Critical',
      title: 'Undefined Success Metrics',
      description: 'Without measurable KPIs (e.g. latency constraints, precision thresholds, business ROI metrics), it will be impossible to measure success. Define quantitative target thresholds immediately.'
    });
  }

  if (scores.computeBudget <= 2) {
    recommendations.push({
      category: 'Organizational Alignment',
      severity: 'Warning',
      title: 'Evaluate GPU & Compute Budget',
      description: 'AI model training and inference can be highly expensive. Optimize model size (quantization, pruning) or transition to API endpoints to prevent budget overruns.'
    });
  }

  // Feasibility Checks
  if (scores.modelFeasibility <= 2) {
    recommendations.push({
      category: 'Technical Feasibility',
      severity: 'Warning',
      title: 'High Model Complexity Risk',
      description: 'Creating custom neural architectures introduces high technical risk. Default to industry-standard architectures or fine-tune existing models first.'
    });
  }

  if (scores.clearScope <= 2) {
    recommendations.push({
      category: 'Technical Feasibility',
      severity: 'Critical',
      title: 'Narrow Project Scope Required',
      description: 'The scope is too broad or poorly defined. Break down the project into a singular, well-defined MVP (Minimum Viable Product) use case.'
    });
  }

  // Default recommendation if everything is great
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'General',
      severity: 'Info',
      title: 'Maintain Best Practices',
      description: 'Your project parameters look solid. Continue monitoring with periodic assessments and establish rigorous CI/CD validation gates.'
    });
  }

  // 7. Find Primary Risk Driver (the category with the lowest success score)
  const categories = [
    { name: 'Data Readiness', score: Math.round(dataSuccess), raw: dataAverage },
    { name: 'Team Capability', score: Math.round(teamSuccess), raw: teamAverage },
    { name: 'Organizational Alignment', score: Math.round(alignmentSuccess), raw: alignmentAverage },
    { name: 'Technical Feasibility', score: Math.round(feasibilitySuccess), raw: feasibilityAverage }
  ];

  // Sort by raw average ascending (worst is first)
  categories.sort((a, b) => a.raw - b.raw);
  const primaryDriver = categories[0].raw < 4.0 ? categories[0].name : 'None (Overall Balanced)';

  return {
    projectName: projectName || 'Unnamed AI Project',
    timestamp: new Date().toISOString(),
    failureProbability,
    riskLevel,
    colorTheme,
    primaryDriver,
    categoryScores: {
      data: Math.round(dataSuccess),
      team: Math.round(teamSuccess),
      alignment: Math.round(alignmentSuccess),
      feasibility: Math.round(feasibilitySuccess)
    },
    recommendations
  };
}
