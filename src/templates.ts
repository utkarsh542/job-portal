// src/templates.ts

export interface RoleTemplate {
  id: 'qa' | 'ai_qa' | 'api_sdet' | 'manual_qa';
  label: string;
  badge: string;
  subject: string;
  body: string;
}

export const QA_ENGINEER_TEMPLATE = {
  subject: 'Application for QA Engineer / SDET (Manual & API Testing) | Cheshta Verma (3+ Yrs Exp)',
  body: `Dear Hiring Team,

I am writing to express my strong interest in QA Engineer / Software Test Engineer opportunities at your organization.

I bring 3+ years of hands-on experience in Manual Software Testing, Web & Mobile Testing, REST API Testing, and AI/GenAI application testing. Currently deployed at PwC India (via Aerolex Labs) on the Navigate Tax Hub enterprise platform, I specialize in end-to-end quality assurance across functional, regression, smoke, sanity, integration, UAT, and API testing.

Key Highlights of my experience:
• Comprehensive QA & Test Execution: Executed 5,000+ test cases across complex web and mobile enterprise workflows with complete RTM traceability; tracked and managed 500+ defects through JIRA with detailed reproduction steps and root-cause analysis (zero critical defect escapes in production).
• REST API Testing & Data Validation: Conducted thorough API testing using Postman (HTTP status codes, request/response payload validation, JSON schema validation, CRUD operations, auth/RBAC testing, and negative edge cases) with SQL-based backend data reconciliation.
• AI & GenAI Application Testing: Spearheaded end-to-end testing of LLM-powered enterprise modules at PwC India — validating LLM-generated Q&A for accuracy, source traceability, hallucination detection, prompt testing, and RAG response validation.
• Enterprise Agile Collaboration: Actively participate in Sprint ceremonies, test planning, daily QA logs, release validation, and cross-functional triage using JIRA, Zephyr, TestRail, and Azure DevOps.

I would welcome the opportunity to discuss how my QA experience, attention to detail, and API/AI testing skills can add value to your engineering and QA teams.

Please find my resume attached for your consideration.

Thank you for your time and consideration.

Best regards,
Cheshta Verma
QA Engineer | SDET (Manual & API) | AI / GenAI QA
+91 7037563327
kmcheshtamzn@gmail.com
Gurugram, India | linkedin.com/in/cheshta`
};

export const AI_GENAI_QA_TEMPLATE = {
  subject: 'Application for AI / GenAI QA Engineer | LLM Testing, RAG Validation, Hallucination Detection | Cheshta Verma',
  body: `Dear Hiring Team,

I am writing to express my interest in AI / GenAI QA Engineer and Quality Assurance opportunities at your organization.

I am a QA Engineer with 3+ years of experience specializing in testing AI/GenAI applications, LLM orchestration pipelines, and enterprise software at PwC India (via Aerolex Labs) on the Navigate Tax Hub platform.

Key AI/GenAI QA Highlights:
• LLM & RAG Response Validation: Tested LLM-generated Q&A responses for factual accuracy, relevance, hallucinations, source traceability, and model edge cases across enterprise tax and financial document workflows.
• Document AI & Summarization: Validated AI-generated document summaries, bulk document upload parsing (PAN, GSTIN, invoice extraction), file validation, and error-handling mechanisms.
• NLP Engine Testing: Tested NLP classification engines mapping complex product/service descriptions against regulatory codes, validating misclassifications, null outputs, and response-time SLAs.
• API & Functional Quality: Validated backend APIs via Postman, verified database consistency using SQL, and maintained rigorous test coverage and RTM logs in JIRA.

My resume is attached for your review. I would be eager to discuss how my AI testing expertise can help ensure the reliability and safety of your GenAI products.

Thank you for your time and consideration.

Best regards,
Cheshta Verma
QA Engineer | AI / GenAI QA | LLM Testing & RAG Validation
+91 7037563327
kmcheshtamzn@gmail.com
Gurugram, India | linkedin.com/in/cheshta`
};

export const API_SDET_TEMPLATE = {
  subject: 'Application for API Test Engineer / SDET (Manual & API) | Postman, REST APIs, SQL | Cheshta Verma',
  body: `Dear Hiring Team,

I am writing to express my interest in API Test Engineer / QA Engineer (Manual & API) opportunities at your organization.

With 3+ years of testing experience on enterprise web and mobile applications at PwC India (via Aerolex Labs), I possess deep expertise in REST API validation, database verification with SQL, and defect lifecycle management.

Technical Testing Highlights:
• REST API Testing: Expert in Postman for API request/response validation, schema validation, HTTP status verification, authentication/authorization (RBAC), and boundary/negative test suites.
• Database Verification: Wrote complex SQL queries to validate UI-to-backend data integrity and reconcile transaction records.
• Defect Management & Tracking: Logged, prioritized, and tracked 500+ defects in JIRA with comprehensive reproduction steps, evidence, and severity classification.
• Tools & Methodologies: Proficient with Postman, JIRA, SQL, Chrome DevTools, Bruno, Zephyr, TestRail, Git, and Azure DevOps, with basic exposure to Python scripting and JMeter.

Please find my resume attached. I would appreciate the opportunity to discuss how I can contribute to your team's quality standards.

Thank you for your time and consideration.

Best regards,
Cheshta Verma
QA Engineer | SDET (Manual & API) | REST APIs · Postman · SQL
+91 7037563327
kmcheshtamzn@gmail.com
Gurugram, India | linkedin.com/in/cheshta`
};

