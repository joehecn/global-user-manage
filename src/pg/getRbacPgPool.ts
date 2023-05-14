import { Pool, PoolConfig } from 'pg';

let _rbacPgPool: Pool | null = null;

const handleClientError = (err: Error, postgresqlRbacPool: PoolConfig) => {
  console.log('----- GlobalUserManage: handleClientError', Date.now());
  console.error(err);
  _rbacPgPool = createPool(postgresqlRbacPool);
};

const createPool = (postgresqlRbacPool: PoolConfig) => {
  // console.log('----- GlobalUserManage: createPool:', Date.now());
  const rbacPgPool = new Pool(postgresqlRbacPool);

  rbacPgPool.on('connect', (client) => {
    client.on('error', (err) => {
      handleClientError(err, postgresqlRbacPool);
    });
  });

  rbacPgPool.on('error', (err) => {
    console.log('----- GlobalUserManage: rbacPgPool error', Date.now());
    console.error(err);
    throw err;
  });

  return rbacPgPool;
};

const checkPool = () => {
  if (!_rbacPgPool) return false;
  // console.log('----- GlobalUserManage: checkPool true', Date.now());
  // console.log({
  //   totalCount: _rbacPgPool.totalCount,
  //   idleCount: _rbacPgPool.idleCount,
  //   waitingCount: _rbacPgPool.waitingCount,
  // });

  return true;
};

const getRbacPgPoll = (postgresqlRbacPool: PoolConfig) => {
  if (!checkPool()) {
    _rbacPgPool = createPool(postgresqlRbacPool);
  }

  return _rbacPgPool;
};

export default getRbacPgPoll;
