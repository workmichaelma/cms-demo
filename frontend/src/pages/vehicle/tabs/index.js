import { useInputStore } from 'hooks/use-input-store'
import General from './general'

function Tabs({ tab, ...props }) {
  const store = useInputStore({ ...props })
  if (tab === 'general')
    return (
      <General
        {...props}
        store={store}
      />
    )
}

export default Tabs
