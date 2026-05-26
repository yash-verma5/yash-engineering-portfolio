export const profile = {
  name: "Yash Verma",
  title: "Enterprise Software Engineer / Backend Developer",
  location: "Indore, Madhya Pradesh, India",
  phone: "+91-8077-895-681",
  email: "yashv521@gmail.com",
  headline:
    "Enterprise Software Engineer building Java backends, integrations, and scalable retail systems.",
  subtext:
    "Focused on Spring Boot, Apache NiFi, Solr, OMS workflows, and production-grade debugging.",
  availability:
    "Open to backend, platform, and integration engineering opportunities.",
  contactNote:
    "Available for software engineering roles focused on backend systems, integrations, and scalable platform work.",
  links: {
    github: "https://github.com/yash-verma5",
    linkedin: "https://linkedin.com/in/yashverma5",
    docs: "https://yash-verma5.github.io/Dynamic-Docs/",
    blog: "https://yashv521.hashnode.dev/",
    featuredArticle: "https://yashv521.hashnode.dev/practical-hands-on-k8s-services"
  }
};

export const navItems = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "writing", label: "Writing" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" }
];

export const about = {
  eyebrow: "About",
  title: "Backend systems, integrations, and production clarity.",
  body:
    "I am an Enterprise Software Engineer at HotWax Systems with experience building and debugging backend systems, retail integrations, data pipelines, search services, and order management workflows. I work primarily with Java, Spring Boot, Apache NiFi, Apache Solr, Moqui/OFBiz, REST APIs, SQL, and frontend integrations where needed. My work spans production support, migration projects, feature development, debugging, and performance-oriented system design.",
  highlights: [
    "Retail and order-management workflows",
    "Apache NiFi production flow ownership",
    "Solr and SolrCloud search reliability",
    "Backend debugging across distributed systems"
  ]
};

export const skillGroups = [
  {
    title: "Languages & Frameworks",
    skills: ["Java", "Spring Boot", "Moqui / OFBiz", "React.js", "Vue.js", "REST APIs", "SQL"]
  },
  {
    title: "Tools & Infrastructure",
    skills: ["Apache NiFi", "Apache Solr", "AWS", "Docker", "Kubernetes", "Jenkins", "Argo CD", "Git"]
  },
  {
    title: "Working Stack",
    skills: ["MySQL", "JWT", "GraphQL", "Maven", "Grafana", "SolrCloud", "Production Support"]
  }
];

export const experience = [
  {
    company: "HotWax Systems",
    role: "Enterprise Software Engineer",
    location: "Indore, Madhya Pradesh",
    duration: "Apr 2025 - Present",
    summary:
      "Backend and integration engineering across OMS workflows, production support, search migration, data pipelines, and operational debugging.",
    achievements: [
      "Own and monitor Apache NiFi production flows across multiple environments, handling retries, failures, operational health, and root-cause debugging.",
      "Designed an uninvoiced-orders recovery sweep in NiFi, moving from broad scans to cursor-based querying to reduce unnecessary database load.",
      "Investigated missing packed-order scenarios by tracing OMS transaction timestamps, poll cursors, and downstream flow behavior to the root cause.",
      "Supported Solr Standalone to SolrCloud migration for multiple document types, validating document integrity and search behavior during UAT switchover.",
      "Built and maintained indexing, migration, transformation, and schema-validation flows for order, product, and integration data.",
      "Contributed to Ship-to-Store workflows across backend, frontend, OMS, fulfillment, and pickup paths, including shipment conversion, facility-address, and label-generation fixes.",
      "Worked on external integration pipelines and operational flows for commerce, marketing, and retail systems while keeping client-specific details generalized for public discussion.",
      "Built Java/Solr search services and reconciliation queries that reduce pressure on production MySQL systems and improve data validation confidence."
    ]
  }
];

