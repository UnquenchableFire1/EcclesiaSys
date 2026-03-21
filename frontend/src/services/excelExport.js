import * as XLSX from 'xlsx';

// Export members data to Excel file (.xlsx format)
/**
 * @param {Array} members List of members
 * @param {Array} branches Optional list of branches for name mapping
 * @returns {boolean} Success status
 */
export function downloadMembersAsExcel(members, branches = []) {
    if (!members || members.length === 0) {
        console.warn('No members to export');
        return false;
    }

    try {
        // Prepare data for Excel
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Branch', 'Joined Date'];
        
        // Map branch ID to name for sorting/display
        const getBranchName = (id) => branches.find(b => b.id === id)?.name || 'Central / No Branch';
        
        // Sort by branch name then by name
        const sortedMembers = [...members].sort((a, b) => {
            const bA = getBranchName(a.branchId);
            const bB = getBranchName(b.branchId);
            if (bA !== bB) return bA.localeCompare(bB);
            return (a.firstName || '').localeCompare(b.firstName || '');
        });

        const rows = sortedMembers.map(m => [
            m.id,
            m.firstName,
            m.lastName,
            m.email,
            m.phoneNumber,
            m.status,
            getBranchName(m.branchId),
            m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : ''
        ]);

        // Create worksheet with headers and data
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 8 },   // ID
            { wch: 15 },  // First Name
            { wch: 15 },  // Last Name
            { wch: 25 },  // Email
            { wch: 15 },  // Phone
            { wch: 12 },  // Status
            { wch: 20 },  // Branch
            { wch: 15 }   // Joined Date
        ];

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

        // Generate Excel file and download
        const fileName = `members_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        return false;
    }
}

// Export to true Excel format (XLSX) - same as downloadMembersAsExcel
export function downloadMembersAsXLSX(members, branches) {
    return downloadMembersAsExcel(members, branches);
}
