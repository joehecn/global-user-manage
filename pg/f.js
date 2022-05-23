
import util from 'util'
import format from 'pg-format'
import moment from 'moment'

function _getItem (key, value) {
  if (util.types.isRegExp(value)) {
    // node14 不兼容
    // return format('%I ~* %L', key, value.toString().replaceAll('/', ''))

    if (key.includes('->')) {
      // "schema->>'title'"
      return format(`${key} ~* %L`, value.toString().replace(/\//g, ''))
    } else {
      return format('%I ~* %L', key, value.toString().replace(/\//g, ''))
    }
  }

  if (typeof value === 'boolean') {
    return format(`${key} = %s`, value.toString())
  }

  if (typeof value === 'string') {
    if (key.includes('->')) {
      return format(`${key} = %L`, value)
    } else if (['path @>', 'path <@'].includes(key)) {
      return format(`${key} %L`, value)
    } else if (value.includes('IS NOT NULL') && key === value) {
      return value
    } else {
      return format('%I = %L', key, value)
    }
  }

  if (typeof value === 'object') {
    if (moment.isDate(value)) {
      return format(`${key} %L`, value)
    }

    if (value.$in) {
      // { $in: ['Send only', 'Report only'] }
      value = `ANY('{${value.$in.join(',')}}')`
    }
  }

  if (key.includes('->')) {
    return format(`${key} = %s`, value)
  }

  return format('%I = %s', key, value)
}

function _getOr (or) {
  const arr = or.map(obj => {
    const key = Object.keys(obj)[0]
    const value = obj[key]
    return _getItem(key, value)
  })

  return `(${arr.join(' OR ')})`
}

class F {
  constructor (tableName) {
    this.callCounted = false
    this.query = {
      SELECT: '*',
      FROM: `public.${tableName}`,
      WHERE: null,
      'ORDER BY': null,
      OFFSET: null,
      LIMIT: null
    }
  }

  find (where = {}, select = {}) {
    // 如果已经 count 过了
    if (this.callCounted) return this

    /* istanbul ignore else */
    if (where && typeof where === 'object') {
      const arr = []

      for (const key in where) {
        const value = where[key]
        if (key === '$or') {
          arr.push(_getOr(value))
        } else {
          arr.push(_getItem(key, value))
        }
      }

      /* istanbul ignore else */
      if (arr.length > 0) {
        this.query.WHERE = arr.join(' AND ')
      }
    }

    /* istanbul ignore else */
    if (select && typeof select === 'object') {
      const strArr = []
      const argArr = []

      for (const key in select) {
        const value = select[key]
        /* istanbul ignore else */
        if (value) {
          if (value === 1) {
            strArr.push('%I')
            argArr.push(key)
          } else {
            strArr.push('%s')
            argArr.push(format('%I AS %I', key, value))
          }
        }
      }

      /* istanbul ignore else */
      if (argArr.length > 0) {
        this.query.SELECT = format.withArray(strArr.join(', '), argArr)
      }
    }

    return this
  }

  count () {
    this.callCounted = true
    this.query.SELECT = 'count(*)::int'
    return this
  }

  sort (orderBy) {
    this.query['ORDER BY'] = 'id DESC'

    /* istanbul ignore else */
    if (orderBy && typeof orderBy === 'object') {
      const arr = []

      for (const key in orderBy) {
        if (key.includes('->')) {
          if (orderBy[key] === 1) {
            arr.push(key)
          } else {
            arr.push(`${key} DESC`)
          }
        } else {
          if (orderBy[key] === 1) {
            arr.push(format('%I', key))
          } else {
            arr.push(format('%I DESC', key))
          }
        }
      }

      /* istanbul ignore else */
      if (arr.length > 0) {
        this.query['ORDER BY'] = arr.join(', ')
      }
    }

    return this
  }

  offset (n = 0) {
    const intN = parseInt(n)

    /* istanbul ignore else */
    if (!isNaN(intN)) this.query.OFFSET = intN

    return this
  }

  limit (n = 10) {
    const intN = parseInt(n)

    /* istanbul ignore else */
    if (!isNaN(intN)) {
      this.query.LIMIT = intN
    }

    return this
  }

  exec () {
    const strArr = []
    const argArr = []

    ;['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'OFFSET', 'LIMIT'].forEach(key => {
      const value = this.query[key]

      // 忽略 OFFSET = 0, LIMIT = 0
      if (value) {
        strArr.push('%s', '%s')
        argArr.push(key, value)
      }
    })

    return format.withArray(strArr.join(' '), argArr)
  }
}

export default function f (tableName) {
  return new F(tableName)
}
