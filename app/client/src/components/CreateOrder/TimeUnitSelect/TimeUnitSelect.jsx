import React, { Component } from "react";
import { FormControl } from "react-bootstrap";

const TIME_UNITS = [
    {
        label: "Hour",
        value: "hours",
    },
    {
        label: "Day",
        value: "days",
    },
    {
        label: "Week",
        value: "weeks",
    },
    {
        label: "Month",
        value: "months",
    },
    {
        label: "Year",
        value: "years",
    },
];

class TimeUnitSelect extends Component {
    render() {
        const { name, onChange, defaultValue } = this.props;

        return (
            <FormControl
                name={name}
                onChange={onChange}
                componentClass="select"
                placeholder="select"
                defaultValue={defaultValue}>
                {TIME_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                        {unit.label}
                    </option>
                ))}
            </FormControl>
        );
    }
}

export default TimeUnitSelect;
