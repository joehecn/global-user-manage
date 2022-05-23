
// npm test test/pg/f.test.js

import f from './f.js'

it('f()', () => {
  expect(f('i18n').exec()).toBe('SELECT * FROM public.i18n')
})

it('f().find()', () => {
  expect(f('i18n').find().exec()).toBe('SELECT * FROM public.i18n')
  expect(f('i18n').find({}).exec()).toBe('SELECT * FROM public.i18n')
  expect(f('i18n').find({}, {}).exec()).toBe('SELECT * FROM public.i18n')
  expect(f('i18n').find(null).exec()).toBe('SELECT * FROM public.i18n')
  expect(f('i18n').find(null, null).exec()).toBe('SELECT * FROM public.i18n')
  expect(f('i18n').find({ id: 21 }).exec()).toBe('SELECT * FROM public.i18n WHERE id = 21')
  expect(f('i18n').find({ id: 21 }, {}).exec()).toBe('SELECT * FROM public.i18n WHERE id = 21')
  expect(f('i18n').find({ key: 'update' }).exec()).toBe("SELECT * FROM public.i18n WHERE key = 'update'")
  expect(f('i18n').find({ key: /LAN/ }).exec()).toBe("SELECT * FROM public.i18n WHERE key ~* 'LAN'")
  expect(f('i18n').find({ key: /LAN/ }).exec()).toBe("SELECT * FROM public.i18n WHERE key ~* 'LAN'")

  expect(f('i18n').find({
    $or: [{ key: /LAN/ }, { 'zh-cn': /登/ }]
  }).exec()).toBe('SELECT * FROM public.i18n WHERE (key ~* \'LAN\' OR "zh-cn" ~* \'登\')')

  expect(f('i18n').find({ id: 21, key: 'update' }).exec()).toBe("SELECT * FROM public.i18n WHERE id = 21 AND key = 'update'")
  expect(f('i18n').find({ id: 21 }, { id: 1, 'zh-cn': 'zhCn' }).exec()).toBe('SELECT id, "zh-cn" AS "zhCn" FROM public.i18n WHERE id = 21')
  expect(f('i18n').find({}, { id: 1, 'zh-cn': 1 }).exec()).toBe('SELECT id, "zh-cn" FROM public.i18n')
})

it('jsonb.find()', () => {
  expect(f('json_schema').find({ "schema->>'title'": /switch/ }).exec()).toBe("SELECT * FROM public.json_schema WHERE schema->>'title' ~* 'switch'")
  expect(f('json_schema').find({
    $or: [{ "schema->>'title'": /switch/ }]
  }).exec()).toBe("SELECT * FROM public.json_schema WHERE (schema->>'title' ~* 'switch')")
  expect(f('json_schema').find({
    $or: [{ "schema->>'title'": /switch/ }, { schema_type: 'instruction_profile' }]
  }).exec()).toBe("SELECT * FROM public.json_schema WHERE (schema->>'title' ~* 'switch' OR schema_type = 'instruction_profile')")

  expect(f('json_schema').find({ schema_type: 'instruction_profile', "schema->>'title'": /switch/ }).exec()).toBe("SELECT * FROM public.json_schema WHERE schema_type = 'instruction_profile' AND schema->>'title' ~* 'switch'")
  expect(f('json_schema').find({
    schema_type: 'instruction_profile',
    $or: [{ "schema->>'title'": /switch/ }]
  }).exec()).toBe("SELECT * FROM public.json_schema WHERE schema_type = 'instruction_profile' AND (schema->>'title' ~* 'switch')")
  expect(f('json_schema').find({
    schema_type: 'instruction_profile',
    $or: [{ "schema->>'title'": /switch/ }, { "schema->>'description'": /1/ }]
  }).exec()).toBe("SELECT * FROM public.json_schema WHERE schema_type = 'instruction_profile' AND (schema->>'title' ~* 'switch' OR schema->>'description' ~* '1')")
  expect(f('json_schema').find({
    schema_type: 'instruction_profile',
    $or: [{ "schema->>'title'": /switch/ }, { "schema->>'type'": 'string' }]
  }).exec()).toBe("SELECT * FROM public.json_schema WHERE schema_type = 'instruction_profile' AND (schema->>'title' ~* 'switch' OR schema->>'type' = 'string')")
})

it('f().count()', () => {
  expect(f('i18n').count().exec()).toBe('SELECT count(*)::int FROM public.i18n')
  // 忽略 count 后 find
  expect(f('i18n').count().find({}, {}).exec()).toBe('SELECT count(*)::int FROM public.i18n')
})
it('f().sort()', () => {
  // default id ASC
  expect(f('i18n').sort().exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC')
  expect(f('i18n').sort(null).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC')
  expect(f('i18n').sort({}).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC')
  expect(f('i18n').sort({ id: 1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY id')
  expect(f('i18n').sort({ id: -1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC')
  expect(f('i18n').sort({ id: 1, key: -1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY id, key DESC')
  expect(f('i18n').sort({ id: -1, key: -1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC, key DESC')
  expect(f('i18n').sort({ id: -1, key: 1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC, key')
  expect(f('i18n').sort({ 'zh-cn': 1 }).exec()).toBe('SELECT * FROM public.i18n ORDER BY "zh-cn"')
})

it('jsonb.sort()', () => {
  expect(f('json_schema').sort({ "schema->>'title'": 1 }).exec()).toBe("SELECT * FROM public.json_schema ORDER BY schema->>'title'")
  expect(f('json_schema').sort({ "schema->>'title'": -1 }).exec()).toBe("SELECT * FROM public.json_schema ORDER BY schema->>'title' DESC")
})

it('f().sort().offset()', () => {
  expect(f('i18n').sort().offset().exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC')
  expect(f('i18n').sort().offset(10).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC OFFSET 10')
})

it('f().sort().offset().limit()', () => {
  expect(f('i18n').sort().offset().limit().exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC LIMIT 10')
  expect(f('i18n').sort().offset(20).limit(20).exec()).toBe('SELECT * FROM public.i18n ORDER BY id DESC OFFSET 20 LIMIT 20')
})

// it.only('$in', () => {
//   const where = {
//     schema_type: 'instruction',
//     data_transmission_type: { $in: 'Send only,Report only'.split(',') }
//   }
//   const select = { schema: 1 }

//   expect(
//     f('json_schema')
//       .find(where, select)
//       .exec()
//     ).toBe("SELECT schema FROM public.json_schema WHERE schema_type = 'instruction' AND data_transmission_type = ANY('{Send only,Report only}')")
// })
it.only('$in', () => {
  const where = {
    key: 'home',
    id: { $in: [3, 4] }
  }
  const select = { key: 1 }

  expect(
    f('i18n')
      .find(where, select)
      .exec()
  ).toBe("SELECT key FROM public.i18n WHERE key = 'home' AND id = ANY('{3,4}')")
})

it('false', () => {
  const where = {
    is_admin: false
  }
  expect(
    f('user')
      .find(where)
      .exec()
  ).toBe('SELECT * FROM public.user WHERE is_admin = false')
})
