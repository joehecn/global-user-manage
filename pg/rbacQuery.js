// import getRbacPgPool from './getRbacPgPool.js'

// export const q = async query => {
//   const client = await rbacPgPool.connect()
//   try {
//     const res = await client.query(query)
//     return res
//   } finally {
//     // Make sure to release the client before any error handling,
//     // just in case the error handling itself throws an error.
//     client.release()
//   }
// }
export const getQ = rbacPgPool => {
  // const q = async query => {
  //   // console.log({ rbacPgPool })
  //   const client = await rbacPgPool.connect()
  //   try {
  //     const res = await client.query(query)
  //     return res
  //   } catch (err) {
  //     console.log('------ q error:')
  //     console.error(err)
  //     throw err
  //   } finally {
  //     // Make sure to release the client before any error handling,
  //     // just in case the error handling itself throws an error.
  //     client.release()
  //   }
  // }

  const q = async query => {
    try {
      const res = await rbacPgPool.query(query)
      return res
    } catch (error) {
      console.log('------ q error:')
      console.error(err)
      throw err
    }
  }

  return q
}

// // transactions
// export const tq = async (func, ctx) => {
//   // note: we don't try/catch this because if connecting throws an exception
//   // we don't need to dispose of the client (it will be undefined)
//   const client = await rbacPgPool.connect()

//   try {
//     await client.query('BEGIN')

//     ctx.client = client
//     const res = await func(ctx)

//     await client.query('COMMIT')

//     return res
//   } catch (e) {
//     await client.query('ROLLBACK')
//     throw e
//   } finally {
//     client.release()
//   }
// }
// export const getTQ = async rbacPgPool => {
//   const tq = async (func, ctx) => {
//     // note: we don't try/catch this because if connecting throws an exception
//     // we don't need to dispose of the client (it will be undefined)
//     const client = await rbacPgPool.connect()

//     try {
//       await client.query('BEGIN')

//       ctx.client = client
//       const res = await func(ctx)

//       await client.query('COMMIT')

//       return res
//     } catch (e) {
//       await client.query('ROLLBACK')
//       throw e
//     } finally {
//       client.release()
//     }
//   }

//   return tq
// }
