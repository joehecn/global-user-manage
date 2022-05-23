import BasicAuthorizer from 'koa-authz/BasicAuthorizer.js'

class MyAuthorizer extends BasicAuthorizer {
  // override function
  async checkPermission () {
    const { ctx, enforcer } = this
    const { url, method: act } = ctx
    const { role, dom } = ctx.state.auth

    const obj = url.split('?')[0]
    // console.log({ role, dom, obj, act })

    try {
      const isAllow = await enforcer.enforce(role.sub, dom, obj, act)
      return isAllow
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

export default MyAuthorizer