export const projects = [
  {
    title: "SolrCloud Migration",
    category: "Enterprise Search / Data Migration",
    tech: ["Apache NiFi", "Apache Solr", "Java"],
    description:
      "Migrated large search datasets from Solr Standalone to SolrCloud, validated document integrity, supported UAT switchover, and improved reliability of indexing workflows.",
    impact: ["Large-scale migration", "Near-zero downtime mindset", "Search reliability and validation"],
    links: []
  },
  {
    title: "Ship-to-Store Workflow",
    category: "OMS / Fulfillment Feature",
    tech: ["Moqui", "Java", "Vue.js", "Apache NiFi"],
    description:
      "Contributed to an end-to-end Ship-to-Store workflow across OMS, fulfillment, and pickup flows, including backend logic, UI updates, label-generation fixes, and operational correctness.",
    impact: ["Cross-system feature delivery", "Backend + frontend coordination", "Production-oriented debugging"],
    links: []
  },
  {
    title: "OMS Integration Pipelines",
    category: "Enterprise Integrations",
    tech: ["Apache NiFi", "REST APIs", "SQL"],
    description:
      "Built and maintained integration pipelines and operational flows connecting external systems with core OMS workflows, including monitoring, debugging, and stability improvements.",
    impact: ["Integration ownership", "Production monitoring", "Root-cause analysis"],
    links: []
  },
  {
    title: "HouseSquare",
    category: "Full-Stack Project / Real Estate Marketplace",
    tech: ["React", "Firebase v9", "Google OAuth", "Firestore"],
    description:
      "Developed a full-stack real estate marketplace featuring interactive dashboards, authentication, and real-time listing management.",
    impact: ["Auth and dashboard workflows", "Realtime listing management", "Responsive marketplace UI"],
    links: [
      { label: "Live Demo", href: "https://house-square.vercel.app/" },
      { label: "GitHub Repo", href: "https://github.com/yash-verma5/HouseSquare" }
    ]
  },
  {
    title: "GreenMart",
    category: "Full-Stack E-Commerce Project",
    tech: ["Java", "Spring Boot", "React.js", "MySQL", "JWT", "REST APIs", "Maven"],
    description:
      "A full-stack e-commerce application with secure authentication, role-based access control, product-category handling, and a responsive storefront.",
    impact: ["Role-based access control", "Spring Boot API design", "Responsive storefront implementation"],
    links: [
      { label: "GitHub Repo", href: "#greenmart-repo-placeholder", placeholder: true },
      { label: "Live Demo", href: "#greenmart-live-placeholder", placeholder: true }
    ]
  },
  {
    title: "Technical Documentation & Engineering Notes",
    category: "Writing / Documentation",
    tech: ["Documentation", "Architecture Notes", "Debugging Writeups"],
    description:
      "A curated space for engineering notes, technical documentation, and implementation writeups covering backend systems, integrations, DevOps, and production learnings.",
    impact: ["Public technical notes", "Implementation writeups", "Backend and DevOps learning trail"],
    links: [
      { label: "Documentation Website", href: profile.links.docs },
      { label: "Hashnode Blog", href: profile.links.blog }
    ]
  }
];

export const writing = [
  {
    title: "Dynamic Docs",
    label: "Documentation Website",
    href: profile.links.docs,
    description:
      "A structured documentation space for backend, integration, DevOps, and implementation notes."
  },
  {
    title: "Engineering Blog",
    label: "Hashnode",
    href: profile.links.blog,
    description:
      "Technical writing on systems, implementation details, debugging, and developer workflows."
  },
  {
    title: "Practical Hands-on K8s Services",
    label: "Featured Read",
    href: profile.links.featuredArticle,
    description:
      "A practical writeup focused on Kubernetes services and hands-on infrastructure learning."
  }
];

export const education = [
  {
    title: "PG Diploma in Advanced Computing (PG-DAC)",
    institution: "Centre for Development of Advanced Computing (C-DAC), Pune",
    meta: "Score: 71.75%",
    completion: "Completed Feb 2025",
    featured: true
  },
  {
    title: "Bachelor's Degree in Computer Science / CSE",
    institution: "Jaypee University of Engineering and Technology",
    meta: "GPA: 7.8 / 10",
    completion: "",
    featured: false
  }
];
