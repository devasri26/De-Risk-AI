import axios from "axios";

const generateMockReport = (idea) => {
  const lowercaseIdea = idea.toLowerCase();
  
  let risks = [];
  let failureReasons = [];
  let challenges = [];
  let solutions = [];
  let confidenceScore = 65;
  let investorReadinessScore = 50;
  let marketPotentialScore = 50;
  let scalabilityScore = 50;
  let revenueModelScore = 50;
  let executionFeasibilityScore = 50;
  let technicalRisk = 50;
  let budgetRisk = 50;
  let marketRisk = 50;
  let scalabilityRisk = 50;
  let operationalRisk = 50;
  let roadmap = [];
  let swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  let estimates = { estimatedBudget: "", estimatedDuration: "", recommendedTeamSize: "", complexityLevel: "", estimatedMaintenanceCost: "" };

  if (lowercaseIdea.includes("ai") || lowercaseIdea.includes("machine learning") || lowercaseIdea.includes("model") || lowercaseIdea.includes("gpt") || lowercaseIdea.includes("llm") || lowercaseIdea.includes("predict")) {
    risks = [
      {
        risk: "Compute & GPU Cost Volatility",
        severity: "High",
        description: "Scaling LLM context windows or intensive prediction loops runs high infrastructure bills, threatening bootstrap runway."
      },
      {
        risk: "Data Quality and Labeling Bottlenecks",
        severity: "Medium",
        description: "AI prediction requires continuous streams of high-resolution domain data which are expensive to acquire and label."
      },
      {
        risk: "Model Hallucination and Drift",
        severity: "Medium",
        description: "Edge cases in environmental or real-world shifts can lead to incorrect predictions, causing user trust erosion."
      }
    ];
    failureReasons = [
      "Inability to secure continuous training datasets for diverse client workloads.",
      "High subscription churn once users realize prediction limits and accuracy boundaries.",
      "Oversaturated landscape of generic wrappers."
    ];
    challenges = [
      "High latency on model inference over standard client network endpoints.",
      "Low accuracy for early-stage predictive features compared to traditional analysis."
    ];
    solutions = [
      {
        challenge: "High latency on model inference over standard client network endpoints.",
        solution: "Implement quantized models (ONNX/TensorFlow Lite) running directly on edge mobile devices or cached endpoints."
      },
      {
        challenge: "Low accuracy for early-stage predictive features compared to traditional analysis.",
        solution: "Partner with regional research labs to source ground-truth databases and validate baseline models."
      }
    ];
    confidenceScore = 72;
    investorReadinessScore = 84;
    marketPotentialScore = 88;
    scalabilityScore = 85;
    revenueModelScore = 78;
    executionFeasibilityScore = 80;
    technicalRisk = 80;
    budgetRisk = 75;
    marketRisk = 55;
    scalabilityRisk = 85;
    operationalRisk = 60;
    roadmap = [
      {
        phase: "Phase 1: Research & Planning",
        duration: "3 Weeks",
        tasks: [
          "Define AI model architecture requirements and evaluate open-source base LLMs.",
          "Identify and secure training/validation data streams for the target predictive domains.",
          "Estimate GPU resource consumption metrics to size initial cloud server budgets."
        ]
      },
      {
        phase: "Phase 2: MVP Development",
        duration: "6 Weeks",
        tasks: [
          "Construct core Python endpoints for model inference using quantized engine runtimes.",
          "Develop responsive visual data panels and failure diagnostic logs in the client.",
          "Integrate in-memory cache structures (Redis) to accelerate model query performance."
        ]
      },
      {
        phase: "Phase 3: Testing & Validation",
        duration: "3 Weeks",
        tasks: [
          "Establish continuous regression pipelines validating accuracy against test data.",
          "Execute stress test scripts simulating simultaneous multi-tenant query volumes.",
          "Review closed-beta feedback on usability and false-positive alert boundaries."
        ]
      },
      {
        phase: "Phase 4: Deployment",
        duration: "2 Weeks",
        tasks: [
          "Deploy containerized microservices (Docker/Kubernetes) to cloud clusters.",
          "Expose webhook configurations for real-time status page alerts and logs.",
          "Wire up secure subscription billing integrations using stripe checkouts."
        ]
      },
      {
        phase: "Phase 5: Scaling",
        duration: "4 Weeks+",
        tasks: [
          "Quantize and export models for localized on-device execution on client browsers.",
          "Build continuous active-learning training pipelines processing anonymized inputs.",
          "Partner with regional accelerators and VC funds to secure growth enterprise pilots."
        ]
      }
    ];
    swot = {
      strengths: [
        "Highly accurate predictive capability using specialized models.",
        "Quantized model support for fast edge inference.",
        "Proprietary initial datasets for model training."
      ],
      weaknesses: [
        "Substantial upfront compute and GPU infrastructure costs.",
        "High latency profiles on complex inference queries.",
        "Direct dependence on constant clean data input pipelines."
      ],
      opportunities: [
        "Deploying localized models directly on client hardware.",
        "Licensing predictive pipelines to traditional legacy companies.",
        "Collaboration with industry accelerators for validation runs."
      ],
      threats: [
        "Rapid open-source replication of base model weights.",
        "Tightening of privacy rules on user telemetry ingestion.",
        "Erosion of profit margins from raw hosting cost inflation."
      ]
    };
    estimates = {
      estimatedBudget: "₹12–18 Lakhs",
      estimatedDuration: "6–9 Months",
      recommendedTeamSize: "6 Engineers",
      complexityLevel: "High",
      estimatedMaintenanceCost: "₹1.2 Lakhs / Month"
    };
  } else if (lowercaseIdea.includes("app") || lowercaseIdea.includes("platform") || lowercaseIdea.includes("web") || lowercaseIdea.includes("saas")) {
    risks = [
      {
        risk: "Customer Acquisition Cost (CAC)",
        severity: "High",
        description: "Oversaturated ad channels lead to high cost of user acquisition compared to lifetime value."
      },
      {
        risk: "Scaling & Concurrency Churn",
        severity: "Low",
        description: "Simultaneous user logins could slow DB queries if horizontal scaling isn't set up early."
      }
    ];
    failureReasons = [
      "Lack of product-market fit due to duplicate market solutions.",
      "Slow development cycles causing loss of early adopter interest."
    ];
    challenges = [
      "High DB read/write loads during peak daily login hours.",
      "Low user activation rate within the first 7 days."
    ];
    solutions = [
      {
        challenge: "High DB read/write loads during peak daily login hours.",
        solution: "Deploy Redis caching layer for read-heavy queries and paginate active API responses."
      },
      {
        challenge: "Low user activation rate within the first 7 days.",
        solution: "Refactor onboarding flow to request fewer signup steps and offer immediate interactive value."
      }
    ];
    confidenceScore = 60;
    investorReadinessScore = 68;
    marketPotentialScore = 72;
    scalabilityScore = 80;
    revenueModelScore = 65;
    executionFeasibilityScore = 55;
    technicalRisk = 45;
    budgetRisk = 55;
    marketRisk = 70;
    scalabilityRisk = 60;
    operationalRisk = 50;
    roadmap = [
      {
        phase: "Phase 1: Research & Planning",
        duration: "2 Weeks",
        tasks: [
          "Perform qualitative customer development interviews to isolate target paint points.",
          "Design database relational diagrams (PostgreSQL) and define API contracts.",
          "Draft initial user experience flow wireframes for core value screens."
        ]
      },
      {
        phase: "Phase 2: MVP Development",
        duration: "4 Weeks",
        tasks: [
          "Implement REST server routes, authentication guards, and database schemas.",
          "Develop front-end components, forms, and analytical dashboards.",
          "Configure standard cache nodes to decrease initial page response latencies."
        ]
      },
      {
        phase: "Phase 3: Testing & Validation",
        duration: "2 Weeks",
        tasks: [
          "Draft integration tests checking database consistency and data validation boundaries.",
          "Simulate simultaneous horizontal page login workloads using load drivers.",
          "Measure and refactor key customer onboarding retention steps."
        ]
      },
      {
        phase: "Phase 4: Deployment",
        duration: "1 Week",
        tasks: [
          "Expose endpoints to server nodes and configure automatic scaling triggers.",
          "Enable automated database backup configurations and monitoring channels.",
          "Integrate transaction payment notifications to track subscription triggers."
        ]
      },
      {
        phase: "Phase 5: Scaling",
        duration: "6 Weeks+",
        tasks: [
          "Introduce referral mechanisms and collaborative workspace sharing.",
          "Rewrite complex query lines and optimize index metrics to support high concurrency.",
          "Form sales loops and test ad channels targeting key business buyers."
        ]
      }
    ];
    swot = {
      strengths: [
        "Paginated and cached REST API structures minimizing latency.",
        "Sleek and intuitive user interface dashboard layout.",
        "Modular database schemas allowing rapid feature iterations."
      ],
      weaknesses: [
        "High CAC over traditional ad marketing channels.",
        "Database bottleneck risks under simultaneous client workloads.",
        "Lack of deep technical support for legacy client software."
      ],
      opportunities: [
        "Viral referral integrations in developer workspaces.",
        "Providing automated webhook alerts for premium tier accounts.",
        "Upselling fully-managed platform hosting support packages."
      ],
      threats: [
        "Established competitors introducing copycat widgets.",
        "Browser privacy updates limiting analytics tracking.",
        "Developer team churn delaying key roadmap features."
      ]
    };
    estimates = {
      estimatedBudget: "₹5–8 Lakhs",
      estimatedDuration: "3–5 Months",
      recommendedTeamSize: "4 Developers",
      complexityLevel: "Medium",
      estimatedMaintenanceCost: "₹45K / Month"
    };
  } else {
    risks = [
      {
        risk: "Market Timing and Validation",
        severity: "High",
        description: "Solving a problem that is either too niche or does not have immediate commercial willingness to pay."
      },
      {
        risk: "Operational Resource Constraints",
        severity: "Medium",
        description: "Underestimating the developer hours needed to build a polished, production-ready release."
      }
    ];
    failureReasons = [
      "Lack of distribution channel or product-led growth strategy.",
      "Running out of budget before finding repeatable customer channels."
    ];
    challenges = [
      "Securing initial reference customer testimonials for B2B validation.",
      "Integrating with legacy standard enterprise systems."
    ];
    solutions = [
      {
        challenge: "Securing initial reference customer testimonials for B2B validation.",
        solution: "Offer free pilot runs to 3 local businesses in exchange for documented success metrics."
      },
      {
        challenge: "Integrating with legacy standard enterprise systems.",
        solution: "Expose clean REST webhooks and write robust compatibility adaptors."
      }
    ];
    confidenceScore = 55;
    investorReadinessScore = 52;
    marketPotentialScore = 58;
    scalabilityScore = 60;
    revenueModelScore = 50;
    executionFeasibilityScore = 42;
    technicalRisk = 55;
    budgetRisk = 65;
    marketRisk = 75;
    scalabilityRisk = 40;
    operationalRisk = 60;
    roadmap = [
      {
        phase: "Phase 1: Research & Planning",
        duration: "2 Weeks",
        tasks: [
          "Investigate competitor feature gaps and define the value proposition.",
          "Outline hardware/software architecture specifications and resource requirements.",
          "Map initial operational runway models and compute project budgets."
        ]
      },
      {
        phase: "Phase 2: MVP Development",
        duration: "5 Weeks",
        tasks: [
          "Deploy relational databases and build basic backend control routing.",
          "Design simple, clean data dashboard views and inputs inside the client UI.",
          "Connect external API networks and build robust adaptor functions."
        ]
      },
      {
        phase: "Phase 3: Testing & Validation",
        duration: "2 Weeks",
        tasks: [
          "Review product execution flows during structured trial pilot groups.",
          "Benchmark request/response latencies and solve visual layout alignment issues.",
          "Audit database security rules and verify cross-tenant boundaries."
        ]
      },
      {
        phase: "Phase 4: Deployment",
        duration: "2 Weeks",
        tasks: [
          "Publish servers to deployment environments and configure SSL profiles.",
          "Enable automated system status monitors and log alert configurations.",
          "Initiate public production checkups and verify billing webhook status."
        ]
      },
      {
        phase: "Phase 5: Scaling",
        duration: "8 Weeks+",
        tasks: [
          "Expose additional subscription packages and service levels.",
          "Incorporate Redis caches and optimize slow database index fields.",
          "Initiate enterprise customer sales efforts to validate scale plans."
        ]
      }
    ];
    swot = {
      strengths: [
        "Experienced core team in custom software solutions.",
        "Scalable database models configured for high availability.",
        "Validated product-market fit from client focus groups."
      ],
      weaknesses: [
        "High reliance on third-party integrations and APIs.",
        "Bootstrap budget runway constraints limiting early hires.",
        "Manual client onboarding process for complex setups."
      ],
      opportunities: [
        "Expanding into untracked mid-market customer segments.",
        "Building automated integrations with telemetry toolchains.",
        "Offering white-label versions for platform partners."
      ],
      threats: [
        "Rapid copycat replication from large tech platforms.",
        "Compliance adjustments blocking direct server telemetry.",
        "Shifts in subscription margins from cloud cost changes."
      ]
    };
    estimates = {
      estimatedBudget: "₹4–6 Lakhs",
      estimatedDuration: "2–4 Months",
      recommendedTeamSize: "3 Developers",
      complexityLevel: "Low-Medium",
      estimatedMaintenanceCost: "₹30K / Month"
    };
  }

  return {
    risks,
    failureReasons,
    challenges,
    solutions,
    confidenceScore,
    investorReadinessScore,
    marketPotentialScore,
    scalabilityScore,
    revenueModelScore,
    executionFeasibilityScore,
    technicalRisk,
    budgetRisk,
    marketRisk,
    scalabilityRisk,
    operationalRisk,
    roadmap,
    swot,
    estimates
  };
};

