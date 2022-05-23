import path from 'path'

import initGlobalUserManage from './index.js'

it('initGlobalUserManage()', () => {
  const POSTGRESQL_RBAC_POOL = {
    host: 'localhost',
    port: 5432,
    user: 'me_open',
    password: 'me_open',
    database: 'me_open',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
  const PASSWORD_SALT = 'PASSWORD_SALT'
  const ROOT_PATH = process.cwd()
  const MODEL_PATH = path.resolve(ROOT_PATH, 'conf/rbac_with_domains_model.conf')

  const { rbac } = initGlobalUserManage(POSTGRESQL_RBAC_POOL, PASSWORD_SALT, MODEL_PATH)
  expect(rbac).not.toBe(null)
})