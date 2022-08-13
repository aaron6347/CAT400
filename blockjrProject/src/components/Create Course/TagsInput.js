import React from 'react';
import {TextField, Chip} from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function TagsInput(props) {
  	return (
		<div>
			<Autocomplete
				style={{width: "40em",}}
				value={props.tags}
				multiple
				id="multiple-limit-tags"
				options={[]}
				freeSolo
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip variant={"outlined"} label={option} {...getTagProps({ index })}
							disabled={false} size={"small"}/>
					))
				}
				renderInput={(params) => (
					<TextField {...params} variant={"standard"} label="Tags" required
						placeholder={(props.tags.length==3)?"Maxed":"Insert Tag"} disabled={props.tags.length==3}
						inputProps={{ ...params.inputProps, maxLength: 20}}/>
				)}
				autoSelect={true}
				onChange={props.setTags}
				disabled={props.tags.length==3}
			/>
		</div>
 	)
}