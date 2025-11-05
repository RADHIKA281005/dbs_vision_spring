import Dexie from 'dexie';

// 1. Create a new Dexie database
const db = new Dexie('VisionSpringDB');

// 2. Define the schema (the "tables")
// This schema MUST match the data you are saving from your form
db.version(1).stores({
  beneficiaries: '++id, &beneficiaryId, fullName, age, gender, location, registeredBy, isSynced',
  inventory: '++id, &itemCode, itemName, itemType, isSynced',
});

// 3. Export the database object
export default db;