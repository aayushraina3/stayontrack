import { Injectable, Inject } from "@nestjs/common";
import { Firestore } from "firebase-admin/firestore";

@Injectable()
export class FirebaseService {
  private readonly db: Firestore;

  constructor(
    @Inject("FIREBASE_FIRESTORE")
    firestore: unknown,
  ) {
    this.db = firestore as Firestore;
  }

  getCollection(name: string) {
    return this.db.collection(name);
  }

  async create<T = Record<string, any>>(
    collection: string,
    data: T,
    id?: string,
  ): Promise<T & { id: string; createdAt: Date; updatedAt: Date }> {
    const ref = id
      ? this.db.collection(collection).doc(id)
      : this.db.collection(collection).doc();

    const now = new Date();
    const createdAt = now;
    const updatedAt = now;

    const docData = {
      ...data,
      createdAt,
      updatedAt,
    };

    await ref.set(docData);

    return { id: ref.id, ...docData };
  }

  async findById<T = Record<string, any>>(
    collection: string,
    id: string,
  ): Promise<(T & { id: string }) | null> {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as T) };
  }

  async findMany<T = Record<string, any>>(
    collection: string,
    filters?: Record<string, any>,
  ): Promise<(T & { id: string })[]> {
    let query = this.db.collection(collection) as any;

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        query = query.where(field, "==", value);
      });
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as T),
    }));
  }

  async update<T = Record<string, any>>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<{ id: string; updatedAt: Date }> {
    const ref = this.db.collection(collection).doc(id);
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    await ref.update(updateData);
    return { id, updatedAt: updateData.updatedAt };
  }

  async delete(collection: string, id: string): Promise<{ deleted: boolean }> {
    await this.db.collection(collection).doc(id).delete();
    return { deleted: true };
  }

  async query<T = Record<string, any>>(
    collection: string,
    queryFn: (ref: any) => any,
  ): Promise<(T & { id: string })[]> {
    const ref = this.db.collection(collection);
    const query = queryFn(ref);
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as T),
    }));
  }
}
