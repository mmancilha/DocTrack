import {
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type Version,
  type InsertVersion,
  type Comment,
  type InsertComment,
  type AuditLog,
  type InsertAuditLog,
  type SearchQuery,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  searchDocuments(query: SearchQuery): Promise<Document[]>;

  getVersions(documentId: string): Promise<Version[]>;
  getVersion(id: string): Promise<Version | undefined>;
  createVersion(version: InsertVersion): Promise<Version>;

  getComments(documentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;

  getAuditLogs(documentId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, Document>;
  private versions: Map<string, Version>;
  private comments: Map<string, Comment>;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.versions = new Map();
    this.comments = new Map();
    this.auditLogs = new Map();

    this.seedData();
  }

  private seedData() {
    const adminUser: User = {
      id: "user-1",
      username: "Admin User",
      password: "admin123",
      role: "admin",
      avatarUrl: null,
    };
    this.users.set(adminUser.id, adminUser);

    const sampleDocs: InsertDocument[] = [
      {
        title: "Getting Started Guide",
        content: "<h1>Welcome to DocTrack</h1><p>This guide will help you get started with our document management system.</p><h2>Key Features</h2><ul><li>Rich text editing</li><li>Version control</li><li>PDF export</li><li>Global search</li></ul><p>Start by creating your first document using the <strong>New Document</strong> button in the sidebar.</p>",
        category: "guide",
        status: "published",
        authorId: adminUser.id,
        authorName: adminUser.username,
      },
      {
        title: "System Administration Manual",
        content: "<h1>System Administration Manual</h1><p>This comprehensive manual covers all aspects of system administration.</p><h2>Table of Contents</h2><ol><li>User Management</li><li>Security Configuration</li><li>Backup Procedures</li><li>Troubleshooting</li></ol><h2>User Management</h2><p>Learn how to create, modify, and delete user accounts in the system.</p>",
        category: "manual",
        status: "published",
        authorId: adminUser.id,
        authorName: adminUser.username,
      },
      {
        title: "Daily Operations Checklist",
        content: "<h1>Daily Operations Checklist</h1><p>Complete the following tasks each day to ensure smooth operations.</p><h2>Morning Tasks</h2><ul><li>Check system status</li><li>Review overnight logs</li><li>Verify backups completed</li></ul><h2>Evening Tasks</h2><ul><li>Generate daily report</li><li>Update documentation</li><li>Schedule maintenance</li></ul>",
        category: "checklist",
        status: "draft",
        authorId: adminUser.id,
        authorName: adminUser.username,
      },
    ];

    for (const doc of sampleDocs) {
      const id = randomUUID();
      const now = new Date();
      const document: Document = {
        id,
        ...doc,
        createdAt: now,
        updatedAt: now,
      };
      this.documents.set(id, document);

      const versionId = randomUUID();
      const version: Version = {
        id: versionId,
        documentId: id,
        versionNumber: "1.0",
        content: doc.content,
        authorId: doc.authorId,
        authorName: doc.authorName,
        createdAt: now,
        changeDescription: "Initial version",
      };
      this.versions.set(versionId, version);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, avatarUrl: insertUser.avatarUrl || null };
    this.users.set(id, user);
    return user;
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = {
      id,
      ...insertDoc,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);

    const versionId = randomUUID();
    const version: Version = {
      id: versionId,
      documentId: id,
      versionNumber: "1.0",
      content: insertDoc.content,
      authorId: insertDoc.authorId,
      authorName: insertDoc.authorName,
      createdAt: now,
      changeDescription: "Initial version",
    };
    this.versions.set(versionId, version);

    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updatedDoc: Document = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDoc);

    if (updates.content && updates.content !== existing.content) {
      const existingVersions = Array.from(this.versions.values())
        .filter((v) => v.documentId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const lastVersion = existingVersions[0];
      const [major, minor] = (lastVersion?.versionNumber || "1.0").split(".").map(Number);
      const newVersionNumber = `${major}.${minor + 1}`;

      const versionId = randomUUID();
      const version: Version = {
        id: versionId,
        documentId: id,
        versionNumber: newVersionNumber,
        content: updates.content,
        authorId: updates.authorId || existing.authorId,
        authorName: updates.authorName || existing.authorName,
        createdAt: new Date(),
        changeDescription: null,
      };
      this.versions.set(versionId, version);
    }

    return updatedDoc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id);
    if (deleted) {
      for (const [versionId, version] of this.versions) {
        if (version.documentId === id) {
          this.versions.delete(versionId);
        }
      }
      for (const [commentId, comment] of this.comments) {
        if (comment.documentId === id) {
          this.comments.delete(commentId);
        }
      }
    }
    return deleted;
  }

  async searchDocuments(query: SearchQuery): Promise<Document[]> {
    let docs = Array.from(this.documents.values());

    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm) ||
          doc.authorName.toLowerCase().includes(searchTerm)
      );
    }

    if (query.category && query.category !== "all") {
      docs = docs.filter((doc) => doc.category === query.category);
    }

    if (query.status && query.status !== "all") {
      docs = docs.filter((doc) => doc.status === query.status);
    }

    if (query.authorId) {
      docs = docs.filter((doc) => doc.authorId === query.authorId);
    }

    return docs.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getVersions(documentId: string): Promise<Version[]> {
    return Array.from(this.versions.values())
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getVersion(id: string): Promise<Version | undefined> {
    return this.versions.get(id);
  }

  async createVersion(insertVersion: InsertVersion): Promise<Version> {
    const id = randomUUID();
    const version: Version = {
      id,
      ...insertVersion,
      createdAt: new Date(),
    };
    this.versions.set(id, version);
    return version;
  }

  async getComments(documentId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.documentId === documentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      id,
      ...insertComment,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getAuditLogs(documentId?: string): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());

    if (documentId) {
      logs = logs.filter((log) => log.documentId === documentId);
    }

    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      id,
      ...insertLog,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }
}

export const storage = new MemStorage();
