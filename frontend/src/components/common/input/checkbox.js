import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { capitalize, clone, isEmpty, pull } from 'lodash';

function InputCheckBox({ setInputs, name, value, schema, saveBtnClicked }) {
	const { checkbox } = schema;
	const [touched, setTouched] = useState(false);
	const [checkList, setCheckList] = useState(value);
	const ref = useRef();

	useEffect(() => {
		if (touched) {
			ref.current.touched = true;
		}
	}, [touched]);

	useEffect(() => {
		setInputs((v) => {
			return {
				...v,
				[name]: ref,
			};
		});
	}, [name, setInputs]);

	useEffect(() => {
		if (!touched) {
			ref.current.customValue = value;
		} else {
			ref.current.customValue = checkList;
		}
	}, [checkList, value, touched]);

	if (!schema) return null;
	return (
		<FormGroup ref={ref} size='small' name={name} value={checkList}>
			{checkbox.map((r) => (
				<FormControlLabel
					label={capitalize(r)}
					control={
						<Checkbox
							checked={checkList.includes(r)}
							onChange={(event) => {
								const checked = event.target.checked;
								setTouched(true);
								setCheckList((v) => {
									if (r === '*') {
										if (checked) {
											return ['*'];
										} else {
											const list = clone(checkbox);
											return pull(list, '*');
										}
									} else {
										if (checked) {
											return pull([...v, r], '*');
										} else {
											const arr = pull([...v], r);
											if (isEmpty(arr)) {
												return ['*'];
											}
											return arr;
										}
									}
								});
							}}
						/>
					}
				/>
			))}
		</FormGroup>
	);
}

export default InputCheckBox;
