// src/templates.ts

export interface RoleTemplate {
  id: 'ai' | 'backend' | 'genai' | 'python' | 'fullstack' | 'frontend';
  label: string;
  badge: string;
  subject: string;
  body: string;
}

export const BACKEND_AI_TEMPLATE = {
  subject: 'Application for Backend & AI Engineer | 4+ Years Exp | Python, FastAPI, LLMs, AWS',
  body: `Dear Hiring Team,

I am writing to express my strong interest in Backend & AI Engineer opportunities at your organization.

I bring 4+ years of experience engineering production-grade backend systems and GenAI applications for enterprise clients including PwC and Aditya Birla Group. My core expertise centers on Python, FastAPI, microservices, cloud-native deployments on AWS and Azure, and building end-to-end LLM/GenAI pipelines.

Key Highlights of my experience:
• GenAI & LLM Pipelines: Built production GenAI pipelines using OpenAI, Azure OpenAI, AWS Bedrock, and LangChain for document Q&A, summarization, and risk prediction at PwC (processing 500+ tax documents/month) with OCR integration (Tesseract, Docling, AWS Textract) and vector databases.
• High-Scale Fintech & API Integrations: Developed and maintained mission-critical third-party financial API integrations (Razorpay, Digio, Tartan) for Aditya Birla Group serving a 10M+ customer base; reduced integration failure rate by ~30% via robust retry and error-handling layers.
• Scalable Serverless & Microservices: Architected FastAPI + PostgreSQL backend on AWS Lambda (serverless), reducing infrastructure costs by ~35% vs EC2, and implemented Redis caching layers improving API response times by ~60%.
• Asynchronous Architecture & SRE: Designed distributed message architectures with AWS SNS+SQS (50K+ msgs/day) and Celery+Redis task queues; drove SRE best practices maintaining 99.5%+ service availability.

I would be thrilled to bring my experience in Python backend microservices and GenAI systems to your engineering team.

Please find my resume attached for your consideration.

Thank you for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | Python · FastAPI · LLMs · AWS
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`
};

export const PYTHON_BACKEND_TEMPLATE = {
  subject: 'Application for Python Backend Developer / FastAPI Engineer | 4+ Years Experience',
  body: `Dear Hiring Team,

I am writing to express my interest in Python Backend Developer / Senior Backend Engineer roles at your organization.

With 4+ years of experience designing and scaling production backend systems for enterprise clients including PwC and Aditya Birla Group, I specialize in Python, FastAPI, Django, PostgreSQL, Redis, microservices, and serverless cloud architectures (AWS Lambda, Azure Functions).

Key Highlights:
• Scalable APIs & Microservices: Built 15+ secure RESTful APIs using FastAPI and Django; optimized ORM queries (SQLAlchemy, Django ORM) to reduce database load by 20% on high-traffic endpoints.
• Financial & Third-Party Integrations: Integrated payment gateways, PAN verification, and E-mandates (Razorpay, Digio, Tartan) for Aditya Birla Group's 10M+ customer base with strict compliance (OAuth, JWT, field-level encryption).
• Serverless & Performance: Deployed FastAPI backends on AWS Lambda, cutting infrastructure costs by 35% and cutting deployment times from 2 hours to under 15 minutes via automated CI/CD pipelines (Azure DevOps, GitHub Actions).
• Async Processing: Built background processing pipelines with Celery + Redis and AWS SNS/SQS handling 50,000+ daily messages with guaranteed delivery.

My resume is attached for your review. I would welcome the opportunity to discuss how my backend engineering experience aligns with your team's needs.

Thank you for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | Python · FastAPI · Microservices
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`
};

export const GENAI_LLM_TEMPLATE = {
  subject: 'Application for Generative AI & LLM Engineer | LangChain, RAG, Bedrock, OpenAI | 4+ Yrs Exp',
  body: `Dear Hiring Team,

I am writing to express my interest in GenAI / LLM Engineer opportunities at your organization.

I am a Backend & AI Engineer with 4+ years of experience specializing in building production GenAI pipelines, RAG systems, and intelligent document processing systems integrated with Python/FastAPI backends on AWS and Azure.

Key AI/GenAI Highlights:
• GenAI Pipelines: Built and deployed enterprise GenAI pipelines using LangChain, OpenAI APIs, Azure OpenAI, and AWS Bedrock for intelligent document Q&A, summarization, and risk prediction at PwC.
• Document AI & OCR: Engineered multi-format extraction pipelines processing PDF, Excel, and scanned documents via OCR (Tesseract, Docling OCR, AWS Textract) and vector databases (ChromaDB) with LLM-as-Judge evaluation.
• Production Serving: Wrapped LLM orchestration in high-performance FastAPI serverless services on AWS Lambda, achieving 60% faster response times via Redis semantic/data caching.
• Anthropic Certified: Certified in AI Fluency (Foundations of LLMs, prompt engineering, responsible AI, and practical Claude API usage).

Please find my resume attached. I would be eager to discuss how I can contribute to your GenAI initiatives.

Thank you for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | LLMs · LangChain · AWS Bedrock
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`
};

