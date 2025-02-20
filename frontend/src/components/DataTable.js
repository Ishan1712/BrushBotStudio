import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style.css"; // Importing styles

const DataTable = () => {
    const [data, setData] = useState([]);
    const [status, setStatus] = useState(0); // New state for status
    const [editingRow, setEditingRow] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState("");

    useEffect(() => {
        fetchData();
        fetchStatus();

        // Poll status every 5 seconds
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/brushfiles");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchStatus = async () => {
        try {
            const response = await axios.get("http://localhost:5000/status");
            setStatus(response.data.status); // Update status state
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };

    const handleEdit = (id, field, value) => {
        setEditingRow(id);
        setEditingField(field);
        setTempValue(value);
    };

    const handleChange = (e) => {
        setTempValue(e.target.value);
    };

    const handleKeyDown = async (e, id, field) => {
        if (e.key === "Enter") {
            try {
                const updatedItem = data.find((item) => item.id === id);
                const newData = { ...updatedItem, [field]: tempValue };

                // Update backend
                await axios.put(`http://localhost:5000/brushfiles/${id}`, newData);

                // Update UI
                setData((prevData) =>
                    prevData.map((item) =>
                        item.id === id ? { ...item, [field]: tempValue } : item
                    )
                );

                // Exit edit mode
                setEditingRow(null);
                setEditingField(null);
            } catch (error) {
                console.error("Error updating data:", error);
            }
        }
    };

    return (
        <div className="container">
            <h2 className="title">BrushFile Editor - Model #3, Color #4</h2>

            {/* Status Indicator */}
            <div className="status-indicator">
                <span>Communication Status: </span>
                <div className={`indicator ${status === 1 ? "green" : "red"}`}></div>
            </div>

            {/* Scrollable Table */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Atom</th>
                            <th>Fluid</th>
                            <th>Shape</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.level}</td>

                                {/* Editable Cells */}
                                {["atom", "fluid", "shape", "description"].map((field) => (
                                    <td
                                        key={field}
                                        onClick={() => handleEdit(item.id, field, item[field])}
                                    >
                                        {editingRow === item.id && editingField === field ? (
                                            <input
                                                type={field === "description" ? "text" : "number"}
                                                value={tempValue}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, field)}
                                                autoFocus
                                            />
                                        ) : (
                                            item[field]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