export const MANUAL_QA_TEMPLATE = {
  subject: 'Application for QA Engineer / Manual Test Engineer | Web, Mobile, JIRA | Cheshta Verma (3+ Yrs Exp)',
  body: `Dear Hiring Team,

I am writing to express my interest in QA Engineer / Manual Software Testing roles at your organization.

I have 3+ years of experience in manual software testing across Web and Mobile applications, currently deployed at PwC India (via Aerolex Labs) on an enterprise Tax Hub platform. I have a thorough understanding of SDLC, STLC, test scenario design, test case execution, and defect reporting.

Core Testing Highlights:
• Test Execution & Coverage: Designed and executed functional, regression, smoke, sanity, integration, system, UI, cross-browser, and UAT test cases (5,000+ test cases executed).
• Defect Tracking & Root Cause Analysis: Managed defect lifecycle in JIRA, collaborating closely with developers and product managers to resolve 500+ bugs with zero critical defect escapes.
• Documentation & Quality Standards: Created and maintained Test Plans, Requirement Traceability Matrices (RTM), execution logs, and daily QA reports.
• End-to-End Ownership: Sole QA engineer owning multiple modules including Q&A, Document Summarization, and Submission workflows.

My resume is attached for your consideration. I look forward to the possibility of discussing this role with you.

Thank you for your time and consideration.

Best regards,
Cheshta Verma
QA Engineer | Manual Testing · Web & Mobile · JIRA · STLC
+91 7037563327
kmcheshtamzn@gmail.com
Gurugram, India | linkedin.com/in/cheshta`
};

export const FOLLOWUP_TEMPLATE = {
  subject: 'Follow-Up: Application for QA Engineer / AI QA Role | Cheshta Verma (3+ Yrs Exp)',
  body: `Dear Hiring Team,

I hope this email finds you well.

I am following up on my previous application for QA Engineer / Test Engineer opportunities at your organization.

I remain very enthusiastic about bringing my 3+ years of QA experience (Manual, Postman REST API testing, SQL validation, and AI/GenAI LLM response testing at PwC India via Aerolex Labs) to your team.

I have re-attached my resume for your convenience. I would welcome the opportunity to connect for a brief conversation regarding any current or upcoming QA openings.

Thank you once again for your time and consideration.

Best regards,
Cheshta Verma
QA Engineer | SDET (Manual & API) | AI / GenAI QA
+91 7037563327
kmcheshtamzn@gmail.com
Gurugram, India | linkedin.com/in/cheshta`
};

// Aliases for compatibility across components and core.ts
export const BACKEND_AI_TEMPLATE = QA_ENGINEER_TEMPLATE;
export const PYTHON_BACKEND_TEMPLATE = API_SDET_TEMPLATE;
export const GENAI_LLM_TEMPLATE = AI_GENAI_QA_TEMPLATE;
export const CLOUD_BACKEND_TEMPLATE = MANUAL_QA_TEMPLATE;
export const FRESH_TEMPLATE = QA_ENGINEER_TEMPLATE;
export const BACKEND_FRESH_TEMPLATE = API_SDET_TEMPLATE;
export const FRONTEND_FRESH_TEMPLATE = MANUAL_QA_TEMPLATE;
export const FRONTEND_FOLLOWUP_TEMPLATE = FOLLOWUP_TEMPLATE;
export const FRONTEND_TEMPLATE = MANUAL_QA_TEMPLATE;
export const AI_FRONTEND_TEMPLATE = AI_GENAI_QA_TEMPLATE;
export const FULLSTACK_TEMPLATE = API_SDET_TEMPLATE;
export const BACKEND_TEMPLATE = QA_ENGINEER_TEMPLATE;

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'qa',
    label: 'QA Engineer (Manual & API)',
    badge: 'Postman / REST APIs / SQL',
    subject: QA_ENGINEER_TEMPLATE.subject,
    body: QA_ENGINEER_TEMPLATE.body
  },
  {
    id: 'ai_qa',
    label: 'AI / GenAI QA Engineer',
    badge: 'LLM Testing / RAG / Prompts',
    subject: AI_GENAI_QA_TEMPLATE.subject,
    body: AI_GENAI_QA_TEMPLATE.body
  },
  {
    id: 'api_sdet',
    label: 'API QA / SDET Specialist',
    badge: 'API Testing / Postman / SQL',
    subject: API_SDET_TEMPLATE.subject,
    body: API_SDET_TEMPLATE.body
  },
  {
    id: 'manual_qa',
    label: 'Manual & Mobile QA',
    badge: 'Web / Mobile / JIRA / UAT',
    subject: MANUAL_QA_TEMPLATE.subject,
    body: MANUAL_QA_TEMPLATE.body
  }
];
