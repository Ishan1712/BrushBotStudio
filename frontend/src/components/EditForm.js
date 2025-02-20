import React, { useState } from "react";
import Modal from "react-modal";
import "../style.css"; // Importing styles

Modal.setAppElement("#root"); // Required for accessibility

const EditForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...item });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);

        // ✅ Show success alert when saved
        alert("✅ Details saved successfully!");

        // ✅ Close the form when user clicks "OK" on alert
        onCancel();
    };

    return (
        <>
            {/* ✅ Edit Form Modal */}
            <Modal
                isOpen={true}
                onRequestClose={onCancel}
                className="modal"
                overlayClassName="overlay"
                shouldCloseOnOverlayClick={false}
            >
                <h3 className="modal-title">Edit Row</h3>
                <form onSubmit={handleSubmit} className="modal-form">
                    <label>Atom:</label>
                    <input type="number" name="atom" value={formData.atom} onChange={handleChange} required />

                    <label>Fluid:</label>
                    <input type="number" name="fluid" value={formData.fluid} onChange={handleChange} required />

                    <label>Shape:</label>
                    <input type="number" name="shape" value={formData.shape} onChange={handleChange} required />

                    <label>Description:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} required />

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default EditForm;