export const analyzeProject = async (idea) => {
  try {
    if (!idea) throw new Error("Idea is required");

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("WARN: OPENROUTER_API_KEY is not defined. Using offline mock diagnostics.");
      return generateMockReport(idea);
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content: `
You are a senior software architect and startup evaluator.

You evaluate project ideas like a Y Combinator investor.

You MUST return ONLY valid JSON.
No markdown, no explanation, no text.

IMPORTANT RULES:
- Never return empty arrays
- Always give real meaningful content
- confidenceScore must be between 1 and 100
- investorReadinessScore must be between 1 and 100
- marketPotentialScore must be between 1 and 100
- scalabilityScore must be between 1 and 100
- revenueModelScore must be between 1 and 100
- executionFeasibilityScore must be between 1 and 100
- technicalRisk must be between 1 and 100
- budgetRisk must be between 1 and 100
- marketRisk must be between 1 and 100
- scalabilityRisk must be between 1 and 100
- operationalRisk must be between 1 and 100
- roadmap must be an array of exactly 5 elements matching the phases:
  - Phase 1: Research & Planning
  - Phase 2: MVP Development
  - Phase 3: Testing & Validation
  - Phase 4: Deployment
  - Phase 5: Scaling
  Each phase must have "phase" (the name of the phase), "duration" (estimated duration, e.g. "3 Weeks", "2 Months"), and "tasks" (an array of at least 3 customized task strings for the idea).
- swot must be an object with keys "strengths", "weaknesses", "opportunities", and "threats", each containing an array of at least 3 customized SWOT analysis bullet point strings.
- estimates must be an object with keys "estimatedBudget" (string, e.g. "₹4–6 Lakhs"), "estimatedDuration" (string, e.g. "4–6 Months"), "recommendedTeamSize" (string, e.g. "5 Developers"), "complexityLevel" (string, e.g. "Medium"), and "estimatedMaintenanceCost" (string, e.g. "₹40K / Month"). Estimate values based on project scope, features, and technology complexity.
- Be strict, realistic, and analytical
`
          },
          {
            role: "user",
            content: `
Analyze this project idea deeply:

"${idea}"

Return ONLY JSON in this format:

{
  "risks": [
    {
      "risk": "Name of the risk (e.g. Technical Risk, Scalability Risk, Market Risk)",
      "severity": "High" | "Medium" | "Low",
      "description": "A detailed explanation of the specific risk and why it applies here."
    }
  ],
  "failureReasons": [
    "First specific reason why this project might fail.",
    "Second reason...",
    "Third reason..."
  ],
  "challenges": [
    "First operational/technical challenge.",
    "Second challenge..."
  ],
  "solutions": [
    {
      "challenge": "Core challenge matching one from the list...",
      "solution": "Actionable, technical, or business solution to mitigate this challenge."
    }
  ],
  "confidenceScore": 1-100,
  "investorReadinessScore": 1-100,
  "marketPotentialScore": 1-100,
  "scalabilityScore": 1-100,
  "revenueModelScore": 1-100,
  "executionFeasibilityScore": 1-100,
  "technicalRisk": 1-100,
  "budgetRisk": 1-100,
  "marketRisk": 1-100,
  "scalabilityRisk": 1-100,
  "operationalRisk": 1-100,
  "roadmap": [
    {
      "phase": "Phase 1: Research & Planning",
      "duration": "estimated duration (e.g. 2 Weeks)",
      "tasks": [
        "First specific custom task...",
        "Second task...",
        "Third task..."
      ]
    }
  ],
  "swot": {
    "strengths": [
      "First strength bullet point...",
      "Second...",
      "Third..."
    ],
    "weaknesses": [
      "First weakness...",
      "Second...",
      "Third..."
    ],
    "opportunities": [
      "First opportunity...",
      "Second...",
      "Third..."
    ],
    "threats": [
      "First threat...",
      "Second...",
      "Third..."
    ]
  },
  "estimates": {
    "estimatedBudget": "estimated development budget (e.g. ₹4–6 Lakhs)",
    "estimatedDuration": "estimated development duration (e.g. 4–6 Months)",
    "recommendedTeamSize": "recommended team size (e.g. 5 Developers)",
    "complexityLevel": "complexity level (e.g. Medium)",
    "estimatedMaintenanceCost": "estimated maintenance cost (e.g. ₹40K / Month)"
  }
}
`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let text = response.data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response from AI service.");
    }

    // 🧹 SAFE CLEANUP (important for JSON issues)
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🧠 parse safely
    const parsed = JSON.parse(text);

    // Validate fields exist and conform
    return {
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      failureReasons: Array.isArray(parsed.failureReasons) ? parsed.failureReasons : [],
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
      solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 50,
      investorReadinessScore: typeof parsed.investorReadinessScore === 'number' ? parsed.investorReadinessScore : 50,
      marketPotentialScore: typeof parsed.marketPotentialScore === 'number' ? parsed.marketPotentialScore : 50,
      scalabilityScore: typeof parsed.scalabilityScore === 'number' ? parsed.scalabilityScore : 50,
      revenueModelScore: typeof parsed.revenueModelScore === 'number' ? parsed.revenueModelScore : 50,
      executionFeasibilityScore: typeof parsed.executionFeasibilityScore === 'number' ? parsed.executionFeasibilityScore : 50,
      technicalRisk: typeof parsed.technicalRisk === 'number' ? parsed.technicalRisk : 50,
      budgetRisk: typeof parsed.budgetRisk === 'number' ? parsed.budgetRisk : 50,
      marketRisk: typeof parsed.marketRisk === 'number' ? parsed.marketRisk : 50,
      scalabilityRisk: typeof parsed.scalabilityRisk === 'number' ? parsed.scalabilityRisk : 50,
      operationalRisk: typeof parsed.operationalRisk === 'number' ? parsed.operationalRisk : 50,
      roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
      swot: (parsed.swot && Array.isArray(parsed.swot.strengths)) ? parsed.swot : {
        strengths: ["Innovative concept with clear customer value proposition."],
        weaknesses: ["Early-stage development dependency and bootstrap runway constraints."],
        opportunities: ["First-mover advantage in niche industrial integration."],
        threats: ["Rapid feature replication from platform gatekeepers."]
      },
      estimates: parsed.estimates || {
        estimatedBudget: "₹4–6 Lakhs",
        estimatedDuration: "4–6 Months",
        recommendedTeamSize: "5 Developers",
        complexityLevel: "Medium",
        estimatedMaintenanceCost: "₹40K / Month"
      }
    };
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("OpenRouter Error Details:", errorDetails);
    throw new Error(`AI Service Failed: ${errorDetails}`);
  }
};