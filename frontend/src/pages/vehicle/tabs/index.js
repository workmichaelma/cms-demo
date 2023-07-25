import General from './general'

function Tabs({ tab, ...props }) {
  if (tab === 'general') return <General {...props} />
}

export default Tabs
