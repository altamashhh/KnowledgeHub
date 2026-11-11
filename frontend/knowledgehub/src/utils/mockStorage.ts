import { KnowledgeItem, User } from '../types';

export const INITIAL_SEED_ITEMS: KnowledgeItem[] = [
  {
    id: '1',
    title: 'React Server Components: A Paradigm Shift',
    url: 'https://react.dev/reference/rsc/server-components',
    content: `React Server Components (RSC) represent a fundamental shift in how we build React applications. By default, components now render on the server, sending zero JavaScript to the client unless explicitly required.

The Zero-Bundle-Size Principle
Historically, React applications required downloading the entire component bundle to the client before rendering could begin. RSC changes this equation entirely.

\`\`\`javascript
import db from './database';

export default async function NoteList() {
  const notes = await db.notes.getAll();
  return (
    <ul>
      {notes.map(note => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

Because this component is asynchronous and runs exclusively on the server, the database query happens close to the data source, and the resulting HTML is streamed to the client.`,
    type: 'DOCUMENTATION',
    status: 'LEARNING',
    difficulty: 'INTERMEDIATE',
    rating: 5,
    topic: 'React Ecosystem',
    topicId: 'react',
    tags: ['frontend', 'performance', 'hooks'],
    progress: 65,
    createdAt: '2023-10-12T14:20:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
  {
    id: '2',
    title: 'Advanced Design Patterns in Distributed Systems',
    url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/',
    content: `A deep exploration of distributed consensus, split-brain mitigation, and leader election protocols such as Raft and Paxos. Essential principles for microservice scalability.`,
    type: 'ARTICLE',
    status: 'LEARNING',
    difficulty: 'ADVANCED',
    rating: 4,
    topic: 'Architecture',
    topicId: 'arch',
    tags: ['architecture', 'distributed-systems', 'scalability'],
    progress: 40,
    createdAt: '2023-11-04T10:15:00Z',
    updatedAt: '2024-02-01T16:45:00Z',
  },
  {
    id: '3',
    title: 'Tailwind CSS Customization Guide',
    url: 'https://tailwindcss.com/docs/configuration',
    content: `A comprehensive overview of customizing Tailwind CSS v3 & v4 via configuration files, design tokens, color extensions, and utility layer plugins.`,
    type: 'DOCUMENTATION',
    status: 'INBOX',
    difficulty: 'BEGINNER',
    rating: 4,
    topic: 'CSS',
    topicId: 'css',
    tags: ['frontend', 'css', 'design-systems'],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Understanding Micro-Frontends Architecture',
    url: 'https://micro-frontends.org/',
    content: `Notes on decoupling large monolithic frontend applications into smaller, independently deliverable, testable frontend web applications.`,
    type: 'NOTE',
    status: 'INBOX',
    difficulty: 'INTERMEDIATE',
    rating: 3,
    topic: 'Architecture',
    topicId: 'arch',
    tags: ['architecture', 'micro-frontends', 'frontend'],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Rust for JavaScript Developers',
    url: 'https://www.youtube.com/watch?v=rust-js',
    content: `Excellent crash course translating common JS patterns (Promises, closures, generic types) into Rust ownership, borrowing, lifetimes, and traits.`,
    type: 'VIDEO',
    status: 'COMPLETED',
    difficulty: 'INTERMEDIATE',
    rating: 5,
    topic: 'Rust',
    topicId: 'rust',
    tags: ['rust', 'backend', 'systems'],
    createdAt: '2024-03-12T11:00:00Z',
    updatedAt: '2024-03-12T11:00:00Z',
  },
  {
    id: '6',
    title: 'V8 Engine Deep Dive: Hidden Classes & Inline Caching',
    url: 'https://v8.dev/blog/fast-properties',
    content: `Detailed blog post explaining how V8 optimizes JavaScript property access using hidden classes (shapes) and polymorphic inline caches.`,
    type: 'WEBSITE',
    status: 'COMPLETED',
    difficulty: 'ADVANCED',
    rating: 5,
    topic: 'Performance',
    topicId: 'perf',
    tags: ['performance', 'javascript', 'v8', 'compiler'],
    createdAt: '2024-03-10T08:30:00Z',
    updatedAt: '2024-03-10T08:30:00Z',
  },
  {
    id: '7',
    title: 'GraphQL Data Dataloader Pattern',
    url: 'https://github.com/graphql/dataloader',
    content: `Implementation details for solving the N+1 query problem in GraphQL APIs using the Dataloader batching and memoization caching utility.`,
    type: 'NOTE',
    status: 'INBOX',
    difficulty: 'INTERMEDIATE',
    rating: 4,
    topic: 'Backend',
    topicId: 'backend',
    tags: ['backend', 'graphql', 'databases'],
    createdAt: '2024-03-05T14:10:00Z',
    updatedAt: '2024-03-05T14:10:00Z',
  },
  {
    id: '8',
    title: 'Ideas for new caching layer',
    content: `Explore using Redis cluster + local in-memory L1 cache with cache-aside pattern to reduce database load by 80%. Consider stampede protection via mutex locks.`,
    type: 'NOTE',
    status: 'INBOX',
    difficulty: 'BEGINNER',
    rating: null,
    topic: 'Architecture',
    topicId: 'arch',
    tags: ['architecture', 'caching', 'redis'],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: '9',
    title: 'Google Spanner Whitepaper',
    url: 'https://research.google/pubs/spanner-googles-globally-distributed-database/',
    content: `Deep dive into TrueTime API, GPS and Atomic Clocks synchronization, and externally consistent distributed transactions at global scale.`,
    type: 'DOCUMENTATION',
    status: 'LEARNING',
    difficulty: 'ADVANCED',
    rating: 5,
    topic: 'Databases',
    topicId: 'databases',
    tags: ['databases', 'distributed-systems', 'google-cloud'],
    progress: 25,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'Awesome Java Libraries GitHub Repo',
    url: 'https://github.com/akullpp/awesome-java',
    content: `A curated list of awesome frameworks, libraries and software for Java and Spring Boot ecosystem.`,
    type: 'WEBSITE',
    status: 'INBOX',
    difficulty: 'BEGINNER',
    rating: 4,
    topic: 'Java',
    topicId: 'java',
    tags: ['java', 'spring-boot', 'libraries'],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  }
];

const LOCAL_STORAGE_KEY = 'kh_local_items_v1';

export function getLocalItems(): KnowledgeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ITEMS));
      return INITIAL_SEED_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEED_ITEMS;
  }
}

export function saveLocalItems(items: KnowledgeItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}
