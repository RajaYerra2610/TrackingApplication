import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Settings
  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        userName: 'Developer',
        startDate: new Date().toISOString().split('T')[0],
        goalHoursPerDay: 6,
        targetDays: 90,
      },
    });
    console.log('✅ Settings created');
  }

  // Seed UserXP
  const existingXP = await prisma.userXP.findFirst();
  if (!existingXP) {
    await prisma.userXP.create({ data: {} });
    console.log('✅ UserXP created');
  }

  // Seed Achievements
  const achievements = [
    { name: 'First Steps', description: 'Earn your first 10 XP', icon: 'footprints', xpReward: 10, category: 'milestone' },
    { name: 'Centurion', description: 'Earn 100 XP', icon: 'award', xpReward: 20, category: 'milestone' },
    { name: 'XP Hunter', description: 'Earn 500 XP', icon: 'target', xpReward: 50, category: 'milestone' },
    { name: 'XP Master', description: 'Earn 1000 XP', icon: 'crown', xpReward: 100, category: 'milestone' },
    { name: 'Level 5', description: 'Reach level 5', icon: 'star', xpReward: 25, category: 'milestone' },
    { name: 'Level 10', description: 'Reach level 10', icon: 'zap', xpReward: 50, category: 'milestone' },
    { name: 'First Problem', description: 'Solve your first DSA problem', icon: 'code', xpReward: 10, category: 'dsa' },
    { name: 'Ten Down', description: 'Solve 10 DSA problems', icon: 'code-2', xpReward: 20, category: 'dsa' },
    { name: 'Fifty Club', description: 'Solve 50 DSA problems', icon: 'terminal', xpReward: 50, category: 'dsa' },
    { name: 'Century Coder', description: 'Solve 100 DSA problems', icon: 'trophy', xpReward: 100, category: 'dsa' },
    { name: 'Hard Crusher', description: 'Solve 10 hard problems', icon: 'flame', xpReward: 50, category: 'dsa' },
    { name: 'Week Warrior', description: '7 day study streak', icon: 'calendar', xpReward: 30, category: 'streak' },
    { name: 'Two Week Titan', description: '14 day study streak', icon: 'calendar-check', xpReward: 50, category: 'streak' },
    { name: 'Month Master', description: '30 day study streak', icon: 'calendar-heart', xpReward: 100, category: 'streak' },
    { name: 'Consistency King', description: '60 day study streak', icon: 'shield', xpReward: 200, category: 'streak' },
    { name: 'Marathon Runner', description: '90 day study streak', icon: 'medal', xpReward: 500, category: 'streak' },
    { name: 'Night Owl', description: 'Study for 8+ hours in a day', icon: 'moon', xpReward: 20, category: 'study' },
    { name: 'Early Bird', description: 'Log study before 7 AM', icon: 'sunrise', xpReward: 15, category: 'study' },
    { name: '100 Hours', description: 'Total 100 study hours', icon: 'clock', xpReward: 50, category: 'study' },
    { name: '500 Hours', description: 'Total 500 study hours', icon: 'hourglass', xpReward: 200, category: 'study' },
    { name: 'Interview Ready', description: 'Mark 50 concepts as interview ready', icon: 'check-circle', xpReward: 100, category: 'general' },
    { name: 'Resume Pro', description: 'Create 3 resume versions', icon: 'file-text', xpReward: 20, category: 'general' },
    { name: 'Job Hunter', description: 'Apply to 10 companies', icon: 'briefcase', xpReward: 30, category: 'general' },
    { name: 'Mock Master', description: 'Complete 5 mock interviews', icon: 'mic', xpReward: 40, category: 'general' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { userId_name: { userId: 'default', name: a.name } },
      update: {},
      create: a,
    });
  }
  console.log(`✅ ${achievements.length} achievements seeded`);

  // Seed Roadmap Data
  const roadmapData: { roadmap: string; section: string; topic: string; estimatedHours: number; order: number }[] = [];

  // JavaScript Roadmap
  const jsTopics = [
    { section: 'Fundamentals', topics: ['Variables & Data Types', 'Operators & Expressions', 'Control Flow (if/else, switch)', 'Loops (for, while, do-while)', 'Functions & Scope', 'Hoisting', 'Closures', 'Template Literals'] },
    { section: 'Advanced Concepts', topics: ['Prototypes & Inheritance', 'this keyword', 'call, apply, bind', 'Event Loop & Concurrency', 'Promises', 'async/await', 'Generators', 'Proxy & Reflect'] },
    { section: 'ES6+ Features', topics: ['Arrow Functions', 'Destructuring', 'Spread/Rest Operator', 'Map, Set, WeakMap, WeakSet', 'Symbols', 'Iterators', 'Modules (import/export)', 'Optional Chaining & Nullish Coalescing'] },
    { section: 'DOM & Browser', topics: ['DOM Manipulation', 'Event Handling', 'Event Delegation', 'Local Storage & Session Storage', 'Fetch API', 'Web Workers', 'Service Workers', 'WebSockets'] },
    { section: 'Design Patterns', topics: ['Module Pattern', 'Observer Pattern', 'Singleton Pattern', 'Factory Pattern', 'Pub/Sub Pattern', 'Decorator Pattern', 'Strategy Pattern', 'MVC/MVVM'] },
  ];
  let order = 0;
  jsTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'javascript', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // React Roadmap
  order = 0;
  const reactTopics = [
    { section: 'Core Concepts', topics: ['JSX & Rendering', 'Components (Functional & Class)', 'Props & State', 'Event Handling', 'Conditional Rendering', 'Lists & Keys', 'Forms & Controlled Components'] },
    { section: 'Hooks', topics: ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback', 'useRef', 'Custom Hooks'] },
    { section: 'State Management', topics: ['Context API', 'Redux Toolkit', 'Zustand', 'React Query / TanStack Query', 'Jotai / Recoil'] },
    { section: 'Routing & Navigation', topics: ['React Router v6', 'Nested Routes', 'Protected Routes', 'Lazy Loading Routes', 'URL Parameters & Query Strings'] },
    { section: 'Advanced Patterns', topics: ['Higher-Order Components', 'Render Props', 'Compound Components', 'Error Boundaries', 'React.memo & Performance', 'Suspense & Concurrent Mode', 'Server Components'] },
    { section: 'Testing', topics: ['Jest & React Testing Library', 'Component Testing', 'Integration Testing', 'Mocking API Calls', 'Snapshot Testing'] },
  ];
  reactTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'react', section: s.section, topic: t, estimatedHours: 2, order: order++ });
  }));

  // Node.js Roadmap
  order = 0;
  const nodeTopics = [
    { section: 'Core', topics: ['Node.js Architecture', 'Modules (CommonJS & ES)', 'File System (fs)', 'Path Module', 'Events & EventEmitter', 'Streams & Buffers', 'Process & Child Processes', 'Cluster Module'] },
    { section: 'Express.js', topics: ['Routing', 'Middleware', 'Error Handling', 'Template Engines', 'Static Files', 'CORS', 'Rate Limiting', 'File Upload (Multer)'] },
    { section: 'Database', topics: ['MongoDB & Mongoose', 'PostgreSQL & Prisma', 'SQLite', 'Redis', 'Database Design', 'Migrations', 'Indexing & Optimization'] },
    { section: 'Authentication', topics: ['JWT', 'OAuth 2.0', 'Passport.js', 'Session Management', 'Password Hashing (bcrypt)', 'Role-Based Access Control'] },
    { section: 'Advanced', topics: ['WebSocket (Socket.io)', 'GraphQL', 'Microservices', 'Message Queues (RabbitMQ)', 'Caching Strategies', 'Logging (Winston)', 'PM2 & Deployment'] },
  ];
  nodeTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'node', section: s.section, topic: t, estimatedHours: 2, order: order++ });
  }));

  // SQL Roadmap
  order = 0;
  const sqlTopics = [
    { section: 'Basics', topics: ['SELECT, FROM, WHERE', 'INSERT, UPDATE, DELETE', 'ORDER BY, LIMIT, OFFSET', 'DISTINCT & Aliases', 'Aggregate Functions (COUNT, SUM, AVG, MAX, MIN)', 'GROUP BY & HAVING', 'NULL handling'] },
    { section: 'Joins & Subqueries', topics: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'Self Join', 'Subqueries', 'Correlated Subqueries', 'EXISTS & IN'] },
    { section: 'Advanced', topics: ['Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', 'LEAD, LAG', 'CTEs (WITH clause)', 'Recursive CTEs', 'CASE Expressions', 'UNION & INTERSECT', 'Pivoting Data', 'Views & Materialized Views'] },
    { section: 'Database Design', topics: ['Normalization (1NF, 2NF, 3NF, BCNF)', 'ER Diagrams', 'Primary & Foreign Keys', 'Indexes (B-Tree, Hash)', 'Transactions & ACID', 'Stored Procedures', 'Triggers', 'Query Optimization'] },
  ];
  sqlTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'sql', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // Python Roadmap
  order = 0;
  const pythonTopics = [
    { section: 'Basics', topics: ['Variables & Data Types', 'Control Flow', 'Functions', 'List Comprehensions', 'Dictionaries & Sets', 'String Manipulation', 'File I/O', 'Exception Handling'] },
    { section: 'OOP', topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstract Classes', 'Magic Methods', 'Decorators', 'Generators'] },
    { section: 'Advanced', topics: ['Itertools', 'Collections Module', 'Context Managers', 'Multithreading & Multiprocessing', 'Asyncio', 'Type Hints', 'Virtual Environments', 'Package Management (pip)'] },
  ];
  pythonTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'python', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // Docker Roadmap
  order = 0;
  const dockerTopics = [
    { section: 'Fundamentals', topics: ['What is Docker?', 'Docker Architecture', 'Images vs Containers', 'Dockerfile', 'Docker Build', 'Docker Run', 'Docker Compose', 'Environment Variables'] },
    { section: 'Advanced', topics: ['Multi-stage Builds', 'Volumes & Bind Mounts', 'Networking', 'Docker Registry', 'Health Checks', 'Logging', 'Resource Limits', 'Docker Secrets'] },
    { section: 'Orchestration', topics: ['Docker Swarm', 'Kubernetes Basics', 'Pods & Deployments', 'Services & Ingress', 'ConfigMaps & Secrets', 'Helm Charts'] },
  ];
  dockerTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'docker', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // FastAPI Roadmap
  order = 0;
  const fastapiTopics = [
    { section: 'Core', topics: ['Introduction & Setup', 'Path Parameters', 'Query Parameters', 'Request Body (Pydantic)', 'Response Models', 'Status Codes', 'Form Data & File Upload'] },
    { section: 'Advanced', topics: ['Dependency Injection', 'Middleware', 'Background Tasks', 'WebSockets', 'CORS', 'Authentication (OAuth2)', 'Database Integration (SQLAlchemy)', 'Testing with pytest'] },
  ];
  fastapiTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'fastapi', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // Next.js Roadmap
  order = 0;
  const nextTopics = [
    { section: 'Fundamentals', topics: ['App Router', 'Pages & Layouts', 'Server Components', 'Client Components', 'Routing & Navigation', 'Loading & Error States', 'Metadata & SEO'] },
    { section: 'Data Fetching', topics: ['Server-Side Rendering (SSR)', 'Static Site Generation (SSG)', 'Incremental Static Regeneration (ISR)', 'API Routes', 'Server Actions', 'Caching Strategies'] },
    { section: 'Advanced', topics: ['Middleware', 'Authentication', 'Internationalization', 'Image Optimization', 'Font Optimization', 'Deployment (Vercel)', 'Edge Runtime'] },
  ];
  nextTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'nextjs', section: s.section, topic: t, estimatedHours: 2, order: order++ });
  }));

  // CI/CD Roadmap
  order = 0;
  const cicdTopics = [
    { section: 'Version Control', topics: ['Git Fundamentals', 'Branching Strategies', 'Git Flow', 'Trunk-Based Development', 'Pull Requests & Code Review', 'Git Hooks'] },
    { section: 'CI/CD Pipelines', topics: ['GitHub Actions', 'Jenkins', 'CircleCI', 'GitLab CI', 'Build Automation', 'Automated Testing', 'Code Quality (SonarQube)', 'Deployment Strategies (Blue/Green, Canary)'] },
    { section: 'Infrastructure', topics: ['AWS Basics (EC2, S3, Lambda)', 'Terraform', 'Nginx', 'SSL/TLS', 'Monitoring (Prometheus, Grafana)', 'Log Management'] },
  ];
  cicdTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'cicd', section: s.section, topic: t, estimatedHours: 1.5, order: order++ });
  }));

  // LLD Roadmap
  order = 0;
  const lldTopics = [
    { section: 'SOLID Principles', topics: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion'] },
    { section: 'Design Patterns', topics: ['Creational: Singleton', 'Creational: Factory', 'Creational: Abstract Factory', 'Creational: Builder', 'Creational: Prototype', 'Structural: Adapter', 'Structural: Decorator', 'Structural: Facade', 'Structural: Proxy', 'Behavioral: Observer', 'Behavioral: Strategy', 'Behavioral: Command', 'Behavioral: State', 'Behavioral: Iterator', 'Behavioral: Template Method'] },
    { section: 'LLD Problems', topics: ['Parking Lot', 'Elevator System', 'Library Management', 'Hotel Booking', 'Tic-Tac-Toe', 'Snake & Ladder', 'Chess', 'ATM Machine', 'Vending Machine', 'Online Shopping Cart'] },
  ];
  lldTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'lld', section: s.section, topic: t, estimatedHours: 2, order: order++ });
  }));

  // HLD Roadmap
  order = 0;
  const hldTopics = [
    { section: 'Fundamentals', topics: ['Scalability (Vertical vs Horizontal)', 'Load Balancing', 'Caching (Redis, Memcached)', 'CDN', 'Database Sharding', 'Replication', 'Consistent Hashing', 'CAP Theorem'] },
    { section: 'Components', topics: ['Message Queues (Kafka, RabbitMQ)', 'API Gateway', 'Service Discovery', 'Rate Limiting', 'Circuit Breaker', 'Event-Driven Architecture', 'CQRS', 'Saga Pattern'] },
    { section: 'HLD Problems', topics: ['Design URL Shortener', 'Design Twitter/X', 'Design Instagram', 'Design WhatsApp', 'Design Netflix', 'Design Uber', 'Design YouTube', 'Design Google Drive', 'Design Payment System', 'Design Notification System'] },
  ];
  hldTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'hld', section: s.section, topic: t, estimatedHours: 3, order: order++ });
  }));

  // System Design Roadmap
  order = 0;
  const sdTopics = [
    { section: 'Core Concepts', topics: ['Requirements Gathering', 'Capacity Estimation', 'API Design', 'Database Schema Design', 'High-Level Architecture', 'Deep Dive Components', 'Trade-offs Discussion', 'Bottlenecks & Optimization'] },
    { section: 'Storage', topics: ['SQL vs NoSQL', 'Object Storage (S3)', 'File Systems', 'Data Warehousing', 'Time-Series Databases', 'Graph Databases', 'Search Engines (Elasticsearch)'] },
    { section: 'Communication', topics: ['REST vs GraphQL vs gRPC', 'WebSocket vs SSE vs Long Polling', 'Pub/Sub Systems', 'Event Sourcing', 'Webhooks', 'Protocol Buffers'] },
  ];
  sdTopics.forEach(s => s.topics.forEach(t => {
    roadmapData.push({ roadmap: 'system-design', section: s.section, topic: t, estimatedHours: 2.5, order: order++ });
  }));

  // Insert all roadmap items
  const existingRoadmaps = await prisma.roadmapItem.count();
  if (existingRoadmaps === 0) {
    await prisma.roadmapItem.createMany({ data: roadmapData });
    console.log(`✅ ${roadmapData.length} roadmap items seeded across 12 roadmaps`);
  } else {
    console.log(`⏭️  Roadmaps already seeded (${existingRoadmaps} items)`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
