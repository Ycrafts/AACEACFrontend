// src/pages/System1/EmployeeListPage.jsx
import React, { useState, useEffect } from 'react';
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployeeRoles,
    getAllOrganizationalUnits,
    getOrganizationalUnits
} from '../../api';

// Add the ParentSelectionModal component
const ParentSelectionModal = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    organizationalUnits, 
    loading, 
    error,
    currentPage,
    totalPages,
    onPageChange,
    searchTerm,
    onSearchChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Select Organizational Unit</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search organizational units..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-4">
                        <p>Loading organizational units...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-red-500 text-center py-4">
                        <p>{error}</p>
                    </div>
                )}

                {/* Organizational Units List */}
                {!loading && !error && (
                    <div className="space-y-2">
                        {organizationalUnits.map(unit => (
                            <div
                                key={unit.id}
                                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                                onClick={() => onSelect(unit)}
                            >
                                <div className="font-medium">{unit.name}</div>
                                <div className="text-sm text-gray-500">
                                    Division: {unit.division_name}
                                    {unit.parent_name && ` | Parent: ${unit.parent_name}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

function EmployeeListPage() {
    // --- State Management ---
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        fname: '',
        mname: '',
        lname: '',
        phone_no: '',
        organizationalunit: '',
        role: ''
    });

    // Dropdown data state
    const [organizationalUnits, setOrganizationalUnits] = useState([]);
    const [employeeRoles, setEmployeeRoles] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    // Organizational Unit Selection Modal state
    const [showOrgUnitModal, setShowOrgUnitModal] = useState(false);
    const [orgUnitSearchTerm, setOrgUnitSearchTerm] = useState('');
    const [orgUnitCurrentPage, setOrgUnitCurrentPage] = useState(1);
    const [orgUnitPageSize] = useState(10);
    const [orgUnitTotalPages, setOrgUnitTotalPages] = useState(1);
    const [orgUnits, setOrgUnits] = useState([]);
    const [loadingOrgUnits, setLoadingOrgUnits] = useState(false);

    // --- Data Fetching ---
    const fetchEmployees = async (page, size, search) => {
        setLoading(true);
        try {
            const response = await getEmployees(page, size, search);
            setEmployees(response.data.results);
            setTotalCount(response.data.count);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        setLoadingDropdowns(true);
        try {
            const [orgUnitsRes, rolesRes] = await Promise.all([
                getAllOrganizationalUnits(),
                getAllEmployeeRoles()
            ]);
            // Roles come as a direct array
            setEmployeeRoles(rolesRes.data || []);
            // Initialize org units for the modal
            setOrganizationalUnits(orgUnitsRes.data?.results || []);
            setOrgUnitTotalPages(Math.ceil(orgUnitsRes.data?.count / orgUnitPageSize || 0));
        } catch (err) {
            console.error("Error fetching dropdown data:", err);
            setError("Failed to load form data");
            setEmployeeRoles([]);
            setOrganizationalUnits([]);
        } finally {
            setLoadingDropdowns(false);
        }
    };

    const fetchOrgUnits = async (page, search) => {
        setLoadingOrgUnits(true);
        try {
            const response = await getOrganizationalUnits(page, orgUnitPageSize, search);
            setOrgUnits(response.data.results);
            setOrgUnitTotalPages(Math.ceil(response.data.count / orgUnitPageSize));
        } catch (err) {
            console.error("Error fetching organizational units:", err);
            setError("Failed to fetch organizational units");
        } finally {
            setLoadingOrgUnits(false);
        }
    };

    // --- Effects ---
    useEffect(() => {
        fetchEmployees(currentPage, pageSize, debouncedSearchTerm);
    }, [currentPage, pageSize, debouncedSearchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (showOrgUnitModal) {
            fetchOrgUnits(orgUnitCurrentPage, orgUnitSearchTerm);
        }
    }, [showOrgUnitModal, orgUnitCurrentPage, orgUnitSearchTerm]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'role') {
            const selectedRole = employeeRoles.find(r => r.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                [name]: value,
                role_name: selectedRole ? selectedRole.role : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleOrgUnitSelect = (unit) => {
        setFormData(prev => ({
            ...prev,
            organizationalunit: unit.id,
            organizationalunit_name: unit.name
        }));
        setShowOrgUnitModal(false);
    };

    const handleCreateClick = () => {
        setShowCreateForm(true);
        setFormData({
            fname: '',
            mname: '',
            lname: '',
            phone_no: '',
            organizationalunit: '',
            role: ''
        });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create a clean form data object with only the required fields
            const cleanFormData = {
                fname: formData.fname,
                mname: formData.mname,
                lname: formData.lname,
                phone_no: formData.phone_no,
                organizationalunit: parseInt(formData.organizationalunit), // Just the ID
                role: formData.role ? parseInt(formData.role) : null // Role is optional
            };
            console.log('Submitting form data:', cleanFormData);
            await createEmployee(cleanFormData);
            setShowCreateForm(false);
            fetchEmployees(currentPage, pageSize, debouncedSearchTerm);
        } catch (err) {
            console.error("Error creating employee:", err);
            setError("Failed to create employee");
        }
    };

    const handleEditClick = (employee) => {
        setShowEditForm(true);
        setCurrentEditItem(employee);
        setFormData({
            fname: employee.fname,
            mname: employee.mname,
            lname: employee.lname,
            phone_no: employee.phone_no,
            organizationalunit: employee.organizationalunit,
            role: employee.role
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create a clean form data object with only the required fields
            const cleanFormData = {
                fname: formData.fname,
                mname: formData.mname,
                lname: formData.lname,
                phone_no: formData.phone_no,
                organizationalunit: parseInt(formData.organizationalunit), // Just the ID
                role: formData.role ? parseInt(formData.role) : null // Role is optional
            };
            console.log('Submitting form data:', cleanFormData);
            await updateEmployee(currentEditItem.id, cleanFormData);
            setShowEditForm(false);
            setCurrentEditItem(null);
            fetchEmployees(currentPage, pageSize, debouncedSearchTerm);
        } catch (err) {
            console.error("Error updating employee:", err);
            setError("Failed to update employee");
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(id);
                fetchEmployees(currentPage, pageSize, debouncedSearchTerm);
            } catch (err) {
                console.error("Error deleting employee:", err);
                setError("Failed to delete employee");
            }
        }
    };

    // --- Render ---
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Employees</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Create New Button */}
            {!showCreateForm && !showEditForm && (
                <button
                    onClick={handleCreateClick}
                    className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
                >
                    Add New Employee
                </button>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-4 p-6 border rounded-md bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4">Add New Employee</h3>
                    {loadingDropdowns ? (
                        <p>Loading form data...</p>
                    ) : (
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                <input
                                    type="text"
                                    name="mname"
                                    value={formData.mname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_no"
                                    value={formData.phone_no}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Organizational Unit</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.organizationalunit ? 
                                            (orgUnits.find(u => u.id === parseInt(formData.organizationalunit))?.name || '') 
                                            : ''}
                                        readOnly
                                        className="w-full px-3 py-2 border rounded-md pr-10 cursor-pointer"
                                        onClick={() => setShowOrgUnitModal(true)}
                                        placeholder="Click to select organizational unit"
                                    />
                                    <div 
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                                        onClick={() => setShowOrgUnitModal(true)}
                                    >
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {employeeRoles.map(role => (
                                        <option key={role.id} value={role.id}>{role.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Edit Form */}
            {showEditForm && currentEditItem && (
                <div className="mb-4 p-6 border rounded-md bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4">Edit Employee</h3>
                    {loadingDropdowns ? (
                        <p>Loading form data...</p>
                    ) : (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                <input
                                    type="text"
                                    name="mname"
                                    value={formData.mname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_no"
                                    value={formData.phone_no}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Organizational Unit</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.organizationalunit ? 
                                            (orgUnits.find(u => u.id === parseInt(formData.organizationalunit))?.name || '') 
                                            : ''}
                                        readOnly
                                        className="w-full px-3 py-2 border rounded-md pr-10 cursor-pointer"
                                        onClick={() => setShowOrgUnitModal(true)}
                                        placeholder="Click to select organizational unit"
                                    />
                                    <div 
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                                        onClick={() => setShowOrgUnitModal(true)}
                                    >
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {employeeRoles.map(role => (
                                        <option key={role.id} value={role.id}>{role.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Update</button>
                                <button type="button" onClick={() => setShowEditForm(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Employees Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Organizational Unit</th>
                                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        {`${employee.fname} ${employee.mname} ${employee.lname}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        {employee.phone_no}
                                    </td>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        {employee.organizationalunit_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        {employee.role_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <button
                                            onClick={() => handleEditClick(employee)}
                                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(employee.id)}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalCount > 0 && (
                <div className="mt-4 flex justify-between items-center">
                    <span>
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage * pageSize >= totalCount}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Add the organizational unit selection modal */}
            <ParentSelectionModal
                isOpen={showOrgUnitModal}
                onClose={() => setShowOrgUnitModal(false)}
                onSelect={handleOrgUnitSelect}
                organizationalUnits={orgUnits}
                loading={loadingOrgUnits}
                error={error}
                currentPage={orgUnitCurrentPage}
                totalPages={orgUnitTotalPages}
                onPageChange={setOrgUnitCurrentPage}
                searchTerm={orgUnitSearchTerm}
                onSearchChange={setOrgUnitSearchTerm}
            />
        </div>
    );
}

export default EmployeeListPage;