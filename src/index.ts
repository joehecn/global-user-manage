import authz from './koa-authz/authz';

import { init as initRbac } from './rbac';

import pg from './pg';
const { getRbacPgPoll, init: initGlobalUser } = pg;

import { PoolConfig } from 'pg';

export function initGlobalUserManage(postgresqlRbacPool: PoolConfig, passwordSalt: string, modelPath: string) {
  const rbacPgPool = getRbacPgPoll(postgresqlRbacPool);

  const globalUserServices = initGlobalUser(rbacPgPool!, passwordSalt);

  let rbac = null;
  if (modelPath) rbac = initRbac(rbacPgPool, modelPath);

  return {
    globalUserServices,
    rbac,
    authz,
  };
}

export { GlobalUserManage, RbacManage } from './types';
export { PoolConfig } from 'pg';

/*
  globalUserServices = {
    list,
    get,
    getActiveUserById,
    getByIdAndPassword,
    getByPhoneOrEmail,
    getByPhoneOrEmailAndPassword,
    getByPhone,
    create,
    update,
    updatePassword
  }

  rbac = {
    authzArg,
    initOnePolicy,
    initOneGroup,
    addGroupingPolicy,
    removeGroupingPolicy,
    setRolePermissions,
    getPermissionsForRole
  }
*/
