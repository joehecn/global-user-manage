
import { Enforcer } from 'casbin'
import BasicAuthorizer from './BasicAuthorizer'

import { Options } from '../types'

export default function authz (options: Options) {
  return async (ctx: any, next: any) => {
    try {
      const {newEnforcer, authorizer} = options
      const enforcer = await newEnforcer()
      if (!(enforcer instanceof Enforcer)) {
        throw new Error('Invalid enforcer')
      }
      const authzorizer = authorizer ? authorizer(ctx, enforcer) : new BasicAuthorizer(ctx, enforcer)
      if (!(authzorizer instanceof BasicAuthorizer)) {
        throw new Error('Please extends BasicAuthorizer class')
      }
      if (!await authzorizer.checkPermission()) {
        ctx.status = 403
        return
      }
      await next()
    } catch (e) {
      throw e
    }
  }
}
