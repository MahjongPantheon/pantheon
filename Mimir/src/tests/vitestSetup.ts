import { Utils } from '@mikro-orm/core';

// Route entity discovery through Vitest so dynamic TypeScript imports are transformed.
Utils.setDynamicImportProvider((id) => import(id));
