
import { Enforcer } from 'casbin'

export default class BasicAuthorizer {
  ctx: any
  enforcer: Enforcer

  constructor (ctx: any, enforcer: Enforcer) {
    this.ctx = ctx
    this.enforcer = enforcer
  }

  // getUserName gets the user name from the request.
  // Currently, only HTTP basic authentication is supported
  getUserName () {
    // customize to get username from context
    const {user} = this.ctx
    const {username} = user
    return username
  }

  // checkPermission checks the user/method/path combination from the request.
  // Returns true (permission granted) or false (permission forbidden)
  async checkPermission () {
    const {ctx, enforcer} = this
    const {originalUrl: path, method} = ctx
    const user = this.getUserName()
    return await enforcer.enforce(user, path, method)
  }
}
