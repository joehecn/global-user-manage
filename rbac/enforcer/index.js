// import path from 'path'
import { newEnforcer } from 'casbin'
import { BasicAdapter } from 'casbin-basic-adapter'

// import getRbacPgPool from '../../pg/getRbacPgPool.js'
// import {
//   ROOT_PATH
// } from '../../config/index.js'

const getEnforcer = (rbacPgPool, modelPath) => {
  /** 单例模式 */
  let _enforcer = null

  const enforcer = async () => {
    if (_enforcer) return _enforcer

    // 从文件加载casbin模型
    // const modelPath = path.resolve(ROOT_PATH, 'src/rbac/conf/rbac_with_domains_model.conf')

    // 从数据库加载casbin政策
    const adapter = await BasicAdapter.newAdapter('pg', rbacPgPool)

    _enforcer = await newEnforcer(modelPath, adapter)

    return _enforcer
  }

  return enforcer
}

export default getEnforcer
