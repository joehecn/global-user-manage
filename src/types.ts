export type GlobalUserManage = {
  list: (args: any) => Promise<any>;
  get: (id: string) => Promise<any>;
  getActiveUserById: (id: string) => Promise<any>;
  getByIdAndPassword: (id: string, password: string) => Promise<any>;
  getByPhoneOrEmail: (countryCode: string, phone: string, email: string) => Promise<any>;
  getByPhoneOrEmailAndPassword: (countryCode: string, phone: string, email: string, password: string) => Promise<any>;
  getByPhone: (countryCode: string, phone: string) => Promise<any>;
  create: (values: any[]) => Promise<any>;
  update: (values: any[]) => Promise<any>;
  update2: ({ set, where, returning }: any) => Promise<any>;
  updatePassword: (id: string, password: string) => Promise<any>;
};

export type Options = {
  newEnforcer: () => Promise<any>;
  authorizer: (ctx: any, e: any) => any;
};

export type RbacManage = {
  authzArg: Options;
  initOnePolicy: (p: any) => Promise<void>;
  initOneGroup: (g: any) => Promise<void>;
  addGroupingPolicy: (g: any) => Promise<boolean>;
  removeGroupingPolicy: (g: any) => Promise<boolean>;
  setRolePermissions: (sub: string, dom: string, policys: any) => Promise<any>;
  getPermissionsForRole: (sub: string, dom: string) => Promise<any>;
};
