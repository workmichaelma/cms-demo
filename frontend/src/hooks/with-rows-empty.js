import { isEmpty } from 'lodash'

export default function withRowsEmpty(Component) {
  return (props) => {
    if (isEmpty(props.rows)) {
      return null
    }
    return <Component {...props} />
  }
}