export const CLOUD_BACKEND_TEMPLATE = {
  subject: 'Application for Cloud & Microservices Backend Engineer | Python, AWS Lambda, Docker | 4+ Yrs Exp',
  body: `Dear Hiring Team,

I am writing to express my interest in Cloud / Microservices Backend Engineer opportunities at your organization.

With 4+ years of production experience across AWS and Azure, I specialize in architecting cloud-native Python/FastAPI microservices, serverless deployments (AWS Lambda, Azure Functions), and asynchronous distributed architectures.

Enterprise Cloud Highlights:
• Scaled serverless FastAPI + PostgreSQL on AWS Lambda, cutting infrastructure costs by ~35% vs EC2.
• Built distributed asynchronous email & task processing via AWS SNS + SQS (50,000+ msgs/day) and Celery + Redis.
• Automated CI/CD pipelines via Azure DevOps and GitHub Actions, cutting deployment cycles from 2 hours to under 15 minutes.
• Drove SRE practices (error budgets, alerting, runbooks) maintaining 99.5%+ service availability across enterprise clients including PwC and Aditya Birla Group.

Please find my resume attached for your consideration.

Thank you for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | Python · AWS · Serverless · SRE
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`
};

export const FOLLOWUP_TEMPLATE = {
  subject: 'Follow-Up: Application for Backend & AI Engineer | Utkarsh Gupta (4+ Yrs Exp)',
  body: `Dear Hiring Team,

I hope this email finds you well.

I am following up on my previous application for Backend & AI Engineer / Python Developer opportunities at your organization.

I remain very enthusiastic about contributing to your engineering team with my 4+ years of experience developing production GenAI pipelines (LangChain, AWS Bedrock, OpenAI), high-performance FastAPI/Django microservices, and cloud-native solutions on AWS and Azure (serving enterprise clients like PwC and Aditya Birla Group).

I have re-attached my resume for your convenience. I would welcome the opportunity to connect for a brief discussion regarding any active or upcoming technical openings.

Thank you once again for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | Python · FastAPI · LLMs · AWS
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`
};

// Aliases for compatibility across components and core.ts
export const FRESH_TEMPLATE = BACKEND_AI_TEMPLATE;
export const BACKEND_FRESH_TEMPLATE = PYTHON_BACKEND_TEMPLATE;
export const FRONTEND_FRESH_TEMPLATE = PYTHON_BACKEND_TEMPLATE;
export const FRONTEND_FOLLOWUP_TEMPLATE = FOLLOWUP_TEMPLATE;
export const FRONTEND_TEMPLATE = PYTHON_BACKEND_TEMPLATE;
export const AI_FRONTEND_TEMPLATE = GENAI_LLM_TEMPLATE;
export const FULLSTACK_TEMPLATE = CLOUD_BACKEND_TEMPLATE;
export const BACKEND_TEMPLATE = PYTHON_BACKEND_TEMPLATE;

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'ai',
    label: 'Backend & AI Engineer',
    badge: 'Python / LLMs / AWS',
    subject: BACKEND_AI_TEMPLATE.subject,
    body: BACKEND_AI_TEMPLATE.body
  },
  {
    id: 'backend',
    label: 'Python Backend Developer',
    badge: 'FastAPI / Django / AWS',
    subject: PYTHON_BACKEND_TEMPLATE.subject,
    body: PYTHON_BACKEND_TEMPLATE.body
  },
  {
    id: 'genai',
    label: 'GenAI & LLM Specialist',
    badge: 'LangChain / Bedrock / RAG',
    subject: GENAI_LLM_TEMPLATE.subject,
    body: GENAI_LLM_TEMPLATE.body
  },
  {
    id: 'python',
    label: 'Cloud & Microservices Engineer',
    badge: 'AWS Lambda / Docker / SRE',
    subject: CLOUD_BACKEND_TEMPLATE.subject,
    body: CLOUD_BACKEND_TEMPLATE.body
  }
];
