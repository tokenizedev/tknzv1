import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
// Use non-codegen validator to satisfy strict CSP (no unsafe-eval)
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';

// Register development plugin
addRxPlugin(RxDBDevModePlugin);

// Document interfaces
export interface TokenDocument {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  decimals: number;
  [prop: string]: any;
}

export interface MetaDocument {
  key: string;
  value: string;
}

export interface Collections {
  verifiedTokens: TokenDocument;
  meta: MetaDocument;
}

// JSON schemas
const tokenSchema = {
  title: 'verified tokens schema',
  version: 0,
  description: 'stores global verified tokens from Jupiter',
  type: 'object',
  primaryKey: 'address',
    properties: {
    // Solana base58 addresses are 44 chars long
    address: { type: 'string', maxLength: 44 },
    symbol: { type: 'string' },
    name: { type: 'string' },
    logoURI: { type: 'string', maxLength: 2048, optional: true },
    decimals: { type: 'number' },
  },
  required: ['address', 'symbol', 'name', 'decimals'],
  additionalProperties: true,
};

const metaSchema = {
  title: 'meta schema',
  version: 0,
  description: 'key-value metadata store',
  type: 'object',
  primaryKey: 'key',
  properties: {
    // Meta keys should have a reasonable max length
    key: { type: 'string', maxLength: 200 },
    value: { type: 'string' },
  },
  required: ['key', 'value'],
  additionalProperties: false,
};

let dbPromise: Promise<RxDatabase<Collections>> | null = null;

/**
 * Returns a singleton RxDB instance for token storage.
 */
export function getTokenDb(): Promise<RxDatabase<Collections>> {
  if (!dbPromise) {
    // Wrap storage with Z-Schema validation (avoids runtime codegen / eval)
    const storage = wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() });
    // Create database and add collections, then return the DB instance
    dbPromise = createRxDatabase<Collections>({
      name: 'tokenize_db',
      storage,
      instanceCreationOptions: {}
    })
      .then(db => {
        console.log('[tokenDb] Database created:', db.name);
        return db.addCollections({
          verifiedTokens: { schema: tokenSchema },
          meta: { schema: metaSchema }
        }).then(() => {
          console.log('[tokenDb] Collections added');
          return db;
        });
      });
  }
  return dbPromise;
}