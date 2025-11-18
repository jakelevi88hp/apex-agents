/**
 * Pieces Drive - Material Management System
 * 
 * Intelligent and enriched material management that ensures your most
 * important code, notes, and other useful materials are always at hand.
 * 
 * Features:
 * - Save code, notes, links, documents, snippets
 * - Organize into collections
 * - Shareable links (no account required for recipients)
 * - View, edit, re-use materials
 */

import { db } from '@/lib/db';
import { piecesDriveMaterials, piecesDriveCollections } from '@/lib/db/schema/pieces-features';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export interface DriveMaterial {
  id?: string;
  userId: string;
  materialType: 'code' | 'note' | 'link' | 'document' | 'snippet';
  title: string;
  content?: string;
  url?: string;
  language?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  shareableLink?: string;
  isPublic?: boolean;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DriveCollection {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  materialIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class PiecesDrive {
  /**
   * Save material to drive
   */
  async saveMaterial(material: DriveMaterial): Promise<string> {
    // Generate shareable link if not provided
    const shareableLink = material.shareableLink || this.generateShareableLink();

    const result = await db.insert(piecesDriveMaterials).values({
      userId: material.userId,
      materialType: material.materialType,
      title: material.title,
      content: material.content,
      url: material.url,
      language: material.language,
      tags: material.tags,
      metadata: material.metadata,
      shareableLink,
      isPublic: material.isPublic || false,
      viewCount: 0,
    }).returning({ id: piecesDriveMaterials.id });

    return result[0].id;
  }

  /**
   * Get material by ID
   */
  async getMaterial(materialId: string, userId?: string): Promise<DriveMaterial | null> {
    const conditions = [eq(piecesDriveMaterials.id, materialId)];

    // If userId provided, ensure user owns it or it's public
    if (userId) {
      conditions.push(
        or(
          eq(piecesDriveMaterials.userId, userId),
          eq(piecesDriveMaterials.isPublic, true)
        )
      );
    } else {
      // If no userId, only public materials
      conditions.push(eq(piecesDriveMaterials.isPublic, true));
    }

    const materials = await db
      .select()
      .from(piecesDriveMaterials)
      .where(and(...conditions))
      .limit(1);

    if (materials.length === 0) return null;

    const material = materials[0];

    // Increment view count
    await db
      .update(piecesDriveMaterials)
      .set({
        viewCount: sql`${piecesDriveMaterials.viewCount} + 1`,
        lastAccessed: new Date(),
      })
      .where(eq(piecesDriveMaterials.id, materialId));

    return material as DriveMaterial;
  }

  /**
   * Get material by shareable link
   */
  async getMaterialByLink(shareableLink: string): Promise<DriveMaterial | null> {
    const materials = await db
      .select()
      .from(piecesDriveMaterials)
      .where(eq(piecesDriveMaterials.shareableLink, shareableLink))
      .limit(1);

    if (materials.length === 0) return null;

    const material = materials[0];

    // Increment view count
    await db
      .update(piecesDriveMaterials)
      .set({
        viewCount: sql`${piecesDriveMaterials.viewCount} + 1`,
        lastAccessed: new Date(),
      })
      .where(eq(piecesDriveMaterials.shareableLink, shareableLink));

    return material as DriveMaterial;
  }

  /**
   * Get all materials for a user
   */
  async getUserMaterials(
    userId: string,
    materialType?: DriveMaterial['materialType'],
    limit: number = 50
  ): Promise<DriveMaterial[]> {
    const conditions = [eq(piecesDriveMaterials.userId, userId)];

    if (materialType) {
      conditions.push(eq(piecesDriveMaterials.materialType, materialType));
    }

    const materials = await db
      .select()
      .from(piecesDriveMaterials)
      .where(and(...conditions))
      .orderBy(desc(piecesDriveMaterials.createdAt))
      .limit(limit);

    return materials as DriveMaterial[];
  }

  /**
   * Search materials
   */
  async searchMaterials(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<DriveMaterial[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    const materials = await db
      .select()
      .from(piecesDriveMaterials)
      .where(
        and(
          eq(piecesDriveMaterials.userId, userId),
          or(
            like(sql`LOWER(${piecesDriveMaterials.title})`, searchTerm),
            like(sql`LOWER(${piecesDriveMaterials.content})`, searchTerm),
            sql`EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(${piecesDriveMaterials.tags}) tag
              WHERE LOWER(tag) LIKE ${searchTerm}
            )`
          )
        )
      )
      .orderBy(desc(piecesDriveMaterials.createdAt))
      .limit(limit);

    return materials as DriveMaterial[];
  }

  /**
   * Update material
   */
  async updateMaterial(
    materialId: string,
    userId: string,
    updates: Partial<DriveMaterial>
  ): Promise<void> {
    // Verify ownership
    const material = await this.getMaterial(materialId, userId);
    if (!material || material.userId !== userId) {
      throw new Error('Material not found or access denied');
    }

    await db
      .update(piecesDriveMaterials)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(piecesDriveMaterials.id, materialId));
  }

  /**
   * Delete material
   */
  async deleteMaterial(materialId: string, userId: string): Promise<void> {
    // Verify ownership
    const material = await this.getMaterial(materialId, userId);
    if (!material || material.userId !== userId) {
      throw new Error('Material not found or access denied');
    }

    await db
      .delete(piecesDriveMaterials)
      .where(eq(piecesDriveMaterials.id, materialId));
  }

  /**
   * Create collection
   */
  async createCollection(collection: DriveCollection): Promise<string> {
    const result = await db.insert(piecesDriveCollections).values({
      userId: collection.userId,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      icon: collection.icon,
      materialIds: collection.materialIds || [],
    }).returning({ id: piecesDriveCollections.id });

    return result[0].id;
  }

  /**
   * Get user collections
   */
  async getUserCollections(userId: string): Promise<DriveCollection[]> {
    const collections = await db
      .select()
      .from(piecesDriveCollections)
      .where(eq(piecesDriveCollections.userId, userId))
      .orderBy(desc(piecesDriveCollections.createdAt));

    return collections as DriveCollection[];
  }

  /**
   * Add material to collection
   */
  async addMaterialToCollection(
    collectionId: string,
    materialId: string,
    userId: string
  ): Promise<void> {
    // Verify collection ownership
    const collections = await db
      .select()
      .from(piecesDriveCollections)
      .where(
        and(
          eq(piecesDriveCollections.id, collectionId),
          eq(piecesDriveCollections.userId, userId)
        )
      )
      .limit(1);

    if (collections.length === 0) {
      throw new Error('Collection not found or access denied');
    }

    const collection = collections[0];
    const materialIds = (collection.materialIds as string[]) || [];

    if (!materialIds.includes(materialId)) {
      materialIds.push(materialId);
      await db
        .update(piecesDriveCollections)
        .set({
          materialIds,
          updatedAt: new Date(),
        })
        .where(eq(piecesDriveCollections.id, collectionId));
    }
  }

  /**
   * Generate unique shareable link
   */
  private generateShareableLink(): string {
    // Generate a random 16-character base64url string
    const bytes = randomBytes(12);
    return bytes.toString('base64url').substring(0, 16);
  }
}

// Export singleton instance
export const piecesDrive = new PiecesDrive();
