export const basename = '/admin'

export const redirect = ({ url, toNew }) => {
  const path = `${basename}${url}`
  if (!toNew) {
    window.location.href = path
  } else {
    window.open(path, '_blank')
  }
}
