
import {
  init as initRbac
} from './rbac/index.js'
import pg from './pg/index.js'
import authz from 'koa-authz'

const {
  getRbacPgPoll,
  init: initGlobalUser
} = pg

const initGlobalUserManage = (postgresqlRbacPool, passwordSalt, modelPath) => {
  const rbacPgPool = getRbacPgPoll(postgresqlRbacPool)

  const globalUserServices = initGlobalUser(rbacPgPool, passwordSalt)

  let rbac = null
  if (modelPath) rbac = initRbac(rbacPgPool, modelPath)

  return {
    globalUserServices,
    rbac,
    authz
  }
}

export default initGlobalUserManage

/**
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
