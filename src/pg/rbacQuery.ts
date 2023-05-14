import { Pool } from 'pg';

export const getQ = (rbacPgPool: Pool) => {
  const q = async (query: any) => {
    try {
      const res = await rbacPgPool.query(query);
      return res;
    } catch (err) {
      console.log('------ q error:');
      console.error(err);
      throw err;
    }
  };

  return q;
};
