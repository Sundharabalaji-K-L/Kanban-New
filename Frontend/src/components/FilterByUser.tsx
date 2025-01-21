import React, { ChangeEvent } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@material-ui/core";
import User from "../models/User";

interface Props {
    filterUsers: User[];
    selectedFilterUser: string | null;
    onFilterChange: (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => void;
}

const FilterByUser = ({
                          filterUsers,
                          selectedFilterUser,
                          onFilterChange,
                      }: Props) => {

    const displayedFilterValue = () => {
        if (selectedFilterUser === null) {
            return "All";
        }
        const selectedUser = filterUsers.find(user => user._id === selectedFilterUser);
        return selectedUser ? selectedUser.name : "All";
    };

    return (
        <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel id="filter-user-label">Filter by Owner</InputLabel>
            <Select
                labelId="filter-user-label"
                id="filter-user-select"
                value={selectedFilterUser === null ? "" : selectedFilterUser }
                onChange={onFilterChange}
                label="Filter by Owner"
                renderValue={()=> displayedFilterValue()}
            >
                <MenuItem value="All">
                    <em>All</em>
                </MenuItem>
                {filterUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                        {user.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default FilterByUser;