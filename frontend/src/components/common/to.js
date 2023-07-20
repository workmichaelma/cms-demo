import React from 'react'
import { basename } from 'config'

function To({ url, children, toNew, withoutDomain, className }) {
	const href = url ? `${withoutDomain ? '' : basename}${url}` : '#'
	const props = toNew
		? {
				target: '_blank',
				rel: 'noreferrer',
		  }
		: {}
	return (
		<a
			href={href}
			className={className}
			{...props}
		>
			{children}
		</a>
	)
}

export default To
