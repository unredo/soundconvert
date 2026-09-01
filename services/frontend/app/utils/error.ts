function getErrorMsg(e: unknown) {
  return e instanceof Error ? e.message : ''
}

export { getErrorMsg }
