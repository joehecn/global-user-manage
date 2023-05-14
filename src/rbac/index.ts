import getEnforcer from './enforcer';
import MyAuthorizer from './classes/MyAuthorizer';
import { RbacManage } from '../types';

let _res: RbacManage | null = null;

export const init = (rbacPgPool: any, modelPath: string) => {
  if (_res) return _res;

  const enforcer = getEnforcer(rbacPgPool, modelPath);

  const authzArg = {
    newEnforcer: async () => {
      const e = await enforcer();
      return e;
    },

    authorizer: (ctx: any, e: any) => {
      return new MyAuthorizer(ctx, e);
    },
  };

  // 判断是否存在并添加一个角色
  const initOnePolicy = async (p: any) => {
    const e = await enforcer();

    // 是否存在角色
    // p: [sub_role_id, dom_id, obj, act]
    // https://casbin.org/docs/zh-CN/management-api#hasnamedpolicy
    // 确定是否存在命名策略授权规则
    const has = await e.hasNamedPolicy('p', ...p);

    if (!has) {
      // private 添加角色
      // p: [sub_role_id, dom_id, obj, act]
      // [ObjectId, ObjectId, '/app/devicelist', 'POST']
      // https://casbin.org/docs/zh-CN/management-api#addnamedpolicy
      // 向当前命名策略添加授权规则。
      // 如果规则已经存在，函数返回false，并且不会添加规则。
      // 否则，通过添加新规则函数返回 true。
      await e.addNamedPolicy('p', ...p);
    }
  };

  // 判断是否存在并添加一个用户
  const initOneGroup = async (g: any) => {
    const e = await enforcer();

    // https://casbin.org/docs/zh-CN/management-api#hasnamedgroupingpolicy
    // 确定是否存在命名角色继承规则
    const has = await e.hasNamedGroupingPolicy('g', ...g);

    if (!has) {
      // https://casbin.org/docs/zh-CN/management-api#addnamedgroupingpolicy
      // 将命名角色继承规则添加到当前策略。
      // 如果规则已经存在，函数返回false，并且不会添加规则。
      // 否则，函数通过添加新规则并返回true
      await e.addNamedGroupingPolicy('g', ...g);
    }
  };

  // 添加用户到角色
  // [sub_user_id, sub_role_id, dom_id]
  // [ObjectId, ObjectId, ObjectId]
  const addGroupingPolicy = async (g: any) => {
    const e = await enforcer();

    // https://casbin.org/docs/zh-CN/management-api#addnamedgroupingpolicy
    // 将命名角色继承规则添加到当前策略。
    // 如果规则已经存在，函数返回false，并且不会添加规则。
    // 否则，函数通过添加新规则并返回true
    const added = await e.addNamedGroupingPolicy('g', ...g);

    // Boolean
    return added;
  };

  // 从角色中删除用户
  // [sub_user_id, sub_role_id, dom_id]
  // [ObjectId, ObjectId, ObjectId]
  const removeGroupingPolicy = async (g: any) => {
    const e = await enforcer();

    const removed = await e.removeNamedGroupingPolicy('g', ...g);
    // console.log({ removed, g })
    // Boolean
    return removed;
  };

  // 设置角色所有权限
  const setRolePermissions = async (sub: string, dom: string, policys: any) => {
    const e = await enforcer();

    // 先删除该角色以前的所有权限
    // https://casbin.org/docs/zh-CN/management-api#removefilterednamedpolicy
    // 从当前命名策略中移除授权规则，可以指定字段筛选器。
    const removed = await e.removeFilteredNamedPolicy('p', 0, sub, dom);

    // 再添加权限
    // policys: [[obj, act]]
    const rules = policys.map((p: any) => [sub, dom, ...p]);

    // https://casbin.org/docs/zh-CN/management-api#addnamedpolicies
    // 向当前命名策略中添加授权规则。 该操作本质上是原子的
    const added = await e.addNamedPolicies('p', rules);

    return { removed, added };
  };

  // 获取角色的权限列表
  const getPermissionsForRole = async (sub: string, dom: string) => {
    const e = await enforcer();

    // 获取用户或角色的权限
    // https://casbin.org/docs/zh-CN/management-api#getfilterednamedpolicy
    const policies = await e.getFilteredNamedPolicy('p', 0, sub, dom);

    return policies;
  };

  _res = {
    authzArg,
    initOnePolicy,
    initOneGroup,
    addGroupingPolicy,
    removeGroupingPolicy,
    setRolePermissions,
    getPermissionsForRole,
  };

  return _res;
};
