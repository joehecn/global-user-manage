
import crypto from 'crypto'

import getRbacPgPoll from './getRbacPgPool.js'

import f from './f.js'
import { getQ } from './rbacQuery.js'

const FIELD_FILTER = 'id AS "globalId", icon, email, phone, country_code AS "countryCode", is_active AS "isActive", note, created_at AS "createdAt", nick_name AS "nickName"'

let _res = null

const init = (rbacPgPool, passwordSalt) => {
  if (_res) return _res

  const q = getQ(rbacPgPool)

  const _asyncPbkdf2 = password => {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, passwordSalt, 512, 64, 'sha1', (err, derivedKey) => {
        if (err) {
          reject(err)
        } else {
          resolve(derivedKey.toString('hex'))
        }
      })
    })
  }

  const _create = async values => {
    values[3] = await _asyncPbkdf2(values[3])

    const text = `INSERT INTO public.global_user(
      country_code, phone, email, password_hash, is_active, note, email_verified, nick_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${FIELD_FILTER}`

    const { rows } = await q({ name: 'global-user-create', text, values })

    return rows[0]
  }

  const _list = ({ where, select, sort, offset, limit }) => {
    const countText = f('global_user')
      .find(where)
      .count()
      .exec()

    const text = f('global_user')
      .find(where, select)
      .sort(sort)
      .offset(offset)
      .limit(limit)
      .exec()

    return { countText, text }
  }

  const list = async args => {
    const { countText, text } = _list(args)

    const count = await q({ text: countText })
    const { rows } = await q({ text })

    return { totalCount: count.rows[0].count, list: rows }
  }

  const get = async id => {
    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE id = $1`

    const { rows } = await q({ name: 'global-user-get', text, values: [id] })

    return rows[0]
  }

  const getActiveUserById = async id => {
    // console.log({ id })
    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE id = $1 AND is_active = true`

    const { rows } = await q({ name: 'global-user-get-active-user-by-id', text, values: [id] })

    return rows[0]
  }

  const getByIdAndPassword = async (id, password) => {
    const passwordHash = await _asyncPbkdf2(password)

    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE id = $1 AND password_hash = $2 AND is_active = true`

    const values = [id, passwordHash]
    const { rows } = await q({ name: 'global-user-getByIdAndPassword', text, values })

    return rows[0]
  }

  const getByPhoneOrEmail = async (countryCode, phone, email) => {
    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE email=$3 OR (country_code=$1 AND phone=$2)`

    const { rows } = await q({ name: 'global-user-getByPhoneOrEmail', text, values: [countryCode, phone, email] })

    return rows[0]
  }

  const getByPhoneOrEmailAndPassword = async (countryCode, phone, email, password) => {
    const passwordHash = await _asyncPbkdf2(password)

    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE (email=$3 OR (country_code=$1 AND phone=$2)) AND password_hash=$4 AND is_active=true`

    const values = [countryCode, phone, email, passwordHash]
    const { rows } = await q({ name: 'global-user-getByPhoneOrEmailAndPassword', text, values })

    return rows[0]
  }

  const getByPhone = async (countryCode, phone) => {
    // console.log({ countryCode, phone })
    const text = `SELECT ${FIELD_FILTER}
      FROM public.global_user
      WHERE country_code=$1 AND phone=$2`

    const values = [countryCode, phone]
    const { rows } = await q({ name: 'global-user-getByPhone', text, values })

    return rows[0]
  }

  const create = async ([
    countryCode,
    phone,
    email,
    password,
    isActive,
    note,
    emailVerified,
    nickName
  ]) => {
    let user = await getByPhoneOrEmailAndPassword(countryCode, phone, email, password)

    if (user) return user

    user = await _create([
      countryCode,
      phone,
      email,
      password,
      isActive,
      note,
      emailVerified,
      nickName
    ])

    return user
  }

  const update = async values => {
    const text = `UPDATE public.global_user
      SET country_code=$2, phone=$3, email=$4, is_active=$5, nick_name=$6
      WHERE id=$1
      RETURNING ${FIELD_FILTER}`

    const { rows } = await q({ name: 'global-user-update', text, values })
    return rows[0]
  }

  const updatePassword = async (id, password) => {
    const passwordHash = await _asyncPbkdf2(password)
    const values = [id, passwordHash]

    const text = `UPDATE public.global_user
      SET password_hash=$2
      WHERE id=$1`
    const { rows } = await q({ name: 'global-user-updatePassword', text, values })
    return rows[0]
  }

  _res = {
    list,
    get,
    getActiveUserById,
    getByIdAndPassword,
    getByPhoneOrEmail,
    getByPhoneOrEmailAndPassword,
    getByPhone,
    create,
    update,
    updatePassword
  }

  return _res
}

export default {
  getRbacPgPoll,
  init
}
