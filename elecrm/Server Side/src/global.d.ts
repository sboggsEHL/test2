// Server Side/src/global.d.ts

import { Pool } from "pg";

declare global {
  // We can define each pool as optional or required
  var pool: Pool | undefined;
  var userManagementPool: Pool | undefined;
  var signalWirePool: Pool | undefined;

  // Also augment the NodeJS Global interface
  namespace NodeJS {
    interface Global {
      pool?: Pool;
      userManagementPool?: Pool;
      signalWirePool?: Pool;
    }
  }
}

// Required so this file is treated as a module
export {};




declare module 'logger' {
    const logger: any;
    export default logger;
  }