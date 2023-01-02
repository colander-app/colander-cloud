export const IOLogRejectedPromises = (
  operation: string,
  results: PromiseSettledResult<unknown>[]
) => {
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.log(
        `Promise member rejected for opertaion: ${operation} reason: ${result.reason}`
      )
    }
  })
}
