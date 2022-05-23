
// import { POSTGRESQL_RBAC_POOL } from '../config/index.js'
import pkgPG from 'pg'

const { Pool } = pkgPG

let _rbacPgPool = null
const getRbacPgPoll = postgresqlRbacPool => {
  if (!_rbacPgPool) {
    const rbacPgPool = new Pool(postgresqlRbacPool)

    rbacPgPool.on('error', err => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })

    _rbacPgPool = rbacPgPool
  }

  return _rbacPgPool
}

export default getRbacPgPoll
