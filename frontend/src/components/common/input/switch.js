import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Switch } from '@mui/material';

function InputSwitch({ name, value, setInputs, saveBtnClicked }) {
	const [isOn, setIsOn] = useState(value || false);
	const ref = useRef();

	useEffect(() => {
		setInputs((v) => {
			return {
				...v,
				[name]: ref,
			};
		});
	}, [name, setInputs]);

	return (
		<Switch
			inputRef={ref}
			checked={isOn}
			onChange={(e) => {
				const on = e.target.checked;
				setIsOn(on);
			}}
		/>
	);
}

export default InputSwitch;
